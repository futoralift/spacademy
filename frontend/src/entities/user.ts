import {z} from "zod";

export const userObject = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    avatar: z.string(),
    role: z.enum(["student", "teacher", "admin"]),
});

export type userModel = z.infer<typeof userObject>;
