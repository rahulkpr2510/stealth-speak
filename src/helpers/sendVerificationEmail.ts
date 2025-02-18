import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendverificationEmail(
    email: string,
    username: string,
    verificationCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "no-reply@stealthspeak.xyz",
            to: email,
            subject: "StealthSpeak | Verification Code",
            react: VerificationEmail({ username, otp: verificationCode })
        })
        return{
            success: true,
            message: "Verification email sent successfully"
        }
    } catch (emailError) {
        console.error("Error sending verification email", emailError)
        return {
            success: false,
            message: "Failed to send verification email"
        }
    }
}