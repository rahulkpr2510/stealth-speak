'use client'
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import {useDebounceCallback} from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, {AxiosError} from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpForm() {
    const [username, setUsername] = useState<string>("");
    const [usernameMessage, setUsernameMessage] = useState("")
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debounced = useDebounceCallback(setUsername, 300)
    const {toast} = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: ""
        }
    })

    useEffect(() => {
        const checkUsernameUniqueness = async() => {
            if(username){
                setIsCheckingUsername(true)
                setUsernameMessage("")
            try {
                const response = await axios.get(`/api/check-username-unique?username=${username}`)
                setUsernameMessage(response.data.message)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                setUsernameMessage(axiosError.response?.data.message || "Something went wrong while checking username !!")
            }finally{
                setIsCheckingUsername(false)
            }
        }
    }
        checkUsernameUniqueness()
    }, [username])

    const onSubmit = async(data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data)
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
            router.replace(`/verify/${username}`)
        } catch (error) {
            console.error("Error in signing up the user", error)
            const axiosError = error as AxiosError<ApiResponse>
            const errorMessage  = axiosError.response?.data.message || "Something went wrong while signing up the user !!"
            toast({
                title: "SignUp Failed !!",
                description: errorMessage,
                variant: "destructive"
            })
        }finally{
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Stealth Speak
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        name="fullName"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Full Name" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField
                        name="username"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Username" 
                                    {...field} 
                                    onChange={(e) => {
                                        field.onChange(e) 
                                        debounced(e.target.value)
                                        }}
                                    />
                                </FormControl>
                                {isCheckingUsername && <Loader2 className="animate-spin"/>}
                                {!isCheckingUsername && usernameMessage && (
                                    <p className={`text-sm ${usernameMessage === "This username is available !!" ? "text-green-500" : "text-red-500"}`}>
                                        {usernameMessage}
                                    </p>
                                )}
                            </FormItem>
                        )}
                        />
                        <FormField
                        name="email"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email" {...field}/>
                                </FormControl>
                                <p className="text-gray-400 text-sm">We will send you a verification code</p>
                            </FormItem>
                        )}
                        />
                        <FormField
                        name="password"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Password" type="password" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Please Wait
                                </>
                            ) : ("Sign Up")}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}