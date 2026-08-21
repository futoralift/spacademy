import { useState } from "react";
import StudentSidebar from "@/pages/student/StudentSidebar.tsx";
import { LearningHubContent } from "@/components/shared/learning-hub/LearningHubContent.tsx";
import {
    TvMinimalPlay,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import DashboardLayoutProvider from "@/pages/DashboardLayoutProvider";

export default function StudentLearningHubPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Learning Hub"
            sidebar={<StudentSidebar />}
            bodyTitle="Learning Hub"
            description='Discover educational videos and short concepts'
            icon={<TvMinimalPlay className="size-6 text-primary" />}
            bodyToolbar={
                <div className="flex items-center gap-3">
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
                </div>
            }
        >
            <LearningHubContent searchTerm={searchTerm} />
        </DashboardLayoutProvider>
    )
}
