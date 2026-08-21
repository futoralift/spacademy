"use client"

import * as React from "react"
import { useState } from "react"
import { LoaderCircle, Plus } from "lucide-react"
import { format } from "date-fns"
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
import { useMySubjectsQuery, useCreateTestMutation } from "@/api/academyHooks"
import { useCurrentUserQuery } from "@/api/authHooks"
import type { TestRequest } from "@/api/types"

export default function CreateTestModal() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [mode, setMode] = useState<"offline" | "online">("offline")
    const [type, setType] = useState<"chapter_wise" | "full_syllabus">("chapter_wise")
    const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    const [expiresAt, setExpiresAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    const [durationMin, setDurationMin] = useState("60")
    const [totalMarks, setTotalMarks] = useState("100")
    const [maxAttempts, setMaxAttempts] = useState("1")
    const [status, setStatus] = useState<"draft" | "published">("published")

    const { data: subjects } = useMySubjectsQuery()
    const { data: me } = useCurrentUserQuery()
    const createMutation = useCreateTestMutation()

    const resetForm = () => {
        setTitle(""); setDescription(""); setSubjectId(""); setMode("offline")
        setType("chapter_wise")
        setStartTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
        setExpiresAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
        setDurationMin("60"); setTotalMarks("100"); setMaxAttempts("1")
        setStatus("published")
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!title.trim()) { toast.error("Please enter a title"); return }
        if (!subjectId) { toast.error("Please select a subject"); return }
        const startTimeDate = new Date(startTime)
        const now = new Date()
        // Allow up to 2 minutes in the past to account for time spent in the form
        if (startTimeDate < new Date(now.getTime() - 2 * 60000)) {
            toast.error("Start time cannot be in the past"); return
        }
        if (new Date(expiresAt) <= startTimeDate) {
            toast.error("Expiry must be after start time"); return
        }

        const payload: TestRequest = {
            title: title.trim(),
            description: description.trim(),
            subjectId,
            mode,
            type,
            startTime: new Date(startTime).toISOString(),
            expiresAt: new Date(expiresAt).toISOString(),
            createdAt: new Date().toISOString(),
            durationMin: parseInt(durationMin),
            totalMarks: parseInt(totalMarks),
            maxAttempts: parseInt(maxAttempts),
            teacherId: me?.id ?? "",
            status,
        }

        try {
            await createMutation.mutateAsync(payload)
            toast.success("Test scheduled successfully")
            setOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || "Failed to create test")
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                            <Input id="test-title" placeholder="e.g. Unit 3 Chapter Test" value={title} onChange={e => setTitle(e.target.value)} required />
                        </Field>

                        <Field className="sm:col-span-2">
                            <Label htmlFor="test-description">Instructions (Optional)</Label>
                            <Textarea id="test-description" placeholder="Syllabus covered, allowed materials, etc." value={description} onChange={e => setDescription(e.target.value)} className="min-h-20" />
                        </Field>

                        <Field>
                            <Label htmlFor="test-subject">Subject</Label>
                            <Select value={subjectId} onValueChange={setSubjectId}>
                                <SelectTrigger id="test-subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="test-type">Type</Label>
                            <Select value={type} onValueChange={v => setType(v as any)}>
                                <SelectTrigger id="test-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chapter_wise">Chapter Wise</SelectItem>
                                    <SelectItem value="full_syllabus">Full Syllabus</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="test-mode">Mode</Label>
                            <Select value={mode} onValueChange={v => setMode(v as any)}>
                                <SelectTrigger id="test-mode"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offline">Offline</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <Label htmlFor="test-maxAttempts">Max Attempts</Label>
                            <Input id="test-maxAttempts" type="number" min="1" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} required />
                        </Field>

                        <Field>
                            <Label htmlFor="test-startTime">Start Date & Time</Label>
                            <Input id="test-startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </Field>

                        <Field>
                            <Label htmlFor="test-expiresAt">Expires At</Label>
                            <Input id="test-expiresAt" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />
                        </Field>

                        <Field>
                            <Label htmlFor="test-duration">Duration (minutes)</Label>
                            <Input id="test-duration" type="number" min="5" value={durationMin} onChange={e => setDurationMin(e.target.value)} required />
                        </Field>

                        <Field>
                            <Label htmlFor="test-totalMarks">Total Marks</Label>
                            <Input id="test-totalMarks" type="number" min="1" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} required />
                        </Field>

                        <Field>
                            <Label htmlFor="test-status">Status</Label>
                            <Select value={status} onValueChange={v => setStatus(v as any)}>
                                <SelectTrigger id="test-status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
