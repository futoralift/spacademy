import StudentSidebar from './StudentSidebar';
import { useMyTeachersQuery } from '@/api/userHooks';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsersIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { getFileUrl } from '@/api/http';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { TeacherResponse } from '@/api/types';
import { useState } from 'react';
import { Spinner } from "@/components/ui/spinner.tsx";
import DashboardLayoutProvider from '@/pages/DashboardLayoutProvider';

const StudentTeachersPage = () => (
    <DashboardLayoutProvider
        pageTitle="My Teachers"
        sidebar={<StudentSidebar />}
        bodyTitle="My Teachers"
        description="View all teachers assigned to your enrolled subjects"
        icon={<UsersIcon className="size-6" />}
    >
        <TeachersList />
    </DashboardLayoutProvider>
);

function TeachersList() {
    const { data: myTeachers, isLoading, isError, error } = useMyTeachersQuery();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const columns: ColumnDef<TeacherResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Teacher',
            cell: ({ row }) => {
                const teacher = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-muted">
                            <AvatarImage
                                src={teacher.avatar ? getFileUrl(teacher.avatar) : undefined}
                                alt={`${teacher.firstName} ${teacher.lastName}`}
                            />
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground">
                                {teacher.firstName} {teacher.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">Teacher</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MailIcon className="size-3.5 shrink-0" />
                    <span>{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneIcon className="size-3.5 shrink-0" />
                    <span>{row.original.phone || 'N/A'}</span>
                </div>
            ),
        },
        {
            accessorKey: 'subjects',
            header: 'Teaching You',
            cell: ({ row }) => {
                const subjects = row.original.subjects || [];
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-62.5">
                        {subjects.map(s => (
                            <Badge
                                key={s.id}
                                variant="secondary"
                                className="text-[10px] py-0 px-2 font-medium"
                            >
                                {s.name}
                            </Badge>
                        ))}
                        {subjects.length === 0 && <span className="text-xs text-muted-foreground italic">No subjects assigned</span>}
                    </div>
                );
            },
        }
    ];

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-100 w-full rounded-xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64 text-destructive text-sm font-medium">
                Failed to load teachers. Please try again.
            </div>
        );
    }

    // Local pagination since the endpoint currently returns all associated teachers
    const paginatedData = (myTeachers || []).slice((page - 1) * pageSize, page * pageSize);
    const totalRecords = myTeachers?.length || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <div className="w-full">
            {isLoading && (
                <div className="flex min-h-40 items-center justify-center">
                    <Spinner />
                </div>
            )}
            {isError && (
                <div className="flex min-h-40 items-center justify-center text-sm text-destructive">
                    {error}
                </div>
            )}
            {!isLoading && !isError && (
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    searchPlaceholder="Search teachers..."
                />
            )}
        </div>
    );
}

export default StudentTeachersPage;
