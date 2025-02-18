import { z } from "zod";

export const verificationSchema = z.object({
    verificationCode: z.string().length(6, "Verification Code must be of 6 digits !!")
})