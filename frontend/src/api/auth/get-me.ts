import {apiRequest} from "@/api";
import {type userModel} from "@/entities/user.ts";

export async function getMe(): Promise<userModel> {
    return apiRequest<userModel>("/auth/me", {
        method: "GET",
    }, true)
}
