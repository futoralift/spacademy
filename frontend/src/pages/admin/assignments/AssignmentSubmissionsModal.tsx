import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useLectureStudentsInfoQuery,
  useAssignmentSubmissionsQuery,
  useUpdateAssignmentSubmissionStatusMutation
} from "@/api/academyHooks";
import { useStudentsQuery } from "@/api/userHooks";
import { CheckCircle2, XCircle, Clock, ExternalLink, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getFileUrl } from '@/api/http';

interface AssignmentSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assignmentTitle: string;
  lectureId?: string | null;
}

const SUBMISSION_STATUSES: any[] = [
  { value: "completed", label: "Completed", icon: <CheckCircle2 className="w-4 h-4" />, className: "bg-emerald-500 hover:bg-emerald-600 font-bold" },
  { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4" />, className: "bg-amber-500 hover:bg-amber-600 font-bold" },
  { value: "rejected", label: "Rejected", icon: <XCircle className="w-4 h-4" />, className: "bg-rose-500 hover:bg-rose-600 font-bold" },
];

export const AssignmentSubmissionsModal: React.FC<AssignmentSubmissionsModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  assignmentTitle,
  lectureId,
}) => {
  const { data: lectureStudents, isLoading: lectureStudentsLoading } = useLectureStudentsInfoQuery(lectureId || "");
  const { data: allStudentsData, isLoading: allStudentsLoading } = useStudentsQuery({ limit: 15 });
  const { data: submissionsData, isLoading: submissionsLoading } = useAssignmentSubmissionsQuery({ assignmentId });
  
  const updateStatusMutation = useUpdateAssignmentSubmissionStatusMutation();

  const handleStatusChange = async (submissionId: string, newStatus: any) => {
    try {
      await updateStatusMutation.mutateAsync({
        studentAssignmentId: submissionId,
        status: newStatus,
      });
      toast.success(`Submission marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const submissions = Array.isArray(submissionsData) ? submissionsData : (submissionsData as any)?.data ?? [];
  const students = lectureId ? lectureStudents : (allStudentsData as any)?.data || [];
  const isLoading = (lectureId ? lectureStudentsLoading : allStudentsLoading) || submissionsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden mb-5 text-left">
        <DialogHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <FileText className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                Verify Submissions
              </DialogTitle>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">{assignmentTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0 bg-white">
          {isLoading ? (
            <div className="h-60 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Submissions...</p>
            </div>
          ) : students?.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
              <XCircle className="size-8 opacity-20" />
              <p className="font-bold">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students?.map((student: any) => {
                const sId = student.studentId || student.id;
                const submission = submissions.find((s: any) => s.studentId === sId);
                
                return (
                  <div
                    key={sId}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300 gap-6 group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName} ${student.lastName}`} />
                        <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-black text-slate-800 text-base leading-tight">
                          {student.firstName} {student.lastName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">Roll: {student.rollNo || "N/A"}</span>
                          {!submission && (
                            <Badge variant="outline" className="bg-rose-50 text-rose-500 border-none text-[9px] font-black uppercase px-2 py-0.5">Not Submitted</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                      {submission ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-slate-200 text-slate-600 font-bold text-xs h-9 hover:bg-slate-50 transition-colors"
                            onClick={() => window.open(getFileUrl(submission.filePath), '_blank')}
                          >
                            <ExternalLink className="mr-2 size-3.5" /> View Work
                          </Button>

                          <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                          <div className="flex gap-1.5 p-1 bg-slate-50 rounded-2xl">
                            {SUBMISSION_STATUSES.map((status) => {
                              const isActive = submission.status === status.value;
                              const isUpdating = updateStatusMutation.isPending && updateStatusMutation.variables?.studentAssignmentId === submission.id;

                              return (
                                <Button
                                  key={status.value}
                                  size="sm"
                                  variant={isActive ? "default" : "ghost"}
                                  onClick={() => handleStatusChange(submission.id, status.value)}
                                  disabled={updateStatusMutation.isPending}
                                  className={cn(
                                    "h-8 px-3 gap-1.5 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-wider",
                                    isActive ? `${status.className} text-white shadow-md scale-105` : "text-slate-400 hover:text-slate-600 hover:bg-white"
                                  )}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    isActive ? status.icon : null
                                  )}
                                  {status.label}
                                </Button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-300 italic text-xs font-medium">Waiting for submission...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
