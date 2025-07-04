"use client"

import { useState, useMemo } from "react"
import Navbar from "@/components/navbar"
import AgentCard from "@/components/agent-card"
import ProfileModal from "@/components/profile-modal"
import ChatInterface from "@/components/chat-interface"
import { celebrityAgents } from "@/data/celebrity-agents"
import type { Agent } from "@/types/agent"

export default function AssistantsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Assistants", count: celebrityAgents.length },
    {
      id: "business",
      name: "Business & Sales",
      count: celebrityAgents.filter((a) => a.category === "business").length,
    },
    { id: "marketing", name: "Marketing", count: celebrityAgents.filter((a) => a.category === "marketing").length },
    { id: "health", name: "Health & Nutrition", count: celebrityAgents.filter((a) => a.category === "health").length },
    {
      id: "mindset",
      name: "Mindset & Motivation",
      count: celebrityAgents.filter((a) => a.category === "mindset").length,
    },
    {
      id: "blockchain",
      name: "Blockchain & Web3",
      count: celebrityAgents.filter((a) => a.category === "blockchain").length,
    },
  ]

  const filteredAgents = useMemo(() => {
    if (selectedCategory === "all") return celebrityAgents
    return celebrityAgents.filter((agent) => agent.category === selectedCategory)
  }, [selectedCategory])

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  const handlePayment = async (agent: Agent) => {
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId: agent.id, price: agent.price }),
      })

      const result = await response.json()

      if (result.success) {
        setActiveAgent(agent)
        setSelectedAgent(null)
        setShowChat(true)
      }
    } catch (error) {
      console.error("Payment failed:", error)
    }
  }

  if (showChat && activeAgent) {
    return <ChatInterface agent={activeAgent} onBack={() => setShowChat(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/10 via-slate-950/50 to-slate-950"></div>
      <div className="relative">
        <Navbar />

        <main className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 premium-gradient-text tracking-tight">
              Celebrity AI Assistants
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Learn from the world's most successful entrepreneurs, marketers, and experts through their AI clones
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 border border-white/10"
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Featured Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-300 font-semibold text-sm">Premium Celebrity Collection</span>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onSelect={handleAgentSelect} />
            ))}
          </div>

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No assistants found</h3>
              <p className="text-slate-400">Try selecting a different category</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 text-center">
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold premium-gradient-text mb-4">Learn from the Best</h2>
              <p className="text-slate-300 leading-relaxed">
                These AI assistants are trained on the knowledge, strategies, and mindset of world-renowned experts. Get
                personalized advice, learn their proven methods, and accelerate your success with insights from the most
                successful people in business, marketing, and personal development.
              </p>
            </div>
          </div>
        </main>

        {/* Profile Modal */}
        {selectedAgent && (
          <ProfileModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} onPayment={handlePayment} />
        )}
      </div>
    </div>
  )
}
