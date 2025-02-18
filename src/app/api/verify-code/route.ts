import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
    await dbConnect()
    try {
        const {username, verificationCode} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})

        if(!user){
            console.log("User not found")
            return Response.json(
                {
                    sucess: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        const isVerificationCodeCorrect = verificationCode === user.verificationCode
        const isVerificationCodeValid = new Date(user.verificationCodeExpiry) > new Date()

        if(isVerificationCodeCorrect && isVerificationCodeValid){
            user.isVerified = true
            await user.save()
            console.log("User verified successfully")
            return Response.json(
                {
                    success: true,
                    message: "User verified successfully"
                }, 
                {
                    status: 200
                }
            )
        }else if (!isVerificationCodeValid){
            console.log("Verification code expired, request new one by signing up again")
            return Response.json(
                {
                    success: false,
                    message: "Verification code expired, request new one by signing up again"
                },
                {
                    status: 400
                }
            )
        } else{
            console.log("Invalid verification code")
            return Response.json(
                {
                    success: false,
                    message: "Invalid verification code"
                }, 
                {
                    status: 400
                }
            )
        }
    } catch (error) {
        console.error("Error in verifying code", error)
        return Response.json(
            {
                sucess: false,
                message: "Failed to verify code"
            },
            {
                status: 500
            }
        )
    }
}