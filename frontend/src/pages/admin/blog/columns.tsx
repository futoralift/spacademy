import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button.tsx";
import type { PostResponse } from "@/api/types.ts";
import { ArrowUpDown } from "lucide-react";
import BlogActions from "@/pages/admin/blog/BlogActions.tsx";
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

export const columns: ColumnDef<PostResponse>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className='flex flex-col text-sm ml-4'>
                <span className='text-card-foreground font-medium'>{row.original.title}</span>
                <span className='text-muted-foreground truncate max-w-xs'>{row.original.excerpt}</span>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.status === "publish" ? "default" : "secondary"}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.slug}</span>,
    },
    {
        accessorKey: "publishedAt",
        header: "Published At",
        cell: ({ row }) => {
            const dateStr = row.original.publishedAt;
            return (
                <span 
                    className="text-sm text-muted-foreground"
                    title={dateStr ? new Date(dateStr).toLocaleString() : undefined}
                >
                    {formatRelativeDate(dateStr)}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <BlogActions post={row.original} />,
    },
]
