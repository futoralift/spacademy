import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { columns } from "@/pages/admin/course/columns.tsx";
import { DataTable } from "@/components/ui/data-table.tsx";
import { useCoursesQuery } from "@/api/academyHooks.ts";
import AddCourseForm from "@/pages/admin/course/AddCourseForm.tsx";
import { Library } from "lucide-react";
import type { CourseResponse } from "@/api/types.ts";
import type { FilterFn } from "@tanstack/react-table";
import DashboardLayoutProvider from '@/pages/DashboardLayoutProvider';


const AdminDashboardCoursePage = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="Courses"
            sidebar={<AdminSidebar />}
            bodyTitle="Courses"
            description='Design and manage academic courses, subjects, and curriculum'
            icon={<Library className="size-6" />}
            bodyToolbar={
                <AddCourseForm />
            }
        >
            <Courses />
        </DashboardLayoutProvider>
    )
}

export default AdminDashboardCoursePage

const courseFilterFn: FilterFn<CourseResponse> = (row, _columnId, filterValue) => {
    const searchValue = String(filterValue).trim().toLowerCase()
    if (!searchValue) return true
    return [
        row.original.name,
        row.original.description,
        row.original.mode,
    ].some((value) => String(value ?? "").toLowerCase().includes(searchValue))
}

function Courses() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const coursesQuery = useCoursesQuery();

    const coursesArray = coursesQuery.data || [];
    const totalRecords = coursesArray.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const paginatedData = coursesArray.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="w-full">
            {coursesQuery.isLoading && (
                <div className="flex min-h-40 items-center justify-center">
                    <Spinner />
                </div>
            )}
            {coursesQuery.isError && (
                <div className="flex min-h-40 items-center justify-center text-sm text-destructive">
                    {coursesQuery.error.message}
                </div>
            )}
            {!coursesQuery.isLoading && !coursesQuery.isError && (
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onPageSizeChange={(nextPageSize: number) => {
                        setPageSize(nextPageSize);
                        setPage(1);
                    }}
                    searchPlaceholder="Search by name or description..."
                    globalFilterFn={courseFilterFn}
                />
            )}
        </div>
    );
}
