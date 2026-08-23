import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useSiteSettingsQuery } from "@/api/academyHooks";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/course" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Subscription", href: "/subscription" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { data: settings } = useSiteSettingsQuery();
    const academyName = settings?.academyName || "SF Academy";

    const isActive = (path: string) => {
        if (path === "/" && location.pathname !== "/") return false;
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md dark:bg-brand-dark/90 transition-colors">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="SF Academy Logo" className="w-11 h-11 rounded-full object-cover shadow-md" />
                    <span className="font-sans font-bold text-base tracking-wide text-gray-900 dark:text-white">SF Academy</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={cn(
                                "relative text-sm font-semibold transition-all duration-300 py-2 px-1 font-sans",
                                isActive(link.href)
                                    ? "text-brand-primary dark:text-brand-secondary font-bold"
                                    : "text-muted-foreground hover:text-brand-primary dark:hover:text-white"
                            )}
                        >
                            {link.name}
                            {isActive(link.href) && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-secondary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button className="cursor-pointer text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary/90 px-6 h-11 shadow-md transition-all duration-300 flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile Navigation */}
                <div className="lg:hidden flex items-center gap-2">
                    <ModeToggle />
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-brand-dark dark:text-white">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-75 sm:w-100 bg-brand-bg dark:bg-brand-dark">
                            <div className="flex flex-col gap-6 py-4">
                                <SheetTitle className="text-left font-serif text-2xl text-brand-dark dark:text-white">Navigation</SheetTitle>
                                <SheetDescription className="text-left">
                                    Access all sections of {academyName}.
                                </SheetDescription>
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center justify-between text-lg font-bold transition-all p-3",
                                                isActive(link.href)
                                                    ? "bg-brand-primary/10 text-brand-primary dark:text-brand-secondary"
                                                    : "hover:bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {link.name}
                                            {isActive(link.href) && (
                                                <div className="size-2 rounded-full bg-brand-secondary" />
                                            )}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                                    <Link to="/dashboard/admin/overview" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full flex items-center justify-center gap-2 h-12 bg-brand-primary text-white">
                                            <UserIcon className="h-4 w-4" />
                                            Admin Dashboard
                                        </Button>
                                    </Link>
                                    <Link to="/dashboard/teacher/overview" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-border text-brand-dark dark:text-white">
                                            Teacher Dashboard
                                        </Button>
                                    </Link>
                                    <Link to="/dashboard/student/overview" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-border text-brand-dark dark:text-white">
                                            Student Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
