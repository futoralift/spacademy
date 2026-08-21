import {z} from "zod";

export const courseModeSchema = z.enum(["offline", "online"]);

export const courseResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    standards: z.array(z.string()),
    image: z.string(),
    highlights: z.array(z.string()),
    isActive: z.boolean(),
    isPaid: z.boolean(),
    mode: courseModeSchema,
    amount: z.number().nullable(),
    currency: z.string(),
});

export type CourseResponseModel = z.infer<typeof courseResponseSchema>;
