import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { cn } from '@/lib/utils'

// Statistics card data type
type StatisticsCardProps = {
  icon: ReactNode
  value: string
  title: string
  changePercentage?: string
  className?: string
}

const StatisticsCard = ({ icon, value, title, changePercentage, className }: StatisticsCardProps) => {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader className='flex items-center'>
        <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
          {icon}
        </div>
        <div className='flex flex-col'>
          <span className='text-2xl font-bold'>{value}</span>
          {changePercentage && (
            <span className='text-xs text-muted-foreground'>{changePercentage} from last month</span>
          )}
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <span className='font-semibold text-sm h-10'>{title}</span>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
