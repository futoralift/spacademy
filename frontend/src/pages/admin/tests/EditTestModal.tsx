"use client"

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
    useUpdateTestMutation,
    useSubjectsQuery,
} from "@/api/academyHooks"
import { useTeachersQuery } from "@/api/userHooks"
import type { TestResponse } from "@/api/types"

interface EditTestModalProps {
    test: TestResponse | null
    isOpen: boolean
    onClose: () => void
}

export default function EditTestModal({ test, isOpen, onClose }: EditTestModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [durationMin, setDurationMin] = useState('60')
    const [totalMarks, setTotalMarks] = useState('100')
    const [mode, setMode] = useState<'online' | 'offline'>('online')
    const [type, setType] = useState<'chapter_wise' | 'full_syllabus'>('chapter_wise')
    const [startTime, setStartTime] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [maxAttempts, setMaxAttempts] = useState('1')
    const [subjectId, setSubjectId] = useState('')
    const [teacherId, setTeacherId] = useState('')
    const [status, setStatus] = useState<"draft" | "published">("published")

    const { data: subjects = [] } = useSubjectsQuery()
    const { data: teachersData } = useTeachersQuery()
    const updateMutation = useUpdateTestMutation()

    const teachers = (teachersData as any)?.data || []
    
    useEffect(() => {
        if (test && isOpen) {
            setTitle(test.title)
            setDescription(test.description || '')
            setDurationMin(String(test.durationMin))
            setTotalMarks(String(test.totalMarks))
            setMode(test.mode)
            setType(test.type)
            setStartTime(format(parseISO(test.startTime), "yyyy-MM-dd'T'HH:mm"))
            setExpiresAt(format(parseISO(test.expiresAt), "yyyy-MM-dd'T'HH:mm"))
            setMaxAttempts(String(test.maxAttempts))
            setSubjectId(test.subjectId)
            setTeacherId(test.teacherId)
            setStatus(test.status)
        }
    }, [test, isOpen])

    const isLive = test ? (new Date() >= new Date(test.startTime) && new Date() <= new Date(test.expiresAt)) : false;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!test || !title.trim() || !subjectId || !teacherId) return

        try {
            await updateMutation.mutateAsync({
                id: test.id,
                title: title.trim(),
                description: description.trim(),
                durationMin: parseInt(durationMin),
                totalMarks: parseInt(totalMarks),
                mode,
                type,
                startTime: new Date(startTime).toISOString(),
                expiresAt: new Date(expiresAt).toISOString(),
                maxAttempts: parseInt(maxAttempts),
                subjectId,
                teacherId,
                status
            })
            toast.success('Test updated successfully')
            onClose()
        } catch {
            toast.error('Failed to update test')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Test / Exam</DialogTitle>
                    <DialogDescription>
                        {isLive ? (
                            <span className="text-destructive font-semibold">This test is currently LIVE and cannot be edited.</span>
                        ) : (
                            "Update the details for this evaluation."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        <fieldset disabled={isLive} className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
                            <Field className="sm:col-span-2">
                                <Label htmlFor="edit-test-title">Test Title</Label>
                                <Input
                                    id="edit-test-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={isLive}
                                />
                            </Field>

                            <Field className="sm:col-span-2">
                                <Label htmlFor="edit-test-description">Instructions / Description</Label>
                                <Textarea
                                    id="edit-test-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[80px]"
                                    disabled={isLive}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="edit-subject-select">Subject</Label>
                                <Select value={subjectId} onValueChange={setSubjectId} disabled={isLive}>
                                    <SelectTrigger id="edit-subject-select">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label htmlFor="edit-teacher-select">Teacher (Owner)</Label>
                                <Select value={teacherId} onValueChange={setTeacherId} disabled={isLive}>
                                    <SelectTrigger id="edit-teacher-select">
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label htmlFor="edit-test-mode">Mode</Label>
                                <Select value={mode} onValueChange={(v: any) => setMode(v)} disabled={isLive}>
                                    <SelectTrigger id="edit-test-mode">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label htmlFor="edit-test-type">Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)} disabled={isLive}>
                                    <SelectTrigger id="edit-test-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chapter_wise">Chapter Wise</SelectItem>
                                        <SelectItem value="full_syllabus">Full Syllabus</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label htmlFor="edit-duration">Duration (Minutes)</Label>
                                <Input
                                    id="edit-duration"
                                    type="number"
                                    min="5"
                                    value={durationMin}
                                    onChange={(e) => setDurationMin(e.target.value)}
                                    required
                                    disabled={isLive}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="edit-total-marks">Total Marks</Label>
                                <Input
                                    id="edit-total-marks"
                                    type="number"
                                    min="1"
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(e.target.value)}
                                    required
                                    disabled={isLive}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="edit-maxAttempts">Max Attempts</Label>
                                <Input
                                    id="edit-maxAttempts"
                                    type="number"
                                    min="1"
                                    value={maxAttempts}
                                    onChange={(e) => setMaxAttempts(e.target.value)}
                                    required
                                    disabled={isLive}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="edit-test-status">Status</Label>
                                <Select value={status} onValueChange={(v: any) => setStatus(v)} disabled={isLive}>
                                    <SelectTrigger id="edit-test-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <Label htmlFor="edit-start-time">Start Time</Label>
                                <Input
                                    id="edit-start-time"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    disabled={isLive}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="edit-expires-at">Expires At</Label>
                                <Input
                                    id="edit-expires-at"
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    required
                                    disabled={isLive}
                                />
                            </Field>
                        </fieldset>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={updateMutation.isPending || isLive}
                        >
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLive ? 'Locked' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
