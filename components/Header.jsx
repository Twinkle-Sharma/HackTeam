"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Code2, Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


import { cn } from "@/lib/utils"

export default function Header() {

  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }


  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/hackathons", label: "Hackathons" },
    { href: "/team-finder", label: "Find Teammates" },
    ...(user
      ? [
        { href: "/profile", label: "Profile" },
        { href: "/chat", label: "Chat" },
      ]
      : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">HackTeam</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Link href="/profile" className="hidden sm:block">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                Logout
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Link href="/login">
                <Button size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted",
                      pathname === link.href ? "text-primary bg-muted" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!user ? (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Link href="/login" className="w-full">
                      <Button className="w-full" variant="outline">Log In</Button>
                    </Link>
                    <Link href="/signup" className="w-full">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Link href="/profile" className="w-full">
                      <Button className="w-full" variant="outline">Profile</Button>
                    </Link>
                    <Button className="w-full" variant="ghost" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}
