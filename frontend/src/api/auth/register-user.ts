import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/api/http";
import { registerRequestSchema, type RegisterRequestModel } from "@/entities/register";
import type { ResponseModel, TokenResponse } from "@/api/types";

interface RequestOptions {
    signal?: AbortSignal;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export async function registerUser(
    payload: RegisterRequestModel,
    options?: RequestOptions,
): Promise<ResponseModel> {
    const requestBody = registerRequestSchema.parse(payload);

    const response = await apiRequest<ResponseModel>("/auth/register", {
        method: "POST",
        body: requestBody,
        signal: options?.signal,
    });

    if (response.code == "Created") {
        return apiRequest<ResponseModel>(`/auth/otp/request?email=${encodeURIComponent(payload.email)}`, {
            method: "POST",
        })
    }

    return response;
}

export async function requestSignupOtp(email: string): Promise<ResponseModel> {
    return apiRequest<ResponseModel>(`/auth/otp/request?email=${encodeURIComponent(email)}`, {
        method: "POST",
    });
}

interface SignupOtpVerifyResponse {
    loginToken: string;
}

export async function verifyOtp({ email, otp }: VerifyOtpPayload) {
    return apiRequest<SignupOtpVerifyResponse>(`/auth/otp/verify`, {
        method: "POST",
        body: { email, otp },
    });
}

export async function signupTokenLogin(token: string): Promise<TokenResponse> {
    return apiRequest<TokenResponse>(`/auth/token_login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
        },
    });
}

export function useRegisterUserMutation() {
    return useMutation({
        mutationFn: (payload: RegisterRequestModel) => registerUser(payload),
    });
}

export function useVerifySignupOtpMutation() {
    return useMutation({
        mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    });
}

export function useRequestSignupOtpMutation() {
    return useMutation({
        mutationFn: (email: string) => requestSignupOtp(email),
    });
}
