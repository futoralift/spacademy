import { useState } from "react";

import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { columns } from "@/pages/admin/teacher/columns.tsx";
import { DataTable } from "@/components/ui/data-table.tsx";
import { useTeachersQuery } from "@/api/userHooks.ts";
import AddTeacherForm from "@/pages/admin/teacher/AddTeacherForm.tsx";
import type { TeacherResponse } from "@/api/types.ts";
import type { FilterFn } from "@tanstack/react-table";

import { UsersIcon } from "lucide-react";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider";

const AdminDashboardTeacherPage = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="Teachers"
            sidebar={<AdminSidebar />}
            bodyTitle="Teachers"
            description="Manage teacher profiles and assignments"
            icon={<UsersIcon className="size-6" />}
            bodyToolbar={<AddTeacherForm />}
        >
            <Teachers />
        </DashboardLayoutProvider>
    )
}

export default AdminDashboardTeacherPage

const teacherFilterFn: FilterFn<TeacherResponse> = (row, _columnId, filterValue) => {
    const searchValue = String(filterValue).trim().toLowerCase()

    if (!searchValue) return true

    return [
        row.original.firstName,
        row.original.lastName,
        row.original.phone,
    ].some((value) => String(value ?? "").toLowerCase().includes(searchValue))
}

function Teachers() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const teachers = useTeachersQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize,
    });

    const teacherResponse = teachers.data;

    return (
        <div className='w-full'>
            {teachers.isLoading && (
                <div className="flex min-h-40 items-center justify-center">
                    <Spinner />
                </div>
            )}
            {teachers.isError && (
                <div className="flex min-h-40 items-center justify-center text-sm text-destructive">
                    {teachers.error.message}
                </div>
            )}
            {!teachers.isLoading && !teachers.isError && teacherResponse && (
                <DataTable
                    columns={columns}
                    data={teacherResponse.data}
                    page={page}
                    pageSize={pageSize}
                    totalPages={teacherResponse.totalPages}
                    totalRecords={teacherResponse.totalRecord}
                    onPageChange={setPage}
                    onPageSizeChange={(nextPageSize: number) => {
                        setPageSize(nextPageSize);
                        setPage(1);
                    }}
                    searchPlaceholder="Search by first name, last name or phone..."
                    globalFilterFn={teacherFilterFn}
                />
            )}
        </div>
    );
}
