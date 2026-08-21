"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { getFileUrl } from "@/api/http";
import { Button } from "@/components/ui/button.tsx";
import type { StudentResponse } from "@/api/types.ts";
import { ArrowUpDown } from "lucide-react";
import StudentActions from "@/pages/admin/student/StudentProfile.tsx";
import { ExpandableList } from "@/components/ExpandableList.tsx";


export const columns: ColumnDef<StudentResponse>[] = [
    {
        accessorKey: "firstName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Students
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className='flex items-center gap-2'>
                <Avatar className='size-9'>
                    <AvatarImage src={getFileUrl(row.original.avatar)} alt={`${row.original.firstName} ${row.original.lastName}`} />
                    <AvatarFallback className='text-xs'>
                        {`${row.original.firstName[0]?.toUpperCase() ?? ""}${row.original.lastName[0]?.toUpperCase() ?? ""}`}
                    </AvatarFallback>
                </Avatar>
                <div className='flex flex-col text-sm'>
                    <span className='text-card-foreground font-medium'>{`${row.original.firstName} ${row.original.lastName}`}</span>
                    <span className='text-muted-foreground'>{row.original.email}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "rollNo",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Roll no
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => row.original.rollNo ?? "-",
    },
    {
        accessorKey: "studentNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Phone number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "standard",
        header: "Standard",
        cell: ({ row }) => row.original.standard ?? "-",
    },
    {
        id: "courses",
        header: "Courses",
        cell: ({ row }) => {
            return <ExpandableList items={row.original.courses.map((course) => course.name)} limit={2} />
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <StudentActions student={row.original} />,
    },
]
