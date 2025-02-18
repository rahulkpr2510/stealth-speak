import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(6, "Username should be of atleast 6 characters !!")
    .max(20, "Username should be of atmost 20 characters !!")
    .regex(/^[a-zA-Z0-9_]+$/, "Username cannot contain special characters !!")

export const signUpSchema = z.object({
    fullName: z.string().regex(/^[a-zA-Z]+$/, {message:"Full Name cannot contain numbers or special characters"}),
    username: usernameValidation,
    email: z.string().email({message: "Invalid email address !!"}),
    password: z.string().min(6, {message: "Password must be atleast 6 characters !!"})
})