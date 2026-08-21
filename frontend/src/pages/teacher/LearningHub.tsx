import { useState } from "react";
import TeacherSidebar from "@/pages/teacher/TeacherSidebar.tsx";
import { LearningHubContent } from "@/components/shared/learning-hub/LearningHubContent.tsx";
import {
    TvMinimalPlay,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider";

import AddVideoForm from "@/pages/admin/learning-hub/AddVideoForm.tsx";

export default function TeacherLearningHubPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Learning Hub"
            sidebar={<TeacherSidebar />}
            bodyTitle="Learning Hub"
            description='Library of educational content and short concepts'
            icon={<TvMinimalPlay className="size-6 text-primary" />}
            bodyToolbar={
                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search videos..."
                            className="pl-10 bg-white border-slate-200"
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
