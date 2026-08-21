import { useState } from "react";
import { Plus, Upload, Loader2, FileIcon, X, Calendar } from "lucide-react";
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
import { useCreateAnnouncementMutation } from "@/api/academyHooks.ts";
import type { AnnouncementType } from "@/api/types.ts";
import { toast } from "sonner";
import {Field, FieldGroup} from "@/components/ui/field.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";


export default function AddAnnouncementForm() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [status, setStatus] = useState<string>("active");
    const [type, setType] = useState<AnnouncementType>("public");
    const [file, setFile] = useState<File | null>(null);
    const createMutation = useCreateAnnouncementMutation();

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setFile(null);
        setStatus("active");
        setType("public");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !file || !startDate || !endDate) {
            toast.error("Please fill in all required fields and upload a banner");
            return;
        }

        try {
            await createMutation.mutateAsync({
                title,
                description,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                status: status as any,
                type: type,
                bannerImage: file,
            });
            toast.success("Announcement created successfully");
            setOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error?.message || "Failed to create announcement");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" />
                    New Notice
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Post New Announcement</DialogTitle>
                    <DialogDescription>
                        Create a sitewide notice that will appear on student dashboards. Specify a date range for visibility.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="title">Announcement Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Final Exam Schedule Declared"
                                aria-label="title"
                            />
                        </Field>
                        
                        <Field>
                            <Label htmlFor="description">Short Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide more details about this announcement..."
                                className="resize-none"
                                rows={3}
                            />
                        </Field>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="start">Start Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" />
                                    <Input
                                        id="start"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="pl-10"
                                        aria-label="date"
                                    />
                                </div>
                            </Field>
                            <Field>
                                <Label htmlFor="end">End Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" />
                                    <Input
                                        id="end"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="pl-10"
                                        aria-label="end-date"
                                    />
                                </div>
                            </Field>
                        </FieldGroup>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Initial Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active Immediately</SelectItem>
                                        <SelectItem value="inactive">Draft / Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label>Visibility Type</Label>
                                <Select value={type} onValueChange={(val) => setType(val as AnnouncementType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public (Home Page)</SelectItem>
                                        <SelectItem value="private">Private (Dashboard Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field>
                            <Label>Banner Image (Recommended 1200x400)</Label>
                            {!file ? (
                                <div className="group relative mt-1 flex justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-6 transition-colors hover:border-primary/50 hover:bg-primary/5">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-slate-400 transition-colors group-hover:text-primary" />
                                        <div className="mt-4 flex text-sm leading-6 text-slate-600 font-medium">
                                            <label htmlFor="banner-upload" className="relative cursor-pointer rounded-md font-bold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                                                <span>Click to upload banner</span>
                                                <input id="banner-upload" name="banner-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*" />
                                            </label>
                                        </div>
                                        <p className="text-[11px] leading-5 text-muted-foreground uppercase font-bold tracking-widest">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-center">
                                            <FileIcon className="size-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-900 truncate tracking-tight">{file.name}</span>
                                            <span className="text-[11px] font-medium text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                    <Button aria-label="exit" type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/10" onClick={() => setFile(null)}>
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing Notice...
                                </>
                            ) : (
                                "Post Announcement"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
