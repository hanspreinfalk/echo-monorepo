import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

const methodValidator = v.union(
  v.literal("GET"),
  v.literal("POST"),
  v.literal("PUT"),
  v.literal("PATCH"),
);

const headersValidator = v.optional(
  v.array(
    v.object({
      key: v.string(),
      value: v.string(),
    }),
  ),
);

const argumentFieldTypeValidator = v.union(
  v.literal("string"),
  v.literal("number"),
  v.literal("integer"),
  v.literal("boolean"),
  v.literal("array"),
  v.literal("object"),
);

const argumentFieldsValidator = v.optional(
  v.array(
    v.object({
      name: v.string(),
      type: v.optional(argumentFieldTypeValidator),
      description: v.optional(v.string()),
      schema: v.optional(v.string()),
      required: v.optional(v.boolean()),
    }),
  ),
);

type ArgumentFieldType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object";

const ARGUMENT_FIELD_TYPES = new Set<ArgumentFieldType>([
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
]);

function normalizeArgumentFieldType(
  raw: string | undefined,
): ArgumentFieldType {
  if (raw !== undefined && ARGUMENT_FIELD_TYPES.has(raw as ArgumentFieldType)) {
    return raw as ArgumentFieldType;
  }
  return "string";
}

type NormalizedArgumentField = {
  name: string;
  type: ArgumentFieldType;
  description?: string;
  schema?: string;
  required?: boolean;
};

function normalizeArgumentFields(
  raw:
    | {
        name: string;
        type?: ArgumentFieldType;
        description?: string;
        schema?: string;
        required?: boolean;
      }[]
    | undefined,
): NormalizedArgumentField[] {
  if (!raw?.length) {
    return [];
  }
  const out: NormalizedArgumentField[] = [];
  const seen = new Set<string>();
  for (const f of raw) {
    const name = f.name.trim();
    if (!name) {
      continue;
    }
    assertValidToolName(name);
    if (seen.has(name)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Duplicate argument name: ${name}`,
      });
    }
    seen.add(name);
    const type = normalizeArgumentFieldType(f.type);
    const schemaTrimmed = f.schema?.trim() ?? "";
    const includeSchema =
      (type === "array" || type === "object") && schemaTrimmed.length > 0;
    out.push({
      name,
      type,
      ...(f.required === true ? { required: true } : {}),
      ...(f.description !== undefined && f.description.trim() !== ""
        ? { description: f.description.trim() }
        : {}),
      ...(includeSchema ? { schema: schemaTrimmed } : {}),
    });
  }
  return out;
}

function assertValidToolName(name: string) {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message:
        "Tool name must start with a letter and contain only letters, numbers, and underscores",
    });
  }
}

function assertValidEndpointUrl(endpoint: string) {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Endpoint must be a valid URL",
    });
  }
  const isLocal =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !isLocal) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Endpoint must use https (http is allowed only for localhost)",
    });
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    return await ctx.db
      .query("agentCustomTools")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    endpoint: v.string(),
    method: methodValidator,
    headers: headersValidator,
    argumentFields: argumentFieldsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    assertValidToolName(args.name.trim());
    if (!args.description.trim()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Description is required",
      });
    }
    assertValidEndpointUrl(args.endpoint.trim());
    const argumentFields = normalizeArgumentFields(args.argumentFields);

    const existing = await ctx.db
      .query("agentCustomTools")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();
    if (existing.some((t) => t.name === args.name.trim())) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "A tool with this name already exists",
      });
    }

    return await ctx.db.insert("agentCustomTools", {
      organizationId: orgId,
      name: args.name.trim(),
      description: args.description.trim(),
      endpoint: args.endpoint.trim(),
      method: args.method,
      headers: args.headers,
      argumentFields,
    });
  },
});

export const update = mutation({
  args: {
    toolId: v.id("agentCustomTools"),
    name: v.string(),
    description: v.string(),
    endpoint: v.string(),
    method: methodValidator,
    headers: headersValidator,
    argumentFields: argumentFieldsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    const row = await ctx.db.get(args.toolId);
    if (!row || row.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Tool not found",
      });
    }
    assertValidToolName(args.name.trim());
    if (!args.description.trim()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Description is required",
      });
    }
    assertValidEndpointUrl(args.endpoint.trim());
    const argumentFields = normalizeArgumentFields(args.argumentFields);

    const siblings = await ctx.db
      .query("agentCustomTools")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();
    if (
      siblings.some(
        (t) => t._id !== args.toolId && t.name === args.name.trim(),
      )
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "A tool with this name already exists",
      });
    }

    await ctx.db.patch(args.toolId, {
      name: args.name.trim(),
      description: args.description.trim(),
      endpoint: args.endpoint.trim(),
      method: args.method,
      headers: args.headers,
      argumentFields,
    });
  },
});

export const remove = mutation({
  args: { toolId: v.id("agentCustomTools") },
  handler: async (ctx, { toolId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    const row = await ctx.db.get(toolId);
    if (!row || row.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Tool not found",
      });
    }
    await ctx.db.delete(toolId);
  },
});
