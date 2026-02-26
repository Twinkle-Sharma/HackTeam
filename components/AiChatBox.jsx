"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, X, Send, User, Loader2, Sparkles, Cpu } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { API_URL } from "@/lib/constants"

export function AiChatBox() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hi! I'm HackBot. How can I help you find hackathons, build your team, or suggest ideas today?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMsg }].map(m => ({ role: m.role, content: m.content }))
                })
            })

            if (!response.ok) throw new Error("Failed to send message")

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'model', content: data.reply }])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-card text-card-foreground text-xs font-semibold px-2 py-1 rounded shadow border border-border">
                        HackBot
                    </div>
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all p-0 bg-primary overflow-hidden"
                    >
                        <img src="/chat-bot-icon-with-artificial-intelligence-vector-47786100.avif" alt="Chat" className="h-full w-full object-cover scale-[1.3]" />
                    </Button>
                </div>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] shadow-2xl z-50 flex flex-col rounded-xl overflow-hidden animate-in slide-in-from-bottom-5">
                    <Card className="flex flex-col h-full border-border bg-card rounded-none border-0 ring-1 ring-border shadow-xl">
                        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-0 rounded-full overflow-hidden h-9 w-9 flex items-center justify-center">
                                    <img src="/chat-bot-icon-with-artificial-intelligence-vector-47786100.avif" alt="HackBot" className="h-full w-full object-cover scale-[1.3]" />
                                </div>
                                <CardTitle className="text-base font-semibold">HackBot</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="flex-shrink-0 mt-auto bg-primary/10 p-0 rounded-full overflow-hidden h-8 w-8 flex items-center justify-center">
                                            <img src="/chat-bot-icon-with-artificial-intelligence-vector-47786100.avif" alt="HackBot" className="h-full w-full object-cover scale-[1.3]" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted/50 border border-border rounded-bl-sm'
                                        }`}>
                                        {msg.role === 'model' ? (
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-4" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-3" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="flex-shrink-0 mt-auto bg-primary/10 p-0 rounded-full overflow-hidden h-8 w-8 flex items-center justify-center">
                                        <img src="/chat-bot-icon-with-artificial-intelligence-vector-47786100.avif" alt="HackBot" className="h-full w-full object-cover scale-[1.3]" />
                                    </div>
                                    <div className="p-4 rounded-2xl rounded-bl-sm bg-muted/50 border border-border flex items-center h-10">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        <CardFooter className="p-3 border-t border-border bg-card">
                            <form onSubmit={handleSend} className="flex w-full gap-2">
                                <Input
                                    autoFocus
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask HackBot..."
                                    className="flex-1 rounded-full bg-muted/50"
                                    disabled={loading}
                                />
                                <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-full shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    )
}
