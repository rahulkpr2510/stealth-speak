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
    return new Response(
      JSON.stringify({
        success: false,
        message: "User not authenticated !!",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Extract messageid from the request URL
  const url = new URL(request.url);
  const messageid = url.pathname.split("/").pop(); // Get last part of URL

  if (!messageid) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Message ID is missing in the request URL !!",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const updatedResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updatedResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Message not found or already deleted !!",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message deleted successfully !!",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    console.error("Error in deleting the message", error);

    return new Response(
      JSON.stringify({
        success: false,
        message:
          axiosError.response?.data.message ||
          "Something went wrong while deleting the message !!",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
