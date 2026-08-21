"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
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
} from "@/components/ui/dialog.tsx"
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
import { useMySubjectsQuery, useUpdateTestMutation } from "@/api/academyHooks"
import type { TestResponse } from "@/api/types"

interface EditTestModalProps {
    test: TestResponse | null
    isOpen: boolean
    onClose: () => void
}

export default function EditTestModal({ test, isOpen, onClose }: EditTestModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [mode, setMode] = useState<"offline" | "online">("offline")
    const [type, setType] = useState<"chapter_wise" | "full_syllabus">("chapter_wise")
    const [startTime, setStartTime] = useState("")
    const [expiresAt, setExpiresAt] = useState("")
    const [durationMin, setDurationMin] = useState("60")
    const [totalMarks, setTotalMarks] = useState("100")
    const [maxAttempts, setMaxAttempts] = useState("1")
    const [status, setStatus] = useState<"draft" | "published">("published")

    const { data: subjects } = useMySubjectsQuery()
    const updateMutation = useUpdateTestMutation()

    useEffect(() => {
        if (test && isOpen) {
            setTitle(test.title)
            setDescription(test.description || "")
            setSubjectId(test.subjectId)
            setMode(test.mode)
            setType(test.type)
            setStartTime(format(parseISO(test.startTime), "yyyy-MM-dd'T'HH:mm"))
            setExpiresAt(format(parseISO(test.expiresAt), "yyyy-MM-dd'T'HH:mm"))
            setDurationMin(test.durationMin.toString())
            setTotalMarks(test.totalMarks.toString())
            setMaxAttempts(test.maxAttempts.toString())
            setStatus(test.status)
        }
    }, [test, isOpen])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!test) return
        if (!title.trim()) { toast.error("Please enter a title"); return }

        try {
            await updateMutation.mutateAsync({
                id: test.id,
                title: title.trim(),
                description: description.trim(),
                subjectId,
                mode,
                type,
                startTime: new Date(startTime).toISOString(),
                expiresAt: new Date(expiresAt).toISOString(),
                durationMin: parseInt(durationMin),
                totalMarks: parseInt(totalMarks),
                maxAttempts: parseInt(maxAttempts),
                teacherId: test.teacherId,
                status,
            })
            toast.success("Test updated successfully")
            onClose()
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || "Failed to update test")
        }
    }

    const isLive = test ? (new Date() >= new Date(test.startTime) && new Date() <= new Date(test.expiresAt)) : false;

    return (
        <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose() }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Test / Exam</DialogTitle>
                    <DialogDescription>
                        {isLive ? <span className="text-destructive font-semibold">This test is currently LIVE and cannot be edited.</span> : "Update the details for this evaluation."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <FieldGroup className="grid gap-4 sm:grid-cols-2 opacity-100">
                        <fieldset disabled={isLive} className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
                        <Field className="sm:col-span-2">
                            <Label htmlFor="edit-test-title">Title</Label>
                            <Input id="edit-test-title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isLive} />
                        </Field>

                        <Field className="sm:col-span-2">
                            <Label htmlFor="edit-test-desc">Instructions (Optional)</Label>
                            <Textarea id="edit-test-desc" value={description} onChange={e => setDescription(e.target.value)} className="min-h-20" disabled={isLive} />
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-subject">Subject</Label>
                            <Select value={subjectId} onValueChange={setSubjectId} disabled={isLive}>
                                <SelectTrigger id="edit-test-subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-type">Type</Label>
                            <Select value={type} onValueChange={v => setType(v as any)} disabled={isLive}>
                                <SelectTrigger id="edit-test-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chapter_wise">Chapter Wise</SelectItem>
                                    <SelectItem value="full_syllabus">Full Syllabus</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-mode">Mode</Label>
                            <Select value={mode} onValueChange={v => setMode(v as any)} disabled={isLive}>
                                <SelectTrigger id="edit-test-mode"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offline">Offline</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-maxAttempts">Max Attempts</Label>
                            <Input id="edit-test-maxAttempts" type="number" min="1" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} required disabled={isLive} />
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-startTime">Start Date & Time</Label>
                            <Input id="edit-test-startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required disabled={isLive} />
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-expiresAt">Expires At</Label>
                            <Input id="edit-test-expiresAt" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required disabled={isLive} />
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-duration">Duration (minutes)</Label>
                            <Input id="edit-test-duration" type="number" min="5" value={durationMin} onChange={e => setDurationMin(e.target.value)} required disabled={isLive} />
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-totalMarks">Total Marks</Label>
                            <Input id="edit-test-totalMarks" type="number" min="1" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} required disabled={isLive} />
                        </Field>

                        <Field>
                            <Label htmlFor="edit-test-status">Status</Label>
                            <Select value={status} onValueChange={v => setStatus(v as any)} disabled={isLive}>
                                <SelectTrigger id="edit-test-status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        </fieldset>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={updateMutation.isPending || isLive}>
                            {updateMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            {isLive ? "Locked" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
