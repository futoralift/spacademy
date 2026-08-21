"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge.tsx"

interface ExpandableListProps {
  items: string[]
  limit?: number
}

export function ExpandableList({ items, limit = 1 }: ExpandableListProps) {
  const [expanded, setExpanded] = useState(false)

  if (!items || items.length === 0) {
    return <span className="text-muted-foreground text-sm">None</span>
  }

  if (items.length <= limit) {
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, idx) => (
          <Badge key={idx} variant="secondary" className="font-normal pointer-events-none text-xs whitespace-nowrap">
            {item}
          </Badge>
        ))}
      </div>
    )
  }

  const visibleItems = expanded ? items : items.slice(0, limit)

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleItems.map((item, idx) => (
        <Badge key={idx} variant="secondary" className="font-normal pointer-events-none text-xs whitespace-nowrap">
          {item}
        </Badge>
      ))}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted-foreground hover:text-foreground select-none underline-offset-2 ml-1 cursor-pointer"
      >
        {expanded ? "View less" : `+${items.length - limit} more`}
      </button>
    </div>
  )
}
