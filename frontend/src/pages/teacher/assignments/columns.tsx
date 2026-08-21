"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Pencil, Trash2, Clock, BookOpen, MoreVertical, CheckCircle2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, parseISO } from "date-fns"
import type { AssignmentResponse } from "@/api/types"

export type AssignmentRow = AssignmentResponse & {
    subjectName: string
    courseName: string
    lectureLabel: string | null
    _subjectId: string
    _courseId: string
}

export function buildColumns(
    onEdit: (a: AssignmentResponse) => void,
    onDelete: (id: string) => void,
    onVerify: (a: AssignmentResponse) => void,
): ColumnDef<AssignmentRow>[] {
    return [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0 font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Assignment <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col min-w-0">
                    <span className="font-medium text-card-foreground line-clamp-1">{row.original.title}</span>
                    {row.original.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "courseName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0 font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Course <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-card-foreground font-medium">
                    {row.original.courseName || "—"}
                </span>
            ),
        },
        {
            accessorKey: "subjectName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0 font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Subject <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                    <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{row.original.subjectName || "Independent"}</span>
                </div>
            ),
        },
        {
            accessorKey: "deadline",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0 font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Deadline <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => {
                const isPast = new Date(row.original.deadline) < new Date()
                return (
                    <div className="flex items-center gap-1.5 text-sm">
                        <Clock className={`size-3.5 shrink-0 ${isPast ? "text-destructive/70" : "text-muted-foreground"}`} />
                        <span title={new Date(row.original.deadline).toLocaleString()} className={isPast ? "text-destructive" : "text-card-foreground"}>
                            {format(parseISO(row.original.deadline), "MMM do, yyyy")}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "mark",
            header: () => <span className="text-muted-foreground font-semibold">Marks</span>,
            cell: ({ row }) =>
                row.original.mark
                    ? <span className="text-sm font-medium text-card-foreground">{row.original.mark} pts</span>
                    : <span className="text-muted-foreground text-sm">—</span>,
        },
        {
            id: "status",
            header: () => <span className="text-muted-foreground font-semibold">Status</span>,
            cell: ({ row }) => {
                const isPast = new Date(row.original.deadline) < new Date()
                return (
                    <Badge className={`rounded-sm px-1.5 capitalize font-medium ${
                        isPast
                            ? "bg-slate-100 text-slate-500 hover:bg-slate-100"
                            : "bg-primary/10 text-primary hover:bg-primary/10"
                    }`}>
                        {isPast ? "Past Due" : "Active"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: () => null,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-fit">
                        <DropdownMenuItem onClick={() => onVerify(row.original)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Verify submissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10"
                            onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]
}
