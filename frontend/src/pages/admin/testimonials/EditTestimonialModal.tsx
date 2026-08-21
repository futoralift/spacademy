import { useState, useEffect } from "react";
import { Upload, Loader2, FileIcon, X, Star } from "lucide-react";
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
import { useUpdateTestimonialMutation } from "@/api/academyHooks.ts";
import type { TestimonialResponse } from "@/api/types.ts";
import { toast } from "sonner";
import { Field, FieldGroup } from "@/components/ui/field.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";


interface EditTestimonialModalProps {
    testimonial: TestimonialResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditTestimonialModal({ testimonial, open, onOpenChange }: EditTestimonialModalProps) {
    const [studentName, setStudentName] = useState(testimonial.studentName);
    const [courseName, setCourseName] = useState(testimonial.courseName || "");
    const [content, setContent] = useState(testimonial.content);
    const [rating, setRating] = useState(testimonial.rating);
    const [isActive, setIsActive] = useState(testimonial.isActive);
    const [file, setFile] = useState<File | null>(null);
    
    const updateMutation = useUpdateTestimonialMutation();

    useEffect(() => {
        if (open) {
            setStudentName(testimonial.studentName);
            setCourseName(testimonial.courseName || "");
            setContent(testimonial.content);
            setRating(testimonial.rating);
            setIsActive(testimonial.isActive);
            setFile(null);
        }
    }, [open, testimonial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentName.trim() || !content.trim()) {
            toast.error("Student name and testimonial content are required");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: testimonial.id,
                studentName,
                content,
                courseName,
                rating,
                isActive,
                file
            });
            toast.success("Testimonial updated successfully");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to update testimonial");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Testimonial</DialogTitle>
                    <DialogDescription>
                        Update the details of this student success story.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="editStudentName">Student Name</Label>
                            <Input
                                id="editStudentName"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="E.g., John Doe"
                                required
                            />
                        </Field>
                        
                        <Field>
                            <Label htmlFor="editCourseName">Course/Achievement (Optional)</Label>
                            <Input
                                id="editCourseName"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="E.g., JEE Main 2024 - 99.5%"
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="editContent">Testimonial Content</Label>
                            <Textarea
                                id="editContent"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What did the student say?"
                                className="resize-none"
                                rows={4}
                                required
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label>Rating</Label>
                                <Select value={String(rating)} onValueChange={(val) => setRating(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 4, 3, 2, 1].map((r) => (
                                            <SelectItem key={r} value={String(r)}>
                                                <div className="flex items-center gap-1">
                                                    {r} <Star className="size-3 fill-amber-400 text-amber-400" />
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label>Visibility</Label>
                                <Select value={String(isActive)} onValueChange={(val) => setIsActive(val === "true")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Visible (Live)</SelectItem>
                                        <SelectItem value="false">Hidden (Draft)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field>
                            <Label>Update Avatar (Optional)</Label>
                            {!file ? (
                                <div className="group relative mt-1 flex justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-6 transition-colors hover:border-primary/50 hover:bg-primary/5">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-slate-400 transition-colors group-hover:text-primary" />
                                        <div className="mt-4 flex text-sm leading-6 text-slate-600 font-medium">
                                            <label htmlFor="edit-avatar-upload" className="relative cursor-pointer rounded-md font-bold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                                                <span>Click to change avatar</span>
                                                <input id="edit-avatar-upload" name="edit-avatar-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*" />
                                            </label>
                                        </div>
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
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/10" onClick={() => setFile(null)}>
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
                                    Updating...
                                </>
                            ) : (
                                "Update Testimonial"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
