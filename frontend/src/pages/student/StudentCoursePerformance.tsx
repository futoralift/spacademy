import { useParams } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { useCurrentUserQuery } from '@/api/authHooks';
import {
    useCoursesQuery,
    useMySubjectsQuery,
    useTestsQuery,
    useStudentAnswersQuery,
    useTestAttemptsQuery
} from '@/api/academyHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader, 
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Award, Eye, ClipboardListIcon } from 'lucide-react';
import {
    Pie,
    PieChart,
    Cell,
    ResponsiveContainer,
} from "recharts";
import DashboardLayoutProvider from '../DashboardLayoutProvider';
import { format } from 'date-fns';
import { SolvedPaperModal } from './SolvedPaperModal';

export default function StudentCoursePerformancePage() {
    return (
        <DashboardLayoutProvider
            pageTitle="Performance Report"
            sidebar={<StudentSidebar />}
            bodyTitle="Academic Performance"
            description="View your test results and scores"
            icon={<Award />}
        >
            <CoursePerformance />
        </DashboardLayoutProvider>
    );
}

/* ---------------- PIE CHART ---------------- */

function PerformancePieChart({
    percent,
    size = "size-60",
    color = "#f97316"
}: {
    percent: number;
    size?: string;
    color?: string;
}) {
    const data = [
        { name: "Score", value: percent, fill: color },
        { name: "Remaining", value: 100 - percent, fill: "hsl(var(--muted))" },
    ];

    return (
        <div className={size}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={0}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ---------------- MAIN ---------------- */

function CoursePerformance() {
    const { id: courseId } = useParams<{ id: string }>();

    const { data: user } = useCurrentUserQuery();
    const { data: allCourses, isLoading: coursesLoading } = useCoursesQuery();
    const { data: allSubjects, isLoading: subjectsLoading } = useMySubjectsQuery();
    const { data: tests, isLoading: testsLoading } = useTestsQuery();
    const { data: studentAnswers, isLoading: answersLoading } = useStudentAnswersQuery({ studentId: user?.id });
    const { data: testAttempts, isLoading: attemptsLoading } = useTestAttemptsQuery({ studentId: user?.id });

    const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewTest, setReviewTest] = useState<{ id: string; title: string } | null>(null);

    const course = allCourses?.find(c => c.id === courseId);
    const subjects = allSubjects?.filter(s => s.courseId === courseId) ?? [];
    const subjectIds = subjects.map(s => s.id);

    const isLoading = coursesLoading || subjectsLoading || testsLoading || answersLoading || attemptsLoading || !user || !course;

    if (isLoading) {
        return (
            <div className="p-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    const courseTests = (tests as any)?.data?.filter((t: any) => subjectIds.includes(t.subjectId)) ?? [];

    const testPerformance = courseTests.map((test: any) => {
        const attempt = (testAttempts as any)?.data?.find((a: any) => a.testId === test.id);
        const answers = (studentAnswers as any)?.data?.filter((a: any) => a.testId === test.id) ?? [];

        let obtainedMarks = 0;
        let hasAt = false;

        if (test.mode === 'offline') {
            obtainedMarks = attempt?.obtainedMarks ?? 0;
            hasAt = attempt !== undefined && attempt.obtainedMarks !== null;
        } else {
            obtainedMarks = answers.reduce((sum: number, a: any) => sum + (a.answer === a.correctAnswer ? a.mark : 0), 0);
            hasAt = answers.length > 0;
        }

        const percent = test.totalMarks > 0 ? Math.round((obtainedMarks / test.totalMarks) * 100) : 0;

        return {
            id: test.id,
            subjectId: test.subjectId,
            title: test.title,
            obtained: obtainedMarks,
            total: test.totalMarks,
            percent,
            hasAttempted: hasAt,
            startTime: test.startTime,
            expiresAt: test.expiresAt,
            mode: test.mode
        };
    });

    const attemptedTests = testPerformance.filter((p: any) => p.hasAttempted);
    const avgScore = attemptedTests.length > 0
        ? Math.round(attemptedTests.reduce((sum: number, p: any) => sum + p.percent, 0) / attemptedTests.length)
        : 0;

    const highestScore = attemptedTests.length > 0
        ? Math.max(...attemptedTests.map((p: any) => p.percent))
        : 0;

    const lowestScore = attemptedTests.length > 0
        ? Math.min(...attemptedTests.map((p: any) => p.percent))
        : 0;

    return (
        <div className="space-y-6 flex flex-col w-full">
            {/* OVERALL PERFORMANCE */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Award className="size-4 text-orange-600" />
                        </div>
                        Overall Course Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 relative flex items-center justify-center">
                        <PerformancePieChart percent={avgScore} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black">{avgScore}%</span>
                            <span className="text-muted-foreground font-medium">Average</span>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                        {[
                            { label: 'Exams Attempted', value: attemptedTests.length, textColor: 'text-orange-500', bgColor: 'bg-orange-500/20' },
                            { label: 'Total Assessments', value: courseTests.length, textColor: 'text-sky-500', bgColor: 'bg-sky-500/20' },
                            { label: 'Highest Score', value: `${highestScore}%`, textColor: 'text-emerald-500', bgColor: 'bg-emerald-500/20' },
                            { label: 'Lowest Score', value: `${lowestScore}%`, textColor: 'text-rose-500', bgColor: 'bg-rose-500/20' },
                        ].map((item) => (
                            <div key={item.label} className={`${item.bgColor} flex flex-col gap-1 p-4 rounded-3xl`}>
                                <div className={`text-2xl font-bold ${item.textColor}`}>{item.value}</div>
                                <span className="text-muted-foreground text-[12px] font-medium">{item.label}</span>
                            </div>
                        ))}
                        <div className="col-span-2 p-3 rounded-2xl bg-orange-500/10 border border-orange-500 flex items-center gap-2 justify-between px-5">
                            <span className="font-semibold text-orange-500">Performance Category</span>
                            <span className="text-lg font-semibold text-orange-500">
                                {avgScore >= 80 ? "Excellent" : avgScore >= 60 ? "Good" : avgScore >= 40 ? "Average" : "Needs Improvement"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SUBJECTS PERFORMANCE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {subjects.map(subject => {
                    const subjectTestData = testPerformance.filter((p: any) => p.subjectId === subject.id);
                    const attemptedSubjectTests = subjectTestData.filter((p: any) => p.hasAttempted);
                    const subjectAvg = attemptedSubjectTests.length > 0
                        ? Math.round(attemptedSubjectTests.reduce((sum: number, p: any) => sum + p.percent, 0) / attemptedSubjectTests.length)
                        : 0;

                    const subjectColors = ["#f97316", "#0ea5e9", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
                    const color = subjectColors[subjects.indexOf(subject) % subjectColors.length];

                    return (
                        <Card key={subject.id}>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center justify-between">
                                    {subject.name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative flex flex-1 items-center justify-center">
                                        <PerformancePieChart percent={subjectAvg} size="size-40" color={color} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-xl font-black">{subjectAvg}%</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                        {[
                                            {
                                                label: 'Average',
                                                value: `${subjectAvg}%`,
                                                textColor: 'text-emerald-500 text-4xl font-black ',
                                                bgColor: 'bg-emerald-500/10',
                                                span: 'row-span-2 text-center',
                                            },
                                            {
                                                label: 'Attempted',
                                                value: attemptedSubjectTests.length,
                                                textColor: 'text-orange-500 text-xl font-semibold ',
                                                bgColor: 'bg-orange-500/10',
                                            },
                                            {
                                                label: 'Pending',
                                                value: subjectTestData.length - attemptedSubjectTests.length,
                                                textColor: 'text-sky-500 text-xl font-semibold ',
                                                bgColor: 'bg-sky-500/10',
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={`
                                                    ${item.bgColor} 
                                                    ${item.span || ''} 
                                                    flex flex-col justify-center gap-1 
                                                    p-3 rounded-2xl
                                                  `}
                                            >
                                                <div className={`${item.textColor}`}>
                                                    {item.value}
                                                </div>
                                                <span className="text-[12px] font-medium text-muted-foreground">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] text-muted-foreground">Assessments</span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {subjectTestData.length} total
                                        </span>
                                    </div>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="cursor-pointer border-orange-200 text-orange-600 hover:bg-orange-50"
                                        onClick={() => setSelectedSubject({ id: subject.id, name: subject.name })}
                                    >
                                        Exam Log
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <PerformanceLogModal
                subject={selectedSubject}
                onClose={() => setSelectedSubject(null)}
                tests={testPerformance.filter((p: any) => p.subjectId === selectedSubject?.id)}
                onReview={(test) => {
                    setReviewTest(test);
                    setIsReviewOpen(true);
                }}
            />

            {reviewTest && user && (
                <SolvedPaperModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    testId={reviewTest.id}
                    testTitle={reviewTest.title}
                    studentId={(user as any)?.studentId || ""}
                />
            )}
        </div>
    );
}

/* ---------------- MODAL ---------------- */

function PerformanceLogModal({
    subject,
    onClose,
    tests,
    onReview
}: {
    subject: { id: string; name: string } | null;
    onClose: () => void;
    tests: any[];
    onReview: (test: any) => void;
}) {
    return (
        <Dialog open={!!subject} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">{subject?.name}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-80 flex flex-col gap-6 items-center justify-center">
                    {tests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <ClipboardListIcon className="size-12 mb-4 opacity-20" />
                            <p className="text-center">No assessments recorded for this subject yet.</p>
                        </div>
                    ) : (
                        tests.map((test) => (
                            <div key={test.id} className="flex justify-between p-4 border-b">
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-semibold">{test.title}</span>
                                    <span className="text-muted-foreground">{format(new Date(test.startTime), "MMMM d, yyyy @ h:mm a")}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`${test.hasAttempted
                                            ? test.percent >= 40
                                                ? "text-emerald-500 bg-emerald-500/20"
                                                : "text-rose-500 bg-rose-500/20"
                                            : new Date() > new Date(test.expiresAt)
                                                ? "bg-muted text-muted-foreground"
                                                : "text-sky-500 bg-sky-500/20"
                                            } h-fit capitalize p-2 rounded-lg flex items-center justify-center`}
                                    >
                                        {test.hasAttempted
                                            ? `${test.percent}%`
                                            : new Date() > new Date(test.expiresAt)
                                                ? "Missed"
                                                : "Upcoming"}
                                    </div>

                                    {test.hasAttempted && test.mode === 'online' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-orange-600 hover:bg-orange-50 rounded-full h-10 w-10 p-0"
                                            onClick={() => onReview(test)}
                                        >
                                            <Eye className="size-5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
