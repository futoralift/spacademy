"use client"

import { useState } from "react"
import { Plus, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { useCoursesQuery, useSubjectsQuery, useUpdateSubjectMutation } from "@/api/academyHooks"
import { queryClient } from "@/api/queryClient"
import { queryKeys } from "@/api/queryKeys"

interface AssignSubjectModalProps {
  teacherId: string
  alreadyTeachingIds: string[]
}

export default function AssignSubjectModal({ teacherId, alreadyTeachingIds }: AssignSubjectModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

  const { data: courses, isLoading: coursesLoading } = useCoursesQuery()
  const { data: subjects, isLoading: subjectsLoading } = useSubjectsQuery()
  const updateSubjectMutation = useUpdateSubjectMutation()

  // Filter subjects for the selected course
  const courseSubjects = subjects?.filter((s) => s.courseId === selectedCourseId) || []

  const handleAssign = async () => {
    if (!selectedSubjectId) {
      toast.error("Please select a subject to assign.")
      return
    }

    const subjectToUpdate = subjects?.find((s) => s.id === selectedSubjectId)
    if (!subjectToUpdate) return

    try {
      await updateSubjectMutation.mutateAsync({
        ...subjectToUpdate,
        teacherId: teacherId, // Updates the teacher assignment
      })
      toast.success("Subject assigned successfully.")

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all })
      await queryClient.invalidateQueries({ queryKey: ["subjects"] }) // Invalidate subjects specifically if defined elsewhere

      setOpen(false)
      // Reset state for next open
      setSelectedCourseId("")
      setSelectedSubjectId("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign subject."
      toast.error(message)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Clear data when closing
      setSelectedCourseId("")
      setSelectedSubjectId("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="h-7 text-xs px-2 gap-1 rounded-full">
          <Plus className="size-3" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Subject</DialogTitle>
          <DialogDescription>
            Select a course, then select an available subject to assign to this teacher.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Field>
            <FieldLabel>Course</FieldLabel>
            <Select
              value={selectedCourseId}
              onValueChange={(val) => {
                setSelectedCourseId(val)
                setSelectedSubjectId("") // Reset subject when course changes
              }}
              disabled={coursesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {coursesLoading ? (
                  <div className="flex justify-center p-2"><LoaderCircle className="size-4 animate-spin text-muted-foreground" /></div>
                ) : courses?.length ? (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No courses found</div>
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Subject</FieldLabel>
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={!selectedCourseId || subjectsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedCourseId
                    ? "Select a course first"
                    : subjectsLoading
                      ? "Loading subjects..."
                      : courseSubjects.length === 0
                        ? "No subjects assigned to this course"
                        : "Select a subject"
                } />
              </SelectTrigger>
              <SelectContent>
                {subjectsLoading ? (
                  <div className="flex justify-center p-2"><LoaderCircle className="size-4 animate-spin text-muted-foreground" /></div>
                ) : courseSubjects.length ? (
                  courseSubjects.map((subject) => {
                    const isAlreadyAssigned = alreadyTeachingIds.includes(subject.id)
                    return (
                      <SelectItem
                        key={subject.id}
                        value={subject.id}
                        disabled={isAlreadyAssigned}
                      >
                        {subject.name} {isAlreadyAssigned && <span className="text-muted-foreground ml-1">(Already assigned)</span>}
                      </SelectItem>
                    )
                  })
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {selectedCourseId ? "No subjects assigned to this course" : "Select a course to view subjects"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={updateSubjectMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedCourseId || !selectedSubjectId || updateSubjectMutation.isPending}
          >
            {updateSubjectMutation.isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
