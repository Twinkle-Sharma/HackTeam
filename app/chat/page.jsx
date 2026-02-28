"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Loader2, Users, ChevronLeft } from "lucide-react"


import { cn } from "@/lib/utils"
import { API_URL } from "@/lib/constants"
import { io } from "socket.io-client"

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get("teamId")
  const userIdFromQuery = searchParams.get("userId")
  const { user, loading: authLoading } = useAuth()


  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTeamSidebar, setShowTeamSidebar] = useState(false)

  const messagesEndRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }

  }, [user, authLoading, router])


  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return
      try {
        const token = localStorage.getItem('token')
        const currentUserId = user.id || user._id
        const res = await fetch(`${API_URL}/api/chat/conversations/${currentUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          let updatedConversations = [...data]

          if (userIdFromQuery) {
            const roomId = [currentUserId, userIdFromQuery].sort().join('-')
            const existing = data.find(c => c.id === roomId)

            if (existing) {
              setSelectedConversation(roomId)
            } else {
              const userRes = await fetch(`${API_URL}/api/users/${userIdFromQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              if (userRes.ok) {
                const targetUser = await userRes.json()
                const newConv = {
                  id: roomId,
                  name: targetUser.name,
                  isTeam: false,
                  participants: [targetUser.name],
                  lastMessage: "Start a conversation",
                  timestamp: new Date().toISOString(),
                  avatar: targetUser.avatar || "/placeholder.svg",
                }
                updatedConversations = [newConv, ...data]
                setSelectedConversation(roomId)
              }
            }
          } else if (teamId) {
            setSelectedConversation(teamId)
          }

          console.log("Fetched conversations:", data)
          setConversations(updatedConversations)

        }
      } catch (err) {
        console.error("Failed to fetch conversations", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [user, teamId, userIdFromQuery])

  // Socket.io Setup
  useEffect(() => {
    if (!user) return

    const newSocket = io(API_URL)
    setSocket(newSocket)

    const currentUserId = user.id || user._id
    if (currentUserId) {
      newSocket.emit("join_room", currentUserId.toString())
    }


    newSocket.on("receive_message", (data) => {
      const currentUserId = user.id || user._id
      if (selectedConversation === data.roomId && data.senderId.toString() !== currentUserId.toString()) {
        setMessages((prev) => [...prev, {
          id: data.id || `rt-${Date.now()}`,
          senderId: data.senderId,
          senderName: data.senderName || "Member",
          text: data.message,
          timestamp: data.timestamp || new Date().toISOString()
        }])

      }



      setConversations(prev => {
        const existing = prev.find(conv => conv.id === data.roomId)
        if (existing) {
          return prev.map(conv =>
            conv.id === data.roomId
              ? { ...conv, lastMessage: data.message, timestamp: data.timestamp || new Date().toISOString() }
              : conv
          )
        } else {
          // New conversation - we should re-fetch to get correct names/avatars
          // but for instant UI we can just wait for the next fetch or trigger one
          return prev;
        }
      })

      // If it's a new conversation, re-fetch the list to show it immediately
      setConversations(prev => {
        const isNew = !prev.find(c => c.id === data.roomId);
        if (isNew) {
          const fetchConversations = async () => {
            const token = localStorage.getItem('token')
            const currentId = user.id || user._id
            const res = await fetch(`${API_URL}/api/chat/conversations/${currentId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
              const data = await res.json()
              setConversations(data)
            }
          }
          fetchConversations();
        }
        return prev;
      })

    })

    return () => {
      newSocket.disconnect()
    }
  }, [user, selectedConversation])

  // Join room when selectedConversation changes
  useEffect(() => {
    if (socket && selectedConversation && user) {
      socket.emit("join_room", selectedConversation)

      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await fetch(`${API_URL}/api/messages/${selectedConversation}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            const currentUserId = user?.id || user?._id
            if (!currentUserId) return;

            setMessages(data.map(msg => ({
              id: msg.id || msg._id,
              senderId: msg.senderId.toString(),
              senderName: msg.senderName || (msg.senderId.toString() === currentUserId.toString() ? user.name : "Member"),
              text: msg.message,
              timestamp: msg.timestamp
            })))



          }
        } catch (err) {
          console.error("Failed to fetch messages", err)
        }
      }
      fetchMessages()
    }
  }, [socket, selectedConversation, user])


  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !socket || !user) return

    const currentUserId = user?.id || user?._id
    if (!currentUserId) return;

    const messageData = {
      roomId: selectedConversation,
      message: newMessage,
      senderId: currentUserId,
      senderName: user.name,
      timestamp: new Date().toISOString()
    }

    const currentConversation = conversations.find(c => c.id === selectedConversation)
    if (currentConversation && !currentConversation.isTeam) {
      const parts = selectedConversation.split('-')
      const receiverId = parts.find(p => p !== currentUserId)
      if (receiverId) {
        messageData.receiverId = receiverId
      }
    }

    socket.emit("send_message", messageData)

    setMessages(prev => [...prev, {
      id: Date.now(),
      senderId: currentUserId,
      senderName: user.name,
      text: newMessage,
      timestamp: new Date().toISOString()
    }])

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation
        ? { ...conv, lastMessage: newMessage, timestamp: new Date().toISOString() }
        : conv
    ))

    setNewMessage("")
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  if (!user) return null

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="container py-4 md:py-8">
      <Card className="sticky top-20 md:top-24 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] overflow-hidden border-border bg-card shadow-lg">

        <div className="flex h-full relative">
          {/* Conversations Sidebar */}
          <div className={cn(
            "w-full md:w-80 border-r border-border bg-muted/30 flex flex-col transition-all duration-300 absolute md:relative inset-0 z-10 md:z-0 min-h-0",
            selectedConversation && "hidden md:flex"
          )}>


            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <ScrollArea className="flex-1 min-h-0">

              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={cn(
                      "w-full p-4 text-left transition-colors border-b border-border hover:bg-muted/50",
                      selectedConversation === conversation.id && "bg-muted",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {conversation.isTeam && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-[8px] text-primary-foreground px-1 rounded-sm font-bold border border-background">
                            TEAM
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{conversation.name}</p>
                          <span className="text-xs text-muted-foreground">{formatTime(conversation.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex flex-1 flex-col transition-all duration-300 min-h-0",
            !selectedConversation && "hidden md:flex"
          )}>

            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">

                    <AvatarImage src={currentConversation.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{currentConversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{currentConversation.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentConversation.isTeam
                        ? currentConversation.participants?.join(", ")
                        : "Direct Message"}
                    </p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4 min-h-0">
                  <div className="space-y-4">

                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <div className="bg-muted p-6 rounded-full mb-4">
                          {currentConversation.isTeam ? (
                            <Users className="h-12 w-12" />
                          ) : (
                            <MessageSquare className="h-12 w-12" />
                          )}
                        </div>
                        <h4 className="font-medium text-lg">No messages yet</h4>
                        <p className="text-sm max-w-[200px]">
                          {currentConversation.isTeam
                            ? `Start the conversation with your team ${currentConversation.name}!`
                            : `Say hello to ${currentConversation.name}!`}
                        </p>

                      </div>
                    ) : (
                      messages.map((message, index) => {

                        const currentUserId = user?.id || user?._id
                        const isOwnMessage = currentUserId && message.senderId === currentUserId
                        return (
                          <div key={message.id || index} className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
                            {!isOwnMessage && (
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="text-xs">{message.senderName?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn("max-w-[70%] space-y-1", isOwnMessage && "items-end flex flex-col")}>
                              <div className={cn("flex items-center gap-2", isOwnMessage && "flex-row-reverse")}>
                                {!isOwnMessage && <span className="text-xs font-medium">{message.senderName || "User"}</span>}
                                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                              </div>

                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2",
                                  isOwnMessage ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
                                )}
                              >
                                <p className="text-sm leading-relaxed">{message.text}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-input"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground bg-muted/5">
                <div className="text-center space-y-4 max-w-sm px-4">
                  <div className="bg-primary/10 p-8 rounded-full inline-block mb-4 shadow-sm border border-primary/20">
                    <MessageSquare className="h-20 w-20 text-primary opacity-80" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Start a Conversation</h3>

                  <div className="pt-4">
                    <Button variant="outline" className="rounded-full shadow-sm hover:bg-primary/5 border-primary/30" onClick={() => router.push('/team-finder')}>
                      Find Teammates
                    </Button>
                  </div>
                </div>
              </div>

            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  )
}
