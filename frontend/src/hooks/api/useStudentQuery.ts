import type {PaginationParams} from "@/api/types.ts";
import {
    useCreateStudentMutation,
    useStudentsQuery,
} from "@/api/userHooks.ts";

export function useStudentQuery(params: PaginationParams = {}) {
    return useStudentsQuery(params);
}

export function useStudentCreateMutation() {
    return useCreateStudentMutation();
}
