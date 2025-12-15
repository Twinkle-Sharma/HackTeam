"use client"

import { AuthProvider } from "@/lib/contexts/auth-context"
import { ChatProvider } from "@/lib/contexts/chat-context"

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>{children}</ChatProvider>
    </AuthProvider>
  )
}
