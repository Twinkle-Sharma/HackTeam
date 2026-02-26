"use client"

import { AuthProvider } from "@/lib/contexts/auth-context"
import { ChatProvider } from "@/lib/contexts/chat-context"
import { RecommendationProvider } from "@/lib/contexts/recommendation-context"

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <RecommendationProvider>
        <ChatProvider>{children}</ChatProvider>
      </RecommendationProvider>
    </AuthProvider>
  )
}
