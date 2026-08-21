import { useParams } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { useCurrentUserQuery } from '@/api/authHooks';
import {
    useCoursesQuery,
    useMySubjectsQuery,
    useMyLecturesQuery,
    useMyAttendanceHistoryQuery
} from '@/api/academyHooks';
import { useMyStudentInsightsQuery, useMyTeachersQuery } from '@/api/userHooks';
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
import { Activity } from 'lucide-react';
import {type AttendanceResponse, type LectureResponse, type TeacherResponse} from "@/api/types.ts";
import {
    Pie,
    PieChart,
    Cell,
    ResponsiveContainer,
} from "recharts";
import DashboardLayoutProvider from '../DashboardLayoutProvider';
import {format} from "date-fns";

export default function StudentCourseAttendancePage() {
    return (
        <DashboardLayoutProvider
            pageTitle="Attendance Report"
            sidebar={<StudentSidebar />}
            bodyTitle="Attendance Report"
            description="View your attendance report"
            icon={<Activity />}
        >
            <CourseAttendance />
        </DashboardLayoutProvider>
    );
}

/* ---------------- PIE CHART ---------------- */

function AttendancePieChart({
                                stats,
                                size = "size-60",
                            }: {
    stats: { present: number; late: number; excused: number; absent: number };
    size?: string;
}) {
    const isZero =
        stats.present === 0 &&
        stats.late === 0 &&
        stats.excused === 0 &&
        stats.absent === 0;

    const data = isZero
        ? [{ name: "No Data", value: 1, fill: "hsl(var(--muted))" }]
        : [
            { name: "present", value: stats.present, fill: "#2fb775" },
            { name: "late", value: stats.late, fill: "#faa71a" },
            { name: "excused", value: stats.excused, fill: "#3061ae" },
            { name: "absent", value: stats.absent, fill: "#f0453b" },
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
    );
}

/* ---------------- MAIN ---------------- */

function CourseAttendance() {
    const { id: courseId } = useParams<{ id: string }>();

    const { data: user } = useCurrentUserQuery();
    const { data: allCourses } = useCoursesQuery();
    const { data: allSubjects } = useMySubjectsQuery();
    const { data: insight, isLoading: insightLoading } = useMyStudentInsightsQuery(user?.id, { enabled: !!user?.id });
    const { data: allTeachersData } = useMyTeachersQuery();
    const { data: myLectures } = useMyLecturesQuery();
    const { data: attendanceHistory } = useMyAttendanceHistoryQuery();

    const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);

    const course = allCourses?.find(c => c.id === courseId);
    const subjects = allSubjects?.filter(s => s.courseId === courseId) ?? [];

    const isLoading = insightLoading || !user || !course;

    /* -------- FIXED LOGIC -------- */

    const attendanceData =
        (insight as any)?.attendance?.courseWiseAttendance?.[course?.name ?? ""] ?? {};

    interface Stats {
        total: number;
        present: number;
        late: number;
        excused: number;
        absent: number;
    }

    const courseStats: Stats = Object.values(attendanceData).reduce(
        (acc: Stats, val: any) => {
            const stats = val[1];
            return {
                total: acc.total + val[0],
                present: acc.present + stats.present,
                late: acc.late + stats.late,
                excused: acc.excused + stats.excused,
                absent: acc.absent + stats.absent,
            };
        },
        { total: 0, present: 0, late: 0, excused: 0, absent: 0 }
    );

    const attendancePercent =
        courseStats.total > 0
            ? Math.round(
                ((courseStats.present +
                    courseStats.late +
                    courseStats.excused) /
                    courseStats.total) *
                100
            )
            : 0;

    /* -------- LOADING -------- */

    if (isLoading) {
        return (
            <div className="p-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    /* -------- UI -------- */

    return (
        <div className="space-y-6 flex flex-col w-full">
            {/* OVERALL */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <Activity className="size-4 text-emerald-600" />
                        </div>
                        Overall Course Participation
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 relative flex items-center justify-center">
                        <AttendancePieChart stats={courseStats} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black">{attendancePercent}%</span>
                            <span className="text-muted-foreground font-medium">Attendance</span>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                        {[
                            { label: 'Present', value: courseStats.present, textColor: 'text-emerald-500', bgColor: 'bg-emerald-500/20' },
                            { label: 'Late', value: courseStats.late, textColor: 'text-amber-500', bgColor: 'bg-amber-500/20' },
                            { label: 'Excused', value: courseStats.excused, textColor: 'text-violet-500', bgColor: 'bg-violet-500/20' },
                            { label: 'Absent', value: courseStats.absent, textColor: 'text-rose-500', bgColor: 'bg-rose-500/20' },
                        ].map((item) => (
                            <div key={item.label} className={`${item.bgColor} flex flex-col gap-1 p-4 rounded-3xl`}>
                                <div className={`text-2xl font-black ${item.textColor}`}>{item.value}</div>
                                <span className="text-muted-foreground text-[12px] font-bold">{item.label}</span>
                            </div>
                        ))}
                        <div className="col-span-2 p-3 mt-1 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 justify-between px-5">
                            <span className="font-bold text-emerald-600">Total Lectures</span>
                            <span className="text-lg font-bold text-emerald-700">{courseStats.total}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SUBJECTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {subjects.map(subject => {
                    const raw = attendanceData?.[subject.name] ?? [0, { present: 0, late: 0, excused: 0, absent: 0 }];
                    const total = raw[0];
                    const stats = raw[1];
                    const percent = total > 0 ? Math.round(((stats.present + stats.late + stats.excused) / total) * 100) : 0;
                    const teacher = (allTeachersData as TeacherResponse[])?.find(t => t.id === subject.teacherId);

                    return (
                        <Card key={subject.id}>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center justify-between">
                                    {subject.name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative flex items-center justify-center">
                                        <AttendancePieChart stats={stats} size="size-40" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-xl font-black">{percent}%</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                        {[
                                            { label: 'Present', value: stats.present, textColor: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
                                            { label: 'Late', value: stats.late, textColor: 'text-amber-500', bgColor: 'bg-amber-500/10' },
                                            { label: 'Excused', value: stats.excused, textColor: 'text-violet-500', bgColor: 'bg-violet-500/10' },
                                            { label: 'Absent', value: stats.absent, textColor: 'text-rose-500', bgColor: 'bg-rose-500/10' },
                                        ].map((item) => (
                                            <div key={item.label} className={`${item.bgColor} flex flex-col gap-0.5 p-2 px-3 rounded-2xl`}>
                                                <div className={`text-xl font-black ${item.textColor}`}>{item.value}</div>
                                                <span className="text-[12px] font-medium text-muted-foreground">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] text-muted-foreground">Instructor</span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown"}
                                        </span>
                                    </div>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => setSelectedSubject({ id: subject.id, name: subject.name })}
                                    >
                                        History Log
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <SubjectLecturesModal
                subject={selectedSubject}
                onClose={() => setSelectedSubject(null)}
                lectures={myLectures?.filter(l => l.subjectId === selectedSubject?.id) ?? []}
                attendanceHistory={attendanceHistory ?? []}
            />
        </div>
    );
}

/* ---------------- MODAL ---------------- */

function SubjectLecturesModal({
    subject,
    onClose,
    lectures,
    attendanceHistory
}: any) {
    return (
        <Dialog open={!!subject} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">{subject?.name}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-80 flex flex-col gap-6">
                    {lectures.map((lec: LectureResponse) => {
                        const att = attendanceHistory.find((a: AttendanceResponse) => a.lectureId === lec.id);

                        return (
                            <div key={lec.id} className="flex justify-between p-4 border-b">
                                {
                                    lec.lectureTitle ? (
                                        <div className="flex flex-col items-start ">
                                            <span className="text-base font-medium">{lec.lectureTitle}</span>
                                            <span>{format(lec.startDate, "MMMM d, yyyy @ h:mm a")}</span>
                                        </div>
                                    ): (
                                        <div className="flex flex-col items-start ">
                                            <span className="text-base font-medium">{format(lec.startDate, "MMMM d, yyyy")}</span>
                                            <span>{format(lec.startDate, "@ h:mm a")}</span>
                                        </div>
                                    )
                                }

                                <div className={`${
                                    att?.status == "present" ?
                                        "text-emerald-500 bg-emerald-500/20":
                                    att?.status == "excused" ?
                                        "text-violet-500 bg-violet-500/20" :
                                    att?.status == "late" ?
                                        "text-amber-500 bg-amber-500/20":
                                    att?.status == "absent" ?
                                        "text-rose-500 bg-rose-500/20":
                                    "bg-muted text-muted-foreground"
                                } h-fit capitalize p-2 rounded-lg flex items-center justify-center`}>
                                    {att?.status ?? "N/A"}
                                </div>
                            </div>
                        );
                    })}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}