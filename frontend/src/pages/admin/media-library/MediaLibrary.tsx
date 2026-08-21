import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { useMediaAssetsQuery, useDeleteMediaAssetMutation, useSyncMediaAssetsMutation } from "@/api/academyHooks.ts";
import { getFileUrl } from "@/api/http.ts";
import type { MediaAssetResponse } from "@/api/types.ts";
import {
    Images,
    Search,
    MoreVertical,
    Download,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileIcon,
    FileText,
    Video,
    User,
    CheckCircle2,
    Archive,
    Info,
    Eye
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
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
import AddMediaForm from "./AddMediaForm.tsx";
import DashboardLayoutProvider from '@/pages/DashboardLayoutProvider.tsx';
import {HiOutlineRefresh} from "react-icons/hi";


export default function AdminMediaLibraryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");

    const syncMutation = useSyncMediaAssetsMutation();

    const handleSync = async () => {
        try {
            await syncMutation.mutateAsync();
            toast.success("Media library synchronized with storage");
        } catch {
            toast.error("Failed to sync media assets");
        }
    };

    return (
        <DashboardLayoutProvider
            pageTitle="Media Library"
            sidebar={<AdminSidebar />}
            bodyTitle="Media Library"
            description="Manage all uploaded assets across the academy"
            icon={<Images className="size-6" />}
            bodyToolbar={
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search assets..."
                            className="pl-10 bg-card border-slate-200 dark:border-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="search assets"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {selectedType === "all" ? "All Types" : selectedType}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup
                                value={selectedType}
                                onValueChange={setSelectedType}
                            >
                                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="blog">Blog</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={handleSync}>
                        <HiOutlineRefresh />
                        Sync
                    </Button>

                    <AddMediaForm />
                </div>
            }
        >
            <MediaLibraryContent
                searchTerm={searchTerm}
                selectedType={selectedType}
            />
        </DashboardLayoutProvider>
    );
}

function MediaLibraryContent({
    searchTerm,
    selectedType,
}: {
    searchTerm: string;
    selectedType: string;
}) {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);

    const { data } = useMediaAssetsQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        media_type: selectedType === "all" ? undefined : (selectedType as any),
    });

    const assets = data?.data || [];
    const totalPages = data?.totalPages || 0;

    const filteredAssets = assets.filter((v) =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='w-full'>
            {/* UI SAME AS BEFORE */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAssets.map((asset) => (
                        <MediaCard key={asset.id} asset={asset} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
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
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            aria-label="Page navigation"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function MediaCard({ asset }: { asset: MediaAssetResponse }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const deleteMutation = useDeleteMediaAssetMutation();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(asset.id);
            toast.success("Asset deleted permanently");
        } catch {
            toast.error("Failed to delete asset");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const isImage = asset.contentType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(asset.originalFilename.split('.').pop()?.toLowerCase() || '');
    const isPdf = asset.originalFilename.toLowerCase().endsWith('.pdf');

    const typeIcons: Record<string, any> = {
        study_resource: FileText,
        blog: FileText,
        learning_hub: Video,
        assignment: FileIcon,
        announcement: Info,
        student: User,
        user: User,
        course: Archive,
        test: CheckCircle2,
    };

    const Icon = typeIcons[asset.mediaType] || FileIcon;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/60 hover:-translate-y-1">
            {/* Visual Area */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
                {isImage ? (
                    <img
                        src={getFileUrl(asset.filePath)}
                        alt={asset.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className={`flex flex-col items-center justify-center size-full gap-2 ${isPdf ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-600'}`}>
                        <Icon className="size-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{asset.mediaType.replace('_', ' ')}</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-10 w-10 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 scale-75 group-hover:scale-100 transition-transform shadow-lg"
                        onClick={() => window.open(getFileUrl(asset.filePath), "_blank")}
                        aria-label="eye"
                    >
                        <Eye className="size-5 text-slate-700 dark:text-slate-200" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-10 w-10 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 scale-75 group-hover:scale-100 transition-delay-100 transition-transform shadow-lg"
                        aria-label="download"
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = getFileUrl(asset.filePath);
                            link.download = asset.originalFilename;
                            link.click();
                        }}
                    >
                        <Download className="size-5 text-primary" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="line-clamp-1 text-sm font-semibold group-hover:text-primary transition-colors">
                            {asset.title}
                        </h3>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground font-medium font-mono mt-0.5">
                            {asset.originalFilename}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="more-vert">
                                <MoreVertical className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-fit">
                             <DropdownMenuItem onClick={() => window.open(getFileUrl(asset.filePath), "_blank")}>
                                <Download className="mr-2 h-4 w-4" />
                                Open/Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Asset
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <Calendar className="size-3" />
                        {new Date(asset.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-5 px-2 bg-muted">
                        {asset.contentType?.split('/')[1] || asset.originalFilename.split('.').pop()}
                    </Badge>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Media Asset</DialogTitle>
                        <DialogDescription>
                            Warning: Deleting this file will break any references to it in Blogs, Resources, or Assignments. This action is permanent.
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
        </div>
    );
}
