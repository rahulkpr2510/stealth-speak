import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function POST(request:Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !user){
        return Response.json(
            {
                success: false,
                message: "User not authenticated !!"
            },
            {
                status: 401
            }
        )
    }
    const userID = user._id
    const {acceptMessages} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            {isAcceptingMessages: !acceptMessages},
            {new: true}
        )

        if(!updatedUser){
            console.log("Failed to toggle the status of accepting messages")
            return Response.json(
                {
                    success: false,
                    message: "Failed to toggle the status of accepting messages"
                },
                {
                    status: 404
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Status of accepting messages toggled successfully"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error in toggling the status of accepting messages", error)
        return Response.json(
            {
                success: false,
                message: "Error in toggling the status of accepting messages"
            },
            {
                status: 500
            }
        )
    }
}

export async function GET(request:Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !user){
        return Response.json(
            {
                success: false,
                message: "User not authenticated !!"
            },
            {
                status: 401
            }
        )
    }

    const userID = user._id
    try {
        const foundUser = await UserModel.findById(userID)
    
        if(!foundUser){
            return Response.json(
                {
                    success: false,
                    message:"User not found !!"
                },
                {
                    status: 404
                }
            )
        }
    
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error in fetching the status of accepting messages", error)
        return Response.json(
            {
                success: false,
                message: "Error in fetching the status of accepting messages"
            },
            {
                status: 500
            }
        )
    }
}