"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

export function RecommendationSection() {
    const { user } = useAuth()
    const [recommendations, setRecommendations] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user || !user._id) return

            setLoading(true)
            try {
                const res = await fetch(`http://localhost:5000/api/recommendations/${user._id}`)
                if (!res.ok) throw new Error("Failed to fetch recommendations")
                const data = await res.json()
                setRecommendations(data)
            } catch (err) {
                console.error(err)
                setError("Could not load recommendations at this time.")
            } finally {
                setLoading(false)
            }
        }

        fetchRecommendations()
    }, [user])

    return (
        <section className="container py-16">
            <div className="flex items-center gap-2 mb-8">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <h2 className="text-3xl font-bold">Recommended for You</h2>
            </div>

            {!user ? (
                <div className="text-center py-12 bg-card/30 border border-dashed border-primary/20 rounded-xl">
                    <p className="text-muted-foreground mb-4">Log in to get personalized hackathon and teammate recommendations powered by Gemini AI!</p>
                    <Link href="/login">
                        <Button>Log In Now</Button>
                    </Link>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground italic">Gemini is finding the best matches for your skills...</p>
                </div>
            ) : error ? (
                <p className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</p>
            ) : recommendations ? (
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Recommended Hackathons */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Top Hackathons
                        </h3>
                        <div className="space-y-4">
                            {recommendations.recommendedHackathons?.length > 0 ? (
                                recommendations.recommendedHackathons.map((hack, i) => (
                                    <Card key={i} className="border-border bg-card/50 hover:bg-card transition-all duration-300">
                                        <CardContent className="p-4">
                                            <h4 className="font-bold text-primary">{hack.name}</h4>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{hack.description}</p>
                                            <div className="mt-3 p-2 bg-primary/5 rounded border border-primary/10 text-xs">
                                                <span className="font-semibold text-primary">Why: </span>
                                                {hack.reason}
                                            </div>
                                            <Link href={`/hackathons/${hack._id}`} className="mt-4 block">
                                                <Button variant="outline" size="sm" className="w-full">View Details</Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm italic">No specific hackathons found yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recommended Teammates */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Potential Teammates
                        </h3>
                        <div className="space-y-4">
                            {recommendations.recommendedTeammates?.length > 0 ? (
                                recommendations.recommendedTeammates.map((mate, i) => (
                                    <Card key={i} className="border-border bg-card/50 hover:bg-card transition-all duration-300">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                {mate.avatar ? (
                                                    <img src={mate.avatar} alt={mate.name} className="h-10 w-10 rounded-full" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                        {mate.name?.[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold">{mate.name}</h4>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {mate.skills?.slice(0, 3).map((skill, si) => (
                                                            <span key={si} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-2 bg-primary/5 rounded border border-primary/10 text-xs text-muted-foreground">
                                                <span className="font-semibold text-primary">Match: </span>
                                                {mate.reason}
                                            </div>
                                            <Link href={`/profile/${mate._id}`} className="mt-4 block">
                                                <Button variant="ghost" size="sm" className="w-full hover:bg-primary/10">Connect</Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm italic">No specific teammates found yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    )
}
