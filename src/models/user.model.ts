import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: [true, "Message is required !!"],
        trim: true
    },
    createdAt: {
        type: Date,
    }
}, {timestamps: true})

export interface User extends Document{
    fullName: string;
    username: string;
    email: string;
    password: string;
    verificationCode: string;
    verificationCodeExpiry: Date;
    isAcceptingMessages: boolean;
    isVerified: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    fullName: {
        type: String,
        required: [true, "Full Name is required !!"],
        trim: true
    },
    username: {
        type: String,
        required: [true, "Username is required !!"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "Email is required !!"],
        unique: true,
        match: [/.+|@.+\..+/, "Please provide a valid email address !!"]
    },
    password: {
        type: String,
        required: [true, "Password is required !!"],
    },
    verificationCode: {
        type: String,
        required: [true, "Verification Code is required !!"],
    },
    verificationCodeExpiry: {
        type: Date,
        required: [true, "Verification Code Expiry is required !!"],
    },
    isAcceptingMessages: {
        type: Boolean,
        default: false, 
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    messages: [MessageSchema]
}, {timestamps: true})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User", UserSchema))

export default UserModel;