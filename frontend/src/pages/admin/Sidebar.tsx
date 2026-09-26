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
    Files,
    GalleryVerticalEnd,
    Library,
    Megaphone,
    Presentation,
    SettingsIcon,
    SquarePen,
    TvMinimalPlay,
    UsersIcon,
    FileText,
    GraduationCap,
    MessageSquareQuote,
    MessageCircleQuestion,
    BookOpen,
    Shield,
    ChevronRight,
} from "lucide-react";

const menuItems = [
    {
        group: null,
        items: [
            {
                label: "Dashboard",
                href: "/dashboard/admin/overview",
                icon: LayoutDashboardIcon,
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
                exact: true,
            },
        ],
    },
    {
        group: "Management",
        items: [
            { label: "Announcements", href: "/dashboard/admin/announcements", icon: Megaphone, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Students", href: "/dashboard/admin/students", icon: UsersIcon, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Teachers", href: "/dashboard/admin/teachers", icon: UsersIcon, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Courses", href: "/dashboard/admin/courses", icon: Library, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Lectures", href: "/dashboard/admin/lectures", icon: Presentation, color: "text-pink-400", bg: "bg-pink-500/10" },
            { label: "Blogs", href: "/dashboard/admin/blogs", icon: SquarePen, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Learning Hub", href: "/dashboard/admin/learning-hub", icon: TvMinimalPlay, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Study Resources", href: "/dashboard/admin/study-resources", icon: Files, color: "text-teal-400", bg: "bg-teal-500/10" },
            { label: "Media Library", href: "/dashboard/admin/media-library", icon: GalleryVerticalEnd, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: MessageSquareQuote, color: "text-rose-400", bg: "bg-rose-500/10" },
            { label: "Enquiries", href: "/dashboard/admin/enquiries", icon: MessageCircleQuestion, color: "text-amber-400", bg: "bg-amber-500/10" },
        ],
    },
    {
        group: "Evaluation",
        items: [
            { label: "Assignments", href: "/dashboard/admin/assignments", icon: FileText, color: "text-lime-400", bg: "bg-lime-500/10" },
            { label: "Tests & Exams", href: "/dashboard/admin/tests", icon: GraduationCap, color: "text-red-400", bg: "bg-red-500/10" },
        ],
    },
    {
        group: "System",
        items: [
            { label: "Settings", href: "/dashboard/admin/settings", icon: SettingsIcon, color: "text-slate-400", bg: "bg-slate-500/10" },
        ],
    },
];

const portalLinks = [
    { label: "Admin", href: "/dashboard/admin/overview", icon: Shield, color: "text-indigo-400" },
    { label: "Teacher", href: "/dashboard/teacher/overview", icon: BookOpen, color: "text-emerald-400" },
    { label: "Student", href: "/dashboard/student/overview", icon: GraduationCap, color: "text-blue-400" },
];

export default function AdminSidebar() {
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
                        <span className="text-muted-foreground text-[10px] font-medium opacity-70">Admin Portal</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 py-2">
                {menuItems.map((section, si) => (
                    <SidebarGroup key={si} className="py-1">
                        {section.group && (
                            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-sidebar-foreground/40 px-3 mb-1">
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
                                                className="h-9 rounded-lg px-3 gap-3 font-medium text-sm transition-all duration-150
                                                    data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700
                                                    data-[active=true]:border-l-2 data-[active=true]:border-blue-500
                                                    border-l-2 border-transparent rounded-l-none
                                                    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                                                    dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-400 dark:data-[active=true]:border-blue-400"
                                            >
                                                <Link to={item.href} className="flex items-center gap-3 w-full">
                                                    <span className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : item.color}`}>
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
                <p className="text-[10px] uppercase tracking-widest font-bold text-sidebar-foreground/40 px-2 mb-2">Switch Portal</p>
                <div className="flex flex-col gap-1">
                    {portalLinks.map((p) => {
                        const PIcon = p.icon;
                        const active = location.pathname.startsWith(p.href.replace('/overview', ''));
                        return (
                            <Link
                                key={p.href}
                                to={p.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                                    ${active
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                    }
                                `}
                            >
                                <PIcon className={`size-3.5 ${p.color}`} />
                                {p.label}
                            </Link>
                        );
                    })}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}