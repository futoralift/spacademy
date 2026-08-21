import {
    SidebarInset,
    SidebarProvider
} from '@/components/ui/sidebar'

import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import AdminFooter from "@/pages/Footer.tsx";
import AdminHeader from "@/pages/Header.tsx";
import AdminOverview from "@/pages/admin/Overview.tsx";


const AdminDashboardPage = () => {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="overflow-hidden">
                <AdminHeader title="Dashboard" />
                <AdminOverview />
                <AdminFooter />
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AdminDashboardPage
