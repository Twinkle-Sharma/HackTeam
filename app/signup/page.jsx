"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    skills: [],
  })

  const [currentSkill, setCurrentSkill] = useState("")

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Add skill to the list
  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()],
      })
      setCurrentSkill("")
    }
  }

  // Remove skill from the list
  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.skills.length === 0) {
      alert("Please add at least one skill")
      return
    }

    // Create new user
    signup(formData)

    // Redirect to profile
    router.push("/profile")
  }

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Profile</CardTitle>
            <CardDescription>Join HackTeam and start connecting with amazing teammates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-input"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-input"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="bg-input"
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself and what you're passionate about..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="bg-input resize-none"
                />
              </div>

              {/* Skills Field */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills *</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    type="text"
                    placeholder="e.g., React, Python, UI Design"
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

                {/* Display added skills */}
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

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
