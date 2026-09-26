import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import ProfileDropdown from "@/components/shadcn-studio/blocks/dropdown-profile.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { useCurrentUser } from "@/hooks/useCurrentUser.ts";
import { Shield, BookOpen, GraduationCap, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
    title: string;
}

const portals = [
    { label: "Home", href: "/", icon: Home, color: "text-slate-500" },
    { label: "Admin", href: "/dashboard/admin/overview", icon: Shield, color: "text-indigo-500" },
    { label: "Teacher", href: "/dashboard/teacher/overview", icon: BookOpen, color: "text-emerald-500" },
    { label: "Student", href: "/dashboard/student/overview", icon: GraduationCap, color: "text-blue-500" },
];

export default function Header({ title }: HeaderProps) {
    const admin = useCurrentUser();
    const location = useLocation();

    const user = admin.data;

    const getActivePortal = () => {
        if (location.pathname.startsWith('/dashboard/admin')) return '/dashboard/admin/overview';
        if (location.pathname.startsWith('/dashboard/teacher')) return '/dashboard/teacher/overview';
        if (location.pathname.startsWith('/dashboard/student')) return '/dashboard/student/overview';
        return '/';
    };

    const activePortal = getActivePortal();

    return (
        <header className="bg-card/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/60">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
                {/* Left: Trigger + Title */}
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="[&_svg]:size-5! text-muted-foreground hover:text-foreground transition-colors" />
                    <div className="hidden sm:flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">The Champions Academy</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="font-semibold text-foreground">{title}</span>
                    </div>
                </div>

                {/* Center: Portal Switcher */}
                <div className="hidden md:flex items-center gap-0.5 bg-muted/70 p-1 rounded-xl border border-border/50">
                    {portals.map((p) => {
                        const PIcon = p.icon;
                        const active = activePortal === p.href || (p.href === '/' && !location.pathname.startsWith('/dashboard'));
                        return (
                            <Link key={p.href} to={p.href}>
                                <button
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer
                                        ${active
                                            ? 'bg-white dark:bg-card shadow-sm text-foreground border border-border/60'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/60'
                                        }
                                    `}
                                >
                                    <PIcon className={`size-3.5 ${active ? p.color : ''}`} />
                                    {p.label}
                                </button>
                            </Link>
                        );
                    })}
                </div>

                {/* Right: Toggle + Avatar */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    {user && (
                        <ProfileDropdown
                            name={`${user.firstName} ${user.lastName}`}
                            role={user.role}
                            avatar={user.avatar}
                            trigger={
                                <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-muted">
                                    <Avatar className="size-8 rounded-lg ring-2 ring-primary/20">
                                        <AvatarImage src={user.avatar} alt="avatar" />
                                        <AvatarFallback className="rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>
        </header>
    );
}