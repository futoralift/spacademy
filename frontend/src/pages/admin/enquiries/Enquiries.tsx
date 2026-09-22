import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
  useEnquiriesQuery,
  useDeleteEnquiryMutation,
  useUpdateEnquiryStatusMutation,
} from "@/api/academyHooks.ts";
import type { EnquiryResponse, EnquiryStatus } from "@/api/types.ts";
import {
  Search,
  MoreVertical,
  Trash2,
  User,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  ExternalLink,
  MessageCircleQuestion,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider.tsx";
import { Card } from "@/components/ui/card.tsx";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination.tsx";

export default function AdminEnquiriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayoutProvider
      pageTitle="Enquiries"
      sidebar={<AdminSidebar />}
      bodyTitle="Student Enquiries"
      description="Manage and respond to student inquiries and interests"
      icon={<MessageCircleQuestion />}
      bodyToolbar={
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search enquiries..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search enquiries"
            />
          </div>
        </div>
      }
    >
      <EnquiriesContent searchTerm={searchTerm} />
    </DashboardLayoutProvider>
  );
}

function EnquiriesContent({ searchTerm }: { searchTerm: string }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const { data, isLoading, isError, error, refetch } = useEnquiriesQuery({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const enquiries = data?.data || [];
  const totalPages = data?.totalPages || 0;

  const filteredEnquiries = enquiries.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex min-h-100 items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : isError ? (
        <div className="flex min-h-100 flex-col items-center justify-center gap-4 text-sm text-destructive font-medium rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm bg-card">
          <p>
            {error?.message ||
              "An unexpected error occurred while fetching enquiries."}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="flex min-h-100 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm bg-card">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full">
            <MessageSquare className="size-10 text-slate-300 dark:text-slate-700" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No enquiries found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
              Student enquiries from the landing page will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredEnquiries.map((enquiry) => (
              <EnquiryCard key={enquiry.id} enquiry={enquiry} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                        }}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer font-bold"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                        totalPages > 7 && 
                        pageNum !== 1 && 
                        pageNum !== totalPages && 
                        Math.abs(pageNum - page) > 1
                    ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        return null;
                    }

                    return (
                        <PaginationItem key={pageNum}>
                            <PaginationLink 
                                href="#"
                                isActive={page === pageNum}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPage(pageNum);
                                }}
                                className="cursor-pointer font-bold"
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) setPage(page + 1);
                        }}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer font-bold"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-center text-xs text-muted-foreground mt-4 font-bold">
                Showing enquiries {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data?.totalRecord || 0)} of {data?.totalRecord}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EnquiryCard({ enquiry }: { enquiry: EnquiryResponse }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  const deleteMutation = useDeleteEnquiryMutation();
  const statusMutation = useUpdateEnquiryStatusMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(enquiry.id);
      toast.success("Enquiry deleted");
    } catch {
      toast.error("Failed to delete enquiry");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    try {
      await statusMutation.mutateAsync({
        id: enquiry.id,
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case "pending":
        return <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 font-medium text-[11px]">Pending</div>;
      case "contacted":
        return <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 font-medium text-[11px]">Contacted</div>;
      case "closed":
        return <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 font-medium text-[11px]">Closed</div>;
      case "converted":
        return <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 font-medium text-[11px]">Converted</div>;
      default:
        return <div className="p-2 rounded-lg font-medium text-[11px]">{status}</div>;
    }
  };

  const getEnquiryTheme = (status: EnquiryStatus) => {
    switch (status) {
      case "pending":
        return {
          card: "bg-amber-50/80 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 hover:shadow-amber-200/40 dark:hover:shadow-amber-900/20",
          icon: "bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
          message: "bg-amber-100/40 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/30 text-amber-900 dark:text-amber-100",
          messageTitle: "text-amber-700 dark:text-amber-400",
          button: "hover:bg-amber-300 dark:hover:bg-amber-900/50 hover:text-amber-700"
        };
      case "contacted":
        return {
          card: "bg-blue-50/80 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 hover:shadow-blue-200/40 dark:hover:shadow-blue-900/20",
          icon: "bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          message: "bg-blue-100/40 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/30 text-blue-900 dark:text-blue-100",
          messageTitle: "text-blue-700 dark:text-blue-400",
          button: "hover:bg-blue-100/60 dark:hover:bg-blue-900/50 hover:text-blue-700"
        };
      case "converted":
        return {
          card: "bg-emerald-50/80 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 hover:shadow-emerald-200/40 dark:hover:shadow-emerald-900/20",
          icon: "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
          message: "bg-emerald-100/40 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-100",
          messageTitle: "text-emerald-700 dark:text-emerald-400",
          button: "hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 hover:text-emerald-700"
        };
      case "closed":
        return {
          card: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-slate-200/40 dark:hover:shadow-black/60 opacity-80",
          icon: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
          message: "bg-slate-200/40 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200",
          messageTitle: "text-slate-600 dark:text-slate-500",
          button: "hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700"
        };
      default:
        return {
          card: "bg-card dark:bg-slate-900 border-slate-200/60 dark:border-slate-800",
          icon: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
          message: "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200",
          messageTitle: "text-primary dark:text-primary",
          button: "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700"
        };
    }
  };

  const theme = getEnquiryTheme(enquiry.status);

  return (
    <Card className={`flex flex-col p-6 transition-all hover:shadow-lg relative overflow-hidden group border-0 shadow-sm ${theme.card}`}>
      <div className="absolute top-0 right-0 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="more-verts"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
              <Clock className="mr-2 h-4 w-4 text-amber-500" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("contacted")}>
              <Phone className="mr-2 h-4 w-4 text-blue-500" />
              Contacted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("converted")}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
              Converted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("closed")}>
              <XCircle className="mr-2 h-4 w-4 text-slate-500" />
              Closed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDetailDialogOpen(true)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
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

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${theme.icon}`}>
            <User className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{enquiry.fullName}</h4>
            <p className="text-xs text-muted-foreground dark:text-slate-500">{format(new Date(enquiry.createdAt), "MMM d, yyyy h:mm a")}</p>
          </div>
        </div>
        {getStatusBadge(enquiry.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Mail className="size-3.5" />
          <span className="line-clamp-1 font-medium">{enquiry.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Phone className="size-3.5" />
          <span className="font-medium">{enquiry.phone}</span>
        </div>
      </div>

      <div className={`rounded-xl p-3 mb-4 grow border transition-colors ${theme.message}`}>
        <p className={`text-[11px] font-extrabold tracking-widest mb-1.5 ${theme.messageTitle}`}>
          {enquiry.title || "General Inquiry"}
        </p>
        <p className="text-sm line-clamp-3 leading-relaxed font-medium">
          {enquiry.message}
        </p>
      </div>

      <Button 
        size="sm"
        className={`w-full text-xs font-medium rounded-xl h-10 transition-all bg-slate-800 hover:bg-slate-900 cursor-pointer`}
        onClick={() => setIsDetailDialogOpen(true)}
      >
        View Full Message
      </Button>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
                <DialogTitle>Enquiry Details</DialogTitle>
                {getStatusBadge(enquiry.status)}
            </div>
            <DialogDescription>
              Received on {format(new Date(enquiry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div>
                   <h5 className="text-xs font-medium text-muted-foreground tracking-widest mb-1">Full Name</h5>
                   <p className="font-semibold text-slate-900 dark:text-slate-100">{enquiry.fullName}</p>
                </div>
                <div>
                   <h5 className="text-xs font-medium text-muted-foreground tracking-widest mb-1">Email Address</h5>
                   <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                     {enquiry.email}
                     <Button variant="ghost" size="icon" className="size-6 rounded-full" onClick={() => window.open(`mailto:${enquiry.email}`)}>
                        <ExternalLink className="size-3" />
                     </Button>
                   </p>
                </div>
                <div>
                   <h5 className="text-xs font-medium text-muted-foreground tracking-widest mb-1">Phone Number</h5>
                   <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                     {enquiry.phone}
                     <Button variant="ghost" size="icon" className="size-6 rounded-full" onClick={() => window.open(`tel:${enquiry.phone}`)}>
                        <Phone className="size-3" />
                     </Button>
                   </p>
                </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-medium text-muted-foreground tracking-widest mb-1">Title</h5>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{enquiry.title || "N/A"}</p>
            </div>
          </div>
          <div>
            <h5 className="text-xs font-medium text-muted-foreground tracking-widest mb-1">Sent @</h5>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{format(new Date(enquiry.createdAt), "PPP p")}</p>
          </div>
          <div className={`rounded-2xl p-6 border transition-colors mt-2 ${theme.message}`}>
             <h5 className={`text-[11px] font-extrabold tracking-widest mb-3 ${theme.messageTitle}`}>Message</h5>
             <p className="leading-relaxed whitespace-pre-wrap font-medium">
                {enquiry.message}
             </p>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
            <div className="flex gap-2">
               {enquiry.status === "pending" && (
                 <Button onClick={() => handleStatusChange("contacted")}>Mark as Contacted</Button>
               )}
               {enquiry.status === "contacted" && (
                 <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange("converted")}>Mark as Converted</Button>
               )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
