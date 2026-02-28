"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/contexts/auth-context"
import { useRecommendation } from "@/lib/contexts/recommendation-context"
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
import { Search, Users, Plus, UserPlus, Lock, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/constants"




export default function TeamFinderPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { aiRecommendations, showAI, loadingAI, toggleAI, clearAI } = useRecommendation()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkill, setFilterSkill] = useState("all")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    hackathonId: "",
    description: "",
    needsSkills: "",
  })

  const [fetchedUsers, setFetchedUsers] = useState([])
  const [fetchedTeams, setFetchedTeams] = useState([])
  const [hackathons, setHackathons] = useState([])
  const [allSkills, setAllSkills] = useState(["React", "Node.js", "MongoDB", "UI/UX Design", "Figma", "Python", "Machine Learning", "Marketing", "Flutter", "DevOps"])

  const [activeTab, setActiveTab] = useState("developers")




  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return; // Only fetch if user is logged in
      try {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams()
        if (searchTerm) queryParams.append('search', searchTerm)
        if (filterSkill !== 'all') queryParams.append('skill', filterSkill)

        const res = await fetch(`${API_URL}/api/users?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFetchedUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    // Debounce basic
    const debounce = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(debounce);
  }, [user, searchTerm, filterSkill]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/teams`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFetchedTeams(data);
        }
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };
    fetchTeams();

    const fetchHackathons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hackathons`);
        if (res.ok) {
          const data = await res.json();
          setHackathons(data);
        }
      } catch (err) {
        console.error("Failed to fetch hackathons", err);
      }
    };
    fetchHackathons();
  }, [user]);

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTeam,
          memberId: user.id || user._id
        })
      });

      if (res.ok) {
        setIsCreateTeamOpen(false)
        setNewTeam({ name: "", hackathonId: "", description: "", needsSkills: "" })
        // Refresh teams
        const updatedTeamsRes = await fetch(`${API_URL}/api/teams`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (updatedTeamsRes.ok) {
          const updatedTeamsData = await updatedTeamsRes.json();
          setFetchedTeams(updatedTeamsData);
        }
        // Switch to Browse Teams tab
        setActiveTab("teams")
      }
    } catch (err) {
      console.error("Error creating team:", err)
    }

  }

  const handleJoinTeam = async (teamId) => {
    if (!teamId) {
      alert("Error: Team ID is missing.")
      return
    }
    try {

      const token = localStorage.getItem('token')
      const url = `${API_URL}/api/teams/${teamId}/join`
      console.log("Joining team at URL:", url)
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id || user?._id
        })

      });


      if (res.ok) {
        // Refresh teams
        const updatedTeamsRes = await fetch(`${API_URL}/api/teams`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (updatedTeamsRes.ok) {
          const updatedTeamsData = await updatedTeamsRes.json();
          setFetchedTeams(updatedTeamsData);
        }
        router.push(`/chat?teamId=${teamId}`)

      }
    } catch (err) {
      console.error("Error joining team:", err)
    }

  }




  const displayTeammates = showAI && aiRecommendations
    ? aiRecommendations.recommendedTeammates
    : fetchedUsers;

  const handleToggleAI = async () => {
    try {
      await toggleAI(user);
    } catch (err) {
      console.error(err);
    }
  }

  const handleClearAI = () => {
    clearAI();
  }

  return (
    <div className="container py-8 md:py-16">
      {/* Header */}
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="mb-2 md:mb-4 text-3xl md:text-4xl font-bold">Find Teammates</h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Connect with talented individuals looking to form hackathon teams.
          </p>
        </div>


        {user && (
          <div className="flex gap-4 items-center">
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto">
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
                        {hackathons.map((hackathon) => (
                          <SelectItem key={hackathon._id} value={hackathon._id.toString()}>
                            {hackathon.name}
                          </SelectItem>
                        ))}
                        {hackathons.length === 0 && (
                          <SelectItem value="none" disabled>No hackathons available</SelectItem>
                        )}
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
          </div>
        )}
      </div>

      {!user ? (
        <Card className="border-border bg-card">
          <CardContent className="py-24 flex flex-col items-center justify-center text-center">
            <Lock className="h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="mb-4 text-2xl font-semibold">Authentication Required</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              You must be logged in to view potential teammates and connect with other developers for hackathons.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("developers")}
              className={`pb-4 px-2 font-medium transition-all relative ${activeTab === "developers" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Find Developers
              {activeTab === "developers" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`pb-4 px-2 font-medium transition-all relative ${activeTab === "teams" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Browse Teams
              {activeTab === "teams" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
          </div>

          {/* Filters */}
          {activeTab === "developers" && (
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 md:max-w-md group">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by name or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 rounded-full border-2 border-primary/20 bg-background hover:border-primary/50 focus-visible:border-primary focus-visible:ring-0 shadow-sm transition-all text-lg"
                />
              </div>
              <Select value={filterSkill} onValueChange={setFilterSkill}>
                <SelectTrigger className="w-full md:w-48 h-14 rounded-full border-2 border-primary/20 bg-background hover:border-primary/50 focus:ring-0 shadow-sm transition-all text-base pl-4">
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
          )}

          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === "developers" ? (
                showAI ? (
                  <span className="flex items-center text-primary font-medium">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Showing {displayTeammates?.length || 0} top matches for you
                  </span>
                ) : (
                  `Found ${displayTeammates?.length || 0} ${displayTeammates?.length === 1 ? "developer" : "developers"} looking for teams`
                )
              ) : (
                `Found ${fetchedTeams.length} teams looking for members`
              )}
            </p>
          </div>

          {/* Users Grid */}
          {activeTab === "developers" ? (
            loadingAI ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card border-border border rounded-xl">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Gemini is finding the best teammates for your skills...</p>
              </div>
            ) : displayTeammates?.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayTeammates.map((teammate) => (
                  <Card key={teammate._id} className="border-border bg-card hover:border-primary/50 transition-all">
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
                      {showAI && teammate.reason && (
                        <div className="p-3 bg-primary/5 rounded border border-primary/10 text-sm">
                          <span className="text-muted-foreground">{teammate.reason}</span>
                        </div>
                      )}
                      {/* Skills */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">SKILLS</Label>
                        <div className="flex flex-wrap gap-2">
                          {teammate.skills?.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-primary/10 text-primary text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {teammate.skills?.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{teammate.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Connect Button */}
                      <Button className="w-full bg-transparent" variant="outline" asChild>
                        <Link href={`/chat?userId=${teammate._id}`}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Connect
                        </Link>
                      </Button>



                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="py-16 text-center">
                  {showAI ? (
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  ) : (
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  )}
                  <h3 className="mb-2 text-lg font-semibold">{showAI ? "No ideal matches found" : "No teammates found"}</h3>
                  <p className="text-muted-foreground">
                    {showAI ? "Update your profile skills and bio to get better recommendations." : "Try adjusting your search or filters to find potential teammates."}
                  </p>
                </CardContent>
              </Card>
            )
          ) : (
            /* Teams Grid */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fetchedTeams.map((team) => (
                <Card key={team._id} className="border-border bg-card hover:border-primary/50 transition-all flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{team.name}</CardTitle>
                        <CardDescription className="text-primary font-medium flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {team.hackathonId?.name || "Hackathon Project"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {team.memberIds?.length || 0} Members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {team.description || "No description provided."}
                    </p>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider font-semibold">Looking For</Label>
                      <div className="flex flex-wrap gap-2">
                        {team.needsSkills?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-auto">
                      {team.memberIds?.some(m => (m._id || m) === (user.id || user._id)) ? (
                        <Button className="w-full" variant="outline" asChild>
                          <Link href={`/chat?teamId=${team._id}`}>
                            Go to Team Chat
                          </Link>
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => handleJoinTeam(team._id)}>
                          Join Team
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {fetchedTeams.length === 0 && (
                <Card className="col-span-full border-border bg-card py-16 text-center">
                  <CardContent>
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No teams found</h3>
                    <p className="text-muted-foreground">Be the first to create a team for a hackathon!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )
      }
    </div>
  )
}



