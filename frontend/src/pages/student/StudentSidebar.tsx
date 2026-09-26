import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboardIcon,
    UsersIcon,
    CalendarIcon,
    Book,
    TvMinimalPlay,
    FileText,
    Shield,
    BookOpen,
    ChevronRight,
} from 'lucide-react';
import { useCurrentUserQuery } from '@/api/authHooks';
import { useMyStudentInsightsQuery } from '@/api/userHooks';
import { Skeleton } from '@/components/ui/skeleton.tsx';

export default function StudentSidebar() {
    const location = useLocation();
    const { data: user } = useCurrentUserQuery();
    const { data: insight, isLoading } = useMyStudentInsightsQuery(user?.id, {
        enabled: !!user?.id,
    });

    const isActive = (path: string, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const enrolledCourses = (insight as any)?.courses ?? [];

    const staticItems = [
        { label: "Dashboard", href: "/dashboard/student/overview", icon: LayoutDashboardIcon, color: "text-indigo-500", exact: true },
        { label: "Lectures", href: "/dashboard/student/lectures", icon: CalendarIcon, color: "text-blue-500" },
    ];

    const libraryItems = [
        { label: "Learning Hub", href: "/dashboard/student/learning-hub", icon: TvMinimalPlay, color: "text-cyan-500" },
        { label: "Study Resources", href: "/dashboard/student/study-resources", icon: FileText, color: "text-teal-500" },
    ];

    const communityItems = [
        { label: "Instructors", href: "/dashboard/student/teachers", icon: UsersIcon, color: "text-emerald-500" },
    ];

    const renderItem = (item: { label: string; href: string; icon: any; color: string; exact?: boolean }) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={`
                        h-9 rounded-lg px-3 gap-3 font-medium text-sm transition-all duration-150
                        ${active
                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 rounded-l-none dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-400'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent rounded-l-none'
                        }
                    `}
                >
                    <Link to={item.href} className="flex items-center gap-3 w-full">
                        <span className={`flex-shrink-0 ${active ? 'text-blue-600' : item.color}`}>
                            <Icon className="size-4" />
                        </span>
                        <span className="truncate">{item.label}</span>
                        {active && <ChevronRight className="size-3 ml-auto text-blue-400 opacity-70" />}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    return (
        <Sidebar>
            {/* ── Logo Header ── */}
            <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="The Champions Academy Logo" className="w-9 h-9 rounded-full object-cover shadow-md" />
                    <div className="flex flex-col leading-none">
                        <span className="text-foreground font-bold text-sm tracking-wide">The Champions Academy</span>
                        <span className="text-muted-foreground text-[10px] font-medium">Student Portal</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 py-2">
                {/* Main nav */}
                <SidebarGroup className="py-1">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {staticItems.map(renderItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Enrolled Courses */}
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 px-3 mb-1">
                        My Courses
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <SidebarMenuItem key={i}>
                                        <div className="px-2 py-1">
                                            <Skeleton className="h-8 w-full rounded-lg" />
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            ) : enrolledCourses.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic">No courses enrolled yet</div>
                            ) : (
                                enrolledCourses.map(([id, name]: [string, string]) => {
                                    const isCourseActive = location.pathname.includes(`/dashboard/student/courses/${id}`);
                                    const courseActive = location.pathname === `/dashboard/student/courses/${id}`;
                                    return (
                                        <SidebarMenuItem key={id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={courseActive}
                                                className={`
                                                    h-9 rounded-lg px-3 gap-3 font-medium text-sm transition-all duration-150
                                                    ${courseActive
                                                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 rounded-l-none dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-400'
                                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent rounded-l-none'
                                                    }
                                                `}
                                            >
                                                <Link to={`/dashboard/student/courses/${id}`} className="flex items-center gap-3 w-full">
                                                    <span className={`flex-shrink-0 ${courseActive ? 'text-blue-600' : 'text-violet-500'}`}>
                                                        <Book className="size-4" />
                                                    </span>
                                                    <span className="truncate text-xs">{name}</span>
                                                </Link>
                                            </SidebarMenuButton>

                                            {isCourseActive && (
                                                <SidebarMenuSub className="border-l-2 border-blue-100 ml-6 pl-2 space-y-0.5 mt-1 dark:border-blue-900/40">
                                                    {[
                                                        { label: "Overview", path: `/dashboard/student/courses/${id}` },
                                                        { label: "Attendance", path: `/dashboard/student/courses/${id}/attendance` },
                                                        { label: "Performance", path: `/dashboard/student/courses/${id}/performance` },
                                                    ].map((sub) => (
                                                        <SidebarMenuSubItem key={sub.path}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={location.pathname === sub.path}
                                                                className="data-[active=true]:text-blue-600 data-[active=true]:font-bold text-xs"
                                                            >
                                                                <Link to={sub.path}>{sub.label}</Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Library */}
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 px-3 mb-1">
                        Library
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{libraryItems.map(renderItem)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Community */}
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 px-3 mb-1">
                        Community
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{communityItems.map(renderItem)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Portal Switcher Footer ── */}
            <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 px-2 mb-2">Switch Portal</p>
                <div className="flex flex-col gap-1">
                    <Link to="/dashboard/admin/overview"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <Shield className="size-3.5 text-indigo-500" /> Admin
                    </Link>
                    <Link to="/dashboard/teacher/overview"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <BookOpen className="size-3.5 text-emerald-500" /> Teacher
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
