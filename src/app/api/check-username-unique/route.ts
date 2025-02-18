import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    try {
        const {searchParams} = new URL(request.url)
        const queryParams = {
            username: searchParams.get("username")
        }

        const result = UsernameQuerySchema.safeParse(queryParams)
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid Query Parameters !!"
                },
                {
                    status: 400
                }
            )
        }

        const {username} = result.data
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
        if(existingVerifiedUser){
            return Response.json(
                {
                    success: false,
                    message: "This username is already taken !!"
                },
                {
                    status: 400
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "This username is available !!"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Error in checking username", error)
        return Response.json(
            {
                success: false,
                message: "Error in checking username"
            },
            {
                status: 500
            }
        )
    }
}