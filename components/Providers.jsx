"use client"

import { AuthProvider } from "@/lib/contexts/auth-context"
import { ChatProvider } from "@/lib/contexts/chat-context"
import { RecommendationProvider } from "@/lib/contexts/recommendation-context"
import { Toaster } from "sonner"

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <RecommendationProvider>
        <ChatProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </ChatProvider>
      </RecommendationProvider>
    </AuthProvider>
  )
}
