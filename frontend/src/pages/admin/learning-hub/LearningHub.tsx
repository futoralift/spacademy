import { useState } from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { LearningHubContent } from "@/components/shared/learning-hub/LearningHubContent.tsx";
import AddVideoForm from "./AddVideoForm.tsx";
import {
    TvMinimalPlay,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider";

export default function AdminLearningHubPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Learning Hub"
            sidebar={<AdminSidebar />}
            bodyTitle="Learning Hub"
            description='Curate and manage educational video content'
            icon={<TvMinimalPlay className="size-6" />}
            bodyToolbar={
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search videos..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search videos"
                        />
                    </div>
                    <AddVideoForm />
                </div>
            }
        >
            <LearningHubContent searchTerm={searchTerm} />
        </DashboardLayoutProvider>
    )
}
