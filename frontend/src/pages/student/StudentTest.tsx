import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useTestsQuery,
    useQuestionsQuery,
    useCreateStudentAnswerMutation
} from '@/api/academyHooks';
import { useCurrentUserQuery } from '@/api/authHooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    Timer,
    Flag,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getFileUrl } from '@/api/http';

const StudentTestPage = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { data: user } = useCurrentUserQuery();

    // 1. Fetch the test details from the list of tests
    const { data: testsData, isLoading: testsLoading } = useTestsQuery();
    const test = testsData?.data.find(t => t.id === testId);

    // 2. Fetch questions for this test
    const { data: questionsData, isLoading: questionsLoading } = useQuestionsQuery({ testId, limit: 100 });
    const questions = questionsData?.data || [];

    // 3. State management
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [testStarted, setTestStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createAnswerMutation = useCreateStudentAnswerMutation();

    // Initialize timer when test starts
    useEffect(() => {
        if (testStarted && test && timeLeft === null) {
            setTimeLeft(test.durationMin * 60);
        }
    }, [testStarted, test, timeLeft]);

    // Handle countdown
    useEffect(() => {
        if (testStarted && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isSubmitting && testStarted) {
            handleAutoSubmit();
        }
    }, [testStarted, timeLeft, isSubmitting]);

    const handleAutoSubmit = () => {
        toast.warning("Time's up! Submitting your test...");
        handleSubmitTest();
    };

    const handleStartTest = async () => {
        setTestStarted(true);
        toast.success("Test started. Good luck!");
    };

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (option: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: option
        }));
    };

    const toggleReview = () => {
        setMarkedForReview(prev => ({
            ...prev,
            [currentQuestion.id]: !prev[currentQuestion.id]
        }));
    };

    const handleSubmitTest = async () => {
        if (!testId || !user) return;
        setIsSubmitting(true);
        try {
            // 1. Submit each answer to the backend
            const answerPromises = Object.entries(selectedAnswers).map(([qId, answer]) =>
                createAnswerMutation.mutateAsync({
                    questionId: qId,
                    answer: answer as any,
                    testId: testId,
                    userId: user.id
                })
            );

            await Promise.all(answerPromises);

            toast.success("Test submitted successfully!");
            navigate(`/dashboard/student/overview`);
        } catch (error) {
            toast.error("Failed to submit some answers. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (testsLoading || questionsLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                <Loader2 className="size-12 animate-spin text-primary" />
                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Preparing Assessment...</p>
            </div>
        );
    }

    if (!test || questions.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-4">
                <div className="bg-rose-50 p-4 rounded-3xl text-rose-500">
                    <AlertCircle className="size-10" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Test Not Available</h2>
                    <p className="text-slate-500 font-medium mt-1">This test might have expired or has no questions yet.</p>
                </div>
                <Button onClick={() => navigate(-1)} variant="outline" className="rounded-2xl px-8 font-bold border-slate-200">
                    Go Back
                </Button>
            </div>
        );
    }

    // Question navigation grid
    const QuestionGrid = () => (
        <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
                const isSelected = currentQuestionIndex === idx;
                const isAnswered = !!selectedAnswers[questions[idx].id];
                const isMarked = markedForReview[questions[idx].id];

                return (
                    <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={cn(
                            "size-10 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                            isSelected ? "bg-primary text-white shadow-lg scale-110 z-10" :
                                isMarked ? "bg-amber-500 text-white shadow-md" :
                                    isAnswered ? "bg-emerald-500 text-white shadow-sm" :
                                        "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                    >
                        {idx + 1}
                    </button>
                );
            })}
        </div>
    );

    // Initial Instructions View
    if (!testStarted) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl rounded-[40px] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <CardContent className="p-0">
                        <div className="bg-primary/5 p-10 border-b border-white">
                            <div className="size-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-6 mx-auto">
                                <FileText className="size-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 text-center tracking-tight leading-tight">
                                {test.title}
                            </h1>
                            <div className="flex items-center justify-center gap-6 mt-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Limit</p>
                                    <p className="text-base font-black text-slate-800">{test.durationMin} Minutes</p>
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                                    <p className="text-base font-black text-slate-800">{questions.length} Items</p>
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                                    <p className="text-base font-black text-slate-800">{test.totalMarks} Points</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Important Instructions:</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Ensure you have a stable internet connection before starting.",
                                        "Once started, the timer cannot be paused.",
                                        "Test will auto-submit when the timer reaches zero.",
                                        "Do not refresh the page or it may reset your progress."
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-500 font-medium leading-relaxed">
                                            <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button onClick={handleStartTest} className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 mt-6">
                                I'm Ready, Start Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Active Test View
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Test Header */}
            <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-2 rounded-xl">
                        <BookOpenIcon className="size-5 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900">{test.title}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment in progress</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={cn(
                        "flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-colors",
                        (timeLeft || 0) < 300 ? "bg-rose-50 text-rose-500 animate-pulse" : "bg-slate-50 text-slate-700"
                    )}>
                        <Timer className="size-4" />
                        <span className="text-lg font-black font-mono">
                            {formatTime(timeLeft || 0)}
                        </span>
                    </div>

                    <Button
                        onClick={handleSubmitTest}
                        disabled={isSubmitting}
                        className="rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 px-8"
                    >
                        Submit Test
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-80 border-r border-slate-100 p-8 overflow-y-auto hidden lg:block bg-slate-50/20">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assessment Map</h3>
                            <QuestionGrid />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <div className="size-3 rounded shadow-sm bg-emerald-500" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <div className="size-3 rounded shadow-sm bg-amber-500" />
                                <span>Marked for Review</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <div className="size-3 rounded shadow-sm bg-slate-100" />
                                <span>Not Visited</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Question Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50/30 p-8 sm:p-12">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {/* Progress */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span className="text-xs font-bold text-slate-400">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
                            </div>
                            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 rounded-full bg-slate-100" />
                        </div>

                        {/* Question Card */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="shrink-0 size-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-900 border border-slate-100">
                                        {currentQuestionIndex + 1}
                                    </span>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                        {currentQuestion.questionText}
                                    </h2>
                                </div>

                                {currentQuestion.questionImg && (
                                    <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white p-2">
                                        <img src={getFileUrl(currentQuestion.questionImg)} alt="Question visual" className="w-full h-auto rounded-2xl" />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid gap-4">
                                {['optionA', 'optionB', 'optionC', 'optionD'].map((opt) => {
                                    const optionLabel = opt.replace('option', '').toUpperCase();
                                    const isSelected = selectedAnswers[currentQuestion.id] === optionLabel;
                                    const optionText = currentQuestion[opt as keyof typeof currentQuestion] as string;
                                    const optionImg = currentQuestion[`${opt}Img` as keyof typeof currentQuestion] as string;

                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswerSelect(optionLabel)}
                                            className={cn(
                                                "group relative flex items-center gap-5 p-6 rounded-3xl border-2 transition-all duration-300 text-left",
                                                isSelected
                                                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/5 translate-x-2"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "size-10 rounded-2xl flex items-center justify-center font-black text-sm transition-colors",
                                                isSelected ? "bg-primary text-white shadow-lg" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                            )}>
                                                {optionLabel}
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <span className={cn(
                                                    "text-base font-bold transition-colors",
                                                    isSelected ? "text-slate-900" : "text-slate-600"
                                                )}>
                                                    {optionText}
                                                </span>
                                                {optionImg && (
                                                    <div className="max-w-sm rounded-xl overflow-hidden border border-slate-100">
                                                        <img src={getFileUrl(optionImg)} alt={`Option ${optionLabel}`} className="w-full h-auto" />
                                                    </div>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <div className="absolute right-6 size-6 rounded-full bg-primary text-white flex items-center justify-center animate-in zoom-in-50 duration-300">
                                                    <CheckCircle2 className="size-4" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="h-12 rounded-2xl px-6 font-bold border-slate-200"
                            >
                                <ChevronLeft className="mr-2 size-4" /> Previous
                            </Button>

                            <Button
                                variant={markedForReview[currentQuestion.id] ? "default" : "outline"}
                                onClick={toggleReview}
                                className={cn(
                                    "h-12 rounded-2xl px-6 font-bold flex gap-2 transition-all",
                                    markedForReview[currentQuestion.id]
                                        ? "bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20"
                                        : "border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                )}
                            >
                                <Flag className="size-4" />
                                {markedForReview[currentQuestion.id] ? "Marked" : "Review Later"}
                            </Button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button
                                    onClick={handleSubmitTest}
                                    className="h-12 rounded-2xl px-8 font-black bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white"
                                >
                                    Submit & Finish
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="h-12 rounded-2xl px-8 font-bold bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    Next Question <ChevronRight className="ml-2 size-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Internal icons needed
const BookOpenIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export default StudentTestPage;
