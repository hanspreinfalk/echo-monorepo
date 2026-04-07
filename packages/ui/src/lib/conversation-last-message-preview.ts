const PAGE_CONTROL_REQUEST_MARKER = /^\[PAGE_CONTROL_REQUEST:/;

/**
 * Human-readable preview for conversation list rows (inbox / sidebar).
 * Tool markers stored as message text are replaced with a short label.
 */
export function formatConversationLastMessagePreview(
    text: string | undefined,
): string | undefined {
    if (text == null || text === "") {
        return text;
    }
    if (PAGE_CONTROL_REQUEST_MARKER.test(text)) {
        return "Page Control Request";
    }
    return text;
}
