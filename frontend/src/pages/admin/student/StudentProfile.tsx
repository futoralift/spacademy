import { type StudentResponse } from "@/api/types.ts";
import { useDeleteStudentMutation, useUpdateStudentMutation, useStudentInsightsQuery, useTeacherStudentInsightsQuery } from "@/api/userHooks.ts";
import { Button } from "@/components/ui/button.tsx";
import {
    BookOpen,
    GraduationCap,
    LoaderCircle,
    Phone,
    School,
    ShieldCheck,
    Trash2, UserRound,
    CheckCircle2, XCircle, AlertCircle, Calendar,
    Activity,
    Settings2,
    Search,
    Trophy,
    LineChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { useCoursesQuery, useSubjectsQuery, useTestsQuery, useTestAttemptsQuery } from "@/api/academyHooks.ts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    Pie,
    PieChart,
} from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser.ts";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import CopyableField from "@/components/CopyableField.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Input } from "@/components/ui/input.tsx";

const formatDateTime = (value: string | null) => {
    if (!value) {
        return "Never"
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value))
}

const formatAuthProvider = (value: StudentResponse["authServiceProvider"]) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const profileRows = (student: StudentResponse) => [
    {
        title: "Student Details",
        icon: UserRound,
        items: [
            { label: "Email", value: student.email },
            { label: "Student Number", value: student.studentNumber },
            { label: "Roll Number", value: student.rollNo ?? "Not assigned" },
            { label: "Standard", value: student.standard ?? "Not assigned" },
        ],
    },
    {
        title: "Family Contact",
        icon: Phone,
        items: [
            { label: "Parent Name", value: student.parentName ?? "Not added" },
            { label: "Parent Number", value: student.parentNumber ?? "Not added" },
        ],
    },
    {
        title: "Account Status",
        icon: ShieldCheck,
        items: [
            { label: "Auth Provider", value: formatAuthProvider(student.authServiceProvider) },
            { label: "Joined On", value: formatDateTime(student.createdAt) },
            { label: "Last Login", value: formatDateTime(student.lastLoginAt) },
            { label: "Deleted At", value: student.deletedAt ? formatDateTime(student.deletedAt) : "Active" },
        ],
    },
]

function AttendancePieChart({ stats }: { stats: { present: number; late: number; excused: number; absent: number } }) {
    const isZero = stats.present === 0 && stats.late === 0 && stats.excused === 0 && stats.absent === 0

    // Fallback data for a nice placeholder ring when no data is available
    const data = isZero
        ? [{ name: "No Data", value: 1, fill: "hsl(var(--muted))" }]
        : [
            { name: "present", value: stats.present, fill: "#2fb775" }, // Emerald 500
            { name: "late", value: stats.late, fill: "#faa71a" },    // Amber 600
            { name: "excused", value: stats.excused, fill: "#3061ae" },   // Sky 500
            { name: "absent", value: stats.absent, fill: "#f0453b" }, // Rose 500
        ]

    const config = {
        present: { label: "Present", color: "#2fb775" },
        late: { label: "Late", color: "#faa71a" },
        excused: { label: "Excused", color: "#3061ae" },
        absent: { label: "Absent", color: "#f0453b" },
    } satisfies ChartConfig

    return (
        <ChartContainer config={config} className="h-35 w-35 min-h-35 min-w-35">
            <PieChart width={140} height={140}>
                {!isZero && (
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                )}

                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={isZero ? 0 : 4}
                    stroke="none"
                />
            </PieChart>
        </ChartContainer>
    );
}

function ScorePieChart({ percentage }: { percentage: number }) {
    const color = percentage >= 75 ? "#10b981" : percentage >= 50 ? "#6366f1" : "#f43f5e"
    
    const data = [
        { name: "Score", value: percentage, fill: color },
        { name: "Remaining", value: Math.max(0.1, 100 - percentage), fill: "#f1f5f9" },
    ]

    const config = {
        score: { label: "Score %", color: color },
    } satisfies ChartConfig

    return (
        <ChartContainer config={config} className="h-35 w-35 min-h-35 min-w-35">
            <PieChart width={140} height={140}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                    startAngle={90}
                    endAngle={450}
                    stroke="none"
                    cornerRadius={4}
                    paddingAngle={2}
                />
            </PieChart>
        </ChartContainer>
    );
}

function AttendanceStatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-xl bg-muted p-3">
            <div className={`flex size-8 items-center justify-center rounded-lg ${color}`}>
                <Icon className="size-4" />
            </div>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
    )
}

function ManageCoursesDialog({ student }: { student: StudentResponse }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>(student.courses.map(c => c.id));

    const { data: courses, isLoading: coursesLoading } = useCoursesQuery();
    const updateStudentMutation = useUpdateStudentMutation();

    const filteredCourses = useMemo(() => {
        if (!courses) return [];
        return courses.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.standards.some(s => s.toLowerCase().includes(search.toLowerCase()))
        );
    }, [courses, search]);

    const handleSave = async () => {
        try {
            await updateStudentMutation.mutateAsync({
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                avatar: student.avatar,
                email: student.email,
                phone: student.studentNumber,
                rollNo: student.rollNo ?? "",
                standard: student.standard ?? "",
                board: student.board ?? "",
                schoolName: student.schoolName ?? "",
                parentName: student.parentName ?? "",
                parentMobileNumber: student.parentNumber ?? "",
                courseIds: selectedIds
            });
            toast.success("Courses updated successfully");
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update courses");
        }
    };

    const toggleCourse = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="px-2 text-primary hover:text-primary hover:bg-primary/5">
                    <Settings2 className="size-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Manage Course Enrolment</DialogTitle>
                    <DialogDescription>
                        Select courses to enroll {student.firstName} into.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="search"
                        />
                    </div>

                    <ScrollArea className="h-75 pr-4">
                        {coursesLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <LoaderCircle className="size-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => toggleCourse(course.id)}
                                    >
                                        <Checkbox
                                            id={course.id}
                                            checked={selectedIds.includes(course.id)}
                                            onCheckedChange={() => toggleCourse(course.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1 space-y-1">
                                            <label
                                                htmlFor={course.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {course.name}
                                            </label>
                                            <div className="flex flex-wrap gap-1">
                                                {course.standards.map(s => (
                                                    <span key={s} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-bold">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateStudentMutation.isPending}
                    >
                        {updateStudentMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function StudentActions({ student, trigger }: { student: StudentResponse, trigger?: React.ReactNode }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const deleteStudentMutation = useDeleteStudentMutation()
    const { data: currentUser } = useCurrentUser()
    const isAdmin = currentUser?.role === "admin"
    const fullName = `${student.firstName} ${student.lastName}`

    const adminInsights = useStudentInsightsQuery(
        isAdmin && isDrawerOpen ? student.id : undefined,
        { enabled: isAdmin && isDrawerOpen && !!student.id }
    )
    const teacherInsights = useTeacherStudentInsightsQuery(
        !isAdmin && isDrawerOpen ? student.id : undefined,
        { enabled: !isAdmin && isDrawerOpen && !!student.id }
    )

    const insights = (isAdmin ? adminInsights.data : teacherInsights.data) as any
    const isInsightsLoading = isAdmin ? adminInsights.isLoading : teacherInsights.isLoading

    // Score Queries
    const subjectsQuery = useSubjectsQuery()
    const testsQuery = useTestsQuery({ limit: 15 })
    const attemptsQuery = useTestAttemptsQuery({ studentId: student.id, limit: 15 }, { enabled: isDrawerOpen })

    const subjects = subjectsQuery.data ?? []
    const tests = (testsQuery.data as any)?.data ?? []
    const attempts = (attemptsQuery.data as any)?.data ?? []

    const performance = useMemo(() => {
        if (!isDrawerOpen || !insights) return null

        const targetCourseName = selectedCourse || (insights.courses[0] ? insights.courses[0][1] : null)
        if (!targetCourseName) return null

        // Find course ID from name
        const courseEntry = insights.courses.find(([_id, name]: [string, string]) => name === targetCourseName)
        if (!courseEntry) return null
        const courseId = courseEntry[0]

        const courseSubjects = subjects.filter(s => s.courseId === courseId)
        const subjectPerformance: Record<string, { avg: number; tests: number }> = {}

        let globalObtained = 0
        let globalPossible = 0
        let totalTestsTaken = 0

        courseSubjects.forEach(subject => {
            const subjectTests = tests.filter((t: any) => t.subjectId === subject.id)
            const subjectTestIds = subjectTests.map((t: any) => t.id)
            const subjectAttempts = attempts.filter((att: any) => subjectTestIds.includes(att.testId))

            if (subjectAttempts.length > 0) {
                const subObtained = subjectAttempts.reduce((sum: number, att: any) => sum + (att.obtainedMarks || 0), 0)
                const subPossible = subjectAttempts.reduce((sum: number, att: any) => {
                    const test = subjectTests.find((t: any) => t.id === att.testId)
                    return sum + (test?.totalMarks || 0)
                }, 0)

                if (subPossible > 0) {
                    subjectPerformance[subject.name] = {
                        avg: Math.round((subObtained / subPossible) * 100),
                        tests: subjectAttempts.length
                    }
                    globalObtained += subObtained
                    globalPossible += subPossible
                    totalTestsTaken += subjectAttempts.length
                }
            }
        })

        return {
            overallAvg: globalPossible > 0 ? Math.round((globalObtained / globalPossible) * 100) : 0,
            totalTests: totalTestsTaken,
            subjects: subjectPerformance
        }
    }, [isDrawerOpen, selectedCourse, insights, subjects, tests, attempts])

    const handleDelete = async () => {
        try {
            await deleteStudentMutation.mutateAsync(student.id)
            setIsDeleteDialogOpen(false)
            toast.success("Student deleted successfully.")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete student."
            toast.error(message)
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    {trigger || (
                        <Button variant="outline" className="capitalize">
                            View Profile
                        </Button>
                    )}
                </DrawerTrigger>
                <DrawerContent className="ml-auto h-full w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl">
                    <DrawerHeader className="gap-4 border-b px-6 py-5 text-left">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-20 rounded-2xl">
                                    <AvatarImage src={student.avatar} alt={fullName} />
                                    <AvatarFallback className="rounded-2xl text-lg font-semibold">
                                        {`${student.firstName[0]?.toUpperCase() ?? ""}${student.lastName[0]?.toUpperCase() ?? ""}`}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <DrawerTitle className="text-2xl font-bold">{fullName}</DrawerTitle>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="p-4">
                                            <GraduationCap className="size-4" />
                                            {student.standard ?? "Standard not assigned"}
                                        </Badge>
                                        <Badge variant="outline" className="p-4">
                                            <Phone className="mr-1 size-4" />
                                            {student.studentNumber}
                                        </Badge>
                                        <Badge variant="outline" className="p-4">
                                            <ShieldCheck className="mr-1 size-4" />
                                            {formatAuthProvider(student.authServiceProvider)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">

                        {/* Attendance Insights Section */}
                        <div className="my-8">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Attendance Analysis</h3>
                                </div>
                                {insights && 'courses' in insights && insights.courses.length > 1 && (
                                    <Select
                                        value={selectedCourse || insights.courses[0][1]}
                                        onValueChange={setSelectedCourse}
                                    >
                                        <SelectTrigger className="w-50">
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {insights.courses.map(([id, name]: [string, string]) => (
                                                <SelectItem key={id} value={name}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {isInsightsLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Skeleton className="h-24 w-full rounded-xl" />
                                        <Skeleton className="h-24 w-full rounded-xl" />
                                    </div>
                                </div>
                            ) : insights && 'attendance' in insights ? (
                                <div className="space-y-6">
                                    {/* Overall Stats */}
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                                        <AttendanceStatCard
                                            label="Total"
                                            value={insights.attendance.lectureAttendance.totalLectures}
                                            icon={Calendar}
                                            color="bg-slate-100 text-slate-600"
                                        />
                                        <AttendanceStatCard
                                            label="Present"
                                            value={insights.attendance.lectureAttendance.present}
                                            icon={CheckCircle2}
                                            color="bg-emerald-100 text-emerald-600"
                                        />
                                        <AttendanceStatCard
                                            label="Late"
                                            value={insights.attendance.lectureAttendance.late}
                                            icon={AlertCircle}
                                            color="bg-amber-100 text-amber-600"
                                        />
                                        <AttendanceStatCard
                                            label="Excused"
                                            value={insights.attendance.lectureAttendance.excused}
                                            icon={Activity}
                                            color="bg-sky-100 text-sky-600"
                                        />
                                        <AttendanceStatCard
                                            label="Absent"
                                            value={insights.attendance.lectureAttendance.absent}
                                            icon={XCircle}
                                            color="bg-rose-100 text-rose-600"
                                        />
                                    </div>

                                    {/* Course Wise Analysis */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="text-primary size-4" />
                                            <h3 className="text-lg font-semibold">Subject Performance</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(() => {
                                                const targetCourse = selectedCourse || (insights.courses[0] ? insights.courses[0][1] : null);
                                                if (!targetCourse || !insights.attendance.courseWiseAttendance[targetCourse]) {
                                                    return <p className="text-sm text-muted-foreground">No attendance data available for this course.</p>;
                                                }

                                                return Object.entries(insights.attendance.courseWiseAttendance[targetCourse]).map(([subjectName, data]) => {
                                                    const [total, stats] = data as [number, { present: number; late: number; excused: number; absent: number }];
                                                    const attended = stats.present + stats.late;
                                                    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

                                                    return (
                                                        <Card key={subjectName} className="overflow-hidden border-none rounded-4xl">
                                                            <CardContent className="px-4 py-2">
                                                                <div className="mb-3 flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex size-10 items-center justify-center rounded-full shadow-sm">
                                                                            <span className="text-lg font-bold text-primary">{subjectName[0].toUpperCase()}</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold">{subjectName}</p>
                                                                            <p className="text-xs text-muted-foreground">{stats.present} present of {total} lectures</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="relative flex items-center justify-center shrink-0">
                                                                        <AttendancePieChart stats={stats} />
                                                                        <div className="absolute flex flex-col items-center">
                                                                            <span className={`text-xl font-black ${percentage >= 75 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                                                {percentage}%
                                                                            </span>
                                                                            <span className="text-[9px] font-bold uppercase text-muted-foreground">Rate</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2 text-[11px] font-medium text-muted-foreground grow">
                                                                        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <div className="size-1.5 rounded-full bg-emerald-500" />
                                                                                Present
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 dark:text-slate-100">{stats.present}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <div className="size-1.5 rounded-full bg-amber-500" />
                                                                                Late
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 dark:text-slate-100">{stats.late}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <div className="size-1.5 rounded-full bg-sky-500" />
                                                                                Excused
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 dark:text-slate-100">{stats.excused}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <div className="size-1.5 rounded-full bg-rose-500" />
                                                                                Absent
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 dark:text-slate-100">{stats.absent}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {total > 0 && (
                                                                    <div className="mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
                                                                        <div className="bg-emerald-500 h-full" style={{ width: `${(stats.present / total) * 100}%` }} />
                                                                        <div className="bg-amber-500 h-full" style={{ width: `${(stats.late / total) * 100}%` }} />
                                                                        <div className="bg-sky-500 h-full" style={{ width: `${(stats.excused / total) * 100}%` }} />
                                                                        <div className="bg-rose-500 h-full" style={{ width: `${(stats.absent / total) * 100}%` }} />
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                                    <Calendar className="mb-2 size-8 opacity-20" />
                                    <p className="text-sm font-medium">No attendance records found for this student.</p>
                                </div>
                            )}
                        </div>

                        {/* Score Performance Section */}
                        <div className="my-8">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Trophy className="size-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Test Performance</h3>
                                </div>
                            </div>

                            {attemptsQuery.isLoading || testsQuery.isLoading ? (
                                <Skeleton className="h-40 w-full rounded-xl" />
                            ) : performance?.totalTests ? (
                                <div className="space-y-6">
                                    {/* Overall Stats */}
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        <AttendanceStatCard
                                            label="Tests Taken"
                                            value={performance.totalTests}
                                            icon={LineChart}
                                            color="bg-slate-100 text-slate-600"
                                        />
                                        <AttendanceStatCard
                                            label="Overall Score"
                                            value={`${performance.overallAvg}%`}
                                            icon={Trophy}
                                            color="bg-indigo-100 text-indigo-600"
                                        />
                                        <div className="hidden sm:block">
                                            <AttendanceStatCard
                                                label="Enrolments"
                                                value={student.courses.length}
                                                icon={GraduationCap}
                                                color="bg-emerald-100 text-emerald-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject Analysis */}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {Object.entries(performance.subjects).map(([subjectName, data]) => (
                                            <Card key={subjectName} className="overflow-hidden border-none rounded-4xl bg-slate-50 dark:bg-slate-900/50">
                                                <CardContent className="px-4 py-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm font-bold text-primary">
                                                                {subjectName[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">{subjectName}</p>
                                                                <p className="text-[10px] font-black text-muted-foreground uppercase">{data.tests} tests</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative flex items-center justify-center shrink-0">
                                                            <ScorePieChart percentage={data.avg} />
                                                            <div className="absolute flex flex-col items-center">
                                                                <span className={`text-xl font-black ${data.avg >= 75 ? 'text-emerald-500' : data.avg >= 50 ? 'text-indigo-500' : 'text-rose-500'}`}>
                                                                    {data.avg}%
                                                                </span>
                                                                <span className="text-[9px] font-bold uppercase text-muted-foreground">Score</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 grow">
                                                            <div className="flex items-center justify-between border-b pb-1">
                                                                <span className="text-[11px] font-medium text-muted-foreground">Average</span>
                                                                <span className="text-xs font-bold">{data.avg}%</span>
                                                            </div>
                                                            <div className="flex items-center justify-between border-b pb-1">
                                                                <span className="text-[11px] font-medium text-muted-foreground">Tests</span>
                                                                <span className="text-xs font-bold">{data.tests}</span>
                                                            </div>
                                                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all duration-1000 ${data.avg >= 75 ? 'bg-emerald-500' : data.avg >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`} 
                                                                    style={{ width: `${data.avg}%` }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                                    <Activity className="mb-2 size-8 opacity-20" />
                                    <p className="text-sm font-medium">No test attempts recorded for this student.</p>
                                </div>
                            )}
                        </div>

                        {/* Personal details */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-dashed h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center font-semibold justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="size-4" />
                                            Enrolled Courses
                                        </div>
                                        {isAdmin && <ManageCoursesDialog student={student} />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {student.courses.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {student.courses.map((course: any) => (
                                                <Badge key={course.id} variant="secondary" className="p-3 bg-primary/5 text-primary border-primary/10">
                                                    {course.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4 border border-dashed rounded-xl grayscale opacity-50">
                                            <BookOpen className="size-8 mb-2 text-muted-foreground" />
                                            <p className="text-xs font-medium text-muted-foreground">No courses assigned</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <School className="size-4" />
                                        School Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <CopyableField
                                        label="School Name"
                                        value={student.schoolName ?? "Not added"}
                                    />
                                    <Separator />
                                    <CopyableField
                                        label="Board"
                                        value={student.board ?? "Not added"}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-4 grid gap-4">
                            {profileRows(student).map((section) => {
                                const Icon = section.icon

                                return (
                                    <Card key={section.title}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Icon className="size-4" />
                                                {section.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-3 sm:grid-cols-2">
                                            {section.items.map((item) => (
                                                <CopyableField
                                                    key={item.label}
                                                    label={item.label}
                                                    value={item.value}
                                                    enableCopy={item.label === "Student Number" || item.label === "Roll Number"}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                    </div>

                    <DrawerFooter className="border-t px-6 py-4 sm:flex-row sm:justify-between">
                        {isAdmin && (
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" disabled={deleteStudentMutation.isPending}>
                                        <Trash2 className="mr-2 size-4" />
                                        Delete User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete student?</DialogTitle>
                                        <DialogDescription>
                                            This will remove {fullName} from the student list. This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={deleteStudentMutation.isPending}>Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={deleteStudentMutation.isPending}
                                        >
                                            {deleteStudentMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                            Confirm Delete
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
