/**
 * Attachment links embedded in message text (markdown-style).
 * Supports `[Attachment: name](url)` and legacy `[📎 name](url)`.
 * Capture group 1 is the URL.
 */
export const ATTACHMENT_MARKDOWN_URL_REGEX =
    /\[(?:Attachment:\s*|📎\s*)[^\]]*\]\((https?:\/\/[^\s)]+)\)/;
