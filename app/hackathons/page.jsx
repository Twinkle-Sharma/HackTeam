"use client"

import { useState } from "react"
import { mockHackathons } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Search, Globe, Building } from "lucide-react"

export default function HackathonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Filter hackathons based on search and type
  const filteredHackathons = mockHackathons.filter((hackathon) => {
    const matchesSearch =
      hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || hackathon.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Discover Hackathons</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Find and join exciting hackathons from around the world. Build innovative projects and connect with amazing
          teams.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8 border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredHackathons.length} {filteredHackathons.length === 1 ? "hackathon" : "hackathons"}
        </p>
      </div>

      {/* Hackathons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHackathons.map((hackathon) => (
          <Card
            key={hackathon.id}
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
                className={`absolute right-3 top-3 ${
                  hackathon.type === "online"
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

              {/* View Button */}
              <Button className="w-full bg-transparent" variant="outline">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredHackathons.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No hackathons found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
