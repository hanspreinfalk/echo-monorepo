"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
    Dropzone,
    DropzoneContent,
    DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";

/** Matches backend `extractTextContent`: raster images, PDF, and text-like formats. */
const KNOWLEDGE_BASE_ACCEPT = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],
    "application/pdf": [".pdf"],
    "text/*": [
        ".txt",
        ".html",
        ".htm",
        ".csv",
        ".md",
        ".markdown",
        ".xml",
        ".css",
        ".log",
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".mjs",
        ".cjs",
        ".yaml",
        ".yml",
    ],
    "application/json": [".json"],
    "application/xml": [".xml", ".xhtml"],
    "application/javascript": [".js", ".mjs"],
    "application/typescript": [".ts", ".tsx"],
    "application/x-yaml": [".yaml", ".yml"],
} as const;

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileUploaded?: () => void;
}

export const UploadDialog = ({
    open,
    onOpenChange,
    onFileUploaded,
}: UploadDialogProps) => {
    const addFile = useAction(api.private.files.addFile);
    const addKnowledgeText = useAction(api.private.files.addKnowledgeText);

    const [tab, setTab] = useState("file");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        category: "",
        filename: "",
    });
    const [textTitle, setTextTitle] = useState("");
    const [textBody, setTextBody] = useState("");

    const resetForm = () => {
        setTab("file");
        setUploadedFiles([]);
        setUploadForm({
            category: "",
            filename: "",
        });
        setTextTitle("");
        setTextBody("");
    };

    const handleFileDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        if (file) {
            setUploadedFiles([file]);
            if (!uploadForm.filename) {
                setUploadForm((prev) => ({ ...prev, filename: file.name }));
            }
        }
    };

    const handleUploadFile = async () => {
        setIsUploading(true);
        try {
            const blob = uploadedFiles[0];

            if (!blob) {
                return;
            }

            const filename = uploadForm.filename || blob.name;

            await addFile({
                bytes: await blob.arrayBuffer(),
                filename,
                mimeType: blob.type || "text/plain",
                category: uploadForm.category,
            });

            toast.success("Document added", {
                description: "Your file was indexed for the knowledge base.",
            });
            onFileUploaded?.();
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Upload failed", {
                description:
                    error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddText = async () => {
        setIsUploading(true);
        try {
            await addKnowledgeText({
                title: textTitle,
                text: textBody,
                category: uploadForm.category,
            });

            toast.success("Text added", {
                description: "Your text was indexed for the knowledge base.",
            });
            onFileUploaded?.();
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Could not add text", {
                description:
                    error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDialogOpenChange = (next: boolean) => {
        if (!next) {
            resetForm();
        }
        onOpenChange(next);
    };

    const categoryOk = uploadForm.category.trim().length > 0;
    const fileReady = uploadedFiles.length > 0 && categoryOk;
    const textReady =
        textTitle.trim().length > 0 &&
        textBody.trim().length > 0 &&
        categoryOk;

    return (
        <Dialog onOpenChange={handleDialogOpenChange} open={open}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
                    <DialogTitle>Add to knowledge base</DialogTitle>
                    <DialogDescription>
                        Upload a file or paste text directly. Everything is
                        chunked and embedded for AI search.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    className="flex min-h-0 flex-1 flex-col gap-0"
                    onValueChange={setTab}
                    value={tab}
                >
                    <div className="flex shrink-0 items-center border-b px-6 py-2.5">
                        <TabsList className="w-full sm:w-auto">
                            <TabsTrigger
                                className="flex-1 sm:flex-initial"
                                value="file"
                            >
                                Upload file
                            </TabsTrigger>
                            <TabsTrigger
                                className="flex-1 sm:flex-initial"
                                value="text"
                            >
                                Paste text
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    Category{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    className="w-full"
                                    id="category"
                                    onChange={(e) =>
                                        setUploadForm((prev) => ({
                                            ...prev,
                                            category: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., Documentation, Support, Product"
                                    type="text"
                                    value={uploadForm.category}
                                />
                            </div>

                            <TabsContent className="mt-0 space-y-4" value="file">
                                <div className="space-y-2">
                                    <Label htmlFor="filename">
                                        Filename{" "}
                                        <span className="text-muted-foreground text-xs">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        className="w-full"
                                        id="filename"
                                        onChange={(e) =>
                                            setUploadForm((prev) => ({
                                                ...prev,
                                                filename: e.target.value,
                                            }))
                                        }
                                        placeholder="Override default filename"
                                        type="text"
                                        value={uploadForm.filename}
                                    />
                                </div>

                                <Dropzone
                                    accept={KNOWLEDGE_BASE_ACCEPT}
                                    disabled={isUploading}
                                    maxFiles={1}
                                    onDrop={handleFileDrop}
                                    src={uploadedFiles}
                                >
                                    <DropzoneEmptyState />
                                    <DropzoneContent />
                                </Dropzone>
                            </TabsContent>

                            <TabsContent className="mt-0 space-y-4" value="text">
                                <div className="space-y-2">
                                    <Label htmlFor="text-title">
                                        Title{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        className="w-full"
                                        id="text-title"
                                        onChange={(e) =>
                                            setTextTitle(e.target.value)
                                        }
                                        placeholder="e.g., Shipping FAQ, Q1 release notes"
                                        type="text"
                                        value={textTitle}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Used as the document name in your list (adds
                                        .txt if there is no extension).
                                    </p>
                                </div>
                                <div className="flex min-h-0 flex-col gap-2">
                                    <Label htmlFor="text-body">
                                        Content{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        className="max-h-[min(24rem,50vh)] min-h-[220px] resize-y overflow-y-auto font-mono text-sm leading-relaxed"
                                        id="text-body"
                                        onChange={(e) =>
                                            setTextBody(e.target.value)
                                        }
                                        placeholder="Paste or type the text you want indexed…"
                                        spellCheck
                                        value={textBody}
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>

                <div
                    className="flex shrink-0 flex-row items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-3"
                    data-slot="dialog-footer"
                >
                    <Button
                        disabled={isUploading}
                        onClick={() => handleDialogOpenChange(false)}
                        type="button"
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    {tab === "file" ? (
                        <Button
                            disabled={!fileReady || isUploading}
                            onClick={() => void handleUploadFile()}
                            type="button"
                        >
                            {isUploading ? "Adding…" : "Upload"}
                        </Button>
                    ) : (
                        <Button
                            disabled={!textReady || isUploading}
                            onClick={() => void handleAddText()}
                            type="button"
                        >
                            {isUploading ? "Adding…" : "Add text"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
