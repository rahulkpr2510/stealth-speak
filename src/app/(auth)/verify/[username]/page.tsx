'use client'
import { useToast } from '@/hooks/use-toast'
import { verificationSchema } from '@/schemas/verificationSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from "zod"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'

function VerifyAccount() {
    const router = useRouter()
    const params = useParams<{username: string}>()
    const {toast} = useToast()
    const form = useForm<z.infer<typeof verificationSchema>>({
        resolver: zodResolver(verificationSchema)
    })

    const onSubmit = async(data: z.infer<typeof verificationSchema>) => {
        try {
            const response = await axios.post<ApiResponse>(`/api/verify-code`, {
                username: params.username,
                verificationCode: data.verificationCode
            })
            if(response.data.success){
                toast({
                    title: "Success",
                    description: response.data.message
                })
            }else{
                toast({
                    title: "Error",
                    description: response.data.message
                })
            }
            router.replace('/sign-in')
        } catch (error) {
            console.error("Error in verifying the user", error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message || "Something went wrong while verifying the user !!"
            toast({
                title: "Verification Failed !!",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl'>
                <div className='text-center'>
                    <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>Verify your Account</h1>
                    <p className='mb-4'>Enter the verification code sent on your email to verify your account</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 justify-center items-center'>
                    <FormField
                    name="verificationCode"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className='items-center'>
                            <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                            </InputOTP>
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className='w-full'>Verify</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default VerifyAccount