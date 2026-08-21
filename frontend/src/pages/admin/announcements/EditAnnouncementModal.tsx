import { useState, useEffect } from "react";
import { Upload, Loader2, X, Calendar, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { useUpdateAnnouncementMutation } from "@/api/academyHooks.ts";
import { toast } from "sonner";
import type { AnnouncementResponse, AnnouncementType } from "@/api/types.ts";
import { getFileUrl } from "@/api/http.ts";
import {Field, FieldGroup} from "@/components/ui/field.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

interface EditAnnouncementModalProps {
    announcement: AnnouncementResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditAnnouncementModal({ announcement, open, onOpenChange }: EditAnnouncementModalProps) {
    const [title, setTitle] = useState(announcement.title);
    const [description, setDescription] = useState(announcement.description || "");
    const [startDate, setStartDate] = useState(announcement.startDate.split('T')[0]);
    const [endDate, setEndDate] = useState(announcement.endDate.split('T')[0]);
    const [status, setStatus] = useState<string>(announcement.status);
    const [type, setType] = useState<AnnouncementType>(announcement.type);
    const [file, setFile] = useState<File | null>(null);
    const updateMutation = useUpdateAnnouncementMutation();

    useEffect(() => {
        if (open) {
            setTitle(announcement.title);
            setDescription(announcement.description || "");
            setStartDate(announcement.startDate.split('T')[0]);
            setEndDate(announcement.endDate.split('T')[0]);
            setStatus(announcement.status);
            setType(announcement.type);
            setFile(null);
        }
    }, [open, announcement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !startDate || !endDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: announcement.id,
                title,
                description,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                status: status as any,
                type: type,
                bannerImage: file || undefined,
            });
            toast.success("Announcement updated successfully");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to update announcement");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Announcement Settings</DialogTitle>
                    <DialogDescription>
                        Update notice details, status, or change the banner image.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        <div className="space-y-2">
                            <Label htmlFor="title">Announcement Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                aria-label="title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide more details about this announcement..."
                                className="resize-none"
                                rows={3}
                            />
                        </div>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="start">Start Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        id="start"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="pl-10"
                                        aria-label="start-date"
                                    />
                                </div>
                            </Field>
                            <Field>
                                <Label htmlFor="end">End Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
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
                                <Label>Visibility Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active (Visible)</SelectItem>
                                        <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label>Visibility Type</Label>
                                <Select value={type} onValueChange={(val) => setType(val as AnnouncementType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public (Home Page)</SelectItem>
                                        <SelectItem value="private">Private (Dashboard Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field>
                            <Label>Update Banner (Recommended 1200x400)</Label>
                            {!file ? (
                                <div className="group relative overflow-hidden rounded-xl border">
                                    <img
                                        src={getFileUrl(announcement.bannerImage)}
                                        alt="Current Banner"
                                        className="h-24 w-full object-cover opacity-50 transition-opacity group-hover:opacity-30"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <label htmlFor="banner-edit" className="relative cursor-pointer font-bold text-primary transition-colors flex items-center gap-2">
                                            <Upload className="size-4" />
                                            <span>Replace Image</span>
                                            <input id="banner-edit" name="banner-edit" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 rounded-xl">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 rounded-lg border flex items-center justify-center">
                                            <ImageIcon className="size-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-semibold truncate tracking-tight">{file.name}</span>
                                            <span className="text-[11px] text-muted-foreground">New Image Selected</span>
                                        </div>
                                    </div>
                                    <Button aria-label="exit" type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setFile(null)}>
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
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Applying Changes...
                                </>
                            ) : (
                                "Update Announcement"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
