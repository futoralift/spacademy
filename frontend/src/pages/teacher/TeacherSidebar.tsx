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
} from '@/components/ui/sidebar'
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboardIcon,
    UsersIcon,
    CalendarIcon,
    BookOpenIcon,
    ClipboardListIcon,
    GraduationCapIcon,
    TvMinimalPlay,
    FileText,
    Shield,
    ChevronRight,
} from "lucide-react";

const menuItems = [
    {
        group: null,
        items: [
            { label: "Dashboard", href: "/dashboard/teacher/overview", icon: LayoutDashboardIcon, color: "text-indigo-500", exact: true },
        ],
    },
    {
        group: "Academic",
        items: [
            { label: "Lectures", href: "/dashboard/teacher/lectures", icon: CalendarIcon, color: "text-blue-500" },
            { label: "My Students", href: "/dashboard/teacher/students", icon: UsersIcon, color: "text-emerald-500" },
            { label: "Subjects", href: "/dashboard/teacher/subjects", icon: BookOpenIcon, color: "text-violet-500" },
        ],
    },
    {
        group: "Library",
        items: [
            { label: "Learning Hub", href: "/dashboard/teacher/learning-hub", icon: TvMinimalPlay, color: "text-cyan-500" },
            { label: "Study Resources", href: "/dashboard/teacher/study-resources", icon: FileText, color: "text-teal-500" },
        ],
    },
    {
        group: "Evaluation",
        items: [
            { label: "Assignments", href: "/dashboard/teacher/assignments", icon: ClipboardListIcon, color: "text-orange-500" },
            { label: "Tests & Exams", href: "/dashboard/teacher/tests", icon: GraduationCapIcon, color: "text-red-500" },
        ],
    },
];

export default function TeacherSidebar() {
    const location = useLocation();

    const isActive = (href: string, exact = false) => {
        if (href === '#') return false;
        if (exact) return location.pathname === href;
        return location.pathname.startsWith(href);
    };

    return (
        <Sidebar>
            {/* ── Logo Header ── */}
            <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="The Champions Academy Logo" className="w-9 h-9 rounded-full object-cover shadow-md" />
                    <div className="flex flex-col leading-none">
                        <span className="text-foreground font-bold text-sm tracking-wide">The Champions Academy</span>
                        <span className="text-muted-foreground text-[10px] font-medium">Teacher Portal</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 py-2">
                {menuItems.map((section, si) => (
                    <SidebarGroup key={si} className="py-1">
                        {section.group && (
                            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 px-3 mb-1">
                                {section.group}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href, (item as any).exact);
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
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* ── Portal Switcher Footer ── */}
            <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 px-2 mb-2">Switch Portal</p>
                <div className="flex flex-col gap-1">
                    <Link to="/dashboard/admin/overview"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <Shield className="size-3.5 text-indigo-500" /> Admin
                    </Link>
                    <Link to="/dashboard/student/overview"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <GraduationCapIcon className="size-3.5 text-blue-500" /> Student
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
