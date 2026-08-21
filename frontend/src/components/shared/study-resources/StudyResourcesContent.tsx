import { useState, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    useStudyResourcesQuery,
    useDeleteStudyResourceMutation,
    useSubjectsQuery,
    useLecturesQuery,
    useMySubjectsQuery
} from "@/api/academyHooks.ts";
import { getFileUrl } from "@/api/http.ts";
import AddResourceForm from "@/pages/admin/study-resources/AddResourceForm.tsx";
import type { StudyResourceResponse } from "@/api/types.ts";
import { useCurrentUserQuery } from "@/api/authHooks.ts";
import {
    Download,
    Pencil,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileIcon,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";

export function StudyResourcesContent({ searchTerm }: { searchTerm: string }) {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);

    const { data: user } = useCurrentUserQuery();
    const isAdmin = user?.role === "admin";

    const { data, isLoading, isError, error } = useStudyResourcesQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize
    });

    const { data: allSubjects } = useSubjectsQuery();
    const { data: mySubjects } = useMySubjectsQuery();
    const subjects = isAdmin ? allSubjects : mySubjects;
    const { data: lectures } = useLecturesQuery({ limit: 100 });

    const resources = data?.data || [];
    const totalPages = data?.totalPages || 0;

    const filteredResources = resources.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='w-full'>
            {isLoading ? (
                <div className="flex min-h-100 items-center justify-center">
                    <Spinner className="size-10" />
                </div>
            ) : isError ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 text-sm text-destructive font-medium bg-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <p>{error?.message || "An unexpected error occurred while fetching study resources."}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 bg-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full">
                        <FileIcon className="size-10 text-slate-300 dark:text-slate-700" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No resources found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredResources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} subjects={subjects || []} lectures={lectures?.data || []} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="bg-white"
                                aria-label="Page navigation"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-300 px-4">
                                Page {page} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="bg-white dark:bg-slate-900"
                                aria-label="Page navigation"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ResourceCard({ resource, subjects, lectures }: { resource: StudyResourceResponse; subjects: any[]; lectures: any[] }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const deleteMutation = useDeleteStudyResourceMutation();
    const { data: user } = useCurrentUserQuery();
    const isStaff = user?.role === 'admin' || user?.role === 'teacher';

    const subjectName = useMemo(() => {
        return subjects.find(s => s.id === resource.subjectId)?.name || 'Unknown Subject';
    }, [subjects, resource.subjectId]);

    const lectureLabel = useMemo(() => {
        if (!resource.lectureId || resource.lectureId === 'none') return null;
        const lecture = lectures.find(l => l.id === resource.lectureId);
        if (!lecture) return null;
        return `LEC: ${new Date(lecture.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }, [lectures, resource.lectureId]);

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(resource.id);
            toast.success("Resource deleted successfully");
        } catch {
            toast.error("Failed to delete resource");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const getFileVisual = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        const fullUrl = getFileUrl(path);

        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
            return (
                <img
                    src={fullUrl}
                    alt="Resource Thumbnail"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            );
        }

        if (ext === 'pdf') {
            return (
                <div className="flex flex-col items-center justify-center size-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 gap-2">
                    <FileIcon className="size-10" />
                    <span className="text-[10px] font-bold tracking-widest">PDF Document</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center size-full bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 gap-2">
                <FileIcon className="size-10" />
                <span className="text-[10px] font-bold tracking-widest">Resource File</span>
            </div>
        );
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/60 hover:-translate-y-1">
            <div className="relative h-40 w-full overflow-hidden border-b border-slate-100 dark:border-slate-800">
                {getFileVisual(resource.filePath)}
                <div
                    className="absolute inset-0 bg-black/10 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => window.open(getFileUrl(resource.filePath), "_blank")}
                >
                    <div className="bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-full scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-black/20">
                        <Download className="size-5 text-primary" />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                            {resource.title}
                        </h3>
                        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {resource.description}
                        </p>
                    </div>
                    {isStaff && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Menu">
                                    <MoreVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-fit">
                                <DropdownMenuItem onClick={() => window.open(getFileUrl(resource.filePath), "_blank")}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-1">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold p-2">
                        {subjectName}
                    </Badge>
                    {lectureLabel && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold p-2">
                            {lectureLabel}
                        </Badge>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {new Date(resource.uploadAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-primary hover:text-primary hover:bg-primary/5 gap-2 px-3"
                        onClick={() => window.open(getFileUrl(resource.filePath), "_blank")}
                    >
                        Download
                        <Download className="size-3" />
                    </Button>
                </div>
            </div>

            {/* Dialogs */}
            {isStaff && isEditDialogOpen && (
                <AddResourceForm
                    resourceToEdit={resource}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                />
            )}

            {isStaff && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Study Material</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to permanently delete "{resource.title}"? This will remove access for all students.
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
                                {deleteMutation.isPending ? "Deleting..." : "Confirm Deletion"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
