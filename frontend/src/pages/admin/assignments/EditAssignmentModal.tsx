"use client"

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    useUpdateAssignmentMutation,
    useSubjectsQuery,
    useLecturesQuery,
} from "@/api/academyHooks"
import type { AssignmentResponse } from "@/api/types"

interface EditAssignmentModalProps {
    assignment: AssignmentResponse | null
    isOpen: boolean
    onClose: () => void
}

export default function EditAssignmentModal({ assignment, isOpen, onClose }: EditAssignmentModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [mark, setMark] = useState('10')
    const [lectureId, setLectureId] = useState<string>('none')
    const [subjectId, setSubjectId] = useState<string>('')

    const { data: subjects = [] } = useSubjectsQuery()
    const { data: lecturesData } = useLecturesQuery({ limit: 15 })
    const updateMutation = useUpdateAssignmentMutation()

    const lectures = lecturesData?.data || []

    useEffect(() => {
        if (assignment && isOpen) {
            setTitle(assignment.title)
            setDescription(assignment.description || '')
            setDeadline(format(parseISO(assignment.deadline), "yyyy-MM-dd'T'HH:mm"))
            setMark(String(assignment.mark || 10))
            setLectureId(assignment.lectureId || 'none')
            
            // Try to find the subjectId via lecture
            if (assignment.lectureId) {
                const lecture = lectures.find(l => l.id === assignment.lectureId)
                if (lecture) setSubjectId(lecture.subjectId)
            } else if ((assignment as any).subjectId) {
                setSubjectId((assignment as any).subjectId)
            }
        }
    }, [assignment, isOpen, lectures])

    // Update lecture list when subject changes if needed, 
    // or just allow selecting any lecture that belongs to the subject.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!assignment || !title.trim()) return

        try {
            await updateMutation.mutateAsync({
                id: assignment.id,
                title: title.trim(),
                description: description.trim(),
                deadline: new Date(deadline).toISOString(),
                mark: parseInt(mark),
                lectureId: lectureId === 'none' ? null : lectureId,
                // subjectId: subjectId, // if supported
            } as any)
            toast.success('Assignment updated successfully')
            onClose()
        } catch {
            toast.error('Failed to update assignment')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] text-left">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Edit Assignment</DialogTitle>
                    <DialogDescription>Update the task details or change the deadline/marks.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title" className="text-sm font-semibold">Title</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description" className="text-sm font-semibold">Description (Optional)</Label>
                        <Textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-deadline" className="text-sm font-semibold">Deadline</Label>
                            <Input
                                id="edit-deadline"
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-mark" className="text-sm font-semibold">Marks</Label>
                            <Input
                                id="edit-mark"
                                type="number"
                                value={mark}
                                onChange={(e) => setMark(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-subject" className="text-sm font-semibold">Subject</Label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger id="edit-subject" className="h-11">
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-lecture" className="text-sm font-semibold">Lecture (Optional)</Label>
                        <Select value={lectureId} onValueChange={setLectureId}>
                            <SelectTrigger id="edit-lecture" className="h-11">
                                <SelectValue placeholder="No specific lecture" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No specific lecture</SelectItem>
                                {lectures
                                    .filter(l => !subjectId || l.subjectId === subjectId)
                                    .map((l) => (
                                        <SelectItem key={l.id} value={l.id}>
                                            {l.lectureTitle || `Lecture on ${new Date(l.startDate).toLocaleDateString()}`}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" className="font-semibold">Cancel</Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={updateMutation.isPending}
                            className="px-8 font-bold"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
