import { useState, useMemo } from "react"
import TeacherSidebar from "@/pages/teacher/TeacherSidebar"
import {
    useAssignmentsQuery,
    useMySubjectsQuery,
    useMyLecturesQuery,
    useDeleteAssignmentMutation,
    useCoursesQuery,
} from "@/api/academyHooks"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner.tsx"
import { Library } from "lucide-react"
import { toast } from "sonner"
import CreateAssignmentModal from "./CreateAssignmentModal"
import EditAssignmentModal from "./EditAssignmentModal"
import { AssignmentSubmissionsModal } from "./AssignmentSubmissionsModal"
import type { AssignmentResponse } from "@/api/types"
import type { FilterFn } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table.tsx"
import { buildColumns, type AssignmentRow } from "./columns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider.tsx";

export default function TeacherAssignmentsPage() {
    return (
        <DashboardLayoutProvider
            pageTitle="Assignments"
            sidebar={<TeacherSidebar />}
            bodyTitle="Assignments"
            description="Manage and create assignments for your subjects"
            icon={<Library />}
            bodyToolbar={<CreateAssignmentModal />}
        >
            <TeacherAssignments />
        </DashboardLayoutProvider>
    )
}

const assignmentFilterFn: FilterFn<AssignmentRow> = (row, _columnId, filterValue) => {
    const search = String(filterValue).trim().toLowerCase()
    if (!search) return true
    return [
        row.original.title,
        row.original.description,
        row.original.subjectName,
        row.original.courseName,
    ].some((v) => String(v ?? "").toLowerCase().includes(search))
}

function TeacherAssignments() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [editingAssignment, setEditingAssignment] = useState<AssignmentResponse | null>(null)
    const [verifyingAssignment, setVerifyingAssignment] = useState<AssignmentResponse | null>(null)
    const [selectedCourseId, setSelectedCourseId] = useState<string>("all")
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")

    const { data: assignmentsData, isLoading, isError, error } = useAssignmentsQuery()
    const { data: subjects } = useMySubjectsQuery()
    const { data: allLectures } = useMyLecturesQuery()
    const { data: courses } = useCoursesQuery()
    const deleteMutation = useDeleteAssignmentMutation()

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success("Assignment deleted successfully")
        } catch {
            toast.error("Failed to delete assignment")
        }
    }

    // Build enriched rows with course/subject names for filtering + display
    const allRows: AssignmentRow[] = useMemo(() => {
        return (assignmentsData?.data || []).map((a) => {
            const lecture = allLectures?.find(l => l.id === a.lectureId)
            const subject = subjects?.find(s => s.id === lecture?.subjectId)
            const course = courses?.find(c => c.id === subject?.courseId)
            return {
                ...a,
                subjectName: subject?.name ?? "",
                courseName: course?.name ?? "",
                lectureLabel: lecture
                    ? `LEC: ${new Date(lecture.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                    : null,
                // attach ids for filtering
                _subjectId: subject?.id ?? "",
                _courseId: course?.id ?? "",
            } as AssignmentRow & { _subjectId: string; _courseId: string }
        })
    }, [assignmentsData, allLectures, subjects, courses])

    // Filtered subjects based on selected course
    const filteredSubjects = useMemo(() => {
        if (!subjects) return []
        if (selectedCourseId === "all") return subjects
        const course = courses?.find(c => c.id === selectedCourseId)
        return subjects.filter(s => s.courseId === course?.id)
    }, [subjects, courses, selectedCourseId])

    // Apply course + subject filter
    const filteredRows = useMemo(() => {
        return allRows.filter(row => {
            const r = row as AssignmentRow & { _subjectId: string; _courseId: string }
            if (selectedCourseId !== "all" && r._courseId !== selectedCourseId) return false
            return !(selectedSubjectId !== "all" && r._subjectId !== selectedSubjectId);

        })
    }, [allRows, selectedCourseId, selectedSubjectId])

    // Paginate
    const totalRecords = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
    const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

    const columns = useMemo(() => buildColumns(setEditingAssignment, handleDelete, setVerifyingAssignment), [])

    return (
        <div className="w-full">
            {isLoading && (
                <div className="flex min-h-40 items-center justify-center">
                    <Spinner />
                </div>
            )}
            {isError && (
                <div className="flex min-h-40 items-center justify-center text-sm text-destructive">
                    {(error as any)?.message ?? "Failed to load assignments"}
                </div>
            )}
            {!isLoading && !isError && (
                <DataTable
                    columns={columns}
                    data={paginatedRows}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onPageSizeChange={(next) => { setPageSize(next); setPage(1) }}
                    searchPlaceholder="Search by title, subject, or course..."
                    globalFilterFn={assignmentFilterFn}
                    toolbarContent={
                        <>
                            <Select
                                value={selectedCourseId}
                                onValueChange={(v) => {
                                    setSelectedCourseId(v)
                                    setSelectedSubjectId("all")
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="All Courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses?.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedSubjectId}
                                onValueChange={(v) => { setSelectedSubjectId(v); setPage(1) }}
                                disabled={filteredSubjects.length === 0}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {filteredSubjects.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(selectedCourseId !== "all" || selectedSubjectId !== "all") && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground"
                                    onClick={() => { setSelectedCourseId("all"); setSelectedSubjectId("all"); setPage(1) }}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </>
                    }
                />
            )}

            <EditAssignmentModal
                assignment={editingAssignment}
                isOpen={!!editingAssignment}
                onClose={() => setEditingAssignment(null)}
            />

            <AssignmentSubmissionsModal
                isOpen={!!verifyingAssignment}
                onClose={() => setVerifyingAssignment(null)}
                assignmentId={verifyingAssignment?.id || ""}
                assignmentTitle={verifyingAssignment?.title || ""}
                lectureId={verifyingAssignment?.lectureId}
            />
        </div>
    )
}
