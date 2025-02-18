'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Message } from "@/models/user.model"
import { acceptingMessageSchema } from "@/schemas/acceptingMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

function Page() {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)
    const {toast} = useToast()

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }
    const {data: session} = useSession()
    const form = useForm<z.infer<typeof acceptingMessageSchema>>({
        resolver: zodResolver(acceptingMessageSchema),
        defaultValues: {
            acceptingMessages: false
        }
    })

    const {register, watch, setValue} = form
    const acceptingMessages = watch('acceptingMessages')

    const fetchAcceptMessage = useCallback(async() => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>("/api/accept-messages")
            setValue("acceptingMessages", response.data.isAcceptingMessages as boolean)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error("Error in getting the status of accepting messages", error)
            toast({
                title: "Error",
                description: axiosError.response?.data.message ?? "Something went wrong while getting the status of accepting messages",
                variant: "destructive"
            })
        } finally{
            setIsSwitchLoading(false)
        }
    }, [setValue])


    const fetchMessages = useCallback(async(refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])
            if(refresh){
                toast({
                    title: "Success",
                    description: "Messages fetched successfully"
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error("Error in fetching the messages", error)
            toast({
                title: "Error",
                description: axiosError.response?.data.message ?? "Something went wrong while fetching the messages",
                variant: "destructive"
            })
        } finally{
            setIsLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() => {
        if(!session || !session.user) return
        fetchMessages()
        fetchAcceptMessage()
    }, [session, setValue, fetchMessages, fetchAcceptMessage])

    const handleSwitchChange = async() => {
        try {
            const response = await axios.post<ApiResponse>("/api/accept-messages", {
                acceptMessages: acceptingMessages
            })
            console.log(response)
            setValue("acceptingMessages", !acceptingMessages)
            toast({
                title: "Success",
                description: response.data.message,
                variant: "default"
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error("Error in toggling the status of accepting messages", error)
            toast({
                title: "Error",
                description: axiosError.response?.data.message ?? "Something went wrong while toggling the status of accepting messages",
                variant: "destructive"
            })
        }
    }

    const {username} = session?.user as User
    const baseUrl = `${window.location.protocol}//${window.location.host}`
    const profileUrl = `${baseUrl}/user/${username}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast({
            title: "URL Copied",
            description: "Profile URL has been copied to clipboard"
        })
    }

    if(!session || !session.user){
        return <div>Please login</div>
    }

    return (
        <div className="my-8 mx-4 lg:mx-auto p-6 bg-white rounded-3xl shadow-2xl w-full max-w-6xl">
          <h1 className="text-4xl font-extrabold mb-4">User Dashboard</h1>
    
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Copy Your Unique Link</h2>{' '}
            <div className="flex items-center">
              <input
                type="text"
                value={profileUrl}
                disabled
                className="input input-bordered w-full p-2 mr-2 border rounded-xl"
              />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>
    
          <div className="mb-4">
            <Switch
              {...register('acceptingMessages')}
              checked={acceptingMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
            />
            <span className="ml-2">
              Accepting Messages: {acceptingMessages ? 'Yes' : 'No'}
            </span>
          </div>
          <Separator />
    
          <Button
            className="mt-4"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <MessageCard
                  key={message._id as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              ))
            ) : (
              <p>No messages to display.</p>
            )}
          </div>
        </div>
      )
}

export default Page