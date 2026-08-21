import {useQuery} from "@tanstack/react-query";
import {getMe} from "@/api/auth/get-me.ts";
import {type userModel} from "@/entities/user.ts";

const mockUser: userModel = {
    id: "mock-admin-id",
    firstName: "Admin",
    lastName: "User",
    email: "admin@sfacademy.com",
    avatar: "/images/logo.png",
    role: "admin",
};

export function useCurrentUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            try {
                return await getMe();
            } catch {
                return mockUser;
            }
        },
        initialData: mockUser,
        retry: false,
        staleTime: Infinity
    })
}