import {useState, useMemo, type SubmitEventHandler} from "react";
import { Plus, Clock, User, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { format, setHours, setMinutes, isAfter, subDays, isSameDay, parseISO } from "date-fns";
import { useCreateLectureMutation, useSubjectsQuery, useCoursesQuery, useLecturesQuery } from "@/api/academyHooks.ts";
import { useTeachersQuery } from "@/api/userHooks.ts";
import { toast } from "sonner";
import {Field, FieldGroup} from "@/components/ui/field.tsx";

export default function AddLectureForm({ defaultDate }: { defaultDate: Date }) {
    const [open, setOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [subjectId, setSubjectId] = useState<string>("");
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("13:00");
    const [lectureTitle, setLectureTitle] = useState("");

    const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsQuery();
    const { data: courses, isLoading: isLoadingCourses } = useCoursesQuery();
    const { data: teachersData } = useTeachersQuery({ limit: 25 });
    const { data: lecturesData } = useLecturesQuery({ limit: 25 });
    const createMutation = useCreateLectureMutation();

    const yesterdayLectures = useMemo(() => {
        if (!lecturesData?.data) return [];
        const yesterday = subDays(defaultDate, 1);
        return lecturesData.data.filter(l => isSameDay(parseISO(l.startDate), yesterday));
    }, [lecturesData, defaultDate]);

    const loadTemplate = (lecture: any) => {
        const start = parseISO(lecture.startDate);
        const end = parseISO(lecture.endDate);
        const sub = subjects?.find(s => s.id === lecture.subjectId);
        
        if (sub) setSelectedCourseId(sub.courseId);
        setSubjectId(lecture.subjectId);
        setStartTime(format(start, "HH:mm"));
        setEndTime(format(end, "HH:mm"));
        setLectureTitle(lecture.lectureTitle || "");
    };

    const resetForm = () => {
        setSelectedCourseId("");
        setSubjectId("");
        setStartTime("12:00");
        setEndTime("13:00");
        setLectureTitle("");
    };

    const getTeacherName = (teacherId: string | null) => {
        if (!teacherId || !teachersData?.data) return "No teacher assigned";
        const teacher = teachersData.data.find(t => t.id === teacherId);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher";
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (!subjectId) {
            toast.error("Please select a subject");
            return;
        }

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startDate = setMinutes(setHours(new Date(defaultDate), startH), startM);
        const endDate = setMinutes(setHours(new Date(defaultDate), endH), endM);

        if (!isAfter(endDate, startDate)) {
            toast.error("End time must be after start time");
            return;
        }

        try {
            await createMutation.mutateAsync({
                subjectId,
                lectureTitle: lectureTitle || undefined,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });
            toast.success("New lecture session scheduled successfully");
            setOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error?.message || "Failed to schedule lecture");
        }
    };

    const filteredSubjects = subjects?.filter(s => s.courseId === selectedCourseId) || [];
    const selectedSubject = subjects?.find(s => s.id === subjectId);

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button size="lg">
                    <Plus className="size-4" />
                    New Lecture
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Schedule Lecture Session</DialogTitle>
                    <DialogDescription>
                        Create a daily or one-time teaching slot on {format(defaultDate, "MMM do")}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        {yesterdayLectures.length > 0 && (
                            <Field>
                                <Label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                    <Clock className="size-3" />
                                    Suggest from Yesterday
                                </Label>
                                <Select onValueChange={(val) => {
                                    const l = yesterdayLectures.find(y => y.id === val);
                                    if (l) loadTemplate(l);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Use a previous session as template..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-50">
                                        {yesterdayLectures.map(l => {
                                            const sub = subjects?.find(s => s.id === l.subjectId);
                                            return (
                                                <SelectItem key={l.id} value={l.id} className="text-xs">
                                                    <span className="font-semibold">{l.lectureTitle || sub?.name}</span>
                                                    <span className="text-muted-foreground ml-2">({format(parseISO(l.startDate), "hh:mm a")})</span>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                        <Field>
                            <Label htmlFor="lectureTitle">Lecture Title (Optional)</Label>
                            <Input
                                id="lectureTitle"
                                placeholder="e.g. Introduction to Organic Chemistry"
                                value={lectureTitle}
                                onChange={(e) => setLectureTitle(e.target.value)}
                                aria-label="Lecture Title"
                            />
                        </Field>
                        <Field>
                            <Label>Target Course</Label>
                            <Select 
                                value={selectedCourseId} 
                                onValueChange={(val) => {
                                    setSelectedCourseId(val);
                                    setSubjectId("");
                                }} 
                                disabled={isLoadingCourses}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Choose a course"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses?.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label>Subject & Teacher</Label>
                            <Select 
                                value={subjectId} 
                                onValueChange={setSubjectId} 
                                disabled={isLoadingSubjects || !selectedCourseId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!selectedCourseId ? "Select a course first" : "Choose a subject"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredSubjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id}>
                                            <div className="flex flex-col gap-0.5 items-start">
                                                <span className="font-medium text-sm">{subject.name}</span>
                                                <span className="text-[10px]">({getTeacherName(subject.teacherId)})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="start">Start Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <Input
                                        id="start"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="pl-10"
                                        aria-label="Start Time"
                                    />
                                </div>
                            </Field>
                            <Field>
                                <Label htmlFor="end">End Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <Input
                                        id="end"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="pl-10"
                                        aria-label="End Time"
                                    />
                                </div>
                            </Field>
                        </Field>

                        {selectedSubject && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                        <User className="size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold tracking-widest leading-3">Assigned Faculty</span>
                                        <span className="text-xs font-bold leading-3">{getTeacherName(selectedSubject.teacherId)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                        <Calendar className="size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold tracking-widest leading-3">Schedule Date</span>
                                        <span className="text-xs font-bold leading-3">{format(defaultDate, "EEEE, MMMM do")}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning Session...
                                </>
                            ) : (
                                "Schedule Session"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
