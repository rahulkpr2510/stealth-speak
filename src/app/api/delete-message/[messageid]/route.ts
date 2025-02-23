import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/models/user.model";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as User | null;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "User not authenticated !!",
      },
      {
        status: 401,
      }
    )
  }

  const url = new URL(request.url);
  const messageid = url.pathname.split("/").pop(); 

  if (!messageid) {
    return Response.json(
      {
        success: false,
        message: "Message not found !!",
      },
      {
        status: 404,
      }
    )
  }

  try {
    const updatedResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updatedResult.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted !!",
        },
        {
          status: 404,
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully !!",
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    console.error("Error in deleting the message", error);

    return Response.json(
      {
        success: false,
        message: axiosError.response?.data.message || "Something went wrong while deleting the message !!",
      },
      {
        status: 500,
      }
    )
  }
}
