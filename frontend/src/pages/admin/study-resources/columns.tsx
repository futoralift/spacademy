import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button.tsx";
import type { StudyResourceResponse } from "@/api/types.ts";
import { ArrowUpDown, FileText, Download } from "lucide-react";
import ResourceActions from "./ResourceActions.tsx";

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
})

function formatRelativeUnit(value: number, unit: Intl.RelativeTimeFormatUnit) {
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
    return formatter.format(-value, unit)
}

function formatRelativeDate(dateInput: string | number | Date | null) {
    if (!dateInput) return "Unknown";

    const now = new Date()
    const date = new Date(dateInput)
    const diffMs = now.getTime() - date.getTime()
    const minuteMs = 60 * 1000
    const hourMs = 60 * minuteMs
    const dayMs = 24 * hourMs

    if (diffMs < minuteMs) {
        return 'just now'
    }

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfTargetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayDiff = Math.floor((startOfToday.getTime() - startOfTargetDay.getTime()) / dayMs)

    if (dayDiff === 0) {
        return `Today, ${timeFormatter.format(date)}`
    }

    if (dayDiff === 1) {
        return `Yesterday, ${timeFormatter.format(date)}`
    }

    if (dayDiff < 7) {
        return formatRelativeUnit(dayDiff, 'day')
    }

    if (dayDiff < 30) {
        return formatRelativeUnit(Math.floor(dayDiff / 7), 'week')
    }

    if (dayDiff < 365) {
        return formatRelativeUnit(Math.floor(dayDiff / 30), 'month')
    }

    return formatRelativeUnit(Math.floor(dayDiff / 365), 'year')
}

export const columns: ColumnDef<StudyResourceResponse>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Resource Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3 ml-4">
                <div className="bg-primary/10 p-2 rounded">
                    <FileText className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "lectures",
        header: "Associated With",
        cell: ({ row }) => (
            <div className="flex flex-col text-xs">
                <span className="font-medium">Subject ID: {row.original.subjectId}</span>
                <span className="text-muted-foreground">Lecture ID: {row.original.lectureId}</span>
            </div>
        )
    },
    {
        accessorKey: "uploadAt",
        header: "Uploaded",
        cell: ({ row }) => (
            <div className="flex flex-col text-sm">
                <span className="text-card-foreground">
                    {formatRelativeDate(row.original.uploadAt)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {new Date(row.original.uploadAt).toLocaleDateString()}
                </span>
            </div>
        )
    },
    {
        id: "download",
        header: "File",
        cell: ({ row }) => (
            <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2"
                onClick={() => window.open(row.original.filePath, "_blank")}
            >
                <Download className="size-3" />
                Download
            </Button>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => <ResourceActions resource={row.original} />,
    }
]
