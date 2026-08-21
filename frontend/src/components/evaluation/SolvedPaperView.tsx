import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentAnswerDetailResponse } from "@/api/types";
import { getFileUrl } from "@/api/http";

interface SolvedPaperViewProps {
  answers: StudentAnswerDetailResponse[];
  className?: string;
}

export const SolvedPaperView: React.FC<SolvedPaperViewProps> = ({ answers, className }) => {
  const getFormattedImageUrl = (path: string | null | undefined) => {
    return getFileUrl(path);
  };

  if (answers.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed text-center text-muted-foreground">
        <HelpCircle className="size-8" />
        <p>No recorded responses for this assessment</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {answers.map((sa, idx) => {
        const isCorrect = sa.answer === sa.correctAnswer;
        const options = [
          { id: 'A', text: sa.optionA, img: sa.optionAImg },
          { id: 'B', text: sa.optionB, img: sa.optionBImg },
          { id: 'C', text: sa.optionC, img: sa.optionCImg },
          { id: 'D', text: sa.optionD, img: sa.optionDImg },
        ];

        return (
          <div
            key={sa.id}
            className="rounded-lg border bg-card text-left"
          >
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Question {idx + 1}</Badge>
                  <Badge variant="outline">{sa.mark} Points</Badge>
                  <Badge
                    variant={isCorrect ? "default" : "destructive"}
                    className={cn(isCorrect && "bg-emerald-600 hover:bg-emerald-600")}
                  >
                    {isCorrect ? <CheckCircle className="size-3.5 mr-1" /> : <XCircle className="size-3.5 mr-1" />}
                    {isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <p className="text-base font-semibold leading-relaxed">
                    {sa.questionText || "Question text not available"}
                  </p>

                  {sa.questionImg && (
                    <div className="rounded-md border overflow-hidden bg-white w-fit max-w-full">
                      <img
                        src={getFormattedImageUrl(sa.questionImg)}
                        alt={`Question ${idx + 1}`}
                        className="h-auto max-h-75 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="p-5 space-y-6">
              {/* Options Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {options.map((opt) => {
                  const isSelected = sa.answer === opt.id;
                  const isCorrectOpt = sa.correctAnswer === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "rounded-lg border p-4 space-y-3",
                        isCorrectOpt && "border-emerald-300 bg-emerald-600/20",
                        isSelected && !isCorrectOpt && "border-rose-300 bg-rose-600/20",
                        !isSelected && !isCorrectOpt && "bg-muted/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Badge variant={isCorrectOpt ? "default" : "outline"} className={cn("shrink-0", isCorrectOpt && "bg-emerald-600 hover:bg-emerald-600")}>
                            {opt.id}
                          </Badge>

                          <div className="flex-1 space-y-3">
                            <p className="text-sm font-medium">{opt.text}</p>

                            {opt.img && (
                              <div className="rounded-md border bg-background p-1 w-fit max-w-full overflow-hidden">
                                <img
                                  src={getFormattedImageUrl(opt.img)}
                                  alt={`Option ${opt.id}`}
                                  className="h-auto max-h-30 object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isSelected && <Badge variant="secondary">Your Choice</Badge>}
                          {isCorrectOpt && <Badge variant="secondary">Correct Answer</Badge>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Section */}
              {sa.explanation && (
                <div className="rounded-lg border p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-left">
                    <HelpCircle className="size-4" />
                    Explanation
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap text-left">
                    {sa.explanation}
                  </div>
                  {sa.explanationImg && (
                    <div className="rounded-md border bg-background p-1 w-fit max-w-full overflow-hidden mt-2">
                      <img
                        src={getFormattedImageUrl(sa.explanationImg)}
                        alt="Explanation"
                        className="h-auto max-h-50 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
