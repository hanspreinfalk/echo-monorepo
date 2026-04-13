import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    issues: defineTable({
        organizationId: v.string(),
        conversationId: v.optional(v.id("conversations")),
        resolved: v.optional(v.boolean()),
        criticality: v.optional(
            v.union(
                v.literal("Critical"),
                v.literal("High"),
                v.literal("Medium"),
                v.literal("Low"),
            ),
        ),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        stepsToReproduce: v.optional(v.string()),
        category: v.optional(
            v.union(
                v.literal("Bug"),
                v.literal("UX"),
                v.literal("Performance"),
                v.literal("Accessibility"),
                v.literal("Security"),
                v.literal("Data"),
            ),
        ),
        firstReported: v.optional(v.number()),
        pageUrl: v.optional(v.string()),
        consoleLogs: v.optional(v.array(v.string())),
        attachments: v.optional(
            v.array(
                v.object({
                    url: v.string(),
                    filename: v.optional(v.string()),
                    mimeType: v.optional(v.string()),
                    storageId: v.optional(v.id("_storage")),
                }),
            ),
        ),
        /** Contact sessions linked when the issue was filed */
        affectedSessions: v.optional(v.array(v.id("contactSessions"))),
        /** Cached AI-generated “copy fix prompt” text (regenerated when issue context changes). */
        fixPrompt: v.optional(v.string()),
        /** Last GitHub Actions “Fix now” dispatch (persists across refresh). */
        githubWorkflowDispatchedAt: v.optional(v.string()),
        githubWorkflowRepository: v.optional(v.string()),
        githubWorkflowRunId: v.optional(v.number()),
        githubWorkflowRunStatus: v.optional(v.string()),
        githubWorkflowRunConclusion: v.optional(v.string()),
    })
        .index("by_organization_id", ["organizationId"])
    ,
    subscriptions: defineTable({
        organizationId: v.string(),
        status: v.string(),
    })
        .index("by_organization_id", ["organizationId"])
    ,
    widgetSettings: defineTable({
        organizationId: v.string(),
        greetMessage: v.string(),
        /** When false, assistant rows hide the logo/avatar. Default true when omitted (legacy docs). */
        showLogo: v.optional(v.boolean()),
        defaultSuggestions: v.object({
          suggestion1: v.optional(v.string()),
          suggestion2: v.optional(v.string()),
          suggestion3: v.optional(v.string()),
        }),
        appearance: v.optional(
          v.object({
            primaryColor: v.optional(v.string()),
            primaryGradientEndColor: v.optional(v.string()),
            headerForegroundColor: v.optional(v.string()),
            backgroundColor: v.optional(v.string()),
            foregroundColor: v.optional(v.string()),
            mutedColor: v.optional(v.string()),
            mutedForegroundColor: v.optional(v.string()),
            borderColor: v.optional(v.string()),
          }),
        ),
      })
      .index("by_organization_id", ["organizationId"])
    ,
    conversations: defineTable({
        threadId: v.string(),
        organizationId: v.string(),
        contactSessionId: v.id("contactSessions"),
        status: v.union(
            v.literal('unresolved'),
            v.literal('escalated'),
            v.literal('resolved')
        ),
        isAiTyping: v.optional(v.boolean()),
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_contact_session_id", ["contactSessionId"])
    .index("by_thread_id", ["threadId"])
    .index("by_status_and_organization_id", ["status", "organizationId"])
    ,
    contactSessions: defineTable({
        name: v.string(),
        email: v.string(),
        organizationId: v.string(),
        expiresAt: v.number(),
        metadata: v.optional(v.object({
            userAgent: v.optional(v.string()),
            language: v.optional(v.string()),
            languages: v.optional(v.string()),
            platform: v.optional(v.string()),
            vendor: v.optional(v.string()),
            screenResolution: v.optional(v.string()),
            viewportSize: v.optional(v.string()),
            timezone: v.optional(v.string()),
            timezoneOffset: v.optional(v.number()),
            cookieEnabled: v.optional(v.boolean()),
            referrer: v.optional(v.string()),
            currentUrl: v.optional(v.string()),
            /** Parent page when the widget runs inside an embed iframe */
            hostPageUrl: v.optional(v.string()),
            /** Recent console lines from the parent page (embed script) */
            hostConsoleLogs: v.optional(v.array(v.string())),
        })),
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_expires_at", ["expiresAt"]),
    users: defineTable({
        name: v.string(),
    }),
    pageControlRequests: defineTable({
        conversationId: v.id("conversations"),
        action: v.string(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
        steps: v.optional(v.array(v.object({
            stepIndex: v.number(),
            goal: v.string(),
            actionName: v.string(),
        }))),
        result: v.optional(v.object({
            success: v.boolean(),
            data: v.string(), 
        })),
    }).index("by_conversation_id", ["conversationId"]),
    githubIntegrationSettings: defineTable({
        organizationId: v.string(),
        fullName: v.string(),
        githubRepoId: v.number(),
        defaultBranch: v.string(),
        htmlUrl: v.optional(v.string()),
    }).index("by_organization_id", ["organizationId"]),
    agentCustomTools: defineTable({
        organizationId: v.string(),
        name: v.string(),
        description: v.string(),
        endpoint: v.string(),
        method: v.union(
            v.literal("GET"),
            v.literal("POST"),
            v.literal("PUT"),
            v.literal("PATCH"),
        ),
        headers: v.optional(
            v.array(
                v.object({
                    key: v.string(),
                    value: v.string(),
                }),
            ),
        ),
        argumentFields: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    type: v.optional(
                        v.union(
                            v.literal("string"),
                            v.literal("number"),
                            v.literal("integer"),
                            v.literal("boolean"),
                            v.literal("array"),
                            v.literal("object"),
                        ),
                    ),
                    description: v.optional(v.string()),
                    schema: v.optional(v.string()),
                    /** When true, the agent should always pass this argument (Zod required). */
                    required: v.optional(v.boolean()),
                }),
            ),
        ),
    }).index("by_organization_id", ["organizationId"]),
});