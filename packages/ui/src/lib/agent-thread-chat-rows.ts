/**
 * Expands Convex agent thread documents into one UI row per user/system message,
 * per assistant text chunk, and per tool call (instead of merging into one bubble).
 */

/** Who sent the row — used for Human vs Bot badges (assistant rows use `agentName` on the thread message). */
export type ChatMessageAttribution =
  | { kind: "system" }
  | { kind: "human"; name: string }
  | { kind: "bot" };

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
  /** Set when a dashboard operator sends the message via `saveMessage` — distinguishes human from model. */
  agentName?: string | null;
  /** Present on model-generated assistant messages (operator handoffs typically omit these). */
  model?: string | null;
  usage?: unknown;
  finishReason?: string | null;
  reasoning?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** True when this assistant row clearly came from the LLM (vs a human operator message). */
function looksLikeGeneratedAssistantMessage(
  m: Pick<RawAgentThreadMessage, "model" | "usage" | "finishReason" | "reasoning" | "message">,
): boolean {
  if (typeof m.model === "string" && m.model.trim()) return true;
  if (m.usage != null) return true;
  if (m.finishReason != null) return true;
  if (typeof m.reasoning === "string" && m.reasoning.trim()) return true;
  const content = m.message?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (!isRecord(part)) continue;
      const t = part.type;
      if (t === "tool-call" || t === "reasoning" || t === "redacted-reasoning") return true;
    }
  }
  return false;
}

function assistantAttribution(
  m: RawAgentThreadMessage,
  /** True when this is the earliest stored message with a valid role (often the bot greeting). */
  isFirstProcessableInThread: boolean,
): Extract<ChatMessageAttribution, { kind: "human" } | { kind: "bot" }> {
  const n = typeof m.agentName === "string" ? m.agentName.trim() : "";
  if (n) return { kind: "human", name: n };
  // Opening assistant message is always the model unless explicitly attributed to a person.
  if (isFirstProcessableInThread) return { kind: "bot" };
  // Operator messages use role "assistant" with `agentName` (often `familyName`); if that is empty we
  // still treat plain assistant text as human unless the doc looks like model output.
  if (m.streaming) return { kind: "bot" };
  if (looksLikeGeneratedAssistantMessage(m)) return { kind: "bot" };
  return { kind: "human", name: "" };
}

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
      attribution: Extract<ChatMessageAttribution, { kind: "system" }>;
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
      attribution: Extract<ChatMessageAttribution, { kind: "human" } | { kind: "bot" }>;
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
      attribution: Extract<ChatMessageAttribution, { kind: "human" } | { kind: "bot" }>;
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
      attribution: Extract<ChatMessageAttribution, { kind: "human" } | { kind: "bot" }>;
    }
  | {
      kind: "page-control-steps";
      id: string;
      key: string;
      createdAt: Date;
      requestId: string;
      order: number;
      stepOrder: number;
      attribution: Extract<ChatMessageAttribution, { kind: "bot" }>;
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
  const firstProcessableIdx = sorted.findIndex(
    (msg) => msg.message != null && typeof msg.message.role === "string",
  );
  const resultByCallId = buildToolResultByCallId(sorted);
  const rows: AgentChatRow[] = [];

  for (let mi = 0; mi < sorted.length; mi++) {
    const m = sorted[mi]!;
    const core = m.message;
    if (!core || typeof core.role !== "string") continue;

    const createdAt = new Date(m._creationTime);
    const baseKey = `${m.threadId}-${m.order}-${m.stepOrder}`;
    const isFirstProcessableInThread = mi === firstProcessableIdx;

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
        attribution: { kind: "system" },
      });
      continue;
    }

    if (core.role === "tool") {
      continue;
    }

    if (core.role === "assistant") {
      const attr = assistantAttribution(m, isFirstProcessableInThread);
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
                  attribution: attr,
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
                  attribution: attr,
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
                attribution: attr,
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
                attribution: attr,
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
                attribution: attr,
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
            attribution: attr,
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
            attribution: attr,
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
              attribution: attr,
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
              attribution: attr,
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

/**
 * Where to place live page-agent steps: immediately before the summary `assistant-text`
 * (`saveMessage` uses a new thread message, so `order` is greater than the page-control row’s).
 * Same-message text after the tool shares `order` with the page-control row — skip those.
 * If no summary yet (page agent still running), anchor to the **last** row in the thread so the
 * steps card sits at the bottom — not squeezed directly under the page-control request when
 * later rows (e.g. tools) still follow it.
 */
function findPageControlStepsInsertTarget(
  rows: AgentChatRow[],
  pageControlIndex: number,
  pageControlOrder: number,
):
  | { mode: "before_assistant_text"; rowIndex: number }
  | { mode: "after_last_row"; lastRowIndex: number } {
  for (let j = pageControlIndex + 1; j < rows.length; j++) {
    const r = rows[j];
    if (!r) continue;
    if (r.kind === "assistant-text" && r.order > pageControlOrder) {
      return { mode: "before_assistant_text", rowIndex: j };
    }
  }
  const lastRowIndex = rows.length > 0 ? rows.length - 1 : pageControlIndex;
  return { mode: "after_last_row", lastRowIndex };
}

/**
 * Inserts synthetic `page-control-steps` rows just above the saved summary, or at the end of the
 * thread while the summary message does not exist yet (streaming / in progress).
 *
 * Also forces the attribution of the page-agent summary row (the first `assistant-text` with a
 * higher order than the page-control row) to `{ kind: "bot" }`, because that message is always
 * generated by the page agent — not a human operator — regardless of what the DB record contains.
 */
export function injectPageControlStepRows(
  rows: AgentChatRow[],
  shouldShowStepsForRequest: (requestId: string) => boolean,
): AgentChatRow[] {
  const insertAfterRowIndex = new Map<number, AgentChatRow[]>();
  const stepsBeforeAssistantText = new Map<number, AgentChatRow[]>();
  /** Row ids that must be attributed as bot (page-agent summaries). */
  const summaryRowIds = new Set<string>();

  for (let pcIdx = 0; pcIdx < rows.length; pcIdx++) {
    const row = rows[pcIdx];
    if (!row || row.kind !== "page-control") continue;

    // Mark the first assistant-text with a higher order as the bot summary,
    // regardless of whether steps are visible.
    for (let j = pcIdx + 1; j < rows.length; j++) {
      const r = rows[j];
      if (!r) continue;
      if (r.kind === "assistant-text" && r.order > row.order) {
        summaryRowIds.add(r.id);
        break;
      }
    }

    if (!shouldShowStepsForRequest(row.requestId)) continue;

    const stepRow: AgentChatRow = {
      kind: "page-control-steps",
      id: `${row.id}-agent-steps`,
      key: `${row.key}-agent-steps`,
      createdAt: row.createdAt,
      requestId: row.requestId,
      order: row.order,
      stepOrder: row.stepOrder,
      attribution: { kind: "bot" },
    };

    const target = findPageControlStepsInsertTarget(rows, pcIdx, row.order);
    if (target.mode === "before_assistant_text") {
      const list = stepsBeforeAssistantText.get(target.rowIndex) ?? [];
      list.push(stepRow);
      stepsBeforeAssistantText.set(target.rowIndex, list);
    } else {
      const list = insertAfterRowIndex.get(target.lastRowIndex) ?? [];
      list.push(stepRow);
      insertAfterRowIndex.set(target.lastRowIndex, list);
    }
  }

  const out: AgentChatRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const beforeSummary = stepsBeforeAssistantText.get(i);
    if (beforeSummary) out.push(...beforeSummary);
    const original = rows[i];
    if (original) {
      // Override attribution for page-agent summary rows to bot.
      if (original.kind === "assistant-text" && summaryRowIds.has(original.id)) {
        out.push({ ...original, attribution: { kind: "bot" } });
      } else {
        out.push(original);
      }
    }
    const afterRow = insertAfterRowIndex.get(i);
    if (afterRow) out.push(...afterRow);
  }
  return out;
}
