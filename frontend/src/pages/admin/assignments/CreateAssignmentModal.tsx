"use client"

import React, { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  useCreateAssignmentMutation,
  useLecturesQuery,
  useSubjectsQuery,
} from "@/api/academyHooks"

export default function CreateAssignmentModal() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const [mark, setMark] = useState('10')
  const [lectureId, setLectureId] = useState<string>('none')
  const [subjectId, setSubjectId] = useState<string>('')

  const { data: lecturesData } = useLecturesQuery({ limit: 15 })
  const { data: subjects = [] } = useSubjectsQuery()
  const createMutation = useCreateAssignmentMutation()

  const lectures = lecturesData?.data || []

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDeadline(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    setMark('10')
    setLectureId('none')
    setSubjectId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline).toISOString(),
        mark: parseInt(mark),
        lectureId: lectureId === 'none' ? null : lectureId,
        // If subjectId is supported by backend for assignments, it could be sent here
        // as (a as any).subjectId = subjectId;
      })
      toast.success('Assignment created successfully')
      setOpen(false)
      resetForm()
    } catch {
      toast.error('Failed to create assignment')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-2 px-4 shadow-sm">
          <Plus className="size-4" />
          <span>New Assignment</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Create Assignment</DialogTitle>
          <DialogDescription>
            Assign a new task to students by linking it to a subject or specific lecture.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Weekly Math Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Detailed instructions for students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-semibold">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mark" className="text-sm font-semibold">Marks</Label>
              <Input
                id="mark"
                type="number"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold">Link to Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject" className="h-11">
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
            <Label htmlFor="lecture" className="text-sm font-semibold">Link to Lecture (Optional)</Label>
            <Select value={lectureId} onValueChange={setLectureId}>
              <SelectTrigger id="lecture" className="h-11">
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
              disabled={createMutation.isPending}
              className="px-8 font-bold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
