import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button.tsx";
import type { LearningHubVideoResponse } from "@/api/types.ts";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import VideoActions from "./VideoActions.tsx";
import { Badge } from "@/components/ui/badge.tsx";

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
})

function formatRelativeUnit(value: number, unit: Intl.RelativeTimeFormatUnit) {
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
    return formatter.format(-value, unit)
}

function formatRelativeDate(dateInput: string | number | Date | null) {
    if (!dateInput) return "Not Published";

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

export const columns: ColumnDef<LearningHubVideoResponse>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3 ml-4">
                {row.original.thumbnail ? (
                    <img
                        src={row.original.thumbnail}
                        alt={row.original.title}
                        className="w-16 h-9 object-cover rounded shadow-sm"
                    />
                ) : (
                    <div className="w-16 h-9 bg-muted rounded flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground">No Thumb</span>
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.title}</span>
                    <a
                        href={row.original.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        View on YouTube <ExternalLink className="size-3" />
                    </a>
                </div>
            </div>
        )
    },
    {
        accessorKey: "videoType",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="secondary" className="capitalize">
                {row.original.videoType.replace(/_/g, ' ')}
            </Badge>
        )
    },
    {
        accessorKey: "publishDate",
        header: "Publish Date",
        cell: ({ row }) => (
            <div className="flex flex-col text-sm">
                <span className="text-card-foreground">
                    {formatRelativeDate(row.original.publishDate)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {new Date(row.original.publishDate).toLocaleDateString()}
                </span>
            </div>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => <VideoActions video={row.original} />,
    }
]
