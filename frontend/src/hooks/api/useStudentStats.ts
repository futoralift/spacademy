import {useQuery} from "@tanstack/react-query";
import {fetchStudentStats} from "@/api/students/student-stats.ts";

export function useStudentStats() {
    return useQuery({
        queryKey: ["studentStats"],
        queryFn: fetchStudentStats,
        retry: false,
        staleTime: Infinity
    })
}