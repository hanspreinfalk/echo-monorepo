/**
 * Expands Convex agent thread documents into one UI row per user/system message,
 * per assistant text chunk, and per tool call (instead of merging into one bubble).
 */

export type RawAgentThreadMessage = {
  _id: string;
  _creationTime: number;
  threadId: string;
  order: number;
  stepOrder: number;
  status?: string;
  streaming?: boolean;
  message?: { role: string; content: unknown } | null;
  text?: string | null;
  tool?: boolean;
};

export type AgentChatRow =
  | {
      kind: "user";
      id: string;
      key: string;
      createdAt: Date;
      content: string;
      order: number;
      stepOrder: number;
    }
  | {
      kind: "system";
      id: string;
      key: string;
      createdAt: Date;
      content: string;
      order: number;
      stepOrder: number;
    }
  | {
      kind: "assistant-text";
      id: string;
      key: string;
      createdAt: Date;
      text: string;
      order: number;
      stepOrder: number;
      streaming?: boolean;
    }
  | {
      kind: "tool";
      id: string;
      key: string;
      createdAt: Date;
      toolName: string;
      toolCallId?: string;
      args?: unknown;
      result?: unknown;
      order: number;
      stepOrder: number;
      streaming?: boolean;
    }
  | {
      kind: "page-control";
      id: string;
      key: string;
      createdAt: Date;
      /** Convex `pageControlRequests` id */
      requestId: string;
      /** From tool args; may be empty for legacy marker-only rows */
      action: string;
      order: number;
      stepOrder: number;
      streaming?: boolean;
    };

const AGENT_TOOL_LABELS: Record<string, string> = {
  searchTool: "Searching knowledge base",
  readAttachmentTool: "Reading attachment",
  readConsoleLogsTool: "Reading page console",
  escalateConversationTool: "Connecting to human agent",
  resolveConversationTool: "Closing conversation",
  requestPageControlTool: "Requesting page control",
  listOpenIssuesTool: "Checking open issues",
  readOpenIssueDetailsTool: "Loading issue details",
  appendSessionToIssueTool: "Linking to existing issue",
  createIssueTool: "Creating engineering issue",
};

function humanizeToolName(toolName: string): string {
  const base = toolName.replace(/Tool$/, "");
  return base
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function labelForAgentTool(toolName: string): string {
  return AGENT_TOOL_LABELS[toolName] ?? humanizeToolName(toolName);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function sortThreadMessages<T extends { order: number; stepOrder: number }>(messages: T[]): T[] {
  return [...messages].sort((a, b) =>
    a.order === b.order ? a.stepOrder - b.stepOrder : a.order - b.order,
  );
}

const LEGACY_PAGE_CONTROL_MARKER = /^\[PAGE_CONTROL_REQUEST:(\{.*\})\]$/;

function parseLegacyPageControlMarker(text: string): { requestId: string } | null {
  const m = text.trim().match(LEGACY_PAGE_CONTROL_MARKER);
  if (!m?.[1]) return null;
  try {
    const o = JSON.parse(m[1]) as { id?: string };
    if (typeof o.id !== "string") return null;
    return { requestId: o.id };
  } catch {
    return null;
  }
}

function parsePageControlToolResult(result: unknown): string | undefined {
  if (result == null) return undefined;
  if (typeof result === "string") {
    try {
      const o = JSON.parse(result) as { pageControlRequestId?: string };
      if (typeof o.pageControlRequestId === "string") return o.pageControlRequestId;
    } catch {
      return undefined;
    }
    return undefined;
  }
  if (isRecord(result) && typeof result.pageControlRequestId === "string") {
    return result.pageControlRequestId;
  }
  return undefined;
}

function parsePageControlToolArgs(args: unknown): string {
  if (isRecord(args) && typeof args.action === "string") return args.action;
  return "";
}

function buildToolResultByCallId(messages: RawAgentThreadMessage[]): Map<string, unknown> {
  const map = new Map<string, unknown>();
  for (const m of messages) {
    const role = m.message?.role;
    if (role !== "tool") continue;
    const c = m.message?.content;
    if (!Array.isArray(c)) continue;
    for (const part of c) {
      if (!isRecord(part)) continue;
      if (part.type === "tool-result" && typeof part.toolCallId === "string") {
        map.set(part.toolCallId, part.result);
      }
    }
  }
  return map;
}

/**
 * One chat bubble per stored segment: user/system rows, each assistant text chunk,
 * and each tool-call (with merged tool-result when present on a following tool message).
 */
export function threadMessagesToSeparateChatRows(
  messages: RawAgentThreadMessage[],
): AgentChatRow[] {
  const sorted = sortThreadMessages(messages);
  const resultByCallId = buildToolResultByCallId(sorted);
  const rows: AgentChatRow[] = [];

  for (const m of sorted) {
    const core = m.message;
    if (!core || typeof core.role !== "string") continue;

    const createdAt = new Date(m._creationTime);
    const baseKey = `${m.threadId}-${m.order}-${m.stepOrder}`;

    if (core.role === "user") {
      const content = typeof m.text === "string" ? m.text : "";
      rows.push({
        kind: "user",
        id: m._id,
        key: baseKey,
        createdAt,
        content,
        order: m.order,
        stepOrder: m.stepOrder,
      });
      continue;
    }

    if (core.role === "system") {
      const content =
        typeof m.text === "string" && m.text.trim()
          ? m.text
          : typeof core.content === "string"
            ? core.content
            : "";
      rows.push({
        kind: "system",
        id: m._id,
        key: baseKey,
        createdAt,
        content,
        order: m.order,
        stepOrder: m.stepOrder,
      });
      continue;
    }

    if (core.role === "tool") {
      continue;
    }

    if (core.role === "assistant") {
      const content = core.content;
      const streaming = Boolean(m.streaming);
      /** Text already emitted from `content` (the agent also duplicates it on `m.text`). */
      const emittedAssistantTextChunks: string[] = [];

      if (Array.isArray(content)) {
        for (let i = 0; i < content.length; i++) {
          const part = content[i];
          if (!isRecord(part)) continue;

          if (part.type === "tool-call" && typeof part.toolName === "string") {
            const toolCallId = typeof part.toolCallId === "string" ? part.toolCallId : undefined;
            const idSuffix = toolCallId ?? `idx-${i}`;
            const toolResult = toolCallId ? resultByCallId.get(toolCallId) : undefined;

            if (part.toolName === "requestPageControlTool") {
              const requestId = parsePageControlToolResult(toolResult);
              const action = parsePageControlToolArgs(part.args);
              if (requestId) {
                rows.push({
                  kind: "page-control",
                  id: `${m._id}:page-control:${idSuffix}`,
                  key: `${baseKey}-pc-${idSuffix}`,
                  createdAt,
                  requestId,
                  action,
                  order: m.order,
                  stepOrder: m.stepOrder,
                  streaming,
                });
              } else {
                rows.push({
                  kind: "tool",
                  id: `${m._id}:tool:${idSuffix}`,
                  key: `${baseKey}-tool-${idSuffix}`,
                  createdAt,
                  toolName: part.toolName,
                  toolCallId,
                  args: part.args,
                  result: toolResult,
                  order: m.order,
                  stepOrder: m.stepOrder,
                  streaming,
                });
              }
            } else {
              rows.push({
                kind: "tool",
                id: `${m._id}:tool:${idSuffix}`,
                key: `${baseKey}-tool-${idSuffix}`,
                createdAt,
                toolName: part.toolName,
                toolCallId,
                args: part.args,
                result: toolResult,
                order: m.order,
                stepOrder: m.stepOrder,
                streaming,
              });
            }
          } else if (part.type === "text" && typeof part.text === "string" && part.text.trim()) {
            const raw = part.text;
            const chunk = raw.trim();
            const legacy = parseLegacyPageControlMarker(raw);
            if (legacy) {
              rows.push({
                kind: "page-control",
                id: `${m._id}:legacy-pc:${i}`,
                key: `${baseKey}-legacy-pc-${i}`,
                createdAt,
                requestId: legacy.requestId,
                action: "",
                order: m.order,
                stepOrder: m.stepOrder,
                streaming,
              });
            } else {
              emittedAssistantTextChunks.push(chunk);
              rows.push({
                kind: "assistant-text",
                id: `${m._id}:part-text:${i}`,
                key: `${baseKey}-txt-${i}`,
                createdAt,
                text: part.text,
                order: m.order,
                stepOrder: m.stepOrder,
                streaming,
              });
            }
          }
        }
      } else if (typeof content === "string" && content.trim()) {
        const legacy = parseLegacyPageControlMarker(content);
        if (legacy) {
          rows.push({
            kind: "page-control",
            id: `${m._id}:legacy-pc:content`,
            key: `${baseKey}-legacy-pc-content`,
            createdAt,
            requestId: legacy.requestId,
            action: "",
            order: m.order,
            stepOrder: m.stepOrder,
            streaming,
          });
        } else {
          emittedAssistantTextChunks.push(content.trim());
          rows.push({
            kind: "assistant-text",
            id: `${m._id}:content`,
            key: `${baseKey}-content`,
            createdAt,
            text: content,
            order: m.order,
            stepOrder: m.stepOrder,
            streaming,
          });
        }
      }

      const textField = typeof m.text === "string" ? m.text.trim() : "";
      if (textField) {
        const dupFromStringField =
          typeof content === "string" && content.trim() === textField;
        const dupFromArrayChunk = emittedAssistantTextChunks.some((t) => t === textField);
        const joined = emittedAssistantTextChunks.join("");
        const dupFromJoined =
          emittedAssistantTextChunks.length > 0 && joined === textField;
        const dupFromJoinedNewline =
          emittedAssistantTextChunks.length > 0 &&
          emittedAssistantTextChunks.join("\n") === textField;
        if (!dupFromStringField && !dupFromArrayChunk && !dupFromJoined && !dupFromJoinedNewline) {
          const legacyTf = parseLegacyPageControlMarker(textField);
          if (legacyTf) {
            rows.push({
              kind: "page-control",
              id: `${m._id}:legacy-pc:tf`,
              key: `${baseKey}-legacy-pc-tf`,
              createdAt,
              requestId: legacyTf.requestId,
              action: "",
              order: m.order,
              stepOrder: m.stepOrder,
              streaming,
            });
          } else {
            rows.push({
              kind: "assistant-text",
              id: `${m._id}:textfield`,
              key: `${baseKey}-tf`,
              createdAt,
              text: textField,
              order: m.order,
              stepOrder: m.stepOrder,
              streaming,
            });
          }
        }
      }
    }
  }

  return rows;
}

export function toolRowIsComplete(row: Extract<AgentChatRow, { kind: "tool" }>): boolean {
  if (row.result !== undefined) return true;
  return !row.streaming;
}
