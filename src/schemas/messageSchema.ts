import { z } from "zod";

export const messageSchema = z.object({
    content: z
    .string()
    .min(10, {message: "Message should be of atleast 10 characteres"})
    .max(300, {message: "Message should be atleast 300 characters"})
})