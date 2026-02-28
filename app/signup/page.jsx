"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    gender: "",
    github: "",
  })

  const [currentSkill, setCurrentSkill] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error on typing
    if (errorMsg) setErrorMsg("")
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
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")

    // Name validation: at least 3 characters
    if (formData.name.trim().length < 3) {
      setErrorMsg("Name must be at least 3 characters long")
      setIsLoading(false)
      return
    }

    // Email validation: simple regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMsg("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Gender validation
    if (!formData.gender) {
      setErrorMsg("Please select your gender")
      setIsLoading(false)
      return
    }

    if (formData.skills.length === 0) {
      setErrorMsg("Please add at least one skill")
      setIsLoading(false)
      return
    }

    try {
      // Create new user
      await signup(formData)

      // Redirect to profile
      router.push("/profile")
    } catch (error) {
      setErrorMsg(error.message || "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-md text-sm">
                  {errorMsg}
                </div>
              )}
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  onInvalid={(e) => e.target.setCustomValidity("Name must be at least 3 characters long")}
                  onInput={(e) => e.target.setCustomValidity("")}
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
                  placeholder="abc@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-input"
                />
              </div>

              {/* Gender Field */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => {
                    setFormData({ ...formData, gender: value })
                    if (errorMsg) setErrorMsg("")
                  }}
                >
                  <SelectTrigger className="bg-input w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Github Field */}
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile URL</Label>
                <Input
                  id="github"
                  name="github"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.github}
                  onChange={handleChange}
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
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
