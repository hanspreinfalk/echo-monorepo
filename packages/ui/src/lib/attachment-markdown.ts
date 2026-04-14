const IMAGE_MIME_TYPE_PREFIX = "image/";
const IMAGE_FILE_EXTENSION_REGEX = /\.(png|jpe?g|webp|gif|bmp|svg)$/i;

function isImageFileName(fileName: string, mimeType?: string) {
    if (mimeType?.startsWith(IMAGE_MIME_TYPE_PREFIX)) {
        return true;
    }
    return IMAGE_FILE_EXTENSION_REGEX.test(fileName);
}

/** Legacy `[📎 …](url)` and current `[Attachment: …](url)` in message text. */
const ATTACHMENT_LINK_REGEX =
    /\[(?:Attachment:\s*|📎\s*)([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

export type ParsedAttachmentLink = {
    name: string;
    url: string;
    isImage: boolean;
};

export function formatAttachmentMarkdownLink(name: string, url: string) {
    return `[Attachment: ${name}](${url})`;
}

export function parseMessageAttachments(content: string): {
    textContent: string;
    attachments: ParsedAttachmentLink[];
} {
    const attachments: ParsedAttachmentLink[] = [];
    const textContent = content
        .replace(ATTACHMENT_LINK_REGEX, (_match, name: string, url: string) => {
            attachments.push({
                name,
                url,
                isImage: isImageFileName(name),
            });
            return "";
        })
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return { textContent, attachments };
}
