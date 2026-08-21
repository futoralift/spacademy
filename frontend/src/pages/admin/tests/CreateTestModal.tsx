"use client"

import React, { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import {
    useCreateTestMutation,
    useSubjectsQuery,
} from "@/api/academyHooks"
import { useTeachersQuery } from "@/api/userHooks"

export default function CreateTestModal() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [durationMin, setDurationMin] = useState('60')
    const [totalMarks, setTotalMarks] = useState('100')
    const [mode, setMode] = useState<'online' | 'offline'>('online')
    const [type, setType] = useState<'chapter_wise' | 'full_syllabus'>('chapter_wise')
    const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    const [expiresAt, setExpiresAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    const [maxAttempts, setMaxAttempts] = useState('1')
    const [subjectId, setSubjectId] = useState('')
    const [teacherId, setTeacherId] = useState('')
    const [status, setStatus] = useState<"draft" | "published">("published")

    const { data: subjects = [] } = useSubjectsQuery()
    const { data: teachersData } = useTeachersQuery()
    const createMutation = useCreateTestMutation()

    const teachers = (teachersData as any)?.data || []

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setDurationMin('60')
        setTotalMarks('100')
        setMode('online')
        setType('chapter_wise')
        setStartTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
        setExpiresAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
        setMaxAttempts('1')
        setSubjectId('')
        setTeacherId('')
        setStatus("published")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !subjectId || !teacherId) {
            toast.error('Please fill in all required fields')
            return
        }

        const startTimeDate = new Date(startTime)
        const now = new Date()
        // Allow up to 2 minutes in the past for form time
        if (startTimeDate < new Date(now.getTime() - 2 * 60000)) {
            toast.error("Start time cannot be in the past")
            return
        }
        if (new Date(expiresAt) <= startTimeDate) {
            toast.error("Expiry must be after start time")
            return
        }

        try {
            await createMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                durationMin: parseInt(durationMin),
                totalMarks: parseInt(totalMarks),
                mode,
                type,
                startTime: new Date(startTime).toISOString(),
                expiresAt: new Date(expiresAt).toISOString(),
                createdAt: new Date().toISOString(),
                maxAttempts: parseInt(maxAttempts),
                subjectId,
                teacherId,
                status
            })
            toast.success('Test scheduled successfully')
            setOpen(false)
            resetForm()
        } catch {
            toast.error('Failed to create test')
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button><Plus className="size-4" /> Schedule Test / Exam</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Schedule Test / Exam</DialogTitle>
                    <DialogDescription>Create a new evaluation for your students.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                            <Label htmlFor="test-title">Title</Label>
                            <Input
                                id="test-title"
                                placeholder="e.g. Mathematics Chapter 1 Assessment"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Field>

                        <Field className="sm:col-span-2">
                            <Label htmlFor="test-description">Instructions (Optional)</Label>
                            <Textarea
                                id="test-description"
                                placeholder="Syllabus covered, allowed materials, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-20"
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="subject-select">Subject</Label>
                            <Select value={subjectId} onValueChange={setSubjectId}>
                                <SelectTrigger id="subject-select">
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="teacher-select">Teacher (Owner)</Label>
                            <Select value={teacherId} onValueChange={setTeacherId}>
                                <SelectTrigger id="teacher-select">
                                    <SelectValue placeholder="Select test owner..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="test-mode">Mode</Label>
                            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                                <SelectTrigger id="test-mode">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="test-type">Type</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger id="test-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chapter_wise">Chapter Wise</SelectItem>
                                    <SelectItem value="full_syllabus">Full Syllabus</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="duration">Duration (Minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="5"
                                value={durationMin}
                                onChange={(e) => setDurationMin(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="total-marks">Total Marks</Label>
                            <Input
                                id="total-marks"
                                type="number"
                                min="1"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="maxAttempts">Max Attempts</Label>
                            <Input
                                id="maxAttempts"
                                type="number"
                                min="1"
                                value={maxAttempts}
                                onChange={(e) => setMaxAttempts(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="test-status">Status</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                <SelectTrigger id="test-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="start-time">Start Date & Time</Label>
                            <Input
                                id="start-time"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="expires-at">Expires At</Label>
                            <Input
                                id="expires-at"
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                required
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
