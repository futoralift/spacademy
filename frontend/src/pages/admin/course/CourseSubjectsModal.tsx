import { useState } from "react";
import { Plus, Trash, Edit, LoaderCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useSubjectsQuery, useCreateSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation } from "@/api/academyHooks.ts";
import { useTeachersQuery } from "@/api/userHooks.ts";
import type { CourseResponse, SubjectResponse, SubjectRequest } from "@/api/types.ts";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Field, FieldGroup} from "@/components/ui/field.tsx";

interface CourseSubjectsModalProps {
    course: CourseResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CourseSubjectsModal({ course, open, onOpenChange }: CourseSubjectsModalProps) {
    const subjectsQuery = useSubjectsQuery();
    const teachersQuery = useTeachersQuery({ limit: 100, offset: 0 });
    
    const createMutation = useCreateSubjectMutation();
    const updateMutation = useUpdateSubjectMutation();
    const deleteMutation = useDeleteSubjectMutation();

    const [editingSubject, setEditingSubject] = useState<SubjectResponse | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state
    const [name, setName] = useState("");
    const [teacherId, setTeacherId] = useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setTeacherId(null);
        setEditingSubject(null);
        setIsAdding(false);
    };

    const courseSubjects = subjectsQuery.data?.filter(s => s.courseId === course.id) || [];

    const handleCreate = async () => {
        if (!name.trim()) return;
        try {
            const payload: SubjectRequest = {
                name,
                teacherId: teacherId || null,
                courseId: course.id
            };
            await createMutation.mutateAsync(payload);
            toast.success("Subject added");
            resetForm();
        } catch {
            toast.error("Failed to add subject");
        }
    };

    const handleUpdate = async () => {
        if (!editingSubject || !name.trim()) return;
        try {
            const payload: SubjectResponse = {
                ...editingSubject,
                name,
                teacherId: teacherId || null,
            };
            await updateMutation.mutateAsync(payload);
            toast.success("Subject updated");
            resetForm();
        } catch {
            toast.error("Failed to update subject");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Subject deleted");
        } catch {
            toast.error("Failed to delete subject");
        }
    };

    const startEdit = (subject: SubjectResponse) => {
        setEditingSubject(subject);
        setName(subject.name);
        setTeacherId(subject.teacherId);
        setIsAdding(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-5xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Subjects - {course.name}</DialogTitle>
                    <DialogDescription>
                        Manage subjects for this course.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{courseSubjects.length} Subjects Total</span>
                        {!isAdding && !editingSubject && (
                            <Button size="sm" onClick={() => setIsAdding(true)}>
                                <Plus /> Add Subject
                            </Button>
                        )}
                    </div>

                    {(isAdding || editingSubject) && (
                        <FieldGroup className="bg-muted/50 w-full p-3 rounded-lg flex items-end gap-3 flex-wrap sm:flex-nowrap border">
                            <Field>
                                <Label className="text-xs">Subject Name</Label>
                                <Input 
                                    size={1} 
                                    placeholder="e.g. Mathematics" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    aria-label="subject"
                                />
                            </Field>
                            <Field>
                                <Label className="text-xs">Teacher</Label>
                                <Select 
                                    value={teacherId || "none"} 
                                    onValueChange={(v) => setTeacherId(v === "none" ? null : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assign teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Teacher</SelectItem>
                                        {teachersQuery.data?.data.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.firstName} {t.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field className="flex gap-2">
                                <Button aria-label="exit" size="icon" variant="outline" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    onClick={editingSubject ? handleUpdate : handleCreate}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    aria-label="check"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                            </Field>
                        </FieldGroup>
                    )}

                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject Name</TableHead>
                                    <TableHead>Assigned Teacher</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjectsQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-6">
                                            <Spinner className="mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : courseSubjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                            No subjects found for this course.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    courseSubjects.map((subject) => (
                                        <TableRow key={subject.id}>
                                            <TableCell className="font-medium text-sm">{subject.name}</TableCell>
                                            <TableCell className="text-sm">
                                                {subject.teacherId ? (
                                                    teachersQuery.data?.data.find(t => t.id === subject.teacherId)
                                                        ? `${teachersQuery.data?.data.find(t => t.id === subject.teacherId)?.firstName} ${teachersQuery.data?.data.find(t => t.id === subject.teacherId)?.lastName}`
                                                        : subject.teacherId
                                                ) : (
                                                    <span className="text-muted-foreground italic">Not Assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 text-xs">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8"
                                                        onClick={() => startEdit(subject)}
                                                        aria-label="edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(subject.id)}
                                                        disabled={deleteMutation.isPending}
                                                        aria-label="delete"
                                                    >
                                                        {deleteMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
