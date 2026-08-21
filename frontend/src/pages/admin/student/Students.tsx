import { useState } from "react";

import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { columns } from "@/pages/admin/student/columns.tsx";
import { DataTable } from "@/components/ui/data-table.tsx";
import { useStudentsQuery } from "@/api/userHooks.ts";
import AddStudentForm from "@/pages/admin/student/AddStudentForm.tsx";
import type { StudentResponse } from "@/api/types.ts";
import type { FilterFn } from "@tanstack/react-table";

import { UsersIcon } from "lucide-react";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider.tsx";

const AdminDashboardStudentPage = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="Students"
            sidebar={<AdminSidebar />}
            bodyTitle="Students"
            description="Manage student profiles, enrollments, and academic records"
            icon={<UsersIcon />}
            bodyToolbar={<AddStudentForm />}
        >
            <Students />
        </DashboardLayoutProvider>
    )
}

export default AdminDashboardStudentPage

const studentFilterFn: FilterFn<StudentResponse> = (row, _columnId, filterValue) => {
    const searchValue = String(filterValue).trim().toLowerCase()

    if (!searchValue) return true

    return [
        row.original.firstName,
        row.original.lastName,
        row.original.rollNo,
        row.original.studentNumber,
    ].some((value) => String(value ?? "").toLowerCase().includes(searchValue))
}

function Students() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const students = useStudentsQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize,
    });

    const studentResponse = students.data;

    return (
        <div className="w-full">
            {students.isLoading && (
                <div className="flex min-h-40 items-center justify-center">
                    <Spinner />
                </div>
            )}
            {students.isError && (
                <div className="flex min-h-40 items-center justify-center text-sm text-destructive">
                    {students.error.message}
                </div>
            )}
            {!students.isLoading && !students.isError && studentResponse && (
                <DataTable
                    columns={columns}
                    data={studentResponse.data}
                    page={page}
                    pageSize={pageSize}
                    totalPages={studentResponse.totalPages}
                    totalRecords={studentResponse.totalRecord}
                    onPageChange={setPage}
                    onPageSizeChange={(nextPageSize) => {
                        setPageSize(nextPageSize);
                        setPage(1);
                    }}
                    searchPlaceholder="Search by first name, last name, roll no, or student no..."
                    globalFilterFn={studentFilterFn}
                />
            )}
        </div>
    );
}
