import { useState, type SubmitEventHandler } from "react";
import { Plus, LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import { Field, FieldGroup } from "@/components/ui/field.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useCreateCourseMutation } from "@/api/academyHooks.ts";
import type { CourseUploadRequest } from "@/api/types.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { toast } from "sonner";

export default function AddCourseForm() {
    const [open, setOpen] = useState(false);
    const createCourseMutation = useCreateCourseMutation();

    // Select states
    const [mode, setMode] = useState<string>("offline");
    const [currency, setCurrency] = useState<string>("INR");
    const [isActive, setIsActive] = useState<string>("true");
    const [isPaid, setIsPaid] = useState<string>("true");

    const [standards, setStandards] = useState<string[]>([""]);
    const [highlights, setHighlights] = useState<string[]>([""]);

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

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const imageFile = formData.get("image") as File;

        if (!imageFile || imageFile.size === 0) {
            toast.error("Please select a course image");
            return;
        }

        const payload: CourseUploadRequest = {
            name: String(formData.get("name") ?? ""),
            description: String(formData.get("description") ?? ""),
            standards: standards.filter(Boolean),
            image: imageFile,
            highlights: highlights.filter(Boolean),
            isActive: isActive === "true",
            isPaid: isPaid === "true",
            mode: mode as any,
            amount: Number(formData.get("amount") ?? 0),
            currency: currency,
        };

        createCourseMutation.mutate(payload, {
            onSuccess: () => {
                toast.success("Course created successfully");
                form.reset();
                setOpen(false);
                setMode("offline");
                setCurrency("INR");
                setIsActive("true");
                setIsPaid("true");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 size-4" /> Add Course</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add Course</DialogTitle>
                    <DialogDescription>
                        Create a new academic course.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                            <Label htmlFor="course-name">Course Name</Label>
                            <Input aria-label="name" id="course-name" name="name" placeholder="e.g. Science Excellence Batch" required />
                        </Field>
                        <Field className="sm:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Input aria-label="description" id="description" name="description" placeholder="Short description of the course" required />
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
                            <Select value={mode} onValueChange={setMode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offline">Offline</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <Label htmlFor="image">Course Image</Label>
                            <Input aria-label="image" id="image" name="image" type="file" accept="image/*" required />
                        </Field>
                        <Field>
                            <Label htmlFor="amount">Amount</Label>
                            <Input aria-label="ammount" id="amount" name="amount" type="number" placeholder="0.00" step="0.01" required />
                        </Field>
                        <Field>
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
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
                            <Select value={isActive} onValueChange={setIsActive}>
                                <SelectTrigger>
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
                            <Select value={isPaid} onValueChange={setIsPaid}>
                                <SelectTrigger>
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
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={createCourseMutation.isPending}
                        >
                            {createCourseMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Create Course
                        </Button>
                    </DialogFooter>
                    {createCourseMutation.isError && (
                        <p className="text-sm text-destructive">
                            {createCourseMutation.error.message}
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
