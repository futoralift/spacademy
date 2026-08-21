import { useState, type SubmitEventHandler } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import { Field, FieldGroup } from "@/components/ui/field.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useUpdateCourseMutation } from "@/api/academyHooks.ts";
import type { CourseUpdateUploadRequest, CourseResponse } from "@/api/types.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { toast } from "sonner";
import { parsePostgresList } from "@/lib/utils";

interface EditCourseModalProps {
    course: CourseResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditCourseModal({ course, open, onOpenChange }: EditCourseModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Course</DialogTitle>
                    <DialogDescription>
                        Update course details.
                    </DialogDescription>
                </DialogHeader>
                <EditCourseForm key={course.id} course={course} onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
}

function EditCourseForm({ course, onOpenChange }: Pick<EditCourseModalProps, "course" | "onOpenChange">) {
    const updateCourseMutation = useUpdateCourseMutation();

    const [mode, setMode] = useState<CourseUpdateUploadRequest["mode"]>(course.mode);
    const [currency, setCurrency] = useState<CourseUpdateUploadRequest["currency"]>(course.currency || "INR");
    const [isActive, setIsActive] = useState<"true" | "false">(String(course.isActive) as "true" | "false");
    const [isPaid, setIsPaid] = useState<"true" | "false">(String(course.isPaid) as "true" | "false");

    const [standards, setStandards] = useState<string[]>(parsePostgresList(course.standards).length ? parsePostgresList(course.standards) : [""]);
    const [highlights, setHighlights] = useState<string[]>(parsePostgresList(course.highlights).length ? parsePostgresList(course.highlights) : [""]);

    const handleAddStandard = () => setStandards([...standards, ""]);
    const handleRemoveStandard = (index: number) => {
        const newStandards = [...standards];
        newStandards.splice(index, 1);
        setStandards(newStandards.length ? newStandards : [""]);
    };
    const handleStandardChange = (index: number, value: string) => {
        const newStandards = [...standards];
        newStandards[index] = value;
        setStandards(newStandards);
    };

    const handleAddHighlight = () => setHighlights([...highlights, ""]);
    const handleRemoveHighlight = (index: number) => {
        const newHighlights = [...highlights];
        newHighlights.splice(index, 1);
        setHighlights(newHighlights.length ? newHighlights : [""]);
    };
    const handleHighlightChange = (index: number, value: string) => {
        const newHighlights = [...highlights];
        newHighlights[index] = value;
        setHighlights(newHighlights);
    };

    const handleModeChange = (value: string) => {
        if (value === "offline" || value === "online") {
            setMode(value);
        }
    };

    const handleCurrencyChange = (value: string) => {
        if (value === "INR" || value === "USD") {
            setCurrency(value);
        }
    };

    const handleIsActiveChange = (value: string) => {
        if (value === "true" || value === "false") {
            setIsActive(value);
        }
    };

    const handleIsPaidChange = (value: string) => {
        if (value === "true" || value === "false") {
            setIsPaid(value);
        }
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const imageFile = formData.get("image") as File;

        const payload: CourseUpdateUploadRequest = {
            id: course.id,
            name: String(formData.get("name") ?? ""),
            description: String(formData.get("description") ?? ""),
            standards: standards.filter(Boolean),
            highlights: highlights.filter(Boolean),
            isActive: isActive === "true",
            isPaid: isPaid === "true",
            mode,
            amount: Number(formData.get("amount") ?? 0),
            currency,
            image: imageFile && imageFile.size > 0 ? imageFile : undefined,
        };

        updateCourseMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Course updated successfully");
                onOpenChange(false);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input aria-label="Course name" id="course-name" name="name" defaultValue={course.name} required />
                </Field>
                <Field className="sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input aria-label="Course description" id="description" name="description" defaultValue={course.description} required />
                </Field>
                <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="standards">Standards</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddStandard}>
                            <Plus className="mr-1 size-3" /> Add Standard
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {standards.map((std, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={std}
                                    onChange={(e) => handleStandardChange(index, e.target.value)}
                                    placeholder="e.g. 10th"
                                    required
                                />
                                {standards.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveStandard(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Field>
                <Field>
                    <Label htmlFor="mode">Mode</Label>
                    <Select value={mode} onValueChange={handleModeChange}>
                        <SelectTrigger aria-label="Course mode">
                            <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <Label htmlFor="image">Course Image (optional)</Label>
                    <Input aria-label="Course image" id="image" name="image" type="file" accept="image/*" />
                </Field>
                <Field>
                    <Label htmlFor="amount">Amount</Label>
                    <Input aria-label="Course amount" id="amount" name="amount" type="number" defaultValue={course.amount} step="0.01" required />
                </Field>
                <Field>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger aria-label="Course currency">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="highlights">Highlights</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddHighlight}>
                            <Plus className="mr-1 size-3" /> Add Highlight
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {highlights.map((h, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={h}
                                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                                    placeholder="e.g. Best Faculty"
                                    required
                                />
                                {highlights.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveHighlight(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Field>
                <Field>
                    <Label htmlFor="isActive">Status</Label>
                    <Select value={isActive} onValueChange={handleIsActiveChange}>
                        <SelectTrigger aria-label="Course status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <Label htmlFor="isPaid">Type</Label>
                    <Select value={isPaid} onValueChange={handleIsPaidChange}>
                        <SelectTrigger aria-label="Course type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Paid</SelectItem>
                            <SelectItem value="false">Free</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
            </FieldGroup>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button" aria-label="Cancel course editing">Cancel</Button>
                </DialogClose>
                <Button
                    type="submit"
                    disabled={updateCourseMutation.isPending}
                    aria-label="Save course changes"
                >
                    {updateCourseMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
            {updateCourseMutation.isError && (
                <p className="text-sm text-destructive">
                    {updateCourseMutation.error.message}
                </p>
            )}
        </form>
    );
}
