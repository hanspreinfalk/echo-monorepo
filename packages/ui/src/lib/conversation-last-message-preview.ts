const PAGE_CONTROL_REQUEST_MARKER = /^\[PAGE_CONTROL_REQUEST:/;

function isPageControlToolResultJson(text: string): boolean {
    try {
        const o = JSON.parse(text) as { pageControlRequestId?: unknown };
        return typeof o.pageControlRequestId === "string" && o.pageControlRequestId.length > 0;
    } catch {
        return false;
    }
}

/**
 * Human-readable preview for conversation list rows (inbox / sidebar).
 * Legacy page-control markers and tool-result JSON are replaced with a short label.
 */
export function formatConversationLastMessagePreview(
    text: string | undefined,
): string | undefined {
    if (text == null || text === "") {
        return text;
    }
    if (PAGE_CONTROL_REQUEST_MARKER.test(text)) {
        return "Page control requested";
    }
    if (isPageControlToolResultJson(text)) {
        return "Page control requested";
    }
    return text;
}
