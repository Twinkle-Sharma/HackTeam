"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Search, Globe, Building, CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRecommendation } from "@/lib/contexts/recommendation-context"
import { API_URL } from "@/lib/constants"

export default function HackathonsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { aiRecommendations, showAI, loadingAI, toggleAI, clearAI } = useRecommendation()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hackathons`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setHackathons(data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load hackathons")
      } finally {
        setLoading(false)
      }
    }
    fetchHackathons()
  }, [])

  const handleRegister = async (hackathonId) => {
    if (!user) {
      toast.error("Please login to register")
      router.push("/login")
      return
    }

    setRegistering(hackathonId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/hackathons/${hackathonId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")

      toast.success("Successfully registered!")

      setHackathons(hackathons.map(h => {
        if (h._id === hackathonId) {
          return {
            ...h,
            participants: h.participants + 1,
            registeredUserIds: [...(h.registeredUserIds || []), user.id || user._id]
          }
        }
        return h
      }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRegistering(null)
    }
  }

  // Filter hackathons based on search and type
  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch =
      hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || hackathon.type === filterType
    return matchesSearch && matchesType
  })

  // Which hackathons to display (standard filtered or AI recommended)
  const displayHackathons = showAI && aiRecommendations
    ? aiRecommendations.recommendedHackathons
    : filteredHackathons;

  const handleToggleAI = async () => {
    try {
      await toggleAI(user);
    } catch (err) {
      toast.error("Could not load AI recommendations at this time.");
    }
  }

  const handleClearAI = () => {
    clearAI();
  }

  if (loading) {
    return (
      <div className="container py-16 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Discover Hackathons</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Find and join exciting hackathons from around the world. Build innovative projects and connect with amazing
            teams.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-md group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 rounded-full border-2 border-primary/20 bg-background hover:border-primary/50 focus-visible:border-primary focus-visible:ring-0 shadow-sm transition-all text-lg"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48 h-14 rounded-full border-2 border-primary/20 bg-background hover:border-primary/50 focus:ring-0 shadow-sm transition-all text-base pl-4">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">In-Person</SelectItem>
          </SelectContent>
        </Select>
        {user && (
          <div className="flex gap-2">
            <Button
              onClick={handleToggleAI}
              className={`border w-14 h-14 p-0 shrink-0 rounded-full ${showAI ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'}`}
              title={showAI ? "Refresh Recommendations" : "AI Recommend"}
              disabled={loadingAI}
            >
              {loadingAI ? <Loader2 className="h-7 w-7 animate-spin" /> : <img src="/ai-3d-icon-png.webp" alt="AI Recommend" className="h-9 w-9 object-contain" />}
            </Button>
            {showAI && (
              <Button
                variant="outline"
                onClick={handleClearAI}
                className="h-14 rounded-full px-6 border-2"
              >
                View All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {showAI ? (
            <span className="flex items-center text-primary font-medium">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Showing {displayHackathons?.length || 0} top matches for you
            </span>
          ) : (
            `Showing ${displayHackathons.length} ${displayHackathons.length === 1 ? "hackathon" : "hackathons"}`
          )}
        </p>
      </div>

      {/* Hackathons Grid */}
      {loadingAI ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border-border border rounded-xl">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse">Gemini is finding the perfect hackathons for your skills...</p>
        </div>
      ) : displayHackathons?.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayHackathons.map((hackathon) => {
            const isRegistered = user && hackathon.registeredUserIds?.includes(user.id || user._id);

            return (
              <Card
                key={hackathon._id}
                className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all"
              >
                {/* Hackathon Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={hackathon.image || "/placeholder.svg"}
                    alt={hackathon.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge
                    className={`absolute right-3 top-3 ${hackathon.type === "online"
                      ? "bg-accent/90 text-accent-foreground"
                      : "bg-primary/90 text-primary-foreground"
                      }`}
                  >
                    {hackathon.type === "online" ? (
                      <>
                        <Globe className="mr-1 h-3 w-3" /> Online
                      </>
                    ) : (
                      <>
                        <Building className="mr-1 h-3 w-3" /> In-Person
                      </>
                    )}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">{hackathon.name}</CardTitle>
                  <CardDescription className="line-clamp-2 leading-relaxed">{hackathon.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {showAI && hackathon.reason && (
                    <div className="p-3 bg-primary/5 rounded border border-primary/10 text-sm">
                      <span className="text-muted-foreground">{hackathon.reason}</span>
                    </div>
                  )}
                  {/* Hackathon Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(hackathon.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{hackathon.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{hackathon.participants} participants</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => handleRegister(hackathon._id)}
                      disabled={isRegistered || registering === hackathon._id}
                      variant={isRegistered ? "secondary" : "default"}
                    >
                      {isRegistered ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Registered</>
                      ) : registering === hackathon._id ? (
                        "Registering..."
                      ) : (
                        "Register Now"
                      )}
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center">
            {showAI ? (
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            ) : (
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            )}
            <h3 className="mb-2 text-lg font-semibold">{showAI ? "No ideal matches found" : "No hackathons found"}</h3>
            <p className="text-muted-foreground">
              {showAI ? "Update your profile skills and bio to get better recommendations." : "Try adjusting your search or filters to find what you're looking for."}
            </p>
          </CardContent>
        </Card>
      )
      }
    </div >
  )
}
