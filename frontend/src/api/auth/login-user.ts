import {apiRequest, type ResponseModel, type TokenResponse} from "@/api";
import type {loginRequestModel} from "@/entities/login.ts";

export async function loginUser(credentials: loginRequestModel): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email)
    formData.append("password", credentials.password)
    return apiRequest<TokenResponse>(`/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });
}

export async function logoutUser(): Promise<ResponseModel> {
    return apiRequest<ResponseModel>(`/auth/logout`, {
        method: "GET",
    });
}
