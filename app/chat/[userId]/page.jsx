"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { io } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft } from "lucide-react"

export default function ChatPage() {
    const { userId } = useParams()
    const { user } = useAuth()
    const router = useRouter()

    const [targetUser, setTargetUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [socket, setSocket] = useState(null)
    const [roomId, setRoomId] = useState("")

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const fetchTargetUser = async () => {
            if (!user) {
                router.push('/login')
                return
            }
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (res.ok) {
                    const data = await res.json()
                    setTargetUser(data)
                }
            } catch (err) {
                console.error("Failed to fetch user", err)
            }
        }
        fetchTargetUser()
    }, [userId, user, router])

    useEffect(() => {
        if (!user || !targetUser) return

        // Create a stable room ID from both user IDs
        const room = [user.id || user._id, targetUser._id].sort().join('-')
        setRoomId(room)

        const newSocket = io("http://localhost:5000")

        newSocket.on("connect", () => {
            newSocket.emit("join_room", room)
        })

        newSocket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data])
        })

        setSocket(newSocket)

        // Fetch previous messages
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`http://localhost:5000/api/messages/${room}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setMessages(data)
                }
            } catch (err) {
                console.error("Failed to fetch messages", err)
            }
        }
        fetchMessages()

        return () => {
            newSocket.disconnect()
        }
    }, [user, targetUser])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !socket || !user) return

        const messageData = {
            roomId,
            message: newMessage,
            senderId: user.id || user._id,
            timestamp: new Date().toISOString()
        }

        socket.emit("send_message", messageData)
        setNewMessage("")
    }

    if (!user || !targetUser) {
        return (
            <div className="container py-16 flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container py-8 max-w-3xl">
            <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team Finder
            </Button>

            <Card className="h-[70vh] flex flex-col border-border bg-card">
                <CardHeader className="border-b border-border pb-4 flex flex-row items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={targetUser.avatar || "/placeholder.svg"} alt={targetUser.name} />
                        <AvatarFallback>{targetUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{targetUser.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-1">{targetUser.bio || "No bio"}</p>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="text-center text-xs text-muted-foreground my-4">
                        Started secure chat with {targetUser.name}
                    </div>

                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === (user.id || user._id)
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted rounded-tl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </CardContent>

                <CardFooter className="p-4 border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-input"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}
