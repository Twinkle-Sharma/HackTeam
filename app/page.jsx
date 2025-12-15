"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Code2, Users, MessageSquare, Trophy } from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Find Teammates",
      description: "Connect with skilled developers, designers, and innovators looking to build amazing projects.",
    },
    {
      icon: Trophy,
      title: "Browse Hackathons",
      description: "Discover upcoming hackathons both online and offline. Find the perfect event for your interests.",
    },
    {
      icon: Code2,
      title: "Build Together",
      description: "Form teams based on complementary skills and collaborate on innovative solutions.",
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: "Communicate seamlessly with your team members through our integrated chat system.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Connect. Collaborate. Create.
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Hackathon Team
            </span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground leading-relaxed md:text-xl">
            Connect with talented developers, designers, and innovators. Build amazing projects together at hackathons
            worldwide.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/hackathons">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Browse Hackathons
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card hover:bg-card/80 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <Card className="border-border bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          <CardContent className="p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Active Developers</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Hackathons Listed</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">250+</div>
                <div className="text-sm text-muted-foreground">Teams Formed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Build Something Amazing?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of developers and innovators finding their perfect teammates.
            </p>
            <Link href="/signup">
              <Button size="lg">Join HackTeam Now</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
