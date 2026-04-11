import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import type { Doc } from "../../../_generated/dataModel";
import { escalateConversation } from "./escalateConversation";

function uniqueToolKey(name: string, used: Set<string>): string {
  const base = name.replace(/[^a-zA-Z0-9_]/g, "_") || "tool";
  let key = /^[0-9]/.test(base) ? `tool_${base}` : base;
  let i = 0;
  while (used.has(key)) {
    i += 1;
    key = `${base}_${i}`;
  }
  used.add(key);
  return key;
}

type AgentTool = typeof escalateConversation;

const legacyParametersSchema = z.object({
  parameters: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      "Optional key-value parameters: query string for GET, JSON body for POST/PUT/PATCH",
    ),
});

function describeWithOptionalSchema(base: string, schema?: string): string {
  const s = schema?.trim();
  if (!s) {
    return base;
  }
  return `${base}\n\nExpected shape (JSON Schema or notes):\n${s}`;
}

/**
 * Tool args are validated before the handler runs. Marking Zod fields as
 * non-optional breaks multi-argument tools whenever the model sends a partial
 * object (e.g. only `email`). We keep every declared key **optional in Zod** and
 * use descriptions to say which fields are required for a *complete* API call.
 */
function obligationSuffix(required: boolean): string {
  return required
    ? " **Required for a complete call:** only invoke this tool when you can supply this field (ask the customer if unknown). Omit the key until then—do not guess."
    : " Optional: omit if unknown.";
}

function argumentZodForField(f: {
  description?: string;
  schema?: string;
  required?: boolean;
  type?:
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "array"
    | "object";
}) {
  const required = f.required === true;
  const t = f.type ?? "string";
  const base =
    f.description?.trim() || "Value from the customer conversation.";
  const suffix = obligationSuffix(required);

  if (t === "number") {
    const d = `${base}${suffix}`;
    return z.union([z.number(), z.null()]).optional().describe(d);
  }
  if (t === "integer") {
    const d = `${base} (whole number).${suffix}`;
    return z.union([z.number().int(), z.null()]).optional().describe(d);
  }
  if (t === "boolean") {
    const d = `${base}${suffix}`;
    return z.union([z.boolean(), z.null()]).optional().describe(d);
  }
  if (t === "array") {
    const body = describeWithOptionalSchema(`${base} (JSON array)`, f.schema);
    const d = `${body}${suffix}`;
    return z.union([z.array(z.unknown()), z.null()]).optional().describe(d);
  }
  if (t === "object") {
    const body = describeWithOptionalSchema(`${base} (JSON object)`, f.schema);
    const d = `${body}${suffix}`;
    return z
      .union([z.record(z.string(), z.unknown()), z.null()])
      .optional()
      .describe(d);
  }
  const d = `${base}${suffix}`;
  return z.union([z.string(), z.null()]).optional().describe(d);
}

function declaredArgumentFields(def: Doc<"agentCustomTools">) {
  const raw = def.argumentFields ?? [];
  return raw.filter((f) => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.name.trim()));
}

function buildCustomToolArgsZod(def: Doc<"agentCustomTools">) {
  const fields = declaredArgumentFields(def);
  if (fields.length === 0) {
    return legacyParametersSchema;
  }
  const shape: Record<string, z.ZodTypeAny> = {};
  const seen = new Set<string>();
  for (const f of fields) {
    const name = f.name.trim();
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    shape[name] = argumentZodForField({
      description: f.description,
      required: f.required,
      schema: f.schema,
      type: f.type,
    });
  }
  if (Object.keys(shape).length === 0) {
    return legacyParametersSchema;
  }
  return z.object(shape);
}

function buildRequestParams(
  def: Doc<"agentCustomTools">,
  args: Record<string, unknown>,
): Record<string, unknown> {
  const fields = declaredArgumentFields(def);
  if (fields.length === 0) {
    const legacy = args.parameters;
    if (legacy && typeof legacy === "object" && !Array.isArray(legacy)) {
      return { ...(legacy as Record<string, unknown>) };
    }
    return {};
  }
  const params: Record<string, unknown> = {};
  for (const f of fields) {
    const k = f.name.trim();
    const val = args[k];
    if (val !== undefined) {
      params[k] = val;
    }
  }
  return params;
}

/**
 * Builds agent tools that call organization-configured HTTPS endpoints.
 * Tool keys are prefixed with `custom_` to avoid collisions with built-in tools.
 */
export function buildCustomHttpTools(
  definitions: Doc<"agentCustomTools">[],
): Record<string, AgentTool> {
  const usedKeys = new Set<string>();
  const tools: Record<string, AgentTool> = {};

  for (const def of definitions) {
    const key = uniqueToolKey(def.name, usedKeys);
    const toolKey = `custom_${key}`;
    const toolId = def._id;
    const argsZod = buildCustomToolArgsZod(def);

    tools[toolKey] = createTool({
      description: def.description,
      args: argsZod,
      handler: async (ctx, args): Promise<string> => {
        if (!ctx.threadId) {
          return "Missing thread ID";
        }

        const conversation = await ctx.runQuery(
          internal.system.conversations.getByThreadId,
          { threadId: ctx.threadId },
        );
        if (!conversation) {
          return "Conversation not found";
        }

        const config = await ctx.runQuery(
          internal.system.agentCustomTools.getOneForInvocation,
          {
            toolId,
            organizationId: conversation.organizationId,
          },
        );
        if (!config) {
          return "This tool is no longer available for this organization.";
        }

        const argsRecord = args as Record<string, unknown>;
        const params = buildRequestParams(config, argsRecord);
        const hasDeclared = declaredArgumentFields(config).length > 0;

        console.log(
          "[custom-http-tool]",
          JSON.stringify({
            toolName: config.name,
            toolId: config._id,
            threadId: ctx.threadId,
            declaredArguments: hasDeclared,
            argumentFields: config.argumentFields?.map((f) => ({
              name: f.name,
              type: f.type ?? "string",
              required: f.required === true,
            })),
            modelArgs: argsRecord,
            requestParams: params,
          }),
        );

        const headerRecord = Object.fromEntries(
          (config.headers ?? [])
            .filter((h) => h.key.trim().length > 0)
            .map((h) => [h.key.trim(), h.value]),
        );

        try {
          const url = new URL(config.endpoint);
          if (config.method === "GET") {
            for (const [k, v] of Object.entries(params)) {
              if (v === null || v === undefined) {
                continue;
              }
              const encoded =
                typeof v === "object"
                  ? JSON.stringify(v)
                  : String(v as string | number | boolean);
              url.searchParams.set(k, encoded);
            }
          }

          const init: RequestInit = {
            method: config.method,
            headers: { ...headerRecord },
          };

          if (config.method !== "GET" && Object.keys(params).length > 0) {
            (init.headers as Record<string, string>)["Content-Type"] =
              "application/json";
            init.body = JSON.stringify(params);
          }

          const res = await fetch(url.toString(), init);
          const text = await res.text();
          const clipped = text.length > 6000 ? `${text.slice(0, 6000)}…` : text;
          return `HTTP ${res.status}\n${clipped}`;
        } catch (e) {
          return `Request failed: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
    }) as unknown as AgentTool;
  }

  return tools;
}
