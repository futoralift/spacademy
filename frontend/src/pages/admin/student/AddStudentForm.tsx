import { useState, type SubmitEventHandler } from "react";
import { Plus } from "lucide-react";

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
import { Spinner } from "@/components/ui/spinner.tsx";
import { useCreateStudentMutation } from "@/api/userHooks.ts";
import type { StudentRequest } from "@/api/types.ts";
import { useCourses } from "@/hooks/api/useCourses.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const DEFAULT_STUDENT_AVATAR = "storage/profile-placeholder.png";

export default function AddStudentForm() {
    const [open, setOpen] = useState(false);
    const [courseIds, setCourseIds] = useState<string[]>([]);
    const createStudentMutation = useCreateStudentMutation();
    const courses = useCourses();

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (courseIds.length === 0) {
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);
        const avatar = String(formData.get("avatar") ?? "").trim();
        const payload: StudentRequest = {
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            avatar: avatar || DEFAULT_STUDENT_AVATAR,
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            password: String(formData.get("password") ?? ""),
            rollNo: String(formData.get("rollNo") ?? ""),
            courseIds,
            standard: String(formData.get("standard") ?? ""),
            board: String(formData.get("board") ?? ""),
            schoolName: String(formData.get("schoolName") ?? ""),
            parentName: String(formData.get("parentName") ?? ""),
            parentMobileNumber: String(formData.get("parentMobileNumber") ?? ""),
        };

        createStudentMutation.mutate(payload, {
            onSuccess: () => {
                form.reset();
                setCourseIds([]);
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus /> Add Student</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Student</DialogTitle>
                    <DialogDescription>
                        Add the student&apos;s academic profile, contact details, and parent information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <Label htmlFor="first-name">First Name</Label>
                            <Input id="first-name" name="firstName" placeholder="Enter student's first name" required aria-label="first-name" />
                        </Field>
                        <Field>
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input id="last-name" name="lastName" placeholder="Enter student's last name" required aria-label="last-name" />
                        </Field>
                        <Field>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="Enter student email" required aria-label="email" />
                        </Field>
                        <Field>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="Enter student phone number" required aria-label="phone" />
                        </Field>
                        <Field>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" placeholder="Enter student password" required aria-label="password" />
                        </Field>
                        <Field>
                            <Label htmlFor="roll-no">Roll No</Label>
                            <Input id="roll-no" name="rollNo" placeholder="Enter student roll no" required aria-label="roll-no" />
                        </Field>
                        <Field className="sm:col-span-2">
                            <Label>Select Enrolled Courses</Label>
                            <div className="mt-2 rounded-xl border p-2">
                                {courses.isLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Spinner />
                                    </div>
                                ) : courses.isError ? (
                                    <p className="text-sm text-destructive">Failed to load courses.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {courses.data?.map((course) => (
                                            <div key={course.id} className="flex items-center space-x-3 border p-3 rounded-lg">
                                                <Checkbox
                                                    id={`course-${course.id}`}
                                                    checked={courseIds.includes(course.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setCourseIds([...courseIds, course.id])
                                                        } else {
                                                            setCourseIds(courseIds.filter(id => id !== course.id))
                                                        }
                                                    }}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor={`course-${course.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {course.name}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {courseIds.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                                        {courseIds.map(id => {
                                            const course = courses.data?.find(c => c.id === id);
                                            return (
                                                <Badge key={id} variant="secondary" className="px-2 py-1">
                                                    {course?.name || id}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </Field>
                        <Field>
                            <Label htmlFor="standard">Standard</Label>
                            <Select name="standard">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student standard" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="8th">8th</SelectItem>
                                    <SelectItem value="9th">9th</SelectItem>
                                    <SelectItem value="10th">10th</SelectItem>
                                    <SelectItem value="11th">11th</SelectItem>
                                    <SelectItem value="12th">12th</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <Label htmlFor="board">Board</Label>
                            <Input id="board" name="board" placeholder="Enter student board" required aria-label="board" />
                        </Field>
                        <Field>
                            <Label htmlFor="school-name">School Name</Label>
                            <Input id="school-name" name="schoolName" placeholder="Enter student school name" required aria-label="school-name" />
                        </Field>
                        <Field>
                            <Label htmlFor="parent-name">Parent Name</Label>
                            <Input id="parent-name" name="parentName" placeholder="Enter student parent name" required aria-label="parent-name" />
                        </Field>
                        <Field>
                            <Label htmlFor="parent-mobile-number">Parent Mobile Number</Label>
                            <Input
                                id="parent-mobile-number"
                                name="parentMobileNumber"
                                type="tel"
                                placeholder="Enter student's parent number"
                                required
                                aria-label="parent-mobile-number"
                            />
                        </Field>
                        <Field className="sm:col-span-2">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input
                                id="avatar"
                                name="avatar"
                                placeholder={DEFAULT_STUDENT_AVATAR}
                                value={DEFAULT_STUDENT_AVATAR}
                                aria-label="avatar"
                            />
                        </Field>
                    </FieldGroup>
                    {courseIds.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            Select at least one course before submitting. All other fields should match the student&apos;s official details.
                        </p>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={createStudentMutation.isPending || courseIds.length === 0 || courses.isLoading}
                        >
                            {createStudentMutation.isPending ? "Adding..." : "Add Student"}
                        </Button>
                    </DialogFooter>
                    {courses.isError && (
                        <p className="text-sm text-destructive">
                            Failed to load courses.
                        </p>
                    )}
                    {createStudentMutation.isError && (
                        <p className="text-sm text-destructive">
                            {createStudentMutation.error.message}
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
