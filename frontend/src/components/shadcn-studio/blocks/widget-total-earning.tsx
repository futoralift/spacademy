import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'

const listItems = ['Share', 'Update', 'Refresh']

type Props = {
  title: string
  earning: number
  trend: 'up' | 'down'
  percentage: number
  comparisonText: string
  earningData: {
    platform: string
    technologies: string
    earnings: string
    progressPercentage: number
  }[]
  className?: string
}

const TotalEarningCard = ({ earningData, title, earning, trend, percentage, comparisonText, className }: Props) => {
  return (
    <Card className={className}>
      <CardHeader className='flex items-center justify-between'>
        <span className='text-lg font-semibold'>{title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='text-muted-foreground size-6 rounded-full'>
              <EllipsisVerticalIcon />
              <span className='sr-only'>Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {listItems.map((item, index) => (
                <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl font-semibold'>₹{earning}</span>
            <span className='flex items-center gap-1'>
              {trend === 'up' ? <ChevronUpIcon className='size-4' /> : <ChevronDownIcon className='size-4' />}
              <span className='text-sm'>{percentage}%</span>
            </span>
          </div>
          <span className='text-muted-foreground text-sm'>{comparisonText}</span>
        </div>
        <div className='w-full flex flex-1 items-start flex-col justify-start gap-6'>
          {earningData.map((earning, index) => (
            <div key={index} className='w-full flex flex-col items-start justify-start gap-2.5'>
              <div className='flex w-full items-center justify-between gap-2.5'>
                {/*<h4 className="p-2 text-lg">#{index+1}</h4>*/}
                <div className='flex justify-between w-full'>
                  <span className='font-medium'>{earning.platform}</span>
                  <span className='text-muted-foreground text-sm'>{earning.technologies}</span>
                </div>
              </div>
              <div className='w-full space-y-2'>
                <p className='text-sm'>{earning.earnings}</p>
                <Progress value={earning.progressPercentage} className='w-full' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TotalEarningCard
