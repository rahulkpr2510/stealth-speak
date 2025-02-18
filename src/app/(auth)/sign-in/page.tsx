'use client'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { signInSchema } from "@/schemas/signInSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignIn(){
    const router = useRouter()
    const {toast} = useToast()

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })

    const onSubmit = async(data: z.infer<typeof signInSchema>) => {
        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier,
            password: data.password
        })

        if(result?.error){
            if(result.error === "CredentialsSignin"){
                toast({
                    title: "Login Failed !!",
                    description: "Incorrect username or password",
                    variant: "destructive"
                })
            }else{
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                })
            }
        }

        if(result?.url){
            router.replace("/dashboard")
        }
    }

    return(
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className=" w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Welcome Back to Stealth Speak
                    </h1>
                    <p className="mb-4">Sign in to continue your secret conversations</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        name="identifier"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email or Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email or Username" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Password" type="password" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full">Login</Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Not a member yet?{" "}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}