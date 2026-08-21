import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button.tsx";
import type { CourseResponse } from "@/api/types.ts";
import { ArrowUpDown } from "lucide-react";
import CourseActions from "@/pages/admin/course/CourseActions.tsx";
import { Badge } from "@/components/ui/badge.tsx";

export const columns: ColumnDef<CourseResponse>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Course Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className='flex flex-col text-sm ml-4'>
                <span className='text-card-foreground font-medium'>{row.original.name}</span>
                <span className='text-muted-foreground truncate max-w-xs'>{row.original.description}</span>
            </div>
        )
    },
    {
        accessorKey: "mode",
        header: "Mode",
        cell: ({ row }) => <span className="capitalize">{row.original.mode}</span>,
    },
    {
        accessorKey: "isPaid",
        header: "isPaid",
        cell: ({ row }) => <span className="capitalize">{row.original.isPaid ? "Paid" : "Free"}</span>,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
                {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        accessorKey: "amount",
        header: "Price",
        cell: ({ row }) => {
            if (row.original.isPaid) {
                if (row.original.amount === null) {
                    return <span className="capitalize">{`Not Set`}</span>
                }
                return <span className="capitalize">{`${row.original.amount} ${row.original.currency} `}</span>
            }
            return <span className="capitalize">Free</span>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CourseActions course={row.original} />,
    },
]
