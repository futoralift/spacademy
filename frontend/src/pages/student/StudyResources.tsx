import { useState } from "react";
import StudentSidebar from "@/pages/student/StudentSidebar.tsx";
import { StudyResourcesContent } from "@/components/shared/study-resources/StudyResourcesContent.tsx";
import {
    FileText,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import DashboardLayoutProvider from '@/pages/DashboardLayoutProvider.tsx';

export default function StudentStudyResourcesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Study Resources"
            sidebar={<StudentSidebar />}
            description="Access your course materials and study references"
            icon={<FileText className="size-6 text-primary" />}
            bodyTitle='Study Resources'
            bodyToolbar={
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search resources..."
                            className="pl-10 bg-white border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search resources"
                        />
                    </div>
                </div>
            }
        >
            <StudyResourcesContent searchTerm={searchTerm} />
        </DashboardLayoutProvider>
    )
}
