import { useState } from "react";
import TeacherSidebar from "@/pages/teacher/TeacherSidebar.tsx";
import { StudyResourcesContent } from "@/components/shared/study-resources/StudyResourcesContent.tsx";
import {
    FileText,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import DashboardLayoutProvider from '@/pages/DashboardLayoutProvider.tsx';

import AddResourceForm from "@/pages/admin/study-resources/AddResourceForm.tsx";

export default function TeacherStudyResourcesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DashboardLayoutProvider
            pageTitle="Study Resources"
            sidebar={<TeacherSidebar />}
            description="Access and review shared study materials and references"
            icon={<FileText className="size-6 text-primary" />}
            bodyTitle='Study Resources'
            bodyToolbar={
                <div className="flex items-center gap-4">
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
                    <AddResourceForm />
                </div>
            }
        >
            <StudyResourcesContent searchTerm={searchTerm} />
        </DashboardLayoutProvider>
    )
}
