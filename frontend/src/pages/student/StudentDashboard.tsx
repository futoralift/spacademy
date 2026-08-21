import StudentSidebar from './StudentSidebar';
import { useCurrentUserQuery } from '@/api/authHooks';
import { useMyStudentInsightsQuery } from '@/api/userHooks';
import { useCoursesQuery, useMySubjectsQuery } from '@/api/academyHooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    BookOpenIcon,
    UsersIcon,
    CalendarCheckIcon,
    TrendingUpIcon,
    ClipboardListIcon, MegaphoneIcon, ChevronLeft, ChevronRight, CalendarIcon,
} from 'lucide-react';
import type { StudentInsight } from '@/api/types';
import { Button } from "@/components/ui/button.tsx";
import { usePublicAnnouncementsQuery } from "@/api/contentHooks.ts";
import { useState } from "react";
import { getFileUrl } from "@/api/http";
import { format } from "date-fns";
import DashboardLayoutProvider from "../DashboardLayoutProvider";

const StudentDashboardPage = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="Dashboard"
            sidebar={<StudentSidebar />}
        >
            <StudentOverview />
        </DashboardLayoutProvider>
    );
};

function StudentOverview() {
    const { data: user, isLoading: userLoading } = useCurrentUserQuery();
    const { data: insight, isLoading: insightLoading } = useMyStudentInsightsQuery(user?.id, {
        enabled: !!user?.id,
    });
    const { data: allCourses } = useCoursesQuery();
    const { data: allSubjects } = useMySubjectsQuery();
    const { data: announcementsData, isLoading: isAnnouncementsLoading } = usePublicAnnouncementsQuery({ limit: 5 });
    const [activeIndex, setActiveIndex] = useState(0);

    const isLoading = userLoading || insightLoading;

    if (isLoading || isAnnouncementsLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    const studentInsight = insight as StudentInsight | undefined;
    const enrolledCourseTuples = studentInsight?.courses ?? [];

    // Enrich with full course data
    const enrolledCourses = enrolledCourseTuples.map(([id, name]) => ({
        id,
        name,
        full: allCourses?.find(c => c.id === id),
    }));

    // Subjects for enrolled courses
    const enrolledSubjects = allSubjects?.filter(s =>
        enrolledCourses.some(c => c.id === s.courseId)
    ) ?? [];

    // Attendance summary from insight
    const attendanceData = studentInsight?.attendance.lectureAttendance ?? {};
    const presentCount = (attendanceData["excused"] || 0) + (attendanceData["present"] || 0) + (attendanceData["late"] || 0);
    const totalCount = attendanceData["totalLectures"] || 0;
    const attendancePercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;


    const stats = [
        {
            icon: <BookOpenIcon className="size-5 text-blue-600" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            label: 'Enrolled Courses',
            value: enrolledCourses.length,
        },
        {
            icon: <ClipboardListIcon className="size-5 text-violet-600" />,
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            label: 'My Subjects',
            value: enrolledSubjects.length,
        },
        {
            icon: <CalendarCheckIcon className="size-5 text-green-600" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
            label: 'Classes Attended',
            value: presentCount,
        },
        {
            icon: <TrendingUpIcon className="size-5 text-amber-600" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            label: 'Attendance Rate',
            value: `${attendancePercent}%`,
        },
    ];


    const announcements = announcementsData?.data?.filter(a => a.status === 'active') || [];
    const nextSlide = () => {
        if (announcements.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % announcements.length);
    };

    const prevSlide = () => {
        if (announcements.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    };

    return (
        <div className="size-full flex-1 space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <Card key={i} className="shadow-none border">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`${s.bg} p-2.5 rounded-xl shrink-0`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-medium">{s.label}</p>
                                <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Announcement */}
            {announcements.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <MegaphoneIcon className="size-5 text-primary" />
                            <h2 className="text-lg font-bold">Announcements</h2>
                        </div>
                        {announcements.length > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-full bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800"
                                    onClick={prevSlide}
                                    aria-label="prev slide"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-full bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800"
                                    onClick={nextSlide}
                                    aria-label="next slide"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="relative overflow-hidden group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="min-w-full flex flex-col md:flex-row min-h-64">
                                    <div className="w-full md:w-1/2 h-48 md:h-auto overflow-hidden">
                                        <img
                                            src={getFileUrl(announcement.bannerImage)}
                                            alt={announcement.title}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                        <div className="space-y-4">
                                            <Badge variant="secondary" className="bg-primary/5 dark:bg-primary/20 text-primary border-none text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 w-fit">
                                                Important Update
                                            </Badge>
                                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                                {announcement.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium pt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="size-4 text-primary" />
                                                    <span>Valid until {format(new Date(announcement.endDate), 'PPP')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            ))}
                        </div>

                        {/* Dots Pagination */}
                        {announcements.length > 1 && (
                            <div className="absolute bottom-4 right-4 flex gap-1.5">
                                {announcements.map((_, i) => (
                                <Button
                                        key={i}
                                        className={`size-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        onClick={() => setActiveIndex(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Enrolled Courses */}
            <Card className="shadow-none dark:border-slate-800">
                <CardHeader className="border-b dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                            <BookOpenIcon className="size-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>My Enrolled Courses</CardTitle>
                            <CardDescription>Courses you are currently enrolled in</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {enrolledCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-full mb-4">
                                <BookOpenIcon className="size-10 text-slate-300 dark:text-slate-700" />
                            </div>
                            <p className="text-muted-foreground font-medium">Not enrolled in any courses yet</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {enrolledCourses.map(course => {
                                const subjects = enrolledSubjects.filter(s => s.courseId === course.id);
                                return (
                                    <div
                                        key={course.id}
                                        className="group border dark:border-slate-800 rounded-xl p-4 hover:border-primary/40 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 bg-card"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <h3 className="font-semibold text-card-foreground leading-tight">{course.name}</h3>
                                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                                {subjects.length} subj.
                                            </Badge>
                                        </div>
                                        {course.full && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {course.full.standards?.map(std => (
                                                    <Badge key={std} variant="outline" className="text-[10px] py-0">
                                                        {std}
                                                    </Badge>
                                                ))}
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] py-0 capitalize"
                                                >
                                                    {course.full.mode}
                                                </Badge>
                                            </div>
                                        )}
                                        {subjects.length > 0 && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-800 flex flex-wrap gap-1">
                                                {subjects.slice(0, 4).map(s => (
                                                    <span
                                                        key={s.id}
                                                        className="text-[10px] bg-primary/8 dark:bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full"
                                                    >
                                                        {s.name}
                                                    </span>
                                                ))}
                                                {subjects.length > 4 && (
                                                    <span className="text-[10px] text-muted-foreground px-1">
                                                        +{subjects.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subjects Summary */}
            {enrolledSubjects.length > 0 && (
                <Card className="shadow-none dark:border-slate-800">
                    <CardHeader className="border-b dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-violet-100 dark:bg-violet-900/20 p-2 rounded-lg">
                                <UsersIcon className="size-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <CardTitle>All My Subjects</CardTitle>
                                <CardDescription>Subjects across all enrolled courses</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {enrolledSubjects.map(subject => {
                                const course = enrolledCourses.find(c => c.id === subject.courseId);
                                return (
                                    <div
                                        key={subject.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border dark:border-slate-800 bg-card hover:bg-muted/30 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="size-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                                            <ClipboardListIcon className="size-4 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm text-card-foreground truncate">{subject.name}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{course?.name}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default StudentDashboardPage;