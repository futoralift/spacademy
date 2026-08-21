"use client"

import * as React from "react"
import { useState } from "react"
import { LoaderCircle, Plus, Trash2, ChevronDown, ChevronUp, HelpCircle, FileIcon, Pencil, Save } from "lucide-react"
import { getFileUrl } from "@/api/http";
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    useQuestionsQuery,
    useCreateQuestionMutation,
    useDeleteQuestionMutation,
    useUpdateQuestionMutation,
} from "@/api/academyHooks"
import type { McqAnswer, QuestionResponse, TestResponse } from "@/api/types"

interface ManageQuestionsModalProps {
    test: TestResponse | null
    isOpen: boolean
    onClose: () => void
}

const OPTIONS: { key: McqAnswer; label: string }[] = [
    { key: "A", label: "Option A" },
    { key: "B", label: "Option B" },
    { key: "C", label: "Option C" },
    { key: "D", label: "Option D" },
]

const getFileVisual = (path: string | null | undefined, className?: string) => {
    if (!path) return null;
    const ext = path.split('.').pop()?.toLowerCase();
    const fullUrl = getFileUrl(path);

    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
        return (
            <img
                src={fullUrl}
                alt="Resource Thumbnail"
                className={className || "size-full object-cover rounded border"}
            />
        );
    }

    return (
        <div className="flex flex-col items-center justify-center size-full bg-slate-50 text-slate-400 gap-2 rounded border p-2">
            <FileIcon className="size-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">Attachment</span>
        </div>
    );
};

function emptyQuestion(testId: string) {
    return {
        testId,
        questionText: "",
        questionImg: null as File | null,
        correctAnswer: "A" as McqAnswer,
        correctAnswerImg: null as File | null,
        mark: 4,
        optionA: "", optionAImg: null as File | null,
        optionB: "", optionBImg: null as File | null,
        optionC: "", optionCImg: null as File | null,
        optionD: "", optionDImg: null as File | null,
        explanation: "",
        explanationImg: null as File | null,
    }
}

function QuestionCard({ q, index, onDelete, isDeleting, onEdit, disabled }: {
    q: QuestionResponse; index: number
    onDelete: (id: string) => void
    isDeleting: boolean
    onEdit: (q: QuestionResponse) => void
    disabled?: boolean
}) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className="rounded-md border overflow-hidden">
            <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <Badge className="rounded-sm px-1.5 font-semibold bg-primary/10 text-primary hover:bg-primary/10 shrink-0">Q{index + 1}</Badge>
                    <div className="flex flex-col gap-1 items-start min-w-0">
                        <span className="text-sm font-medium text-card-foreground truncate">{q.questionText || "Untitled question"}</span>
                        {q.questionImg && (
                            <div className="h-12 w-auto overflow-hidden">
                                {getFileVisual(q.questionImg, "h-12 w-auto object-contain rounded border")}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{q.mark} {q.mark === 1 ? "mark" : "marks"}</span>
                    <Badge className="rounded-sm px-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Ans: {q.correctAnswer}</Badge>
                    {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </div>
            </button>

            {expanded && (
                <div className="border-t px-4 py-4 space-y-3 bg-muted/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {OPTIONS.map(o => {
                            const optText = (q as any)[`option${o.key}`];
                            const optImg = (q as any)[`option${o.key}Img`];
                            return (
                                <div key={o.key} className={`flex flex-col gap-2 rounded-md px-3 py-2 text-sm border ${q.correctAnswer === o.key ? "border-emerald-300 bg-emerald-50" : "border-slate-100 bg-white"}`}>
                                    <div className="flex items-start gap-2">
                                        <span className={`font-bold shrink-0 ${q.correctAnswer === o.key ? "text-emerald-600" : "text-slate-400"}`}>{o.key}.</span>
                                        <span className={q.correctAnswer === o.key ? "text-emerald-700 font-medium" : "text-slate-700"}>
                                            {optText || <em className="text-muted-foreground">—</em>}
                                        </span>
                                    </div>
                                    {optImg && (
                                        <div className="max-h-24 w-auto overflow-hidden mt-1 ml-6">
                                            {getFileVisual(optImg, "max-h-24 w-auto object-contain rounded border")}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {q.explanation && (
                        <div className="space-y-2 border-l-2 border-primary/30 pl-3">
                            <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
                            {q.explanationImg && (
                                <div className="max-h-24 w-auto overflow-hidden mt-1">
                                    {getFileVisual(q.explanationImg, "max-h-24 w-auto object-contain rounded border")}
                                </div>
                            )}
                        </div>
                    )}
                    {!disabled && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary hover:bg-primary/10 mr-2"
                                onClick={() => onEdit(q)}
                            >
                                <Pencil className="size-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={isDeleting}
                                onClick={() => onDelete(q.id)}
                            >
                                <Trash2 className="size-3.5 mr-1" /> Delete
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function AddQuestionForm({ testId, questionToEdit, onAdded, onCancel, disabled }: {
    testId: string;
    questionToEdit?: QuestionResponse | null;
    onAdded: () => void;
    onCancel?: () => void;
    disabled?: boolean;
}) {
    const [form, setForm] = useState(() => {
        if (questionToEdit) {
            return {
                ...questionToEdit,
                // Files are null by default on edit unless user picks new ones
                questionImg: null as File | null,
                correctAnswerImg: null as File | null,
                optionAImg: null as File | null,
                optionBImg: null as File | null,
                optionCImg: null as File | null,
                optionDImg: null as File | null,
                explanationImg: null as File | null,
            }
        }
        return emptyQuestion(testId)
    })

    // Reset form when questionToEdit changes
    React.useEffect(() => {
        if (questionToEdit) {
            setForm({
                ...questionToEdit,
                questionImg: null as File | null,
                correctAnswerImg: null as File | null,
                optionAImg: null as File | null,
                optionBImg: null as File | null,
                optionCImg: null as File | null,
                optionDImg: null as File | null,
                explanationImg: null as File | null,
            })
        } else {
            setForm(emptyQuestion(testId))
        }
    }, [questionToEdit, testId])

    const createMutation = useCreateQuestionMutation()
    const updateMutation = useUpdateQuestionMutation()

    const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.questionText.trim()) { toast.error("Question text is required"); return }
        if (!form.optionA.trim() || !form.optionB.trim() || !form.optionC.trim() || !form.optionD.trim()) {
            toast.error("All 4 options are required"); return
        }
        try {
            if (questionToEdit) {
                await updateMutation.mutateAsync({
                    ...form,
                    id: questionToEdit.id,
                    mark: Number(form.mark),
                })
                toast.success("Question updated")
            } else {
                await createMutation.mutateAsync({
                    ...form,
                    mark: Number(form.mark),
                })
                toast.success("Question added")
            }
            setForm(emptyQuestion(testId))
            onAdded()
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || "Failed to save question")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-md border p-4 bg-muted/10">
            <p className="text-sm font-semibold text-card-foreground">Add New Question</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="q-text">Question Text</Label>
                    <Textarea
                        id="q-text"
                        placeholder="Enter the question..."
                        value={form.questionText}
                        onChange={e => set("questionText", e.target.value)}
                        className="min-h-16"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="q-img">Question Image (Optional)</Label>
                    <Input
                        id="q-img"
                        type="file"
                        accept="image/*"
                        onChange={e => set("questionImg", e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {OPTIONS.map(o => (
                    <div key={o.key} className="space-y-3 p-3 border rounded-md bg-white">
                        <div className="space-y-1.5">
                            <Label htmlFor={`q-opt-${o.key}`}>{o.label} Text</Label>
                            <Input
                                id={`q-opt-${o.key}`}
                                placeholder={`Text for Option ${o.key}`}
                                value={(form as any)[`option${o.key}`]}
                                onChange={e => set(`option${o.key}`, e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor={`q-opt-img-${o.key}`}>{o.label} Image (Optional)</Label>
                            <Input
                                id={`q-opt-img-${o.key}`}
                                type="file"
                                accept="image/*"
                                onChange={e => set(`option${o.key}Img`, e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="q-answer">Correct Answer</Label>
                    <Select value={form.correctAnswer} onValueChange={v => set("correctAnswer", v)}>
                        <SelectTrigger id="q-answer"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {OPTIONS.map(o => <SelectItem key={o.key} value={o.key}>Option {o.key}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="q-mark">Marks</Label>
                    <Input
                        id="q-mark"
                        type="number"
                        min="1"
                        value={form.mark}
                        onChange={e => set("mark", parseInt(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="q-explanation">Explanation (Optional)</Label>
                    <Textarea
                        id="q-explanation"
                        placeholder="Explanation for the correct answer..."
                        value={form.explanation}
                        onChange={e => set("explanation", e.target.value)}
                        className="min-h-14"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="q-explanation-img">Explanation Image (Optional)</Label>
                    <Input
                        id="q-explanation-img"
                        type="file"
                        accept="image/*"
                        onChange={e => set("explanationImg", e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                {questionToEdit && onCancel && (
                    <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={disabled}>
                        Cancel
                    </Button>
                )}
                {!disabled && (
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} size="sm">
                        {(createMutation.isPending || updateMutation.isPending) && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                        {questionToEdit ? <Save className="size-3.5 mr-1" /> : <Plus className="size-3.5 mr-1" />}
                        {questionToEdit ? "Update Question" : "Add Question"}
                    </Button>
                )}
                {disabled && (
                    <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 py-1.5 px-3">
                        Management Disabled (Test Live)
                    </Badge>
                )}
            </div>
        </form>
    )
}

export default function ManageQuestionsModal({ test, isOpen, onClose }: ManageQuestionsModalProps) {
    const { data: questionsData, refetch } = useQuestionsQuery()
    const deleteMutation = useDeleteQuestionMutation()
    const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null)

    const isLive = test ? (new Date() >= new Date(test.startTime) && new Date() <= new Date(test.expiresAt)) : false;

    // Filter questions belonging to this test
    const questions: QuestionResponse[] = (questionsData?.data ?? []).filter(
        (q) => q.testId === test?.id
    )

    const handleDelete = async (questionId: string) => {
        if (isLive) return;
        try {
            await deleteMutation.mutateAsync(questionId)
            toast.success("Question deleted")
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete question")
        }
    }

    if (!test) return null

    return (
        <Dialog open={isOpen} onOpenChange={open => { if (!open) { onClose(); setEditingQuestion(null); } }}>
            <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="size-5 text-primary" />
                        Questions — {test.title}
                        {isLive && <Badge variant="destructive" className="ml-2 animate-pulse">Live</Badge>}
                    </DialogTitle>
                    <DialogDescription>
                        {isLive ? (
                            <span className="text-destructive font-bold">This test is live. Question management is disabled.</span>
                        ) : (
                            `${questions.length} question${questions.length !== 1 ? "s" : ""} · ${questions.reduce((s, q) => s + q.mark, 0)} of ${test.totalMarks} marks assigned`
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-3 py-2">
                    {questions.length > 0 ? (
                        questions.map((q, i) => (
                            <QuestionCard
                                key={q.id}
                                q={q}
                                index={i}
                                onDelete={handleDelete}
                                isDeleting={deleteMutation.isPending}
                                disabled={isLive}
                                onEdit={(q) => {
                                    if (isLive) return;
                                    setEditingQuestion(q);
                                    // Smooth scroll to form
                                    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                            <div className="bg-slate-50 p-4 rounded-full">
                                <HelpCircle className="size-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No questions yet. Add your first question below.</p>
                        </div>
                    )}

                    <Separator className="my-4" />
                    <div id="question-form">
                        <AddQuestionForm
                            testId={test.id}
                            questionToEdit={editingQuestion}
                            disabled={isLive}
                            onAdded={() => {
                                refetch();
                                setEditingQuestion(null);
                            }}
                            onCancel={() => setEditingQuestion(null)}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
