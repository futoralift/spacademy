import React, { useState } from 'react';
import StudentSidebar from "@/pages/student/StudentSidebar.tsx";
import { useMyLecturesQuery, useMySubjectsQuery, useMyAttendanceHistoryQuery } from "@/api/academyHooks";
import { useMyTeachersQuery } from "@/api/userHooks";
import { format, isSameDay } from "date-fns";
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    UserIcon
} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayoutProvider from "../DashboardLayoutProvider";
import type { LectureResponse } from "@/api/types";

type StudentLectureCardProps = {
    lecture: LectureResponse;
    subjectName: string;
    instructorName: string;
    attendanceStatus?: string;
};

function StudentLectureCard({ lecture, subjectName, instructorName, attendanceStatus }: StudentLectureCardProps) {
    const attendanceTone = attendanceStatus === "present"
        ? "bg-emerald-50 text-emerald-600"
        : attendanceStatus === "late"
            ? "bg-amber-50 text-amber-600"
            : attendanceStatus === "absent"
                ? "bg-rose-50 text-rose-600"
                : "border-slate-200 text-slate-400";

    const attendanceIcon = attendanceStatus === "present"
        ? <CheckCircle2 className="size-3" />
        : attendanceStatus === "late"
            ? <Clock className="size-3" />
            : attendanceStatus === "absent"
                ? <XCircle className="size-3" />
                : null;

    return (
        <div className="group relative flex flex-col sm:flex-row gap-4 p-6 border bg-card transition-all duration-300 border-primary/5">
            <div className="flex items-start space-y-3 w-full justify-between gap-4">
                <div className="flex flex-col gap-5">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                        {subjectName}
                    </Badge>
                    <div className="flex flex-col gap-2">
                        {lecture.lectureTitle && (
                            <h2 className="text-2xl font-bold text-primary/95 leading-tight mb-1">
                                {lecture.lectureTitle}
                            </h2>
                        )}
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {format(new Date(lecture.startDate), "hh:mm a")} - {format(new Date(lecture.endDate), "hh:mm a")}
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full font-medium">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{Math.round((new Date(lecture.endDate).getTime() - new Date(lecture.startDate).getTime()) / 60000)} mins session</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full font-medium">
                            <UserIcon className="w-4 h-4 text-primary" />
                            <span>{instructorName}</span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0">
                    {attendanceStatus ? (
                        <div className={`${attendanceTone} capitalize flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full font-medium`}>
                            {attendanceIcon}
                            {attendanceStatus}
                        </div>
                        // <Badge className={`${attendanceTone} border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-xl flex items-center gap-1.5`}>
                        //     {attendanceIcon}
                        //     {attendanceStatus}
                        // </Badge>
                    ) : (
                        <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full font-medium">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Scheduled
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


const StudentLecturesPage: React.FC = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="My Timetable"
            sidebar={<StudentSidebar />}
            bodyTitle='Timetable'
            description="See your upcoming lectures"
            icon={<CalendarIcon className="w-5 h-5 text-primary" />}
        >
            <StudentLectures />
        </DashboardLayoutProvider>
    );
};

const StudentLectures: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const { data: lectures, isLoading: lecturesLoading } = useMyLecturesQuery();
    const { data: subjects, isLoading: subjectsLoading } = useMySubjectsQuery();
    const { data: attendanceHistory, isLoading: attendanceLoading } = useMyAttendanceHistoryQuery();
    const { data: teachers, isLoading: teachersLoading } = useMyTeachersQuery();

    const getSubjectInfo = (subjectId: string) => {
        return subjects?.find(s => s.id === subjectId);
    };

    const getTeacherName = (teacherId?: string | null) => {
        if (!teacherId) return "Instructor TBA";
        const teacher = teachers?.find((item) => item.id === teacherId);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Instructor TBA";
    };

    const filteredLectures = lectures?.filter(lecture =>
        isSameDay(new Date(lecture.startDate), selectedDate)
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const isLoading = lecturesLoading || subjectsLoading || attendanceLoading || teachersLoading;

    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-500 overflow-y-auto w-full p-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Calendar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                {format(selectedDate, "MMMM d, yyyy")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="w-full p-4"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sessions List */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="gap-0 p-0 rounded-2xl">
                        <CardHeader className="border-b bg-card p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-2">
                                    <CardTitle className="text-2xl font-black">Sessions</CardTitle>
                                    <CardDescription className="text-sm font-medium text-primary">
                                        {filteredLectures?.length || 0} scheduled for {format(selectedDate, "MMMM d")}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" aria-label="prev" onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" aria-label="next" onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-200">
                                {isLoading ? (
                                    <div className="p-6 space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
                                        ))}
                                    </div>
                                ) : filteredLectures && filteredLectures.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {filteredLectures.map((lecture) => {
                                            const subject = getSubjectInfo(lecture.subjectId);
                                            const attendance = attendanceHistory?.find(a => a.lectureId === lecture.id);
                                            const instructorName = getTeacherName(subject?.teacherId);

                                            return (
                                                <StudentLectureCard
                                                    key={lecture.id}
                                                    lecture={lecture}
                                                    subjectName={subject?.name || "Subject"}
                                                    instructorName={instructorName}
                                                    attendanceStatus={attendance?.status}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-100 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
                                        <div className="p-6 bg-muted rounded-full">
                                            <CalendarIcon className="w-12 h-12 text-muted-foreground/40" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">No lectures scheduled</h3>
                                            <p className="text-muted-foreground font-medium">Enjoy your day off or select another date.</p>
                                        </div>
                                        <Button variant="outline" onClick={() => setSelectedDate(new Date())} className="px-6 font-bold">
                                            View Today
                                        </Button>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentLecturesPage;
