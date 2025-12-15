"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { mockUsers, mockHackathons } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Plus, UserPlus } from "lucide-react"

export default function TeamFinderPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkill, setFilterSkill] = useState("all")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    hackathonId: "",
    description: "",
    needsSkills: "",
  })

  // Get all unique skills from users
  const allSkills = [...new Set(mockUsers.flatMap((user) => user.skills))]

  // Filter users based on search and skill
  const filteredUsers = mockUsers.filter((u) => {
    if (!u.lookingForTeam) return false
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.bio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkill = filterSkill === "all" || u.skills.includes(filterSkill)
    return matchesSearch && matchesSkill
  })

  const handleCreateTeam = (e) => {
    e.preventDefault()
    console.log("[v0] Creating team:", newTeam)
    // In a real app, this would call a createTeam function
    alert(`Team "${newTeam.name}" created successfully!`)
    setIsCreateTeamOpen(false)
    setNewTeam({ name: "", hackathonId: "", description: "", needsSkills: "" })
  }

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Find Teammates</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Connect with talented individuals looking to form hackathon teams.
          </p>
        </div>

        {user && (
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>Start a team and invite others to join your hackathon project.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Awesome Team"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hackathon">Hackathon</Label>
                  <Select
                    value={newTeam.hackathonId}
                    onValueChange={(value) => setNewTeam({ ...newTeam, hackathonId: value })}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Select hackathon" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHackathons.map((hackathon) => (
                        <SelectItem key={hackathon.id} value={hackathon.id.toString()}>
                          {hackathon.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What are you building?"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    rows={3}
                    className="bg-input resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="needsSkills">Looking For (Skills)</Label>
                  <Input
                    id="needsSkills"
                    placeholder="e.g., Frontend Developer, Designer"
                    value={newTeam.needsSkills}
                    onChange={(e) => setNewTeam({ ...newTeam, needsSkills: e.target.value })}
                    className="bg-input"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Team
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-8 border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-full md:w-48 bg-input">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Found {filteredUsers.length} {filteredUsers.length === 1 ? "developer" : "developers"} looking for teams
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((teammate) => (
          <Card key={teammate.id} className="border-border bg-card hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src={teammate.avatar || "/placeholder.svg"} alt={teammate.name} />
                  <AvatarFallback>{teammate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{teammate.name}</CardTitle>
                  <CardDescription className="line-clamp-2 leading-relaxed mt-1">{teammate.bio}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Skills */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">SKILLS</Label>
                <div className="flex flex-wrap gap-2">
                  {teammate.skills.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {teammate.skills.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{teammate.skills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Connect Button */}
              {user ? (
                <Button className="w-full bg-transparent" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              ) : (
                <Button className="w-full bg-transparent" variant="outline" disabled>
                  Sign up to connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No teammates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find potential teammates.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
