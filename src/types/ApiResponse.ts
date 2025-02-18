import { Message } from "@/models/message.model";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>
}