"use client"

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type FilterFn,
} from "@tanstack/react-table"
import { useState, type MouseEvent } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem
} from "@/components/ui/pagination.tsx";
import {
    Select,
    SelectContent, SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination.ts";
import { Field, FieldLabel } from "@/components/ui/field.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    page: number
    pageSize: number
    totalPages: number
    totalRecords: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    searchPlaceholder?: string
    globalFilterFn?: FilterFn<TData>
    toolbarContent?: React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    page,
    pageSize,
    totalPages,
    totalRecords,
    onPageChange,
    onPageSizeChange,
    searchPlaceholder = "Search...",
    globalFilterFn,
    toolbarContent,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState("")

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
            return
        }

        onPageChange(nextPage)
    }

    const handlePaginationClick = (event: MouseEvent<HTMLButtonElement>, nextPage: number) => {
        event.preventDefault()
        event.stopPropagation()
        handlePageChange(nextPage)
    }

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        pageCount: totalPages,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalFilterFn,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage: page,
        totalPages,
        paginationItemsToDisplay: 3
    })
    const visibleRows = table.getRowModel().rows.length
    const showingFrom = totalRecords === 0 || visibleRows === 0 ? 0 : (page - 1) * pageSize + 1
    const showingTo = totalRecords === 0 || visibleRows === 0 ? 0 : (page - 1) * pageSize + visibleRows
    const isFilterActive = globalFilter.trim().length > 0

    return (
        <div className="flex flex-col">
            <div className="flex w-full flex-wrap items-center justify-between gap-3 py-4">
                <Input
                    placeholder={searchPlaceholder}
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                    aria-label={searchPlaceholder}
                />
                <div className="flex flex-wrap items-center gap-2">
                    {toolbarContent}
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                        <Select
                            value={pageSize.toString()}
                            defaultValue="10"
                            onValueChange={(value) => onPageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead className='bg-secondary h-14 first:pl-4' key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
                <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
                    {isFilterActive
                        ? `Showing ${visibleRows} matching entries on this page`
                        : `Showing ${showingFrom} to ${showingTo} of ${totalRecords} entries`}
                </p>
                <div className="mb-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    type="button"
                                    className='disabled:pointer-events-none disabled:opacity-50'
                                    variant={'ghost'}
                                    onClick={(event) => handlePaginationClick(event, page - 1)}
                                    disabled={page <= 1}
                                    aria-label='Go to previous page'
                                >
                                    <ChevronLeftIcon aria-hidden='true' />
                                    Previous
                                </Button>
                            </PaginationItem>

                            {showLeftEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {pages.map((tablePage) => {
                                const isActive = tablePage === page

                                return (
                                    <PaginationItem key={tablePage}>
                                        <Button
                                            type="button"
                                            size='icon'
                                            className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
                                            onClick={(event) => handlePaginationClick(event, tablePage)}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            {tablePage}
                                        </Button>
                                    </PaginationItem>
                                )
                            })}

                            {showRightEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <Button
                                    type="button"
                                    className='disabled:pointer-events-none disabled:opacity-50'
                                    variant={'ghost'}
                                    onClick={(event) => handlePaginationClick(event, page + 1)}
                                    disabled={page >= totalPages}
                                    aria-label='Go to next page'
                                >
                                    Next
                                    <ChevronRightIcon aria-hidden='true' />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    )
}
