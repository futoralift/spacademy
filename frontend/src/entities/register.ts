import {z} from "zod";

export const registerRequestSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.email("Enter a valid email address"),
    phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/,"Enter a valid phone number (international format preferred)"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const registerSchema = registerRequestSchema.extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterRequestModel = z.infer<typeof registerRequestSchema>;
