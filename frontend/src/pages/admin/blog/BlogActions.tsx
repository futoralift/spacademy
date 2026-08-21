import { useState } from "react";
import { MoreHorizontal, Trash, Edit, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
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
import type { PostResponse } from "@/api/types.ts";
import { useDeletePostMutation } from "@/api/contentHooks.ts";
import { toast } from "sonner";

interface BlogActionsProps {
    post: PostResponse;
}

export default function BlogActions({ post }: BlogActionsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const deleteMutation = useDeletePostMutation();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(post.id);
            toast.success("Blog post deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete blog post");
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
                    <DropdownMenuItem asChild>
                        <Link to={`/dashboard/admin/blogs/${post.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Post
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Post
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>


            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the blog post "{post.title}".
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
                            Delete Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
