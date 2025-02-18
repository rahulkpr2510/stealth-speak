import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendverificationEmail } from "@/helpers/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    await dbConnect();
    try {
        const {fullName, username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifiedByUsername){
            return NextResponse.json(
                {
                    success: false,
                    message: "This username is already taken !!"
                },
                {
                    status: 400
                }
            )
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return NextResponse.json(
                    {
                        success: false,
                        message: "This email is already registered !!"
                    },
                    {
                        status: 400
                    }
                )
            }else{
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verificationCode = verificationCode
                existingUserByEmail.verificationCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        }else{
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)


            const newUser = new UserModel({
                fullName,
                username,
                email,
                password: hashedPassword,
                verificationCode,
                verificationCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: false,
                messages: []
            })
            await newUser.save()
        }

        const emailResponse = await sendverificationEmail(
            email,
            username,
            verificationCode
        )

        if(!emailResponse.success){
            return NextResponse.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully. Please check your email to verify your account"
            }, 
            {
                status: 201
            }
        )
    } catch (error) {
        console.error("Error in registering the user", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error in registering the user"
            },
            {
                status: 500
            }
        )
    }
}