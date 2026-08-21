import { useTeacherDashboardQuery } from '@/api/userHooks';
import { usePublicAnnouncementsQuery } from '@/api/contentHooks';
import { useMySubjectsQuery } from '@/api/academyHooks';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersIcon, BookOpenIcon, CalendarIcon, ClockIcon, MegaphoneIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Button } from '@/components/ui/button';
import TeacherSidebar from '@/pages/teacher/TeacherSidebar';
import StatisticsCard from "@/components/shadcn-studio/blocks/statistics-card-01.tsx";
import { getFileUrl } from "@/api/http";
import { AttendanceModal } from './lecture/AttendanceModal';
import DashboardLayoutProvider from '../DashboardLayoutProvider';

const TeacherDashboardPage = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="Dashboard"
            sidebar={<TeacherSidebar />}
        >
            <TeacherDashboard />
        </DashboardLayoutProvider>
    )
}

function TeacherDashboard() {
    const { data: dashboardData, isLoading, isError } = useTeacherDashboardQuery();
    const { data: announcementsData, isLoading: isAnnouncementsLoading } = usePublicAnnouncementsQuery({ limit: 5 });
    const { data: subjectsData } = useMySubjectsQuery();
    const [activeIndex, setActiveIndex] = useState(0);

    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<{ id: string, subjectName: string, startDate: string } | null>(null);

    if (isLoading || isAnnouncementsLoading) {
        return (
            <div className="p-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-100 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-red-500">Something went wrong</h2>
                <p className="mt-2 text-slate-500 font-medium">We couldn't load your teacher dashboard data.</p>
            </div>
        );
    }

    const { students = [], lectures = [] } = dashboardData || {};
    const announcements = announcementsData?.data?.filter(a => a.status === 'active') || [];

    const nextSlide = () => {
        if (announcements.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % announcements.length);
    };

    const prevSlide = () => {
        if (announcements.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    };

    // Get recent lectures (e.g., within the last 7 days or upcoming)
    const recentLectures = [...lectures].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5);

    return (
        <div className="w-full flex flex-col gap-6">
            {announcements.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800">
                            <MegaphoneIcon className="size-5 text-primary" />
                            <h2 className="text-lg font-bold">Announcements</h2>
                        </div>
                        {announcements.length > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-full bg-white shadow-sm border-slate-200"
                                    onClick={prevSlide}
                                    aria-label="prev slide"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-full bg-white shadow-sm border-slate-200"
                                    onClick={nextSlide}
                                    aria-label="next slide"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="relative overflow-hidden group rounded-2xl border border-slate-100 bg-white">
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
                                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[12px] font-semibold px-2 py-0.5 w-fit">
                                                Important Update
                                            </Badge>
                                            <h3 className="text-xl md:text-2xl font-bold">
                                                {announcement.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
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
                                    <button
                                        key={i}
                                        className={`size-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-primary' : 'bg-slate-300'}`}
                                        onClick={() => setActiveIndex(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className='grid grid-cols-2 gap-6 lg:grid-cols-3'>
                {/* Statistics Cards Reusing Admin UI */}
                <StatisticsCard
                    icon={<UsersIcon className='size-4' />}
                    title='Total Students'
                    value={students.length.toString()}
                    changePercentage='0%'
                />
                <StatisticsCard
                    icon={<BookOpenIcon className='size-4' />}
                    title='Total Lectures'
                    value={lectures.length.toString()}
                    changePercentage='0%'
                />
                <Link to="/dashboard/teacher/subjects">
                    <StatisticsCard
                        icon={<CalendarIcon className='size-4' />}
                        title='Active Subjects'
                        value={subjectsData?.length?.toString() || "0"}
                        changePercentage='0%'
                    />
                </Link>
            </div>

            <div className="space-y-6">
                <Card className="shadow-none overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Lectures</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='text-muted-foreground h-14 first:pl-4'>Subject</TableHead>
                                        <TableHead className='text-muted-foreground h-14'>Course</TableHead>
                                        <TableHead className='text-muted-foreground h-14'>Date & Time</TableHead>
                                        <TableHead className='text-muted-foreground h-14 text-right pr-4'>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLectures.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                No lectures found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentLectures.map((lecture) => {
                                            const isPast = new Date(lecture.endDate) < new Date();
                                            const isLive = new Date(lecture.startDate) <= new Date() && new Date(lecture.endDate) >= new Date();

                                            return (
                                                <TableRow
                                                    key={lecture.id}
                                                    className="cursor-pointer hover:bg-slate-50/50"
                                                    onClick={() => {
                                                        setSelectedLecture({ id: lecture.id, subjectName: lecture.subjectName, startDate: lecture.startDate });
                                                        setIsAttendanceModalOpen(true);
                                                    }}
                                                >
                                                    <TableCell className="pl-4 py-4 text-card-foreground font-medium">
                                                        {lecture.subjectName}
                                                    </TableCell>
                                                    <TableCell>{lecture.courseName}</TableCell>
                                                    <TableCell>
                                                        <div className='flex flex-col text-sm'>
                                                            <span className='text-card-foreground font-medium'>
                                                                {isToday(new Date(lecture.startDate)) ? 'Today' :
                                                                    isYesterday(new Date(lecture.startDate)) ? 'Yesterday' :
                                                                        isTomorrow(new Date(lecture.startDate)) ? 'Tomorrow' :
                                                                            format(new Date(lecture.startDate), 'PPP')}
                                                            </span>
                                                            <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <ClockIcon className="h-3.5 w-3.5" />
                                                                <span>{format(new Date(lecture.startDate), 'p')} - {format(new Date(lecture.endDate), 'p')}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {isLive ? (
                                                            <Badge className="rounded-sm bg-red-50 text-red-600 border-none ring-1 ring-red-200/50">
                                                                Live
                                                            </Badge>
                                                        ) : isPast ? (
                                                            <Badge className="rounded-sm bg-primary/10 text-primary border-none">
                                                                Completed
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="rounded-sm bg-green-50 text-green-700 0 border-none ring-1 ring-green-600/10">
                                                                Upcoming
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {selectedLecture && (
                <AttendanceModal
                    isOpen={isAttendanceModalOpen}
                    onClose={() => {
                        setIsAttendanceModalOpen(false);
                        setSelectedLecture(null);
                    }}
                    lectureId={selectedLecture.id}
                    subjectName={selectedLecture.subjectName}
                    lectureStartDate={selectedLecture.startDate}
                />
            )}
        </div>
    );
}

export default TeacherDashboardPage;