import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { columns } from "@/pages/admin/blog/columns.tsx";
import { DataTable } from "@/components/ui/data-table.tsx";
import { usePostsQuery } from "@/api/contentHooks.ts";
import { Link } from "react-router-dom";
import { SquarePen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { PostResponse } from "@/api/types.ts";
import type { FilterFn } from "@tanstack/react-table";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider.tsx";

const AdminDashboardBlogPage = () => {
    return (
        <DashboardLayoutProvider
            pageTitle="Blog"
            sidebar={<AdminSidebar />}
            bodyTitle="Blog Posts"
            description='Create and publish articles, news, and updates for the academy'
            icon={<SquarePen />}
            bodyToolbar={
                <Button asChild className="gap-2">
                    <Link to="/dashboard/admin/blogs/new">
                        <Plus className="size-4" /> Create Post
                    </Link>
                </Button>
            }
        >
            <Blogs />
        </DashboardLayoutProvider>
    )
}

export default AdminDashboardBlogPage

const blogFilterFn: FilterFn<PostResponse> = (row, _columnId, filterValue) => {
    const searchValue = String(filterValue).trim().toLowerCase()
    if (!searchValue) return true
    return [
        row.original.title,
        row.original.excerpt,
        row.original.slug,
        row.original.status,
    ].some((value) => String(value ?? "").toLowerCase().includes(searchValue))
}

function Blogs() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const blogsQuery = usePostsQuery({ limit: pageSize, offset: (page - 1) * pageSize });

    const blogsArray = blogsQuery.data?.data || [];
    const totalRecords = blogsQuery.data?.totalRecord || 0;
    const totalPages = blogsQuery.data?.totalPages || 0;

    return (
        <div className='w-full'>
            {blogsQuery.isLoading && (
                <div className="flex min-h-40 items-center justify-center">
                    <Spinner />
                </div>
            )}
            {blogsQuery.isError && (
                <div className="flex min-h-40 items-center justify-center text-sm text-destructive">
                    {blogsQuery.error.message}
                </div>
            )}
            {!blogsQuery.isLoading && !blogsQuery.isError && (
                <DataTable
                    columns={columns}
                    data={blogsArray}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onPageSizeChange={(nextPageSize: number) => {
                        setPageSize(nextPageSize);
                        setPage(1);
                    }}
                    searchPlaceholder="Search by title, excerpt or status..."
                    globalFilterFn={blogFilterFn}
                />
            )}
        </div>
    );
}
