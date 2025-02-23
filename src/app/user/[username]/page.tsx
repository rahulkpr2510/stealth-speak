'use client'
import { useToast } from "@/hooks/use-toast"
import { messageSchema } from "@/schemas/messageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

const specialChar = "||"
const parseStringMessage = (message: string): string[] => {
    return message.split(specialChar)
}

const initialMessageString = "What's your favorite movie?||Do you have any pets?||What's your dream job?"

function PublicProfile() {
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    const { toast } = useToast()
    const params = useParams<{ username: string }>()
    
    const [completion, setCompletion] = useState(initialMessageString)
    const [isSuggestLoading, setIsSuggestLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: ""
        }
    })

    const messageContent = form.watch('content')

    const handleMessageClick = (message: string) => {
        form.setValue('content', message)
    }

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsSendingMessage(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/send-message`, {
                username: params.username,
                content: data.content
            })
            toast({
                title: "Success",
                description: response.data.message
            })
            form.reset({ ...form.getValues(), content: "" })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error("Error in sending message", error)
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Something went wrong while sending message",
                variant: "destructive"
            })
        } finally {
            setIsSendingMessage(false)
        }
    }

    const generateMessage = async () => {
        setIsSuggestLoading(true)
        setError(null)
        try {
            const response = await axios.post("/api/suggest-messages")
            if (response.data) {
                setCompletion(response.data)
            }
        } catch (error) {
            console.error('Error fetching messages', error)
            setError("Failed to generate suggested messages. Please try again.")
        } finally {
            setIsSuggestLoading(false)
        }
    }

    return (
        <div className="container mx-auto my-8 p-6 bg-white rounded-3xl shadow-2xl max-w-4xl">
            <h1 className="text-4xl font-extrabold mb-6 text-center">
                Public Profile Link
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Send Anonymous Message to @{params.username}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write your anonymous message here"
                                        className="resize-none border-black/[0.25] rounded-2xl"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                        {isSendingMessage ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSendingMessage || !messageContent}>
                                Send Message
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
            <Separator className="my-6" />

            <div className="space-y-4 my-8">
                <div className="space-y-2">
                    <p>Select any message below by clicking on it.</p>
                </div>
                <Card>
                    <CardHeader>
                        <h3 className="text-xl font-semibold text-center">Suggested Messages</h3>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4 items-center">
                        {error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            parseStringMessage(completion).map((message, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="mb-2 border-black/[0.25] border-2 rounded-2xl text-center break-words whitespace-normal px-6 py-3 h-auto"
                                    onClick={() => handleMessageClick(message)}
                                >
                                    {message}
                                </Button>
                            ))
                        )}
                    </CardContent>
                </Card>
                <div className="flex justify-center">
                    <Button
                        onClick={generateMessage}
                        className="my-4"
                        disabled={isSuggestLoading}
                    >
                        Suggest Some More Messages
                    </Button>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center">
                <div className="mb-4">Get Your Own Stealth Board</div>
                <Link href={'/sign-up'}>
                    <Button>Create Account</Button>
                </Link>
            </div>
        </div>
    )
}

export default PublicProfile