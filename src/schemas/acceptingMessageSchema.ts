import { z } from "zod";

export const acceptingMessageSchema = z.object({
    acceptingMessages: z.boolean()
})