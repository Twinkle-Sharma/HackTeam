import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"
import Header from "@/components/Header"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "HackTeam - Find Your Perfect Hackathon Team",
  description: "Connect with developers, designers, and innovators to build amazing projects at hackathons.",
  generator: 'v0.app'
}

import { AiChatBox } from "@/components/AiChatBox"

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.className} antialiased`}>
        <Providers>
          <Header />
          <main>{children}</main>
          <AiChatBox />
        </Providers>
      </body>
    </html>
  )
}
