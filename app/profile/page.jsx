"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Edit2, Save } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [],
  })
  const [currentSkill, setCurrentSkill] = useState("")

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/signup")
    } else {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        skills: user.skills || [],
      })
    }
  }, [user, router])

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

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      skills: user.skills || [],
    })
    setIsEditing(false)
  }

  return (
    <div className="container py-16">
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
            <div className="mb-8 flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
