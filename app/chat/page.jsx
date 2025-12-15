"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useChat } from "@/lib/contexts/chat-context"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { conversations, messages, sendMessage } = useChat()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/signup")
    }
  }, [user, router])

  // Select first conversation by default
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id)
    }
  }, [conversations, selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedConversation])

  if (!user) return null

  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : []
  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    sendMessage(selectedConversation, user.id, user.name, newMessage)
    setNewMessage("")
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container py-8">
      <Card className="h-[calc(100vh-12rem)] overflow-hidden border-border bg-card">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-border bg-muted/30">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <ScrollArea className="h-[calc(100%-4rem)]">
              {conversations.length > 0 ? (
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
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
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
          <div className="flex flex-1 flex-col">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentConversation.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{currentConversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentConversation.participants.join(", ")}</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {currentMessages.map((message) => {
                      const isOwnMessage = message.senderId === user.id
                      return (
                        <div key={message.id} className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{message.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={cn("max-w-[70%] space-y-1", isOwnMessage && "items-end")}>
                            <div className="flex items-center gap-2">
                              {!isOwnMessage && <span className="text-xs font-medium">{message.senderName}</span>}
                              <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                            </div>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2",
                                isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
                              )}
                            >
                              <p className="text-sm leading-relaxed">{message.text}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-input"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
