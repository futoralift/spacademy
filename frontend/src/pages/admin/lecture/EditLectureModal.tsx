import { useState, useEffect } from "react";
import { Clock, User, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { useSubjectsQuery, useCoursesQuery, useUpdateLectureMutation } from "@/api/academyHooks.ts";
import { useTeachersQuery } from "@/api/userHooks.ts";
import { toast } from "sonner";
import { format, setHours, setMinutes, isAfter, parseISO } from "date-fns";
import type { LectureResponse } from "@/api/types";
import {Field, FieldGroup} from "@/components/ui/field.tsx";

interface EditLectureModalProps {
    lecture: LectureResponse;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditLectureModal({ lecture, isOpen, onClose }: EditLectureModalProps) {
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [subjectId, setSubjectId] = useState<string>("");
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("13:00");
    const [lectureTitle, setLectureTitle] = useState("");

    const { data: subjects, isLoading: isLoadingSubjects } = useSubjectsQuery();
    const { data: courses, isLoading: isLoadingCourses } = useCoursesQuery();
    const { data: teachersData } = useTeachersQuery({ limit: 25 });
    const updateMutation = useUpdateLectureMutation();

    useEffect(() => {
        if (lecture && subjects) {
            const start = parseISO(lecture.startDate);
            const end = parseISO(lecture.endDate);
            const sub = subjects.find(s => s.id === lecture.subjectId);
            
            if (sub) setSelectedCourseId(sub.courseId);
            setSubjectId(lecture.subjectId);
            setStartTime(format(start, "HH:mm"));
            setEndTime(format(end, "HH:mm"));
            setLectureTitle(lecture.lectureTitle || "");
        }
    }, [lecture, subjects, isOpen]);

    const getTeacherName = (teacherId: string | null) => {
        if (!teacherId || !teachersData?.data) return "No teacher assigned";
        const teacher = teachersData.data.find(t => t.id === teacherId);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subjectId) {
            toast.error("Please select a subject");
            return;
        }

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const currentStart = parseISO(lecture.startDate);
        const startDate = setMinutes(setHours(new Date(currentStart), startH), startM);
        const endDate = setMinutes(setHours(new Date(currentStart), endH), endM);

        if (!isAfter(endDate, startDate)) {
            toast.error("End time must be after start time");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: lecture.id,
                subjectId,
                lectureTitle: lectureTitle || undefined,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });
            toast.success("Lecture session updated successfully");
            onClose();
        } catch (error: any) {
            toast.error(error?.message || "Failed to update lecture");
        }
    };

    const filteredSubjects = subjects?.filter(s => s.courseId === selectedCourseId) || [];
    const selectedSubject = subjects?.find(s => s.id === subjectId);

    return (
        <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Pencil className="size-5 text-primary" />
                        Edit Lecture Session
                    </DialogTitle>
                    <DialogDescription>
                        Modify the timing or subject for this lecture.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="edit-lectureTitle">Lecture Title (Optional)</Label>
                            <Input
                                id="edit-lectureTitle"
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
                                    <SelectValue placeholder={isLoadingCourses ? "Loading..." : "Choose a course"} />
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
                                                <span className="font-medium text-sm tracking-tight">{subject.name}</span>
                                                <span className="text-[10px] text-muted-foreground">({getTeacherName(subject.teacherId)})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <FieldGroup className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="edit-start">Start Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" />
                                    <Input
                                        id="edit-start"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="pl-10"
                                        aria-label="Start Time"
                                    />
                                </div>
                            </Field>
                            <Field>
                                <Label htmlFor="edit-end">End Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" />
                                    <Input
                                        id="edit-end"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="pl-10"
                                        aria-label="End Time"
                                    />
                                </div>
                            </Field>
                        </FieldGroup>

                        {selectedSubject && (
                            <div className="rounded-lg p-4 border bg-card flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-primary">
                                        <User className="size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-muted-foreground">Assigned Faculty</span>
                                        <span className="font-semibold leading-3">{getTeacherName(selectedSubject.teacherId)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}

                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Session"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
