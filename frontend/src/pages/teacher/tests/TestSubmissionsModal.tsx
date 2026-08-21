import React, { useState } from 'react';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Save,
} from "lucide-react";
import {
  useStudentAnswersQuery,
  useTestAttemptsQuery,
  useUpdateTestAttemptMutation,
  useCreateTestAttemptMutation
} from "@/api/academyHooks";
import { useTeacherStudentsQuery } from "@/api/userHooks";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SolvedPaperView } from "@/components/evaluation/SolvedPaperView";

interface TestSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  testTitle: string;
  testMode: 'online' | 'offline';
  totalMarks: number;
}

export const TestSubmissionsModal: React.FC<TestSubmissionsModalProps> = ({
  isOpen,
  onClose,
  testId,
  testTitle,
  testMode,
  totalMarks
}) => {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [offlineMarks, setOfflineMarks] = useState<Record<string, number>>({});
  const [savingMarks, setSavingMarks] = useState<string | null>(null);

  // Mutations
  const updateAttempt = useUpdateTestAttemptMutation();
  const createAttempt = useCreateTestAttemptMutation();

  // 1. Get all answers (for online) OR students (for offline)
  const { data: answersData, isLoading: answersLoading } = useStudentAnswersQuery({
    testId,
    limit: 100
  }, { enabled: testMode === 'online' && !!testId });

  const { data: studentsData, isLoading: studentsLoading } = useTeacherStudentsQuery({
    limit: 100
  });

  const { data: attemptsData, isLoading: attemptsLoading } = useTestAttemptsQuery({
    testId,
    limit: 100
  }, { enabled: !!testId });

  const rawAnswers = (answersData as any)?.data ?? [];
  const students = (studentsData as any)?.data ?? [];
  const attempts = (attemptsData as any)?.data ?? [];

  // Group attempts for quick access
  const studentAttempts = attempts.reduce((acc: any, att: any) => {
    acc[att.studentId] = att;
    return acc;
  }, {} as any);

  // Group answers by student (for online)
  const onlineResults = rawAnswers.reduce((acc: any, sa: any) => {
    if (!acc[sa.studentId]) {
      acc[sa.studentId] = {
        studentId: sa.studentId,
        studentName: sa.studentName,
        answers: [],
        totalScore: 0,
        maxScore: 0,
        correctCount: 0,
        totalCount: 0
      };
    }

    acc[sa.studentId].answers.push(sa);
    acc[sa.studentId].totalCount += 1;
    acc[sa.studentId].maxScore += (sa.mark || 0);

    if (sa.answer === sa.correctAnswer) {
      acc[sa.studentId].totalScore += (sa.mark || 0);
      acc[sa.studentId].correctCount += 1;
    }

    return acc;
  }, {});

  const handleSaveOfflineMark = async (studentId: string) => {
    const mark = offlineMarks[studentId];
    if (mark === undefined) return;
    if (mark > totalMarks) {
      toast.error(`Marks cannot exceed total marks (${totalMarks})`);
      return;
    }

    setSavingMarks(studentId);
    try {
      const existing = studentAttempts[studentId];
      if (existing) {
        await updateAttempt.mutateAsync({
          id: existing.id,
          testId,
          studentId,
          attempts: existing.attempts,
          obtainedMarks: mark
        });
      } else {
        await createAttempt.mutateAsync({
          testId,
          studentId,
          attempts: 1,
          obtainedMarks: mark
        });
      }
      toast.success("Mark saved successfully");
      const newMarks = { ...offlineMarks };
      delete newMarks[studentId];
      setOfflineMarks(newMarks);
    } catch {
      toast.error("Failed to save mark");
    } finally {
      setSavingMarks(null);
    }
  };

  const isLoading = testMode === 'online' ? answersLoading : (studentsLoading || attemptsLoading);
  const sortedOnline = Object.values(onlineResults).sort((a: any, b: any) => b.totalScore - a.totalScore);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="size-8 text-primary" />
            <div>
              <DialogTitle className="text-2xl font-semibold">{testTitle}</DialogTitle>
              <DialogDescription>{testMode === 'online' ? `${sortedOnline.length} Submissions Received` : `${students.length} Enrolled Students`}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0 text-left">
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-6 bg-white rounded-[40px] border border-slate-100/50 shadow-sm">
              <div className="relative">
                <div className="size-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <Loader2 className="size-6 text-primary/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs font-black text-slate-400 tracking-[0.2em] animate-pulse">Synchronizing Data...</p>
            </div>
          ) : testMode === 'online' ? (
            sortedOnline.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center rounded-4xl border text-center">
                <div className="size-20 rounded-[30px] flex items-center justify-center">
                  <XCircle className="size-10 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xl tracking-tight">No Submissions Yet</p>
                  <p className="text-muted-foreground mt-2 text-[12px]">Waiting for students to complete this test</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedOnline.map((result: any) => {
                  const isExpanded = expandedStudent === result.studentId;
                  const scorePercent = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;

                  return (
                    <div
                      key={result.studentId}
                      className={cn(
                        "group overflow-hidden rounded-3xl border transition-all duration-500",
                        isExpanded && "border-primary border-2 transition-colors duration-300"
                      )}
                    >
                      <div
                        className="p-3 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedStudent(isExpanded ? null : result.studentId)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-14 rounded-2xl" aria-label="avatar">
                            <AvatarFallback className="bg-muted text-muted-foreground font-black" aria-label="avatar">
                              {result.studentName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <h4 className="font-semibold text-lg">
                              {result.studentName}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 text-left">
                              <div className="flex items-center gap-1.5 rounded-full border px-3 py-2">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                <span className="text-[11px] font-medium">{result.correctCount}/{result.totalCount} Correct</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center">
                            <p className="text-[12px] text-muted-foreground mb-1.5">Scored</p>
                            <div className="flex items-baseline gap-1 text-right">
                              <span className="text-3xl font-black">{result.totalScore}</span>
                              <span className="text-sm text-muted-foreground">/ {result.maxScore}</span>
                            </div>
                          </div>

                          <div className={cn(
                            "size-20 rounded-3xl flex flex-col items-center justify-center transition-all duration-300",
                            scorePercent >= 40 ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" : "bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
                          )}>
                            <span className="text-xl font-black leading-none">{scorePercent}%</span>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 mt-3 pb-12 space-y-4 text-left border-t border-slate-50">
                          <SolvedPaperView answers={result.answers} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Offline Mode: Grid of students with mark input */
            <div className="grid grid-cols-1 gap-4">
              {students.map((student: any) => {
                const currentAttempt = studentAttempts[student.id];
                const savedMark = currentAttempt?.obtainedMarks;
                const isSaving = savingMarks === student.id;
                const pendingValue = offlineMarks[student.id];
                const hasChanged = pendingValue !== undefined;

                return (
                  <div
                    key={student.id}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-5">
                      <Avatar className="size-16 rounded-2xl border-4 border-slate-50 group-hover:scale-105 transition-transform duration-500">
                        <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-lg">
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-black text-slate-900 text-xl tracking-tight">{student.firstName} {student.lastName}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-left">
                          <Badge variant="outline" className="text-[9px] font-black py-0.5 px-2 bg-slate-50 border-slate-100 text-slate-400">Roll No: {student.rollNo}</Badge>
                          <Badge variant="outline" className="text-[9px] font-black py-0.5 px-2 bg-slate-50 border-slate-100 text-slate-400">{student.standard}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 mb-2 px-1 text-right">Gained Marks</p>
                        <div className="relative group/input">
                          <Input
                            type="number"
                            placeholder={savedMark !== undefined && savedMark !== null ? savedMark.toString() : "00"}
                            className="w-32 h-16 bg-slate-50/50 border-2 border-slate-100 rounded-3xl text-center font-black text-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all duration-300"
                            value={pendingValue ?? ""}
                            aria-label="number"
                            onChange={(e) => {
                              const val = e.target.value === "" ? NaN : parseInt(e.target.value);
                              setOfflineMarks(prev => {
                                const next = { ...prev };
                                if (isNaN(val)) delete next[student.id];
                                else next[student.id] = val;
                                return next;
                              });
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        size="icon"
                        disabled={!hasChanged || isSaving}
                        aria-label="save-btn"
                        className={cn(
                          "size-16 rounded-[24px] shadow-lg transition-all duration-500 transform active:scale-95",
                          hasChanged ? "bg-primary text-white shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1" : "bg-slate-50 text-slate-300"
                        )}
                        onClick={() => handleSaveOfflineMark(student.id)}
                      >
                        {isSaving ? <Loader2 className="size-6 animate-spin" /> : <Save className="size-6" />}
                      </Button>
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
