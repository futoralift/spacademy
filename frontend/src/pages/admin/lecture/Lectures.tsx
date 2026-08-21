import { useState, useMemo, useEffect } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { useLecturesQuery, useSubjectsQuery, useDeleteLectureMutation, useCoursesQuery, useBatchCreateLecturesMutation } from "@/api/academyHooks.ts";
import { useTeachersQuery } from "@/api/userHooks.ts";
import {
    Clock,
    MoreVertical,
    Trash2,
    AlertCircle,
    Filter,
    Pencil,
    Calendar as CalendarIcon
} from "lucide-react";
import { getSubjectColorStyles } from "@/lib/utils.ts";
import EditLectureModal from "./EditLectureModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toast } from "sonner";
import {
    format,
    startOfDay,
    addHours,
    isSameDay,
    parseISO,
    differenceInMinutes,
    startOfHour,
    subDays,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
} from "date-fns";
import AddLectureForm from "@/pages/admin/lecture/AddLectureForm.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import DashboardLayoutProvider from '@/pages/DashboardLayoutProvider.tsx';
import type {LectureResponse, SubjectResponse} from "@/api";

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM

export default function AdminLecturesPage() {
    return (
        <DashboardLayoutProvider
            pageTitle="Lectures"
            sidebar={<AdminSidebar />}
            bodyTitle="Lectures"
            description='Manage academic lectures and schedule'
            icon={<CalendarIcon className="size-6" />}
        >
            <LecturesContent />
        </DashboardLayoutProvider>
    )
}

function LecturesContent() {
    const [view, setView] = useState<"day" | "week">("week");
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

    const { data: lecturesData, isLoading, isError, refetch } = useLecturesQuery({ limit: 100 });
    const { data: subjects } = useSubjectsQuery();
    const { data: courses } = useCoursesQuery();
    const { data: teachersData } = useTeachersQuery({ limit: 25 });
    const batchCreateMutation = useBatchCreateLecturesMutation();
    const [isCopying, setIsCopying] = useState(false);

    const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
    const weekEnd = useMemo(() => endOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
    const days = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

    const lectures = useMemo(() => {
        if (!lecturesData?.data) return [];

        let filtered = lecturesData.data;

        if (view === "day") {
            filtered = filtered.filter(lecture => isSameDay(parseISO(lecture.startDate), selectedDate));
        } else {
            filtered = filtered.filter(lecture => {
                const date = parseISO(lecture.startDate);
                return date >= weekStart && date <= weekEnd;
            });
        }

        if (selectedCourseId !== "all" && subjects) {
            filtered = filtered.filter(lecture => {
                const sub = subjects.find(s => s.id === lecture.subjectId);
                return sub?.courseId === selectedCourseId;
            });
        }

        return filtered;
    }, [lecturesData, selectedDate, selectedCourseId, subjects, view, weekStart, weekEnd]);

    const activeSubjects = useMemo(() => {
        if (!subjects || !lectures.length) return [];
        const uniqueIds = Array.from(new Set(lectures.map(l => l.subjectId)));
        return subjects.filter(s => uniqueIds.includes(s.id));
    }, [subjects, lectures]);

    const previousDayLectures = useMemo(() => {
        if (!lecturesData?.data) return [];
        const prevDate = subDays(selectedDate, 1);
        return lecturesData.data.filter(lecture =>
            isSameDay(parseISO(lecture.startDate), prevDate)
        );
    }, [lecturesData, selectedDate]);

    const handleCopySchedule = async () => {
        if (previousDayLectures.length === 0) return;

        setIsCopying(true);
        try {
            const newLectures = previousDayLectures.map(lecture => {
                const prevStart = parseISO(lecture.startDate);
                const prevEnd = parseISO(lecture.endDate);

                const newStart = new Date(selectedDate);
                newStart.setHours(prevStart.getHours(), prevStart.getMinutes(), 0, 0);

                const newEnd = new Date(selectedDate);
                newEnd.setHours(prevEnd.getHours(), prevEnd.getMinutes(), 0, 0);

                return {
                    subjectId: lecture.subjectId,
                    lectureTitle: lecture.lectureTitle,
                    startDate: newStart.toISOString(),
                    endDate: newEnd.toISOString(),
                };
            });

            await batchCreateMutation.mutateAsync({ lectures: newLectures });
            toast.success(`Successfully copied ${newLectures.length} sessions`);
        } catch (error) {
            toast.error("Failed to copy schedule");
            console.error(error);
        } finally {
            setIsCopying(false);
        }
    };

    const isToday = isSameDay(selectedDate, new Date());
    const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);

    useEffect(() => {
        if (!isToday) {
            setCurrentTimePosition(null);
            return;
        }

        const updatePosition = () => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            setCurrentTimePosition((minutes / 60) * 80);
        };

        updatePosition();
        const interval = setInterval(updatePosition, 60000);
        return () => clearInterval(interval);
    }, [isToday, selectedDate]);

    const getTeacherName = (teacherId: string | null) => {
        if (!teacherId || !teachersData?.data) return "No teacher assigned";
        const teacher = teachersData.data.find(t => t.id === teacherId);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher";
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Calendar and Quick Info */}
                <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-4">
                    <Card className="border p-0">
                        <CardHeader className="pt-4 border-b">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CalendarIcon className="size-5 text-primary" />
                                {format(selectedDate, "MMMM d, yyyy")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="w-full p-3"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border p-0">
                        <CardHeader className="pt-4 border-b">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Filter className="size-5 text-primary" />
                                Color Legend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-5">
                            {activeSubjects.length > 0 ? (
                                <div className="grid gap-4 px-3">
                                    {activeSubjects.map(subject => {
                                        const colors = getSubjectColorStyles(subject.id);
                                        return (
                                            <div key={subject.id} className="flex items-center group">
                                                <div
                                                    className="h-full w-1 shrink-0 transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: colors.borderLeftColor }}
                                                />
                                                <div style={{ backgroundColor: (colors.backgroundColor) }} className="pl-3 w-full p-2 flex flex-col min-w-0">
                                                    <span className="font-semibold wrap-break-word">{subject.name}</span>
                                                    <div className="flex items-center gap-1.5 ">
                                                        <span className="text-xs text-muted-foreground font-medium wrap-break-word">
                                                            {getTeacherName(subject.teacherId)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4 flex flex-col items-center gap-2">
                                    <AlertCircle className="size-5 text-muted-foreground" />
                                    <p className="text-[10px] text-muted-foreground font-semibold">
                                        No active sessions
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Schedule View */}
                <div className="lg:col-span-9 flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex min-h-100 items-center justify-center bg-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Spinner className="size-10" />
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-100 flex-col items-center justify-center gap-4 bg-card rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
                            <div className="bg-destructive/10 p-3 rounded-full text-destructive">
                                <AlertCircle className="size-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Failed to load schedule</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">There was an error fetching the lecture data.</p>
                            </div>
                            <Button variant="outline" onClick={() => refetch()} className="rounded-xl font-bold">Try Again</Button>
                        </div>
                    ) : (
                        <div className="rounded-3xl border-2 dark:border-slate-800 overflow-hidden">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-muted/50 dark:bg-slate-900">
                                <h2 className="text-xl font-medium">
                                    {view === "day" ? format(selectedDate, "MMMM d, yyyy") : `${format(weekStart, "MMMM d")} – ${format(weekEnd, "MMMM d")}`}
                                </h2>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex p-1 rounded-xl border dark:border-slate-800">
                                        <Button
                                            variant={view === "day" ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => setView("day")}
                                            className={cn(
                                                "transition-all",
                                                view === "day" ? "bg-primary text-white" : "text-muted-foreground"
                                            )}
                                        >
                                            Day
                                        </Button>
                                        <Button
                                            variant={view === "week" ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => setView("week")}
                                            className={cn(
                                                "transition-all",
                                                view === "week" ? "bg-primary text-white" : "text-muted-foreground"
                                            )}
                                        >
                                            Week
                                        </Button>
                                    </div>

                                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                        <SelectTrigger size="default" className="font-semibold dark:bg-slate-900">
                                            <Filter />
                                            <SelectValue placeholder="All Courses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Courses</SelectItem>
                                            {courses?.map(course => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <AddLectureForm defaultDate={selectedDate} />
                                </div>
                            </div>
                            {/* calendar view */}
                            <div className="relative flex flex-col min-w-200 lg:min-w-0">
                                <div className={cn(
                                    "grid border-b border-slate-300 dark:border-slate-800 bg-muted/30 dark:bg-slate-900",
                                    view === "day" ? "grid-cols-[100px_1fr]" : "grid-cols-[100px_repeat(7,1fr)]"
                                )}>
                                    <div className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 flex justify-center items-center">Time</div>

                                    {view === "day" ? (
                                        <div className="flex items-center justify-between px-6">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scheduled Sessions</div>
                                            {previousDayLectures.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCopySchedule}
                                                    disabled={isCopying}
                                                    className="text-primary hover:bg-primary/5"
                                                >
                                                    {isCopying ? <Spinner className="size-2.5" /> : <Clock className="size-2.5" />}
                                                    Copy Previous Day
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        days.map((day) => (
                                            <div key={day.toISOString()} className={cn(
                                                "p-3 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0 flex flex-col items-center justify-center gap-1",
                                                isSameDay(day, new Date()) && "bg-primary/5 dark:bg-primary/10"
                                            )}>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    isSameDay(day, new Date()) ? "text-primary" : "text-muted-foreground"
                                                )}>
                                                    {format(day, "EEE")}
                                                </span>
                                                <span className={cn(
                                                    "size-7 flex items-center justify-center rounded-full text-sm font-bold",
                                                    isSameDay(day, new Date()) && "bg-primary text-white"
                                                )}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className={cn(
                                    "relative min-h-480 bg-background grid",
                                    view === "day" ? "grid-cols-[100px_1fr]" : "grid-cols-[100px_repeat(7,1fr)]"
                                )}>
                                    <div className="border-r border-slate-300 dark:border-slate-800 bg-muted/30 dark:bg-slate-900">
                                        {HOURS.map((hour) => (
                                            <div key={hour} className="h-20 border-b border-slate-300 dark:border-slate-800 flex items-center justify-center pt-2">
                                                <span className="text-[11px] h-full font-bold text-muted-foreground">
                                                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {view === "day" ? (
                                        <div className="relative">
                                            {HOURS.map((hour) => (
                                                <div key={hour} className="h-20 border-b border-slate-300/50 dark:border-slate-800/50 relative">
                                                    <div className="absolute top-0 left-0 right-0 h-px bg-slate-100/30 dark:bg-slate-800/20" />
                                                </div>
                                            ))}

                                            {currentTimePosition !== null && (
                                                <div
                                                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                                    style={{ top: `${currentTimePosition}px` }}
                                                >
                                                    <div className="size-2 rounded-full bg-red-500 -ml-1 shadow-sm" />
                                                    <div className="h-px flex-1 bg-red-500/50" />
                                                </div>
                                            )}

                                            {lectures.map((lecture) => (
                                                <LectureCard
                                                    key={lecture.id}
                                                    lecture={lecture}
                                                    baseHour={0}
                                                    subjects={subjects || []}
                                                />
                                            ))}

                                            {lectures.length === 0 && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                                    {previousDayLectures.length > 0 ? (
                                                        <div className="flex flex-col items-center gap-4 p-8 bg-card backdrop-blur-sm rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in zoom-in-95 duration-500">
                                                            <div className="bg-primary/10 p-4 rounded-full text-primary ring-8 ring-primary/5">
                                                                <CalendarIcon className="size-10" />
                                                            </div>
                                                            <div className="text-center space-y-1">
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No sessions scheduled</h3>
                                                                <p className="text-sm text-muted-foreground font-medium max-w-60">
                                                                    Would you like to copy the schedule from {format(subDays(selectedDate, 1), "MMM do")}?
                                                                </p>
                                                            </div>
                                                            <Button
                                                                onClick={handleCopySchedule}
                                                                disabled={isCopying}
                                                                className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 group"
                                                            >
                                                                {isCopying ? <Spinner className="size-4 mr-2" /> : <Clock className="size-4 mr-2 group-hover:rotate-12" />}
                                                                Copy {previousDayLectures.length} Sessions
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                                            <Clock className="size-12 text-slate-300" />
                                                            <p className="text-sm font-bold text-muted-foreground">No lectures scheduled for this day</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        days.map((day) => {
                                            const dayLectures = lectures.filter(l => isSameDay(parseISO(l.startDate), day));
                                            return (
                                                <div key={day.toISOString()} className={cn(
                                                    "relative border-r border-slate-100 dark:border-slate-800 last:border-r-0 h-full bg-repeating-lines dark:bg-repeating-lines-dark",
                                                    isSameDay(day, new Date()) && "bg-primary/2 dark:bg-primary/5"
                                                )}>
                                                    {HOURS.map((hour) => (
                                                        <div key={hour} className="h-20 border-b border-slate-100/50 dark:border-slate-800/50" />
                                                    ))}

                                                    {isSameDay(day, new Date()) && currentTimePosition !== null && (
                                                        <div
                                                            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                                            style={{ top: `${currentTimePosition}px` }}
                                                        >
                                                            <div className="h-px flex-1 bg-red-500/50" />
                                                        </div>
                                                    )}

                                                    {dayLectures.map((lecture) => (
                                                        <LectureCard
                                                            key={lecture.id}
                                                            lecture={lecture}
                                                            baseHour={0}
                                                            subjects={subjects || []}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function LectureCard({ lecture, baseHour, subjects, }: { lecture: LectureResponse, baseHour: number, subjects: SubjectResponse[] }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const deleteMutation = useDeleteLectureMutation();

    const start = parseISO(lecture.startDate);
    const end = parseISO(lecture.endDate);
    const subject = subjects.find(s => s.id === lecture.subjectId);
    const colors = getSubjectColorStyles(lecture.subjectId);
    const startOffsetMinutes = differenceInMinutes(start, startOfHour(addHours(startOfDay(start), baseHour)));
    const durationMinutes = differenceInMinutes(end, start);
    const top = (startOffsetMinutes / 60) * 80;
    const height = (durationMinutes / 60) * 80;

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(lecture.id);
            toast.success("Lecture cancelled and removed");
        } catch {
            toast.error("Failed to delete lecture");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <div
                className="absolute left-1 right-2 rounded-br-lg rounded-tr-lg border-l-4 p-2 transition-all hover:translate-y-1 hover:z-10 group overflow-hidden border border-black/5 dark:border-white/10"
                style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: '40px',
                    backgroundColor: colors.backgroundColor,
                    borderLeftColor: colors.borderLeftColor,
                    color: colors.color
                }}
            >
                <div className="flex items-start justify-between gap-1 overflow-hidden">
                    <h4 className="font-semibold truncate leading-tight mb-1">
                        {lecture.lectureTitle || subject?.name || "Untitled"}
                    </h4>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button aria-label="vert-dots" variant="ghost" size="icon" className="h-5 w-5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1 -mr-1">
                                <MoreVertical className="size-3" style={{ color: colors.color }} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-fit" align="end">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 size-4" />
                                Cancel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <EditLectureModal
                lecture={lecture}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Lecture</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this session for {subject?.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
                            Keep Session
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
