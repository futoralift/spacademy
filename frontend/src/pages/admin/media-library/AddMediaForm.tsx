import {type ChangeEvent, type SubmitEventHandler, useState} from "react";
import { Plus, Upload, Loader2, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { useCreateMediaAssetMutation } from "@/api/academyHooks.ts";
import { toast } from "sonner";
import {Field, FieldGroup} from "@/components/ui/field.tsx";

export default function AddMediaForm() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [mediaType, setMediaType] = useState<string>("media_library");
    const [file, setFile] = useState<File | null>(null);
    const createMutation = useCreateMediaAssetMutation();

    const resetForm = () => {
        setTitle("");
        setMediaType("media_library");
        setFile(null);
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (!title.trim() || !file) {
            toast.error("Please provide a title and select a file");
            return;
        }

        try {
            await createMutation.mutateAsync({
                title,
                mediaType: mediaType as any,
                file: file,
            });
            toast.success("Media asset uploaded successfully");
            setOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error?.message || "Failed to upload media asset");
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!title) {
                // Pre-fill title with filename without extension
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
                setTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/[_-]/g, ' '));
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" />
                    Upload Media
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Upload New Asset</DialogTitle>
                    <DialogDescription>
                        Directly upload files to the media library. These assets can then be referenced by other modules.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="title">Asset Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title"
                                aria-label="title"
                            />
                        </Field>

                        <Field>
                            <Label>Source / Usage Type</Label>
                            <Select value={mediaType} onValueChange={setMediaType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select media source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="media_library">Direct Upload (General)</SelectItem>
                                    <SelectItem value="blog">Blog Image</SelectItem>
                                    <SelectItem value="announcement">Announcement Banner</SelectItem>
                                    <SelectItem value="study_resource">Notes & Documents</SelectItem>
                                    <SelectItem value="learning_hub">Visual Hub</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label>Select File</Label>
                            {!file ? (
                                <div className="group relative mt-1 flex justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 px-6 py-10 transition-colors hover:border-primary/50 hover:bg-primary/5">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600 transition-colors group-hover:text-primary" />
                                        <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                                                <span>Click to upload</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">PNG, JPG, PDF up to 20MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 rounded-xl border dark:border-slate-800 bg-card">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <FileIcon className="size-6 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold truncate tracking-tight text-card-foreground">{file.name}</span>
                                            <span className="text-[11px] font-medium text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                    <Button aria-label="exit" type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-mutate-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setFile(null)}>
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading Asset...
                                </>
                            ) : (
                                "Complete Upload"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
