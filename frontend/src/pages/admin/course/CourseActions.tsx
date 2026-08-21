import { useState } from "react";
import { MoreHorizontal, Trash, Edit, BookOpen, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import type { CourseResponse } from "@/api/types.ts";
import { useDeleteCourseMutation } from "@/api/academyHooks.ts";
import { toast } from "sonner";
import EditCourseModal from "@/pages/admin/course/EditCourseModal.tsx";
import CourseSubjectsModal from "@/pages/admin/course/CourseSubjectsModal.tsx";

interface CourseActionsProps {
    course: CourseResponse;
}

export default function CourseActions({ course }: CourseActionsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
    const deleteMutation = useDeleteCourseMutation();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(course.id);
            toast.success("Course deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch {
            toast.error("Failed to delete course");
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-fit">
                    <DropdownMenuItem onClick={() => setIsSubjectsOpen(true)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Subjects
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Course
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditCourseModal
                course={course}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            <CourseSubjectsModal
                course={course}
                open={isSubjectsOpen}
                onOpenChange={setIsSubjectsOpen}
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the course "{course.name}" and all its related data.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Delete Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
