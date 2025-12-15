"use client"

import { createContext, useContext, useState } from "react"

const ChatContext = createContext(undefined)

const defaultConversations = [
  {
    id: 1,
    name: "Tech Innovators",
    participants: ["Alex Johnson", "Sarah Chen"],
    lastMessage: "Let us finalize our project idea",
    timestamp: new Date().toISOString(),
    avatar: "/generic-team-icon.png",
  },
  {
    id: 2,
    name: "Code Warriors",
    participants: ["Michael Brown"],
    lastMessage: "When should we meet?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    avatar: "/team-icon-2.jpg",
  },
]

const defaultMessages = {
  1: [
    {
      id: 1,
      senderId: 2,
      senderName: "Sarah Chen",
      text: "Hey team! Excited to work on this hackathon together!",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 2,
      senderId: 1,
      senderName: "Alex Johnson",
      text: "Me too! I think we should build something related to AI and healthcare.",
      timestamp: new Date(Date.now() - 6000000).toISOString(),
    },
  ],
  2: [
    {
      id: 1,
      senderId: 3,
      senderName: "Michael Brown",
      text: "When should we meet?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
}

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(defaultConversations)
  const [messages, setMessages] = useState(defaultMessages)

  const sendMessage = (conversationId, senderId, senderName, text) => {
    const newMsg = {
      id: Date.now(),
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }))

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, lastMessage: text, timestamp: newMsg.timestamp } : conv,
      ),
    )
  }

  return <ChatContext.Provider value={{ conversations, messages, sendMessage }}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
