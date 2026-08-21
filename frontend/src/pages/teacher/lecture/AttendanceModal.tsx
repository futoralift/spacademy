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
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation
} from "@/api/academyHooks";
import type { AttendanceStatus } from "@/api/types";
import { CheckCircle2, XCircle, Clock, Info, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  subjectName: string;
  lectureStartDate: string;
  lectureTitle?: string;
}

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

const statusConfig: Record<AttendanceStatus, {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "destructive" | "secondary" | "outline";
  className: string;
}> = {
  present: {
    label: "Present",
    icon: <CheckCircle2 className="w-4 h-4" />,
    variant: "default",
    className: "bg-emerald-500 hover:bg-emerald-600",
  },
  absent: {
    label: "Absent",
    icon: <XCircle className="w-4 h-4" />,
    variant: "destructive",
    className: "bg-rose-500 hover:bg-rose-600",
  },
  late: {
    label: "Late",
    icon: <Clock className="w-4 h-4" />,
    variant: "secondary",
    className: "bg-amber-500 text-white hover:bg-amber-600",
  },
  excused: {
    label: "Excused",
    icon: <Info className="w-4 h-4" />,
    variant: "secondary",
    className: "bg-blue-500 text-blue-500 hover:bg-blue-700 focus:bg-blue-700",
  },
};

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   lectureId,
                                                                   subjectName,
                                                                   lectureStartDate,
                                                                   lectureTitle,
                                                                 }) => {
  const { data: students, isLoading, isError } = useLectureStudentsInfoQuery(lectureId);
  const createMutation = useCreateAttendanceMutation();
  const updateMutation = useUpdateAttendanceMutation();
  const deleteMutation = useDeleteAttendanceMutation();

  const isFuture = new Date(lectureStartDate) > new Date();

  const handleStatusChange = async (studentId: string, currentStatus: AttendanceStatus | null, newStatus: AttendanceStatus, attendanceId: string | null) => {
    if (isFuture) {
      toast.error("Cannot mark attendance for future lectures");
      return;
    }
    try {
      if (currentStatus === newStatus && attendanceId) {
        // Toggle off: Delete attendance
        await deleteMutation.mutateAsync(attendanceId);
        toast.success("Attendance removed");
      } else if (attendanceId) {
        // Update existing
        await updateMutation.mutateAsync({
          id: attendanceId,
          lectureId,
          studentId,
          status: newStatus,
        });
        toast.success(`Marked as ${newStatus}`);
      } else {
        // Create new
        await createMutation.mutateAsync({
          lectureId,
          studentId,
          status: newStatus,
        });
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-200 max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="bg-muted/50 border-b p-6 pb-2">
            <DialogTitle className="text-2xl font-bold flex gap-2 flex-col items-center justify-start">
              {lectureTitle ? (
                  <span className="text-primary">{lectureTitle}</span>
              ) : (
                  <span>Attendance Sheet</span>
              )}
              <Badge variant="outline" className="font-normal text-muted-foreground whitespace-nowrap">
                {subjectName}
              </Badge>
              {isFuture && (
                  <div className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 text-amber-800 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Future Session</p>
                      <p className="text-xs opacity-90 font-medium">Attendance marking will be available once the lecture starts.</p>
                    </div>
                  </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 min-h-0">

            {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : isError ? (
                <div className="h-40 flex items-center justify-center text-rose-500">
                  Failed to load students
                </div>
            ) : students?.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  No students enrolled in this course
                </div>
            ) : (
                <div className="space-y-4">
                  {students?.map((student) => (
                      <div
                          key={student.studentId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName} ${student.lastName}`} />
                            <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm">{student.firstName} {student.lastName}</h4>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Roll No: {student.rollNo}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {ATTENDANCE_STATUSES.map((status) => {
                            const config = statusConfig[status];
                            const isActive = student.status === status;
                            const isAnyLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

                            return (
                                <Button
                                    key={status}
                                    size="sm"
                                    variant={isActive ? config.variant : "outline"}
                                    onClick={() => handleStatusChange(student.studentId, student.status, status, student.attendanceId)}
                                    disabled={isAnyLoading || isFuture}
                                    className={cn(
                                        "h-9 px-3 gap-1.5 transition-all duration-200",
                                        isActive ? `${config.className} text-white` : "hover:bg-muted"
                                    )}
                                >
                                  {isActive ? (
                                      React.cloneElement(config.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })
                                  ) : (
                                      React.cloneElement(config.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 text-muted-foreground" })
                                  )}
                                  <span className="sm:hidden lg:inline">{config.label}</span>
                                </Button>
                            );
                          })}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
};
