import { useState, useMemo } from "react";
import { useMySubjectsQuery, useMyLecturesQuery, useCoursesQuery } from "@/api/academyHooks";
import TeacherSidebar from "@/pages/teacher/TeacherSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, Clock, ChevronRight, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AttendanceModal } from "../lecture/AttendanceModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field.tsx";
import { GraduationCap } from "lucide-react";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider";

export default function TeacherSubjectsPage() {
    return (
        <DashboardLayoutProvider
            pageTitle="My Subjects"
            sidebar={<TeacherSidebar />}
            bodyTitle="My Subjects"
            description="Manage your courses and lectures"
            icon={<GraduationCap />}
        >
            <TeacherSubjects />
        </DashboardLayoutProvider>
    );
}

function TeacherSubjects() {
    const { data: subjects, isLoading: isSubjectsLoading } = useMySubjectsQuery();
    const { data: lectures, isLoading: isLecturesLoading } = useMyLecturesQuery();
    const { data: courses, isLoading: isCoursesLoading } = useCoursesQuery();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<{ id: string; startDate: string } | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const isLoading = isSubjectsLoading || isLecturesLoading || isCoursesLoading;

    const selectedSubject = subjects?.find(s => s.id === selectedSubjectId);

    const sortedLectures = useMemo(() => {
        if (!selectedSubjectId) return [];
        return [...(lectures || [])]
            .filter(l => l.subjectId === selectedSubjectId)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [lectures, selectedSubjectId]);

    const filteredLectures = useMemo(() => {
        if (!search.trim()) return sortedLectures;
        const q = search.toLowerCase();
        return sortedLectures.filter(l => {
            const start = new Date(l.startDate);
            return (
                (l.lectureTitle?.toLowerCase().includes(q)) ||
                format(start, "PPP").toLowerCase().includes(q) ||
                format(start, "EEEE").toLowerCase().includes(q)
            );
        });
    }, [sortedLectures, search]);

    const totalRecords = filteredLectures.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const paginatedLectures = filteredLectures.slice((page - 1) * pageSize, page * pageSize);

    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage: page,
        totalPages,
        paginationItemsToDisplay: 3,
    });

    const showingFrom = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
    const showingTo = totalRecords === 0 ? 0 : Math.min(page * pageSize, totalRecords);

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 animate-in fade-in duration-500">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-48 rounded-lg" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Subjects Grid */}
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {subjects?.map((subject) => (
                        <Card
                            key={subject.id}
                            className={cn(
                                "group cursor-pointer transition-all duration-300 hover:shadow-md border-slate-100 dark:border-slate-800",
                                selectedSubjectId === subject.id ? "ring-2 ring-primary bg-primary/2 dark:bg-primary/5 border-primary/20" : "hover:border-primary/20 bg-card"
                            )}
                            onClick={() => { setSelectedSubjectId(subject.id); setPage(1); setSearch(""); }}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors duration-300",
                                        selectedSubjectId === subject.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <BookOpen className="size-5" />
                                    </div>
                                    <ChevronRight className={cn(
                                        "size-4 transition-transform duration-300",
                                        selectedSubjectId === subject.id ? "translate-x-0.5 text-primary" : "text-slate-300 group-hover:text-primary"
                                    )} />
                                </div>
                                <CardTitle className="text-base font-bold leading-tight group-hover:text-primary transition-colors">
                                    {subject.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <p className="font-medium text-muted-foreground mb-2">Course Associated</p>
                                <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 text-primary font-semibold border-none group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    {courses?.find(c => c.id === subject.courseId)?.name || subject.courseId.substring(0, 8) + "..."}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}

                    {!subjects?.length && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <BookOpen className="size-12 text-slate-300 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No subjects assigned</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">You haven't been assigned any subjects yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lectures Section */}
            {selectedSubjectId && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg text-primary">
                            <Calendar className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                Lectures for {selectedSubject?.name}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">Total {sortedLectures.length} sessions found</p>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex w-full items-center justify-between gap-3 py-4 max-sm:flex-col max-sm:items-stretch">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by date or title..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9 max-w-sm"
                                aria-label="Search by date or title"
                            />
                        </div>
                        <Field orientation="horizontal" className="w-fit">
                            <FieldLabel htmlFor="lecture-rows-per-page">Rows per page</FieldLabel>
                            <Select
                                value={pageSize.toString()}
                                defaultValue="10"
                                onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                            >
                                <SelectTrigger className="w-20" id="lecture-rows-per-page">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="start">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    {/* Table — matches datatable-transaction style */}
                    <div className="overflow-hidden rounded-md border dark:border-slate-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 first:pl-4 text-muted-foreground font-semibold">Date</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Time Window</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Duration</TableHead>
                                    <TableHead className="bg-secondary/50 dark:bg-slate-900 h-14 text-muted-foreground font-semibold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLectures.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center bg-card">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full">
                                                    <Calendar className="size-8 text-slate-300 dark:text-slate-700" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground dark:text-slate-500">
                                                    {search ? "No lectures match your search." : "No lectures scheduled for this subject."}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLectures.map((lecture) => {
                                        const start = new Date(lecture.startDate);
                                        const end = new Date(lecture.endDate);
                                        const isPast = end < new Date();
                                        const isUpcoming = start > new Date();
                                        const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

                                        return (
                                            <TableRow
                                                key={lecture.id}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedLecture({ id: lecture.id, startDate: lecture.startDate });
                                                    setIsAttendanceModalOpen(true);
                                                }}
                                            >
                                                <TableCell className="first:pl-4">
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-semibold text-card-foreground">
                                                            {isToday(start) ? "Today" :
                                                                isYesterday(start) ? "Yesterday" :
                                                                    isTomorrow(start) ? "Tomorrow" :
                                                                        format(start, "PPP")}
                                                        </span>
                                                        <span className="text-muted-foreground dark:text-slate-500 text-xs font-medium uppercase tracking-tighter">{format(start, "EEEE")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                                                        <Clock className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>{format(start, "p")} – {format(end, "p")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-card-foreground font-medium">{durationMin} mins</span>
                                                </TableCell>
                                                <TableCell>
                                                    {isPast ? (
                                                        <Badge className="rounded-sm px-1.5 capitalize font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Completed</Badge>
                                                    ) : isUpcoming ? (
                                                        <Badge className="rounded-sm px-1.5 capitalize font-medium bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/10 dark:hover:bg-primary/25">Upcoming</Badge>
                                                    ) : (
                                                        <Badge className="rounded-sm px-1.5 capitalize font-medium bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 animate-pulse">Live Now</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination footer — matches DataTable */}
                    <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col">
                        <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                            Showing {showingFrom} to {showingTo} of {totalRecords} entries
                        </p>
                        <div className="mb-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            type="button"
                                            className="disabled:pointer-events-none disabled:opacity-50"
                                            variant="ghost"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            aria-label="Go to previous page"
                                        >
                                            <ChevronLeftIcon aria-hidden="true" />
                                            Previous
                                        </Button>
                                    </PaginationItem>

                                    {showLeftEllipsis && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}

                                    {pages.map(p => {
                                        const isActive = p === page;
                                        return (
                                            <PaginationItem key={p}>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    className={!isActive ? "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20" : ""}
                                                    onClick={() => setPage(p)}
                                                    aria-current={isActive ? "page" : undefined}
                                                    aria-label="page-icon"
                                                >
                                                    {p}
                                                </Button>
                                            </PaginationItem>
                                        );
                                    })}

                                    {showRightEllipsis && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <Button
                                            type="button"
                                            className="disabled:pointer-events-none disabled:opacity-50"
                                            variant="ghost"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            aria-label="Go to next page"
                                        >
                                            Next
                                            <ChevronRightIcon aria-hidden="true" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>
            )}

            {selectedLecture && (
                <AttendanceModal
                    isOpen={isAttendanceModalOpen}
                    onClose={() => {
                        setIsAttendanceModalOpen(false);
                        setSelectedLecture(null);
                    }}
                    lectureId={selectedLecture.id}
                    subjectName={selectedSubject?.name || ""}
                    lectureStartDate={selectedLecture.startDate}
                />
            )}

            {!selectedSubjectId && subjects && subjects.length > 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
                    <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                        <BookOpen className="size-10 text-primary/40" />
                    </div>
                    <h3 className="text-xl font-bold">Select a subject</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        Click on one of your assigned subjects above to view its complete lecture history and upcoming sessions.
                    </p>
                </div>
            )}
        </div>
    );
}
