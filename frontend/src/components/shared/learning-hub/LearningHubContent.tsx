import { useState } from "react";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useLearningHubVideosQuery, useDeleteLearningHubVideoMutation, usePublicLearningHubVideosQuery } from "@/api/academyHooks.ts";
import { getFileUrl } from "@/api/http.ts";
import AddVideoForm from "@/pages/admin/learning-hub/AddVideoForm.tsx";
import type { LearningHubVideoResponse } from "@/api/types.ts";
import { useCurrentUserQuery } from "@/api/authHooks.ts";
import {
    TvMinimalPlay,
    MoreVertical,
    PlayCircle,
    Pencil,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Play
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

export function LearningHubContent({ searchTerm }: { searchTerm: string }) {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);
    const { data: user } = useCurrentUserQuery();
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'teacher';
    const isStaff = isAdmin || isTeacher;

    const adminQuery = useLearningHubVideosQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize
    });

    const publicQuery = usePublicLearningHubVideosQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize
    });

    const { data, isLoading, isError, error } = isStaff ? adminQuery : publicQuery;

    const videos = data?.data || [];
    const totalPages = data?.totalPages || 0;

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.videoType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='w-full'>
            {isLoading ? (
                <div className="flex min-h-100 items-center justify-center">
                    <Spinner className="size-10" />
                </div>
            ) : isError ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 text-sm text-destructive font-medium rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <p>{error?.message || "An unexpected error occurred while fetching videos."}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full">
                        <TvMinimalPlay className="size-10 text-slate-300 dark:text-slate-700" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No videos found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
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
                                className=""
                                aria-label="prev"
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
                                className=""
                                aria-label="next"
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

function VideoCard({ video }: { video: LearningHubVideoResponse }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const deleteMutation = useDeleteLearningHubVideoMutation();
    const { data: user } = useCurrentUserQuery();
    const isStaff = user?.role === 'admin' || user?.role === 'teacher';

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(video.id);
            toast.success("Video removed successfully");
        } catch {
            toast.error("Failed to delete video");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const typeLabels: Record<string, string> = {
        educational_explanation: "Explanation",
        short_concept: "Short Concept",
        exam_preparation_guidance: "Exam Guidance"
    };

    const typeColors: Record<string, string> = {
        educational_explanation: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
        short_concept: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
        exam_preparation_guidance: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:border-primary/20 bg-card">
            {/* Thumbnail Area */}
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={video.thumbnail ? getFileUrl(video.thumbnail) : `https://img.youtube.com/vi/${video.youtubeVideoId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`;
                    }}
                />
                <div
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => window.open(video.youtubeLink, "_blank")}
                >
                    <div className="/90 p-3 rounded-full scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-black/20">
                        <Play className="size-6 text-primary fill-primary" />
                    </div>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                    <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                    YOUTUBE
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <Badge variant="outline" className={`text-[10px] font-bold ${typeColors[video.videoType] || 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
                        {typeLabels[video.videoType] || video.videoType}
                    </Badge>
                    {isStaff && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="more-vert">
                                    <MoreVertical className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => window.open(video.youtubeLink, "_blank")}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Watch Video
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Details
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

                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-3 min-h-10 group-hover:text-primary transition-colors">
                    {video.title}
                </h3>

                <div className="mt-auto flex items-center gap-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-800/50 pt-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(video.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {isStaff && isEditDialogOpen && (
                <AddVideoForm
                    videoToEdit={video}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                />
            )}

            {isStaff && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Video</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove "{video.title}"? This action cannot be undone.
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
                                {deleteMutation.isPending ? "Removing..." : "Confirm Removal"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
