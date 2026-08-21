import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import type { StudentResponse } from '@/api/types'

export type Item = {
  id: string
  avatar: string
  avatarFallback: string
  name: string
  email: string
  amount: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  paidAt: number
  studentId: string
  student: StudentResponse
}

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
})

function formatRelativeUnit(value: number, unit: Intl.RelativeTimeFormatUnit) {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
  return formatter.format(-value, unit)
}

function formatPaidAt(timestamp: number) {
  const now = new Date()
  const paidAt = new Date(timestamp)
  const diffMs = now.getTime() - paidAt.getTime()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs < minuteMs) return 'just now'

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfPaidAtDay = new Date(paidAt.getFullYear(), paidAt.getMonth(), paidAt.getDate())
  const dayDiff = Math.floor((startOfToday.getTime() - startOfPaidAtDay.getTime()) / dayMs)

  if (dayDiff === 0) return `Today, ${timeFormatter.format(paidAt)}`
  if (dayDiff === 1) return `Yesterday, ${timeFormatter.format(paidAt)}`
  if (dayDiff < 7) return formatRelativeUnit(dayDiff, 'day')
  if (dayDiff < 30) return formatRelativeUnit(Math.floor(dayDiff / 7), 'week')
  if (dayDiff < 365) return formatRelativeUnit(Math.floor(dayDiff / 30), 'month')
  return formatRelativeUnit(Math.floor(dayDiff / 365), 'year')
}

const TransactionDatatable = ({ data, renderActions }: { data: Item[], renderActions?: (item: Item) => React.ReactNode }) => {
  const pageSize = 5
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'name',
      header: 'Recent Transactions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Avatar className='size-9'>
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback className='text-xs'>{row.original.avatarFallback}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col text-sm'>
            <span className='text-card-foreground font-medium'>{row.getValue('name')}</span>
            <span className='text-muted-foreground'>{row.original.email}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR'
        }).format(amount)
        return <span>{formatted}</span>
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className='bg-primary/10 text-primary rounded-sm px-1.5 capitalize'>{row.getValue('status')}</Badge>
      )
    },
    {
      accessorKey: 'paidAt',
      header: () => <span className='w-fit'>Paid at</span>,
      cell: ({ row }) => (
        <span title={new Date(row.original.paidAt).toLocaleString()}>{formatPaidAt(row.original.paidAt)}</span>
      )
    },
    {
      id: 'actions',
      header: () => 'Profile',
      cell: ({ row }) => (
          renderActions ? renderActions(row.original) : <Button variant="outline">Open Profile</Button>
      ),
      size: 60,
      enableHiding: false
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination
    }
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2
  })

  return (
    <div className='w-full'>
      <div className='border-b'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className='text-muted-foreground h-14 first:pl-4'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className='first:pl-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
        <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
          Showing{' '}
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getRowCount()
            )}
          </span>{' '}
          of <span>{table.getRowCount().toString()} entries</span>
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className='disabled:pointer-events-none disabled:opacity-50'
                  variant={'ghost'}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
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

              {pages.map(page => {
                const isActive = page === table.getState().pagination.pageIndex + 1
                return (
                  <PaginationItem key={page}>
                    <Button
                      size='icon'
                      className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {page}
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
                  className='disabled:pointer-events-none disabled:opacity-50'
                  variant={'ghost'}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
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

export default TransactionDatatable