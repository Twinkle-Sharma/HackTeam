"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { API_URL } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Edit2, Save, Calendar, MapPin, Building, Globe } from "lucide-react"
import { RecommendationSection } from "@/components/RecommendationSection"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, loading: authLoading } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [],
    github: "",
  })
  const [currentSkill, setCurrentSkill] = useState("")
  const [profileData, setProfileData] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Fetch full profile data
  useEffect(() => {
    if (!user) {
      setLoadingProfile(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoadingProfile(false)
          return
        }

        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (res.ok) {
          setProfileData(data)
        }
      } catch (error) {
        console.error("Failed to fetch profile", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {


      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        skills: user.skills || [],
        github: user.github || "",
      })
    }
  }, [user, router])

  if (authLoading) {
    return (
      <div className="container py-32 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()],
      })
      setCurrentSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || "Failed to update profile")
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      skills: user.skills || [],
      github: user.github || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="container py-8 md:py-16">

      <div className="mx-auto max-w-3xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Your Profile</CardTitle>
                <CardDescription>Manage your profile information and skills</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Avatar Section */}
            <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-primary/20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-xl sm:text-2xl">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="py-2">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>


            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="bg-input resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Profile URL</Label>
                  <Input
                    id="github"
                    name="github"
                    type="url"
                    value={formData.github}
                    onChange={handleChange}
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      type="text"
                      placeholder="Add a skill"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                      className="bg-input"
                    />
                    <Button type="button" onClick={addSkill} variant="secondary">
                      Add
                    </Button>
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-primary-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="mt-2 text-foreground leading-relaxed">{user.bio || "No bio added yet."}</p>
                </div>

                {user.github && (
                  <div>
                    <Label className="text-muted-foreground">GitHub Profile</Label>
                    <p className="mt-2 text-foreground leading-relaxed">
                      <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {user.github}
                      </a>
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Skills</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills added yet.</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6">
                  <Label className="text-lg font-semibold block mb-4">Registered Hackathons</Label>
                  {loadingProfile ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <p>Loading hackathons...</p>
                    </div>
                  ) : profileData?.registeredHackathons && profileData.registeredHackathons.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">

                      {profileData.registeredHackathons.map((hackathon) => (
                        <Card key={hackathon._id} className="overflow-hidden border-border bg-card">
                          <div className="flex h-full flex-col">
                            {hackathon.image && (
                              <div className="h-24 w-full bg-muted">
                                <img
                                  src={hackathon.image || "/placeholder.svg"}
                                  alt={hackathon.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-semibold line-clamp-1">{hackathon.name}</h4>
                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                                    <span>{new Date(hackathon.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="line-clamp-1">{hackathon.location}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {hackathon.type === 'online' ? <Globe className="mr-1 h-3 w-3" /> : <Building className="mr-1 h-3 w-3" />}
                                  {hackathon.type === 'online' ? 'Online' : 'In-Person'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground bg-muted/50 p-4 rounded-md border border-border">You haven't registered for any hackathons yet.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendation section removed as requested */}
    </div>
  )
}
