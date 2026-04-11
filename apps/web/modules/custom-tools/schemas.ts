import { z } from "zod";

const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH"]);

export const argumentTypeSchema = z.enum([
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
]);

function endpointRefine(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol === "https:") {
      return true;
    }
    if (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

const customToolFormObjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Start with a letter; use only letters, numbers, and underscores",
    ),
  description: z.string().min(1, "Description is required"),
  endpoint: z
    .string()
    .min(1, "Endpoint is required")
    .refine(endpointRefine, {
      message: "Use https, or http only for localhost / 127.0.0.1",
    }),
  method: httpMethodSchema,
  argumentFields: z.array(
    z.object({
      name: z.string(),
      type: argumentTypeSchema,
      description: z.string().optional(),
      schema: z.string().optional(),
      required: z.boolean(),
    }),
  ),
  headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
});

function refineArgumentFieldNames(
  data: z.infer<typeof customToolFormObjectSchema>,
  ctx: z.RefinementCtx,
) {
  const seen = new Set<string>();
  for (let i = 0; i < data.argumentFields.length; i++) {
    const raw = data.argumentFields[i]?.name?.trim() ?? "";
    if (!raw) {
      continue;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(raw)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Argument names must start with a letter and use only letters, numbers, and underscores",
        path: ["argumentFields", i, "name"],
      });
      continue;
    }
    if (seen.has(raw)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate argument name",
        path: ["argumentFields", i, "name"],
      });
    }
    seen.add(raw);
  }
}

/**
 * Validates tool name uniqueness against names returned by `getTakenToolNames`
 * (called at validation time, e.g. after trim — match Convex create/update).
 */
export function createCustomToolFormSchema(
  getTakenToolNames: () => ReadonlySet<string>,
) {
  return customToolFormObjectSchema
    .superRefine(refineArgumentFieldNames)
    .superRefine((data, ctx) => {
      const trimmed = data.name.trim();
      if (trimmed.length === 0) {
        return;
      }
      if (getTakenToolNames().has(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A tool with this name already exists",
          path: ["name"],
        });
      }
    });
}

export type CustomToolFormValues = z.infer<typeof customToolFormObjectSchema>;
