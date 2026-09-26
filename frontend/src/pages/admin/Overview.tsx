import React, {useState, useMemo} from 'react';
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart.tsx";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import TransactionDatatable, {type Item} from "@/components/shadcn-studio/blocks/datatable-transaction.tsx";
import {
    BookText, Library, UsersIcon, Megaphone, FileText,
    GraduationCap, TvMinimalPlay, Files, MessageCircleQuestion,
    SquarePen, TrendingUp, IndianRupee, ArrowRight,
} from "lucide-react";
import {Spinner} from "@/components/ui/spinner.tsx";
import {useCourses} from "@/hooks/api/useCourses.ts";
import {useStudentStats} from "@/hooks/api/useStudentStats.ts";
import {useSubjectsQuery, useTestsQuery, useTestAttemptsQuery, usePaymentsQuery} from "@/api/academyHooks";
import StudentActions from "@/pages/admin/student/StudentProfile.tsx";
import { Link } from 'react-router-dom';

const quickLinks = [
    { label: "Students", href: "/dashboard/admin/students", icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-100 dark:border-blue-900/40" },
    { label: "Teachers", href: "/dashboard/admin/teachers", icon: UsersIcon, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/40" },
    { label: "Courses", href: "/dashboard/admin/courses", icon: Library, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-100 dark:border-violet-900/40" },
    { label: "Lectures", href: "/dashboard/admin/lectures", icon: TvMinimalPlay, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-100 dark:border-cyan-900/40" },
    { label: "Assignments", href: "/dashboard/admin/assignments", icon: FileText, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-100 dark:border-orange-900/40" },
    { label: "Tests & Exams", href: "/dashboard/admin/tests", icon: GraduationCap, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-100 dark:border-red-900/40" },
    { label: "Blogs", href: "/dashboard/admin/blogs", icon: SquarePen, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-100 dark:border-yellow-900/40" },
    { label: "Study Resources", href: "/dashboard/admin/study-resources", icon: Files, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-100 dark:border-teal-900/40" },
    { label: "Announcements", href: "/dashboard/admin/announcements", icon: Megaphone, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-100 dark:border-pink-900/40" },
    { label: "Enquiries", href: "/dashboard/admin/enquiries", icon: MessageCircleQuestion, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-100 dark:border-amber-900/40" },
];

const statColors = [
    { icon: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-100 dark:border-indigo-900/40", trend: "text-emerald-600" },
    { icon: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-100 dark:border-violet-900/40", trend: "text-emerald-600" },
    { icon: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-100 dark:border-cyan-900/40", trend: "text-emerald-600" },
    { icon: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/40", trend: "text-emerald-600" },
];

export default function AdminOverview(){
    const studentStats = useStudentStats();
    const courses = useCourses();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const subjectsQuery = useSubjectsQuery();
    const testsQuery = useTestsQuery({ limit: 15 });
    const attemptsQuery = useTestAttemptsQuery({ limit: 15 });
    const paymentsQuery = usePaymentsQuery();

    const subjects = subjectsQuery.data ?? [];
    const tests = (testsQuery.data as any)?.data ?? [];
    const attempts = (attemptsQuery.data as any)?.data ?? [];

    const transactionData: Item[] = useMemo(() => {
        if (!paymentsQuery.data) return [];
        return paymentsQuery.data.map(p => ({
            id: p.id,
            avatar: p.studentAvatar || "",
            avatarFallback: p.studentName.split(' ').map(n => n[0]).join(''),
            name: p.studentName,
            email: p.studentEmail,
            amount: p.amount,
            status: p.status === 'success' ? 'paid' : (p.status as any),
            paidAt: new Date(p.createdAt).getTime(),
            studentId: p.studentId,
            student: p.student
        }));
    }, [paymentsQuery.data]);

    const totalEarning = useMemo(() => {
        return transactionData
            .filter(t => t.status === 'paid')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactionData]);

    React.useEffect(() => {
        if (courses.data?.[0] && !selectedCourseId) {
            setSelectedCourseId(courses.data[0].id);
        }
    }, [courses.data]);

    const chartData = useMemo(() => {
        if (!selectedCourseId) return [];
        const courseSubjects = subjects.filter(s => s.courseId === selectedCourseId);
        return courseSubjects.map(subject => {
            const subjectTests = tests.filter((t: any) => t.subjectId === subject.id);
            const subjectTestIds = subjectTests.map((t: any) => t.id);
            const subjectAttempts = attempts.filter((att: any) => subjectTestIds.includes(att.testId));

            let avgScore = 0, maxScore = 0;
            if (subjectAttempts.length > 0) {
                const totalObtained = subjectAttempts.reduce((sum: number, att: any) => sum + (att.obtainedMarks || 0), 0);
                const totalPossible = subjectAttempts.reduce((sum: number, att: any) => {
                    const test = subjectTests.find((t: any) => t.id === att.testId);
                    return sum + (test?.totalMarks || 0);
                }, 0);
                avgScore = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

                const scoresByStudent = subjectAttempts.reduce((acc: any, att: any) => {
                    const test = subjectTests.find((t: any) => t.id === att.testId);
                    const pct = test?.totalMarks ? (att.obtainedMarks / test.totalMarks) * 100 : 0;
                    if (!acc[att.studentId] || pct > acc[att.studentId]) acc[att.studentId] = pct;
                    return acc;
                }, {} as any);

                const scores = Object.values(scoresByStudent) as number[];
                if (scores.length > 0) maxScore = Math.max(...scores);
            }
            return { subject: subject.name, avg: Math.round(avgScore), peak: Math.round(maxScore) };
        });
    }, [selectedCourseId, subjects, tests, attempts]);

    const chartConfig = {
        avg: { label: "Class Avg %", color: "#5B5FFF" },
        peak: { label: "Highest Score %", color: "#0EA5E9" },
    } satisfies ChartConfig;

    if (studentStats.isLoading || courses.isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Spinner />
                <p className="text-sm text-muted-foreground">Loading dashboard…</p>
            </div>
        </div>
    );

    const totalStudents = studentStats.data?.totalStudents ?? 0;
    const totalCourses = courses.data?.length ?? 0;

    const statCards = [
        { icon: <UsersIcon className="size-5" />, label: "Total Students", value: totalStudents.toLocaleString(), change: "+12% this month" },
        { icon: <Library className="size-5" />, label: "Total Courses", value: totalCourses.toLocaleString(), change: "+3 this week" },
        { icon: <BookText className="size-5" />, label: "Active Tests", value: tests.length.toLocaleString(), change: "Live now" },
        { icon: <IndianRupee className="size-5" />, label: "Total Earnings", value: `₹${totalEarning.toLocaleString()}`, change: "+12% vs last month" },
    ];

    const today = new Date();
    const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

    return (
        <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-8">

            {/* ── Greeting Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium mb-1">{greeting}, Admin 👋</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Welcome to The Champions Academy</h1>
                        <p className="text-indigo-200 text-sm mt-1">Here's what's happening across your platform today.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/dashboard/admin/students">
                            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm text-xs font-semibold">
                                View Students <ArrowRight className="size-3 ml-1" />
                            </Button>
                        </Link>
                        <Link to="/dashboard/admin/courses">
                            <Button size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-semibold">
                                Manage Courses
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                    const c = statColors[i];
                    return (
                        <Card key={i} className={`border ${c.border} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl ${c.bg} ${c.icon}`}>
                                        {card.icon}
                                    </div>
                                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${c.trend}`}>
                                        <TrendingUp className="size-3" />
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-foreground tracking-tight">{card.value}</p>
                                <p className="text-xs font-medium text-muted-foreground mt-0.5">{card.label}</p>
                                <p className={`text-[11px] font-semibold mt-1.5 ${c.trend}`}>{card.change}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ── Quick Access Grid ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-foreground">Quick Access</h2>
                    <span className="text-xs text-muted-foreground">{quickLinks.length} sections</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {quickLinks.map((ql) => {
                        const QIcon = ql.icon;
                        return (
                            <Link key={ql.href} to={ql.href}>
                                <div className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border ${ql.border} ${ql.bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}>
                                    <div className={`p-2.5 rounded-xl bg-white dark:bg-card shadow-sm ${ql.color} group-hover:scale-110 transition-transform duration-200`}>
                                        <QIcon className="size-5" />
                                    </div>
                                    <span className="text-xs font-semibold text-foreground/80 text-center leading-tight">{ql.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ── Chart + Earnings ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Students Progress Chart */}
                <Card className="lg:col-span-2 border shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle className="text-base font-semibold">Students Progress by Subject</CardTitle>
                            <Select value={selectedCourseId || undefined} onValueChange={setSelectedCourseId}>
                                <SelectTrigger className="w-full sm:w-48 h-8 text-xs">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {courses.data?.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-56 w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                    <CartesianGrid vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false}
                                        tickFormatter={(v) => v.length > 10 ? `${v.slice(0, 8)}…` : v}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis tickLine={false} tickMargin={10} axisLine={false} domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="avg" fill="#5B5FFF" radius={[4,4,0,0]} />
                                    <Bar dataKey="peak" fill="#0EA5E9" radius={[4,4,0,0]} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                                No data available. Please select a course.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Earnings Summary */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Earnings Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 mb-3">
                                <IndianRupee className="size-7 text-emerald-600" />
                            </div>
                            <p className="text-3xl font-bold text-foreground">₹{totalEarning.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full mt-2">
                                <TrendingUp className="size-3" /> +12% from last month
                            </span>
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Transactions</span>
                                <span className="font-semibold">{transactionData.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid</span>
                                <span className="font-semibold text-emerald-600">{transactionData.filter(t => t.status === 'paid').length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending</span>
                                <span className="font-semibold text-orange-500">{transactionData.filter(t => t.status !== 'paid').length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Recent Transactions ── */}
            <Card className="border shadow-sm py-0">
                <CardHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                        <span className="text-xs text-muted-foreground">{transactionData.length} total</span>
                    </div>
                </CardHeader>
                <TransactionDatatable
                    data={transactionData}
                    renderActions={(item) => (
                        <StudentActions
                            student={item.student}
                            trigger={<Button variant="outline" size="sm" className="text-xs h-7">View Profile</Button>}
                        />
                    )}
                />
            </Card>
        </main>
    );
}