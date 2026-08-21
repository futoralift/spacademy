"use client"

import * as React from "react"
import { useState } from "react"
import { LoaderCircle, Calendar } from "lucide-react"
import { format, isAfter, parseISO } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { useCreateAssignmentMutation, useMySubjectsQuery, useMyLecturesQuery } from "@/api/academyHooks"
import { Plus } from "lucide-react"

export default function CreateAssignmentModal() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [lectureId, setLectureId] = useState<string>("")
    const [deadline, setDeadline] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    const [mark, setMark] = useState("20")

    const { data: subjects } = useMySubjectsQuery()
    const { data: myLectures } = useMyLecturesQuery()
    const createMutation = useCreateAssignmentMutation()

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setLectureId("")
        setDeadline(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
        setMark("100")
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            resetForm()
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!title.trim()) {
            toast.error("Please enter a title")
            return
        }

        const deadlineDate = new Date(deadline)
        if (!isAfter(deadlineDate, new Date())) {
            toast.error("Deadline must be in the future")
            return
        }

        try {
            await createMutation.mutateAsync({
                title: title.trim(),
                description: description.trim() || undefined,
                lectureId: lectureId && lectureId !== "none" ? lectureId : undefined,
                deadline: deadlineDate.toISOString(),
                mark: mark ? parseInt(mark) : undefined,
            })
            toast.success("Assignment created successfully")
            setOpen(false)
            resetForm()
        } catch (error: any) {
            const message = error?.data?.message || error?.message || "Failed to create assignment"
            toast.error(message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button><Plus/>Add Assignment</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>New Assignment</DialogTitle>
                    <DialogDescription>
                        Publish work for your students to complete.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                            <Label htmlFor="title">Assignment Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Weekly Lab Research"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                aria-label="title"
                            />
                        </Field>

                        <Field className="sm:col-span-2">
                            <Label htmlFor="description">Instructions (Optional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Provide details about the assignment..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-24"
                                aria-label="description"
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="mark">Max Marks</Label>
                            <Input
                                id="mark"
                                name="mark"
                                type="number"
                                value={mark}
                                onChange={(e) => setMark(e.target.value)}
                                required
                                aria-label="mark"
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input
                                id="deadline"
                                name="deadline"
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                                aria-label="deadline"
                            />
                        </Field>

                        <Field className="sm:col-span-2">
                            <Label htmlFor="lectureId">Link to Lecture (Optional)</Label>
                            <Select
                                value={lectureId || "none"}
                                onValueChange={setLectureId}
                            >
                                <SelectTrigger id="lectureId">
                                    <SelectValue placeholder="Select a session" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Specific Lecture</SelectItem>
                                    {myLectures?.map((lecture) => {
                                        const subject = subjects?.find(s => s.id === lecture.subjectId)
                                        return (
                                            <SelectItem key={lecture.id} value={lecture.id}>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-sm">{lecture.lectureTitle || subject?.name}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                                        <Calendar className="size-2.5" />
                                                        {format(parseISO(lecture.startDate), "MMM do, p")}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Post Assignment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
