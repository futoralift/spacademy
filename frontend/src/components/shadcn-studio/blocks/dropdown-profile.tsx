import type { ReactNode } from 'react'

import {
  UserIcon,
  CreditCardIcon,
  LogOutIcon,
  CalendarDaysIcon
} from 'lucide-react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {useLogoutMutation} from "@/api";
import { Link } from 'react-router-dom'

type Props = {
  name: string
  avatar: string
  role: string
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ name, role, avatar, trigger, defaultOpen, align = 'end' }: Props) => {
  const logout = useLogoutMutation();

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align={align || 'end'}>
        <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
          <div className='relative'>
            <Avatar className='size-10'>
              <AvatarImage src={avatar} alt='John Doe' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <span className='text-foreground text-lg font-semibold'>{name}</span>
            <span className='text-muted-foreground text-base'>{role}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className='px-4 py-2.5 text-base'>
            <Link to={
              role === 'admin' ? '/dashboard/admin/profile' : 
              role === 'teacher' ? '/dashboard/teacher/profile' : 
              role === 'student' ? '/dashboard/student/profile' : 
              '#'
            }>
              <UserIcon className='text-foreground size-5' />
              <span>My account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className='px-4 py-2.5 text-base'>
            <Link to={
              role === 'admin' ? '/dashboard/admin/lectures' : 
              role === 'teacher' ? '/dashboard/teacher/lectures' : 
              role === 'student' ? '/dashboard/student/lectures' :
              '#'
            }>
              <CalendarDaysIcon className='text-foreground size-5' />
              <span>Timetable</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 mx-4" />
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <CreditCardIcon className='text-foreground size-5' />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => {
          logout.mutate()
        }} variant='destructive' className='px-4 py-2.5 text-base'>
          <LogOutIcon className='size-5' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
