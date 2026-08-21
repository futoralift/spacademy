import {useQuery} from "@tanstack/react-query";
import {getCourses} from "@/api/courses/course.ts";

export function useCourses() {
    return useQuery({
        queryKey: ["courses"],
        queryFn: getCourses,
        staleTime: Infinity,
        refetchOnWindowFocus: false
    });
}