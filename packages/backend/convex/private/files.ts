import {
    action,
    internalQuery,
    mutation,
    query,
    QueryCtx,
} from "../_generated/server";
import { 
    contentHashFromArrayBuffer,
    Entry,
    EntryId,
    guessMimeTypeFromContents,
    guessMimeTypeFromExtension,
    vEntryId,
 } from "@convex-dev/rag"
import { ConvexError, v } from "convex/values";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api";

function guessMimeType(filename: string, bytes: ArrayBuffer): string {
    return (
        guessMimeTypeFromExtension(filename) ||
        guessMimeTypeFromContents(bytes) ||
        "application/octet-stream"
    )
}

export const deleteFile = mutation({
    args: {
        entryId: vEntryId 
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            })
        }

        const namespace = await rag.getNamespace(ctx, {
            namespace: orgId,
        })

        if (!namespace) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid namespace"
            })
        }

        const entry = await rag.getEntry(ctx, {
            entryId: args.entryId,
        })

        if (!entry) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Entry not found"
            })
        }

        if (entry.metadata?.uploadedBy !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID"
            })
        }

        if (entry.metadata?.storageId) {
            await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
        }

        await rag.deleteAsync(ctx, {
            entryId: args.entryId,
        })
    }
})

export const addFile = action({
    args: {
        filename: v.string(),
        mimeType: v.string(),
        bytes: v.bytes(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            })
        }

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            {
                organizationId: orgId,
            },
        );
    
        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing subscription"
            });
        }

        const { bytes, filename, category } = args;

        const mimeType = args.mimeType || guessMimeType(filename, bytes);
        const blob = new Blob([bytes], { type: mimeType });

        const storageId = await ctx.storage.store(blob);

        const text = await extractTextContent(ctx, {
            storageId,
            filename,
            bytes,
            mimeType,
        });

        const { entryId, created } = await rag.add(ctx, {
            namespace: orgId, 
            text,
            key: filename, 
            title: filename, 
            metadata: {
                storageId,
                uploadedBy: orgId, 
                filename,
                category: category ?? null,
            } as EntryMetadata,
            contentHash: await contentHashFromArrayBuffer(bytes) // avoid re-inserting if the file content hasn't changed.
        });

        if (!created) {
            console.debug("entry already exists, skipping upload metadata")
            await ctx.storage.delete(storageId);
        }
        
        return {
            url: await ctx.storage.getUrl(storageId),
            entryId,
        }
    }
})

export const addKnowledgeText = action({
    args: {
        title: v.string(),
        text: v.string(),
        category: v.optional(v.string()),
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

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            {
                organizationId: orgId,
            },
        );

        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing subscription",
            });
        }

        const title = args.title.trim();
        const text = args.text.trim();

        if (!title) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Title is required",
            });
        }

        if (!text) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Text is required",
            });
        }

        const category = args.category?.trim();
        const filename = title.includes(".") ? title : `${title}.txt`;

        const utf8 = new TextEncoder().encode(text);
        const contentHash = await contentHashFromArrayBuffer(
            utf8.buffer.slice(
                utf8.byteOffset,
                utf8.byteOffset + utf8.byteLength,
            ),
        );

        const { entryId, created } = await rag.add(ctx, {
            namespace: orgId,
            text,
            key: filename,
            title: filename,
            metadata: {
                uploadedBy: orgId,
                filename,
                category: category ? category : null,
            } as EntryMetadata,
            contentHash,
        });

        return { entryId, created };
    },
});

export const addUrl = action({
    args: {
        url: v.string(),
        title: v.optional(v.string()),
        category: v.optional(v.string()),
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

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            {
                organizationId: orgId,
            },
        );

        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing subscription",
            });
        }

        const url = args.url.trim();

        if (!url) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "URL is required",
            });
        }

        // Fetch the URL content
        let response: Response;
        try {
            response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; EchoBot/1.0)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
                },
                redirect: "follow",
            });
        } catch (error) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: `Failed to fetch URL: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        }

        if (!response.ok) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: `Failed to fetch URL: HTTP ${response.status}`,
            });
        }

        const contentType = response.headers.get("content-type") || "text/html";
        const htmlContent = await response.text();

        if (!htmlContent.trim()) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "The URL returned empty content",
            });
        }

        // Strip script, style, noscript tags and HTML comments to reduce token count
        let cleaned = htmlContent
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/<svg[\s\S]*?<\/svg>/gi, "")
            .replace(/<header[\s\S]*?<\/header>/gi, "")
            .replace(/<footer[\s\S]*?<\/footer>/gi, "")
            .replace(/<nav[\s\S]*?<\/nav>/gi, "");

        // Collapse whitespace
        cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

        // Truncate to ~60k chars (~15k tokens) to stay within limits
        const MAX_CHARS = 60000;
        if (cleaned.length > MAX_CHARS) {
            cleaned = cleaned.slice(0, MAX_CHARS) + "\n[Content truncated]";
        }

        // Use AI to extract clean text from the HTML
        const { generateText } = await import("ai");
        const { openai } = await import("@ai-sdk/openai");

        const result = await generateText({
            model: openai.chat("gpt-4o-mini"),
            system: "You transform web page content into clean markdown text. Extract the main content, ignoring navigation, ads, footers, and other boilerplate. Preserve the structure with headings, lists, and paragraphs.",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: cleaned },
                        {
                            type: "text",
                            text: "Extract the main content from this web page and format it as clean markdown. Do not explain what you are doing.",
                        },
                    ],
                },
            ],
        });

        const text = result.text;

        if (!text.trim()) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Could not extract any text from the URL",
            });
        }

        // Generate a filename from the title or URL
        const title = args.title?.trim() || new URL(url).hostname + new URL(url).pathname.replace(/\//g, "-").replace(/-$/, "");
        const filename = title.includes(".") ? title : `${title}.url`;

        const category = args.category?.trim();

        const utf8 = new TextEncoder().encode(text);
        const contentHash = await contentHashFromArrayBuffer(
            utf8.buffer.slice(
                utf8.byteOffset,
                utf8.byteOffset + utf8.byteLength,
            ),
        );

        const { entryId, created } = await rag.add(ctx, {
            namespace: orgId,
            text,
            key: filename,
            title: filename,
            metadata: {
                sourceUrl: url,
                uploadedBy: orgId,
                filename,
                category: category ? category : null,
            } as EntryMetadata,
            contentHash,
        });

        return { entryId, created };
    },
});

export const list = query({
    args: {
        category: v.optional(v.string()),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            })
        }

        const namespace = await rag.getNamespace(ctx, {
            namespace: orgId,
        })

        if (!namespace) {
            return {
                page: [],
                isDone: true,
                continueCursor: "",
            }
        }

        const results = await rag.list(ctx, {
            namespaceId: namespace.namespaceId,
            paginationOpts: args.paginationOpts,
        });

        const files = await Promise.all(
            results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
        );

        const filteredFiles = args.category
            ? files.filter((file) => file.category === args.category)
            : files;

        return {
            page: filteredFiles,
            isDone: results.isDone,
            continueCursor: results.continueCursor,
        }
    }
})

export type PublicFile = {
    id: EntryId;
    name: string;
    type: string;
    size: string;
    status: "ready" | "processing" | "error";
    url: string | null;
    category?: string;
}

type EntryMetadata = {
    storageId?: Id<"_storage">;
    sourceUrl?: string;
    uploadedBy: string;
    filename: string;
    category: string | null;
}

async function requireOwnedKnowledgeEntry(
    ctx: QueryCtx,
    entryId: EntryId,
): Promise<{ entry: Entry; metadata: EntryMetadata } | null> {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
        return null;
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
        return null;
    }

    const entry = await rag.getEntry(ctx, {
        entryId,
    });

    if (!entry) {
        return null;
    }

    const metadata = entry.metadata as EntryMetadata | undefined;

    if (metadata?.uploadedBy !== orgId) {
        return null;
    }

    return { entry, metadata };
}

export const getKnowledgeEntryMetadataInternal = internalQuery({
    args: {
        orgId: v.string(),
        entryId: vEntryId,
    },
    handler: async (ctx, args) => {
        const entry = await rag.getEntry(ctx, {
            entryId: args.entryId,
        });

        if (!entry) {
            return null;
        }

        const metadata = entry.metadata as EntryMetadata | undefined;

        if (metadata?.uploadedBy !== args.orgId) {
            return null;
        }

        return {
            key: entry.key ?? metadata.filename,
            title: entry.title ?? metadata.filename,
            metadata,
        };
    },
});

export const getKnowledgeEntryForEditor = query({
    args: {
        entryId: vEntryId,
    },
    handler: async (ctx, args) => {
        const owned = await requireOwnedKnowledgeEntry(ctx, args.entryId);

        if (!owned) {
            return null;
        }

        const { entry, metadata } = owned;

        const parts: string[] = [];
        let cursor: string | null = null;
        let isDone = false;

        while (!isDone) {
            const batch = await rag.listChunks(ctx, {
                entryId: args.entryId,
                paginationOpts: { numItems: 100, cursor },
                order: "asc",
            });

            for (const chunk of batch.page) {
                if (chunk.state === "ready" || chunk.state === "pending") {
                    parts.push(chunk.text);
                }
            }

            isDone = batch.isDone;
            cursor = batch.continueCursor;
        }

        return {
            filename: metadata.filename,
            title: entry.title ?? metadata.filename,
            category: metadata.category ?? undefined,
            text: parts.join(""),
            status: entry.status,
        };
    },
});

export const updateKnowledgeEntryText = action({
    args: {
        entryId: vEntryId,
        text: v.string(),
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

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            {
                organizationId: orgId,
            },
        );

        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing subscription",
            });
        }

        const meta = await ctx.runQuery(
            internal.private.files.getKnowledgeEntryMetadataInternal,
            {
                orgId,
                entryId: args.entryId,
            },
        );

        if (!meta) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Entry not found",
            });
        }

        const utf8 = new TextEncoder().encode(args.text);
        const textBuffer = utf8.buffer.slice(
            utf8.byteOffset,
            utf8.byteOffset + utf8.byteLength,
        );
        const contentHash = await contentHashFromArrayBuffer(textBuffer);

        // rag.add rechunks `text`, runs embedMany on each chunk (text-embedding-3-small),
        // and replaces the prior ready entry for this key. Passing contentHash for the
        // *indexed text* aligns with RAG dedup after edits; it differs from upload
        // hashes (file bytes) so the first save after upload always re-embeds.
        const result = await rag.add(ctx, {
            namespace: orgId,
            key: meta.key,
            text: args.text,
            title: meta.title,
            metadata: meta.metadata as EntryMetadata,
            contentHash,
        });

        return {
            entryId: result.entryId,
            embeddingsRefreshed: result.created,
        };
    },
});

async function convertEntryToPublicFile(
    ctx: QueryCtx,
    entry: Entry,
): Promise<PublicFile> {
    const metadata = entry.metadata as EntryMetadata | undefined;
    const storageId = metadata?.storageId;

    let fileSize: string;

    if (storageId) {
        fileSize = "unknown";
        try {
            const storageMetadata = await ctx.db.system.get(storageId);
            if (storageMetadata) {
                fileSize = formatFileSize(storageMetadata.size);
            }
        } catch (error) {
            console.error("Failed to get storage metadata: ", error);
        }
    } else if (metadata?.sourceUrl) {
        fileSize = "URL";
    } else {
        fileSize = "Text";
    }

    const filename = entry.key || "Unknown";
    const extension = filename.split(".").pop()?.toLowerCase() || "txt";

    let status: "ready" | "processing" | "error" = "error";

    if (entry.status === "ready") {
        status = "ready";
    } else if (entry.status === "pending") {
        status = "processing";
    }

    const url = storageId
        ? await ctx.storage.getUrl(storageId)
        : metadata?.sourceUrl ?? null;

    return {
        id: entry.entryId,
        name: filename,
        type: extension,
        size: fileSize,
        status,
        url,
        category: metadata?.category || undefined,
    }

}

function formatFileSize(bytes: number): string {
    if (bytes === 0) {
        return "0 B";
    }

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}