import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { useCurrentUserQuery } from '@/api/authHooks';
import { useMyStudentInsightsQuery } from '@/api/userHooks';
import {
    useCoursesQuery,
    useMySubjectsQuery,
    useMyLecturesQuery,
    useMyAttendanceHistoryQuery,
    useTestsQuery,
    useStudentAnswersQuery,
    useAssignmentsQuery,
    useAssignmentSubmissionsQuery,
    useCreateAssignmentSubmissionMutation,
    useUpdateAssignmentSubmissionMutation,
    useTestAttemptsQuery
} from '@/api/academyHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    BookOpenIcon,
    ClipboardListIcon,
    WifiIcon,
    MonitorIcon,
    ArrowLeft,
    Activity,
    Award,
    Eye,
    UploadIcon,
} from 'lucide-react';
import { SolvedPaperModal } from './SolvedPaperModal';
import { getFileUrl } from '@/api/http';
import {
    Pie,
    PieChart,
    Cell, ResponsiveContainer,
} from "recharts";
import { format } from 'date-fns';
import DashboardLayoutProvider from '../DashboardLayoutProvider';
import { Field } from "@/components/ui/field.tsx";

export default function StudentCourseDetailPage() {
    return (
        <DashboardLayoutProvider
            pageTitle="Course Detail"
            sidebar={<StudentSidebar />}
        >
            <CourseDetail />
        </DashboardLayoutProvider>
    );
}


function AttendancePieChart({
    stats,
}: {
    stats: { present: number; late: number; excused: number; absent: number }
}) {
    const isZero =
        stats.present === 0 &&
        stats.late === 0 &&
        stats.excused === 0 &&
        stats.absent === 0

    const data = isZero
        ? [{ name: "No Data", value: 1, fill: "hsl(var(--muted))" }]
        : [
            { name: "present", value: stats.present, fill: "#2fb775" },
            { name: "late", value: stats.late, fill: "#faa71a" },
            { name: "excused", value: stats.excused, fill: "#3061ae" },
            { name: "absent", value: stats.absent, fill: "#f0453b" },
        ]

    return (
        <div className="size-60"> {/* control size HERE */}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={isZero ? 0 : 4}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

function PerformancePieChart({
    data,
}: {
    data: { name: string; value: number; fill: string }[]
}) {
    const isZero = data.length === 0;

    const chartData = isZero
        ? [{ name: "No Data", value: 1, fill: "hsl(var(--muted))" }]
        : data;

    return (
        <div className="size-60">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={isZero ? 0 : 4}
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}


function AssignmentUploadModal({
    assignment,
    existingSubmission,
}: {
    assignment: any;
    existingSubmission?: any;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const createMutation = useCreateAssignmentSubmissionMutation();
    const updateMutation = useUpdateAssignmentSubmissionMutation();

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        try {
            if (existingSubmission) {
                if (existingSubmission.status === 'completed') {
                    toast.error("Completed assignments cannot be resubmitted");
                    return;
                }
                await updateMutation.mutateAsync({
                    submissionId: existingSubmission.id,
                    assignmentId: assignment.id,
                    file: file
                });
                toast.success("Assignment resubmitted successfully");
            } else {
                await createMutation.mutateAsync({
                    assignmentId: assignment.id,
                    file: file
                });
                toast.success("Assignment submitted successfully");
            }
            setIsOpen(false);
            setFile(null);
        } catch {
            toast.error("Failed to submit assignment");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {existingSubmission ? (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-emerald-600 px-2 rounded-lg"
                        disabled={existingSubmission.status === 'completed'}
                    >
                        {existingSubmission.status === 'completed' ? 'Finalized' : 'Resubmit'}
                    </Button>
                ) : (
                    <Button size="lg" variant="outline" className="cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold">
                        <UploadIcon />
                        Upload
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-bold">
                        {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <h4 className="text-base font-bold">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {assignment.description || "Please upload your completed assignment file below. Once submitted, our team will review it."}
                        </p>
                    </div>

                    <Field>
                        <Label htmlFor="assignment-file">
                            Assignment File
                        </Label>
                        <div
                            className="group relative border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all cursor-pointer animate-in zoom-in-95 duration-300"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-all duration-300">
                                <ClipboardListIcon className="size-7 text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold group-hover:text-emerald-700 transition-colors">
                                    {file ? file.name : "Choose assignment file"}
                                </p>
                                <p className="text-muted-foreground font-semibold">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "PDF, PNG, JPG (MAX 10MB)"}
                                </p>
                            </div>
                            <Input
                                id="assignment-file"
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                aria-label="assignment-file"
                            />
                        </div>
                    </Field>
                </div>
                <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 sm:justify-between gap-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Nevermind
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !file}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading ? "Uploading..." : (existingSubmission ? "Confirm Update" : "Submit Homework")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CourseDetail() {
    const navigate = useNavigate();
    const { id: courseId } = useParams<{ id: string }>();
    const { data: user } = useCurrentUserQuery();
    const { data: allCourses, isLoading: coursesLoading } = useCoursesQuery();
    const { data: allSubjects, isLoading: subjectsLoading } = useMySubjectsQuery();
    const { data: insight, isLoading: insightLoading } = useMyStudentInsightsQuery(user?.id, { enabled: !!user?.id });
    const { data: myLectures, isLoading: lecturesLoading } = useMyLecturesQuery();
    const { isLoading: attHistoryLoading } = useMyAttendanceHistoryQuery();
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewTest, setReviewTest] = useState<{ id: string; title: string } | null>(null);
    const { data: tests, isLoading: testsLoading } = useTestsQuery();
    const { data: studentAnswers, isLoading: answersLoading } = useStudentAnswersQuery({ studentId: user?.id });
    const { data: assignments, isLoading: assignmentsLoading } = useAssignmentsQuery();
    const { data: assignmentSubmissions, isLoading: submissionsLoading } = useAssignmentSubmissionsQuery({ studentId: user?.id });
    const { data: testAttempts, isLoading: attemptsLoading } = useTestAttemptsQuery({ studentId: user?.id });

    const isLoading = insightLoading || coursesLoading || subjectsLoading || lecturesLoading || attHistoryLoading || testsLoading || answersLoading || assignmentsLoading || submissionsLoading || attemptsLoading || !user;

    const course = allCourses?.find(c => c.id === courseId);
    const subjects = allSubjects?.filter(s => s.courseId === courseId) ?? [];
    const subjectIds = subjects.map(s => s.id);

    const courseTests = tests?.data.filter(t => subjectIds.includes(t.subjectId)) ?? [];
    const courseAssignments = assignments?.data.filter(a => {
        const lecture = myLectures?.find(l => l.id === a.lectureId);
        return lecture && subjectIds.includes(lecture.subjectId);
    }) ?? [];

    const attendanceData = (insight as any)?.attendance?.courseWiseAttendance?.[course?.name ?? ""] ?? {};

    interface Stats { total: number; present: number; late: number; excused: number; absent: number }

    const courseStats = Object.values(attendanceData).reduce((acc: Stats, val: any) => {
        const stats = val[1];
        return {
            total: acc.total + val[0],
            present: acc.present + stats.present,
            late: acc.late + stats.late,
            excused: acc.excused + stats.excused,
            absent: acc.absent + stats.absent
        };
    }, { total: 0, present: 0, late: 0, excused: 0, absent: 0 } as Stats);

    const attendancePercent = courseStats.total > 0
        ? Math.round(((courseStats.present + courseStats.late + courseStats.excused) / courseStats.total) * 100)
        : 0;

    // Test Marks Calculation
    const testPerformance = courseTests.map(test => {
        const attempt = testAttempts?.data.find(a => a.testId === test.id);
        const answers = studentAnswers?.data.filter(a => a.testId === test.id) ?? [];

        let obtainedMarks = 0;
        let hasAt = false;

        if (test.mode === 'offline') {
            obtainedMarks = attempt?.obtainedMarks ?? 0;
            hasAt = attempt !== undefined && attempt.obtainedMarks !== null;
        } else {
            obtainedMarks = answers.reduce((sum, a) => sum + (a.answer === a.correctAnswer ? a.mark : 0), 0);
            hasAt = answers.length > 0;
        }

        return {
            id: test.id,
            subjectId: test.subjectId,
            title: test.title,
            obtained: obtainedMarks,
            total: test.totalMarks,
            percent: test.totalMarks > 0 ? Math.round((obtainedMarks / test.totalMarks) * 100) : 0,
            hasAttempted: hasAt
        };
    });

    const subjectPerformance = subjects.map((subject, index) => {
        const subjectTests = testPerformance.filter(p => p.subjectId === subject.id && p.hasAttempted);
        const avgPercent = subjectTests.length > 0
            ? Math.round(subjectTests.reduce((sum, p) => sum + p.percent, 0) / subjectTests.length)
            : 0;

        const colors = ["#2fb775", "#faa71a", "#3061ae", "#f0453b", "#8b5cf6", "#ec4899", "#06b6d4"];

        return {
            name: subject.name,
            value: avgPercent,
            fill: colors[index % colors.length]
        };
    }).filter(s => s.value > 0);

    const avgTestPercent = testPerformance.length > 0
        ? Math.round(testPerformance.reduce((sum, p) => sum + p.percent, 0) / testPerformance.length)
        : 0;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-muted-foreground mb-4">Course not found or you are not enrolled in it.</p>
                <Button asChild variant="outline">
                    <Link to="/dashboard/student/courses">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Courses
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border dark:border-slate-800 bg-card">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none text-slate-900 dark:text-slate-100">
                    <BookOpenIcon className="size-full scale-150 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 aspect-video md:aspect-auto overflow-hidden">
                        {course.image ? (
                            <img
                                src={getFileUrl(course.image)}
                                alt={course.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="size-full flex items-center justify-center bg-primary/5 dark:bg-primary/10">
                                <BookOpenIcon className="size-16 text-primary/20 dark:text-primary/40" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 p-6 md:p-10 space-y-6 flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-primary/5 dark:bg-primary/10 text-primary border-none font-bold tracking-wider px-2 py-0.5">
                                    {course.mode === 'online' ? <><WifiIcon className="size-3 mr-1 inline" /> Online</> : <><MonitorIcon className="size-3 mr-1 inline" /> Offline</>}
                                </Badge>
                                {course.standards.map(std => (
                                    <Badge key={std} variant="outline" className="text-[10px] py-0.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 uppercase font-bold">
                                        {std}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
                                {course.name}
                            </h1>

                            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
                                {course.description || "Learn more about this course and its subjects in your academic plan."}
                            </p>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Subjects</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{subjects.length} Total</span>
                            </div>
                            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Fee Type</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">{course.isPaid ? `${course.currency} ${course.amount}` : "Free"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance & Test Summary Layout */}
            <div className="w-full flex items-stretch justify-start gap-6 max-lg:flex-col">
                {/* Overall Attendance (3/4) */}
                <Card className="flex-1 cursor-pointer hover:bg-muted/30 dark:border-slate-800" onClick={() => navigate(`/dashboard/student/courses/${courseId}/attendance`)}>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                                <Activity className="size-4 text-green-600 dark:text-green-400" />
                            </div>
                            Overall Course Participation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center gap-5">
                        <div className="flex-1 relative flex items-center justify-center">
                            <AttendancePieChart stats={courseStats} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{attendancePercent}%</span>
                                <span className="text-muted-foreground text-xs font-semibold">Attendance</span>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                            {[
                                {
                                    label: 'Present',
                                    value: courseStats.present,
                                    textColor: 'text-emerald-500 dark:text-emerald-400',
                                    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
                                },
                                {
                                    label: 'Late',
                                    value: courseStats.late,
                                    textColor: 'text-amber-500 dark:text-amber-400',
                                    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
                                },
                                {
                                    label: 'Excused',
                                    value: courseStats.excused,
                                    textColor: 'text-violet-500 dark:text-violet-400',
                                    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
                                },
                                {
                                    label: 'Absent',
                                    value: courseStats.absent,
                                    textColor: 'text-rose-500 dark:text-rose-400',
                                    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className={`${item.bgColor} flex flex-col gap-2 p-4 rounded-2xl`}
                                >
                                    <div className={`text-xl font-black ${item.textColor}`}>
                                        {item.value}
                                    </div>
                                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider">
                                        {item.label}
                                    </span>
                                </div>
                            ))}

                            <div className="col-span-2 p-3 mt-2 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 flex items-center gap-2 justify-between px-5">
                                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                    {courseStats.total} Total Lectures
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Marks (1/4) */}
                <Card className="flex-1 cursor-pointer hover:bg-muted/30 dark:border-slate-800" onClick={() => navigate(`/dashboard/student/courses/${courseId}/performance`)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
                                <Award className="size-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            Academic Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-start gap-5">
                        <div className="flex-1 relative flex items-center justify-center">
                            <PerformancePieChart data={subjectPerformance} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{avgTestPercent}%</span>
                                <span className="text-muted-foreground text-[11px] font-bold">Average</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex items-center justify-between font-bold">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Tests Attempted</span>
                                <span className="text-lg text-slate-900 dark:text-slate-100">{testPerformance.filter(p => p.hasAttempted).length}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                {subjects.map((subject) => {
                                    const perf = subjectPerformance.find(s => s.name === subject.name);
                                    const fillColor = perf?.fill || '#cbd5e1';
                                    return (
                                        <div
                                            key={subject.id}
                                            className="flex flex-col gap-1 p-3 rounded-2xl"
                                            style={{ backgroundColor: `${fillColor}15`, border: `1px solid ${fillColor}25` }}
                                        >
                                            <div className="text-lg font-black" style={{ color: fillColor }}>
                                                {perf ? `${perf.value}%` : '0%'}
                                            </div>
                                            <span className="text-muted-foreground text-[12px] font-medium truncate">
                                                {subject.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Test Series & Marks History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Test Series */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-violet-100 dark:bg-violet-900/30 p-2.5 rounded-xl">
                            <BookOpenIcon className="size-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Course Test Series</h2>
                            <p className="text-sm text-muted-foreground font-medium">Available and upcoming assessments</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {courseTests.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center text-muted-foreground italic text-sm">
                                No test series available for this course.
                            </div>
                        ) : (
                            courseTests.map(test => {
                                const performance = testPerformance.find(p => p.id === test.id);
                                return (
                                    <div key={test.id} className="border dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between group hover:shadow-xs hover:border-violet-200 dark:hover:border-violet-900 transition-all bg-card">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                                <ClipboardListIcon className="size-6 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{test.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[12px] text-muted-foreground font-medium">{format(new Date(test.startTime), 'MMM dd, yyyy')}</span>
                                                    <span className="size-1 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                                                    <span className="text-[12px] text-muted-foreground font-medium">{test.durationMin} mins</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {performance?.hasAttempted ? (
                                                new Date() >= new Date(test.expiresAt) ? (
                                                    <div className="flex items-center h-full gap-3">
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-slate-900 dark:text-slate-100">{performance.obtained} / {performance.total}</div>
                                                            <div className={`text-[12px] font-bold px-2 py-0.5 rounded ${performance.percent > 40 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'}`}>
                                                                {performance.percent}% Score
                                                            </div>
                                                        </div>
                                                        {test.mode === 'online' && (
                                                            <Button
                                                                variant="ghost"
                                                                className="cursor-pointer text-primary h-full bg-primary/10 dark:bg-primary/20 font-bold hover:bg-primary/5 dark:hover:bg-primary/30 border border-primary/10 dark:border-primary/20 transition-all flex items-center justify-center p-4"
                                                                onClick={() => {
                                                                    setReviewTest({ id: test.id, title: test.title });
                                                                    setIsReviewOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="size-6" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold text-[12px] px-3 py-1.5 rounded-md flex items-center gap-1.5">
                                                            Result Awaited
                                                        </div>
                                                        <p className="text-[12px] text-muted-foreground font-medium">Available after {format(new Date(test.expiresAt), 'h:mm a')}</p>
                                                    </div>
                                                )
                                            ) : test.mode === 'online' ? (
                                                new Date() < new Date(test.startTime) ? (
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold text-[12px] px-3 py-1.5 rounded-md flex items-center gap-1.5">
                                                            Starting Soon
                                                        </div>
                                                        <p className="text-[12px] text-muted-foreground font-medium">Opens at {format(new Date(test.startTime), 'h:mm a')}</p>
                                                    </div>
                                                ) : new Date() > new Date(test.expiresAt) ? (
                                                    <div className="text-[12px] font-bold px-3 py-2 rounded-lg text-rose-500 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20">
                                                        Exam Expired
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="cursor-pointer rounded-xl border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 font-bold text-xs h-8"
                                                        onClick={() => navigate(`/dashboard/student/tests/${test.id}`)}
                                                    >
                                                        Attempt Now
                                                    </Button>
                                                )
                                            ) : (
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="outline" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-1.5 rounded-xl border-slate-200 dark:border-slate-800">
                                                        Offline Exam
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Assignments Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-950/30 p-2.5 rounded-xl">
                            <ClipboardListIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Assignments</h2>
                            <p className="text-sm text-muted-foreground font-medium">Topic-wise home tasks and submissions</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {courseAssignments.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center text-slate-400 dark:text-slate-600 italic text-sm">
                                No assignments found for this course.
                            </div>
                        ) : (
                            courseAssignments.map(assignment => {
                                // Match submission
                                const submissions = Array.isArray(assignmentSubmissions) ? assignmentSubmissions : (assignmentSubmissions as any)?.data ?? [];
                                const submission = submissions.find((s: any) => s.assignmentId === assignment.id);

                                return (
                                    <div key={assignment.id} className="bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-3 flex items-center justify-between group hover:shadow-xs hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                <BookOpenIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[12px] text-muted-foreground font-medium">Due: {format(new Date(assignment.deadline), 'MMM dd, yyyy')}</span>
                                                    {assignment.mark && (
                                                        <>
                                                            <span className="size-1 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                                                            <span className="text-[12px] text-muted-foreground font-medium">{assignment.mark} Marks</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-2">
                                            {submission && (
                                                <Badge className={`${submission.status === 'completed' ? 'bg-emerald-500' :
                                                    submission.status === 'pending' ? 'bg-amber-500' :
                                                        submission.status === 'rejected' ? 'bg-rose-500' :
                                                            'bg-slate-500'
                                                    } text-white border-none text-[11px] p-2 py-1 h-fit`}>
                                                    {submission.status}
                                                </Badge>
                                            )}

                                            <AssignmentUploadModal
                                                assignment={assignment}
                                                existingSubmission={submission}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Review Solved Paper */}
            {reviewTest && user && (
                <SolvedPaperModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    testId={reviewTest.id}
                    testTitle={reviewTest.title}
                    studentId={(user as any)?.studentId || ""}
                />
            )}
        </main>
    );
}
