"use client"

import { createContext, useContext, useState } from "react"
import { API_URL } from "@/lib/constants"

const RecommendationContext = createContext(undefined)

export function RecommendationProvider({ children }) {
    const [aiRecommendations, setAiRecommendations] = useState(null)
    const [showAI, setShowAI] = useState(false)
    const [loadingAI, setLoadingAI] = useState(false)

    const toggleAI = async (user) => {
        setShowAI(true);
        setLoadingAI(true);
        try {
            const userId = user._id || user.id;
            const res = await fetch(`${API_URL}/api/recommendations/${userId}`);
            if (!res.ok) throw new Error("Failed to fetch recommendations");
            const data = await res.json();
            setAiRecommendations(data);
        } catch (err) {
            console.error(err);
            if (!aiRecommendations) setShowAI(false);
            throw err;
        } finally {
            setLoadingAI(false);
        }
    }

    const clearAI = () => {
        setShowAI(false);
    }

    return (
        <RecommendationContext.Provider
            value={{
                aiRecommendations,
                showAI,
                loadingAI,
                toggleAI,
                clearAI
            }}
        >
            {children}
        </RecommendationContext.Provider>
    )
}

export function useRecommendation() {
    const context = useContext(RecommendationContext)
    if (context === undefined) {
        throw new Error("useRecommendation must be used within RecommendationProvider")
    }
    return context
}
