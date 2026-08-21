import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx'
import Header from "@/pages/Header.tsx";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import DashboardFooter from "@/pages/Footer.tsx";

interface DashboardLayoutProps extends DashboardBodyProps {
    pageTitle: string;
    sidebar: ReactNode;
}

export default function DashboardLayoutProvider({ pageTitle, sidebar, ...bodyProps }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            {sidebar}
            <SidebarInset className="overflow-hidden">
                <Header title={pageTitle} />
                <DashboardBody {...bodyProps}>
                    {bodyProps.children}
                </DashboardBody>
                <DashboardFooter />
            </SidebarInset>
        </SidebarProvider>
    );
}

interface DashboardBodyProps {
    bodyTitle?: string;
    description?: string;
    icon?: ReactNode;
    bodyToolbar?: ReactNode;
    children: ReactNode;
}

function DashboardBody({ bodyTitle, description, icon, bodyToolbar, children }: DashboardBodyProps) {
    const hasHeader = bodyTitle || description || icon || bodyToolbar;

    return (
        <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
            <div className='flex flex-col items-start gap-5'>
                {hasHeader && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
                                    {isValidElement(icon)
                                        ? cloneElement(icon as ReactElement<{ className?: string }>, {
                                            className: "size-6",
                                        })
                                        : icon}
                                </div>
                            )}
                            <div>
                                {bodyTitle && (
                                    <h1 className="text-xl font-semibold">
                                        {bodyTitle}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {bodyToolbar && (
                                bodyToolbar
                            )}
                        </div>
                    </div>
                )}
                {children}
            </div>
        </main>
    );
}