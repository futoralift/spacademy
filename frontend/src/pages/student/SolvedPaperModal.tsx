import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useStudentAnswersQuery,
} from "@/api/academyHooks";
import {
  Trophy,
  AlertCircle,
} from "lucide-react";
import { SolvedPaperView } from "@/components/evaluation/SolvedPaperView";

interface SolvedPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  testTitle: string;
  studentId: string;
}

export const SolvedPaperModal: React.FC<SolvedPaperModalProps> = ({
  isOpen,
  onClose,
  testId,
  testTitle,
  studentId,
}) => {
  const { data: answersData, isLoading, isError } = useStudentAnswersQuery({
    testId,
    studentId,
    limit: 25
  });

  const answers = answersData?.data ?? [];

  const totalScore = answers.reduce((sum, answer) => sum + (answer.answer === answer.correctAnswer ? (answer.mark || 0) : 0), 0);
  const maxScore = answers.reduce((sum, answer) => sum + (answer.mark || 0), 0);
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="space-y-4 border-b p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between text-left">
            <div className="flex items-center gap-4">
              <Trophy className="size-8 text-primary" />
              <div>
                <DialogTitle className="text-2xl font-semibold">{testTitle}</DialogTitle>
                <DialogDescription>Solved Paper</DialogDescription>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-auto">
              <div className="rounded-md border px-4 py-3">
                <p className="text-xs text-muted-foreground font-medium">Score</p>
                <p className="text-xl font-semibold">
                  {totalScore}
                  <span className="ml-1 text-sm text-muted-foreground">/ {maxScore}</span>
                </p>
              </div>
              <div className="rounded-md border px-4 py-3 text-left">
                <p className="text-xs text-muted-foreground font-medium">Accuracy</p>
                <p className="text-xl font-semibold">{scorePercent}%</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto py-6 px-4 md:px-0">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="size-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
              <p>Loading responses...</p>
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="font-medium">Failed to load solved paper</p>
              <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
            </div>
          ) : (
            <SolvedPaperView answers={answers} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
