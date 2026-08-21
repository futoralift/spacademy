"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { LoaderCircle, Calendar } from "lucide-react"
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
} from "@/components/ui/dialog"
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
import { useUpdateAssignmentMutation, useMySubjectsQuery, useMyLecturesQuery } from "@/api/academyHooks"
import type { AssignmentResponse } from "@/api/types"

interface EditAssignmentModalProps {
  assignment: AssignmentResponse | null
  isOpen: boolean
  onClose: () => void
}

export default function EditAssignmentModal({
  assignment,
  isOpen,
  onClose,
}: EditAssignmentModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [lectureId, setLectureId] = useState<string>("")
  const [deadline, setDeadline] = useState("")
  const [mark, setMark] = useState("")

  const { data: subjects } = useMySubjectsQuery()
  const { data: myLectures } = useMyLecturesQuery()
  const updateMutation = useUpdateAssignmentMutation()

  useEffect(() => {
    if (assignment && isOpen) {
      setTitle(assignment.title)
      setDescription(assignment.description || "")
      setLectureId(assignment.lectureId || "none")
      // Assuming 'deadline' is ISO format from API
      setDeadline(format(parseISO(assignment.deadline), "yyyy-MM-dd'T'HH:mm"))
      setMark(assignment.mark?.toString() || "")
    }
  }, [assignment, isOpen])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!assignment) return

    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    const deadlineDate = new Date(deadline)

    try {
      await updateMutation.mutateAsync({
        id: assignment.id,
        title: title.trim(),
        description: description.trim() || undefined,
        lectureId: lectureId && lectureId !== "none" ? lectureId : undefined,
        deadline: deadlineDate.toISOString(),
        mark: mark ? parseInt(mark) : undefined,
      })
      toast.success("Assignment updated successfully")
      onClose()
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Failed to update assignment"
      toast.error(message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Modify details for this assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <Label htmlFor="edit-title">Assignment Title</Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="e.g. Weekly Lab Research"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Field>

            <Field className="sm:col-span-2">
              <Label htmlFor="edit-description">Instructions (Optional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Provide details about the assignment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
              />
            </Field>

            <Field>
              <Label htmlFor="edit-mark">Max Marks</Label>
              <Input
                id="edit-mark"
                name="mark"
                type="number"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                name="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </Field>

            <Field className="sm:col-span-2">
              <Label htmlFor="edit-lectureId">Link to Lecture (Optional)</Label>
              <Select 
                value={lectureId || "none"} 
                onValueChange={setLectureId}
              >
                <SelectTrigger id="edit-lectureId">
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
