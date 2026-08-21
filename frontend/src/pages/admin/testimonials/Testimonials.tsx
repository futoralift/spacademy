import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useTestimonialsQuery, useDeleteTestimonialMutation } from "@/api/academyHooks.ts";
import { getFileUrl } from "@/api/http.ts";
import type { TestimonialResponse } from "@/api/types.ts";
import {
    Quote,
    Search,
    MoreVertical,
    Trash2,
    Star,
    ChevronLeft,
    ChevronRight,
    User,
    CheckCircle2,
    XCircle,
    Pencil, 
    MessageSquareQuote
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
import AddTestimonialForm from "@/pages/admin/testimonials/AddTestimonialForm.tsx";
import EditTestimonialModal from "@/pages/admin/testimonials/EditTestimonialModal.tsx";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function AdminTestimonialsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Testimonials"
            sidebar={<AdminSidebar />}
            bodyTitle="Student Testimonials"
            description="Manage student feedback and success stories"
            icon={<MessageSquareQuote />}
            bodyToolbar={
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <AddTestimonialForm />
                </div>
            }
        >
            <TestimonialsContent
                searchTerm={searchTerm}
            />
        </DashboardLayoutProvider>
    )
}

function TestimonialsContent({searchTerm}: {searchTerm: string;}) {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(6);

    const { data, isLoading, isError, error, refetch } = useTestimonialsQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize
    });

    const testimonials = data?.data || [];
    const totalPages = data?.totalPages || 0;

    const filteredTestimonials = testimonials.filter(t =>
        t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full">
            {isLoading ? (
                <div className="flex min-h-100 items-center justify-center">
                    <Spinner className="size-10" />
                </div>
            ) : isError ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 text-sm text-destructive font-medium rounded-2xl border border-dashed border-slate-200 shadow-sm">
                    <p>{error?.message || "An unexpected error occurred while fetching testimonials."}</p>
                    <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
                </div>
            ) : filteredTestimonials.length === 0 ? (
                <div className="flex min-h-100 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-full">
                        <Quote className="size-10 text-slate-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900">No testimonials found</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Highlight your students' success by adding their feedback here.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredTestimonials.map((testimonial) => (
                            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
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
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <div className="text-sm font-medium text-slate-600 px-4">
                                Page {page} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
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

function TestimonialCard({ testimonial }: { testimonial: TestimonialResponse }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const deleteMutation = useDeleteTestimonialMutation();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(testimonial.id);
            toast.success("Testimonial removed");
        } catch {
            toast.error("Failed to delete testimonial");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <Card className="p-6 transition-all hover:shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-fit">
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
            </div>

            <div className="mb-6">
                <Quote className="size-8 text-primary/20" />
            </div>

            <p className="text-muted-foreground leading-relaxed italic mb-8 line-clamp-4">
                "{testimonial.content}"
            </p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                    <Avatar className="size-12 border-2 border-primary/10">
                        <AvatarImage src={getFileUrl(testimonial.avatar || "")} />
                        <AvatarFallback><User className="size-6 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-sm line-clamp-1">{testimonial.studentName}</h4>
                        <p className="text-primary text-xs font-semibold line-clamp-1">{testimonial.courseName || "General Student"}</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <div className="flex bg-amber-50 px-2 py-1 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`size-3 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-amber-200"}`} 
                            />
                        ))}
                    </div>
                    <Badge variant={testimonial.isActive ? "default" : "secondary"} className="text-[10px] h-5">
                        {testimonial.isActive ? <CheckCircle2 className="size-2.5 mr-1" /> : <XCircle className="size-2.5 mr-1" />}
                        {testimonial.isActive ? "Visible" : "Hidden"}
                    </Badge>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Testimonial</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this testimonial from the landing page?
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

            <EditTestimonialModal
                testimonial={testimonial}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </Card>
    );
}
