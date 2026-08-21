import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useAnnouncementsQuery, useDeleteAnnouncementMutation } from "@/api/academyHooks.ts";
import { getFileUrl } from "@/api/http.ts";
import type { AnnouncementResponse } from "@/api/types.ts";
import {
    Megaphone,
    Search,
    MoreVertical,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Pencil, UsersIcon
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
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
import AddAnnouncementForm from "./AddAnnouncementForm.tsx";
import EditAnnouncementModal from "./EditAnnouncementModal.tsx";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider.tsx";
import {Card, CardTitle} from "@/components/ui/card.tsx";


export default function AdminAnnouncementsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Announcements"
            sidebar={<AdminSidebar />}
            bodyTitle="Announcements"
            description="Manage sitewide messages and banners"
            icon={<UsersIcon />}
            bodyToolbar={
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notices..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search notices"
                        />
                    </div>
                    <AddAnnouncementForm />
                </div>
            }
        >
            <AnnouncementsContent
                searchTerm={searchTerm}
            />
        </DashboardLayoutProvider>
    )
}

function AnnouncementsContent({searchTerm}: {searchTerm: string;}) {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);

    const { data, isLoading, isError, error, refetch } = useAnnouncementsQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize
    });

    const announcements = data?.data || [];
    const totalPages = data?.totalPages || 0;

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full">
            {isLoading ? (
                <div className="flex min-h-100 items-center justify-center">
                    <Spinner className="size-10" />
                </div>
            ) : isError ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 text-sm text-destructive font-medium rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <p>{error?.message || "An unexpected error occurred while fetching announcements."}</p>
                    <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full">
                        <Megaphone className="size-10 text-slate-300 dark:text-slate-700" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No announcements found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">Schedule important notices or sitewide banners to keep your students informed.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        {filteredAnnouncements.map((announcement) => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} />
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

function AnnouncementCard({ announcement }: { announcement: AnnouncementResponse }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const deleteMutation = useDeleteAnnouncementMutation();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(announcement.id);
            toast.success("Announcement deleted permanently");
        } catch {
            toast.error("Failed to delete announcement");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const isExpired = new Date(announcement.endDate) < new Date();
    const isActive = announcement.status === 'active' && !isExpired;

    return (
        <Card className={`p-0 transition-all hover:shadow-lg relative overflow-hidden ${isExpired ? 'opacity-60 grayscale-[0.3] bg-muted/20' : ''}`}>
            {/* Banner Area */}
            <div className="relative h-48 w-full overflow-hidden border-b">
                <img
                    src={getFileUrl(announcement.bannerImage)}
                    alt={announcement.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    {isExpired ? (
                        <Badge variant="secondary" className="bg-slate-500 text-white h-8">
                            <Clock className="size-3 mr-1" />
                            Expired
                        </Badge>
                    ) : (
                        <Badge className={`${isActive ? 'bg-emerald-500' : 'bg-rose-500'} capitalize px-2 h-8`}>
                            {isActive ? <CheckCircle2 className="size-3 mr-1" /> : <XCircle className="size-3 mr-1" />}
                            {announcement.status}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 content-between w-full justify-center px-5 pb-5">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 pr-4">
                        <CardTitle className="font-semibold text-xl">
                            {announcement.title}
                        </CardTitle>
                        {announcement.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                                {announcement.description}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="vert-dots">
                                <MoreVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-fit">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Notice
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-100 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-muted-foreground tracking-widest">Starts</span>
                        <div className="flex items-center gap-2 text-gray-800 dark:text-slate-100 font-bold">
                            <Calendar className="size-4 text-primary" />
                            {new Date(announcement.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-100 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-muted-foreground tracking-widest">Expires</span>
                        <div className="flex items-center gap-2 text-gray-800 dark:text-slate-100 font-bold">
                            <Clock className="size-4 text-orange-400" />
                            {new Date(announcement.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Announcement</DialogTitle>
                        <DialogDescription>
                            This notice will be removed from all student dashboards immediately. This action cannot be undone.
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

            <EditAnnouncementModal
                announcement={announcement}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </Card>
    );
}
