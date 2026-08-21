import { z } from "zod";

export const loginRequestSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string(),
});

export type loginRequestModel = z.infer<typeof loginRequestSchema>;
