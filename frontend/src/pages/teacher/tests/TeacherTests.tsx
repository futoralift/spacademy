import { useState, useMemo } from "react"
import TeacherSidebar from "@/pages/teacher/TeacherSidebar"
import {
    useMySubjectsQuery,
    useCoursesQuery,
    useTestsQuery,
    useDeleteTestMutation,
} from "@/api/academyHooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner.tsx"
import {
    GraduationCap,
    Clock,
    BookOpen,
    MoreVertical,
    Pencil,
    Trash2,
    Search,
    ChevronLeftIcon,
    ChevronRightIcon,
    HelpCircle,
    TrendingUp,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import CreateTestModal from "./CreateTestModal"
import EditTestModal from "./EditTestModal"
import ManageQuestionsModal from "./ManageQuestionsModal"
import { TestSubmissionsModal } from "./TestSubmissionsModal"
import type { TestResponse } from "@/api/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
} from "@/components/ui/pagination"
import { Field, FieldLabel } from "@/components/ui/field.tsx"
import { usePagination } from "@/hooks/use-pagination"
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider";

export default function TeacherTestsPage() {
    return (
        <DashboardLayoutProvider
            pageTitle="Tests & Exams"
            sidebar={<TeacherSidebar />}
            bodyTitle="Tests & Exams"
            description="Schedule and manage evaluations for your students"
            icon={<GraduationCap />}
            bodyToolbar={
                <CreateTestModal />
            }
        >
            <TeacherTests />
        </DashboardLayoutProvider>
    );
}

function getStatus(test: TestResponse): "upcoming" | "live" | "completed" {
    const start = new Date(test.startTime)
    const end = new Date(test.expiresAt)
    const now = new Date()
    if (now < start) return "upcoming"
    if (now <= end) return "live"
    return "completed"
}

function TeacherTests() {
    const [editingTest, setEditingTest] = useState<TestResponse | null>(null)
    const [questionsTest, setQuestionsTest] = useState<TestResponse | null>(null)
    const [resultsTest, setResultsTest] = useState<TestResponse | null>(null)
    const [deletingTest, setDeletingTest] = useState<TestResponse | null>(null)
    const [search, setSearch] = useState("")
    const [filterSubjectId, setFilterSubjectId] = useState("all")
    const [filterCourseId, setFilterCourseId] = useState("all")
    const [filterType, setFilterType] = useState<"all" | "chapter_wise" | "full_syllabus">("all")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data: testsData, isLoading, isError, error } = useTestsQuery()
    const { data: subjects } = useMySubjectsQuery()
    const { data: courses } = useCoursesQuery()
    const deleteMutation = useDeleteTestMutation()

    const allTests = testsData?.data ?? []
    const mySubjectIds = new Set(subjects?.map(s => s.id) ?? [])
    const myTests = allTests.filter(t => mySubjectIds.has(t.subjectId))

    const filteredSubjects = useMemo(() => {
        if (!subjects) return []
        if (filterCourseId === "all") return subjects
        return subjects.filter(s => s.courseId === filterCourseId)
    }, [subjects, filterCourseId])

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()
        return myTests.filter(t => {
            if (filterCourseId !== "all") {
                const sub = subjects?.find(s => s.id === t.subjectId)
                if (sub?.courseId !== filterCourseId) return false
            }
            if (filterSubjectId !== "all" && t.subjectId !== filterSubjectId) return false
            if (filterType !== "all" && t.type !== filterType) return false
            if (q && !t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false
            return true
        })
    }, [myTests, search, filterSubjectId, filterCourseId, filterType, subjects])

    const totalRecords = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage: page,
        totalPages,
        paginationItemsToDisplay: 3,
    })

    const showingFrom = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1
    const showingTo = totalRecords === 0 ? 0 : Math.min(page * pageSize, totalRecords)

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success("Test deleted")
            setDeletingTest(null)
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete test")
        }
    }

    const statusBadge = (test: TestResponse) => {
        const s = getStatus(test)
        if (s === "live") return <Badge className="rounded-sm px-1.5 capitalize font-medium bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 animate-pulse">Live</Badge>
        if (s === "upcoming") return <Badge className="rounded-sm px-1.5 capitalize font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/25">Upcoming</Badge>
        return <Badge className="rounded-sm px-1.5 capitalize font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Completed</Badge>
    }

    const typeBadge = (test: TestResponse) => (
        test.type === "full_syllabus"
            ? <Badge className="rounded-sm px-1.5 capitalize font-medium bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30">Full Syllabus</Badge>
            : <Badge className="rounded-sm px-1.5 capitalize font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30">Chapter Wise</Badge>
    )

    const statusExtraBadge = (test: TestResponse) => (
        test.status === "draft"
            ? <Badge variant="outline" className="rounded-sm px-1.5 capitalize font-medium border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900">Draft</Badge>
            : null
    )

    return (
        <div className='w-full'>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Search by title..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={filterType} onValueChange={v => { setFilterType(v as any); setPage(1) }}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="chapter_wise">Chapter Wise</SelectItem>
                            <SelectItem value="full_syllabus">Full Syllabus</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterCourseId} onValueChange={v => { setFilterCourseId(v); setFilterSubjectId("all"); setPage(1) }}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="All Courses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filterSubjectId} onValueChange={v => { setFilterSubjectId(v); setPage(1) }} disabled={filteredSubjects.length === 0}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {(filterCourseId !== "all" || filterSubjectId !== "all" || filterType !== "all") && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground"
                            onClick={() => { setFilterCourseId("all"); setFilterSubjectId("all"); setFilterType("all"); setPage(1) }}>
                            Clear filters
                        </Button>
                    )}

                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="tests-page-size">Rows</FieldLabel>
                        <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setPage(1) }}>
                            <SelectTrigger className="w-16" id="tests-page-size"><SelectValue /></SelectTrigger>
                            <SelectContent align="start">
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </div>

            {/* Loading / Error */}
            {isLoading && (
                <div className="flex min-h-40 items-center justify-center bg-card border rounded-xl dark:border-slate-800">
                    <Spinner />
                </div>
            )}
            {isError && (
                <div className="min-h-40 flex items-center justify-center text-destructive text-sm bg-card border rounded-xl dark:border-slate-800">
                    {(error as any)?.message ?? "Failed to load tests"}
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    {/* Table */}
                    <div className="overflow-hidden rounded-md border dark:border-slate-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 first:pl-4 text-muted-foreground font-semibold">Test / Exam</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Subject</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Scheduled</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Duration</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Marks</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Mode</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Status</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-48 text-center bg-card">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full">
                                                    <GraduationCap className="size-8 text-slate-300 dark:text-slate-700" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground dark:text-slate-500">
                                                    {search || filterSubjectId !== "all" || filterType !== "all"
                                                        ? "No tests match your filters."
                                                        : "No tests or exams scheduled yet."}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.map(test => {
                                        const subject = subjects?.find(s => s.id === test.subjectId)
                                        return (
                                            <TableRow key={test.id}>
                                                <TableCell className="first:pl-4">
                                                    <div className="flex flex-col gap-0.5 max-w-60">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-card-foreground line-clamp-1">{test.title}</span>
                                                            <div className="flex gap-1">
                                                                {typeBadge(test)}
                                                                {statusExtraBadge(test)}
                                                            </div>
                                                        </div>
                                                        {test.description && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1 text-wrap">{test.description}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                                                        <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>{subject?.name || "—"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium text-card-foreground">{format(parseISO(test.startTime), "MMM do, yyyy")}</span>
                                                        <span className="text-xs text-muted-foreground">{format(parseISO(test.startTime), "h:mm a")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                                                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>{test.durationMin} mins</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium text-card-foreground">{test.totalMarks} total</span>
                                                        <span className="text-xs text-muted-foreground">Max {test.maxAttempts} attempt{test.maxAttempts !== 1 ? "s" : ""}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm capitalize text-card-foreground">{test.mode}</span>
                                                </TableCell>
                                                <TableCell>{statusBadge(test)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="vert-dots">
                                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-fit">
                                                            {test.mode === 'online' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => setQuestionsTest(test)}
                                                                    disabled={getStatus(test) === "live"}
                                                                    className={getStatus(test) === "live" ? "opacity-50 cursor-not-allowed" : ""}
                                                                >
                                                                    <HelpCircle className="mr-2 h-4 w-4" /> Manage Questions
                                                                </DropdownMenuItem>
                                                            )}
                                                            {getStatus(test) !== "upcoming" && (
                                                                <DropdownMenuItem onClick={() => setResultsTest(test)}>
                                                                    <TrendingUp className="mr-2 h-4 w-4" /> {test.mode === 'offline' ? 'Manage Marks' : 'View Performance'}
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => setEditingTest(test)}
                                                                disabled={getStatus(test) === "live"}
                                                                className={getStatus(test) === "live" ? "opacity-50 cursor-not-allowed" : ""}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className={`text-destructive focus:bg-destructive/10 ${getStatus(test) === "live" ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                onClick={() => setDeletingTest(test)}
                                                                disabled={getStatus(test) === "live"}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col">
                        <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                            Showing {showingFrom} to {showingTo} of {totalRecords} entries
                        </p>
                        <div className="mb-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button className="disabled:pointer-events-none disabled:opacity-50" variant="ghost"
                                            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                                            <ChevronLeftIcon /> Previous
                                        </Button>
                                    </PaginationItem>
                                    {showLeftEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                    {pages.map(p => (
                                        <PaginationItem key={p}>
                                            <Button size="icon"
                                                className={p !== page ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                                                onClick={() => setPage(p)} aria-current={p === page ? "page" : undefined}>
                                                {p}
                                            </Button>
                                        </PaginationItem>
                                    ))}
                                    {showRightEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                    <PaginationItem>
                                        <Button className="disabled:pointer-events-none disabled:opacity-50" variant="ghost"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                            Next <ChevronRightIcon />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </>
            )}

            {/* Manage Questions */}
            <ManageQuestionsModal
                test={questionsTest}
                isOpen={!!questionsTest}
                onClose={() => setQuestionsTest(null)}
            />

            {/* View Performance */}
            <TestSubmissionsModal
                isOpen={!!resultsTest}
                onClose={() => setResultsTest(null)}
                testId={resultsTest?.id || ""}
                testTitle={resultsTest?.title || ""}
                testMode={resultsTest?.mode || 'online'}
                totalMarks={resultsTest?.totalMarks || 0}
            />

            {/* Edit */}
            <EditTestModal
                test={editingTest}
                isOpen={!!editingTest}
                onClose={() => setEditingTest(null)}
            />

            {/* Delete confirm */}
            <Dialog open={!!deletingTest} onOpenChange={open => { if (!open) setDeletingTest(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Test</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete "{deletingTest?.title}"? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingTest(null)}>Cancel</Button>
                        <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deletingTest && handleDelete(deletingTest.id)}>
                            {deleteMutation.isPending && <Clock className="mr-2 size-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
