"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import AgentGrid from "@/components/agent-grid"
import ProfileModal from "@/components/profile-modal"
import ChatInterface from "@/components/chat-interface"
import type { Agent } from "@/types/agent"
import Link from "next/link"
import { fetchAgentFromAlliance } from "@/lib/agent-transformers"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "/placeholder.svg?height=60&width=60",
    text: "My digital clone helps me engage with my audience 24/7. The responses are so authentic, my followers can't tell the difference.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Online Educator",
    avatar: "/placeholder.svg?height=60&width=60",
    text: "Created a specialized assistant for my courses. Now my students have personalized support whenever they need it.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Digital Influencer",
    avatar: "/placeholder.svg?height=60&width=60",
    text: "MirrorMind allows me to scale my expertise without losing my personal touch. It's been a game-changer.",
    rating: 5,
  },
]

export default function HomePage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch specific agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch specific agents by name from the alliance API
        const result = await fetchAgentFromAlliance('Neural Nexus,Synthetic Mind')
        
        if (result.success && result.data) {
          setAgents(result.data)
        } else {
          setError(result.error || 'Failed to fetch agents')
        }
      } catch (err) {
        console.error('Error fetching agents:', err)
        setError('Failed to load agents')
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

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
        body: JSON.stringify({ agentId: agent.id, price: agent.price, currency: "USDC" }),
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

  const handleCreateAgent = (type: "clone" | "generic") => {
    console.log(`Creating ${type} agent...`)
  }

  if (showChat && activeAgent) {
    return <ChatInterface agent={activeAgent} onBack={() => setShowChat(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/10 via-slate-950/50 to-slate-950"></div>
      <div className="relative">
        <Navbar />

        <main className="container mx-auto px-6">
          {/* Hero Section */}
          <section className="py-16 text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 premium-gradient-text tracking-tight leading-tight">
                Amplify Your Knowledge
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mx-auto rounded-full mb-8 shadow-sm shadow-blue-500/20"></div>
            </div>
            <p className="text-xl md:text-2xl font-light text-slate-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              Create your digital clone or a personalized assistant to scale your impact 24/7
            </p>

            {/* Call to Action */}
            <div className="mb-16 flex flex-col items-center">
              <Link href="/create" className="clean-btn-primary text-base px-8 py-3 mb-4 inline-block">
                Get Started
              </Link>
              <p className="text-slate-400 text-sm">Join 10,000+ creators amplifying their reach</p>
            </div>
          </section>

          {/* What is MirrorMind */}
          <section className="py-16 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold premium-gradient-text mb-6 tracking-tight">
                What is MirrorMind?
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                The platform that lets you create digital versions of yourself or specialized assistants to interact
                with your audience authentically and at scale.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 003.75-15.25 13.61 13.61 0 00-1.5-1.25m0 1.25a13.61 13.61 0 003.75 3.75M12 18a9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9 9 9 0 01-9 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold premium-gradient-text mb-3">Total Personalization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your AI learns your style, tone, and knowledge to respond exactly as you would.
                </p>
              </div>

              <div className="glass-card p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold premium-gradient-text mb-3">Verified Identity</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Blockchain ensures the authenticity of your digital clone and protects your intellectual identity.
                </p>
              </div>

              <div className="glass-card p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold premium-gradient-text mb-3">Direct Monetization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generate passive income while your AI works for you 24 hours a day.
                </p>
              </div>
            </div>
          </section>

          {/* Choose Your Path */}
          <section className="py-16 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold premium-gradient-text mb-6 tracking-tight">
                Choose Your Path
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Two powerful ways to amplify your digital presence
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="glass-card-hover p-10 text-center group">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mx-auto mb-6 flex items-center justify-center float-animation group-hover:pulse-glow shadow-lg shadow-blue-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275"
                        opacity="0.4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold premium-gradient-text mb-4 tracking-tight">Clone Yourself</h3>
                  <p className="text-slate-300 text-base leading-relaxed font-normal mb-6">
                    Create your digital twin that speaks, thinks, and responds exactly like you
                  </p>
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Maintains your unique personality
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Responds with your style and knowledge
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Available 24/7 for your audience
                    </div>
                  </div>
                </div>
                <Link href="/create" className="clean-btn-primary w-full text-sm py-3 px-6">
                  Create My Clone
                </Link>
              </div>

              <div className="glass-card-hover p-10 text-center group">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl mx-auto mb-6 flex items-center justify-center float-animation group-hover:pulse-glow shadow-lg shadow-purple-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold premium-gradient-text mb-4 tracking-tight">Custom Assistant</h3>
                  <p className="text-slate-300 text-base leading-relaxed font-normal mb-6">
                    Design an AI specialist for specific tasks in your field
                  </p>
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Specialized in your niche
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Optimized for specific tasks
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Easy to customize and train
                    </div>
                  </div>
                </div>
                <Link href="/create" className="clean-btn-primary w-full text-sm py-3 px-6">
                  Create Assistant
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Assistants */}
          <section className="py-16 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold premium-gradient-text mb-6 tracking-tight">
                Featured Assistants
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto font-normal">
                Discover real examples of what you can achieve with MirrorMind
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-slate-400 mt-4">Loading featured agents...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="clean-btn-secondary text-sm px-6 py-2"
                >
                  Try Again
                </button>
              </div>
            ) : agents.length > 0 ? (
              <AgentGrid agents={agents} onAgentSelect={handleAgentSelect} />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No featured agents available at the moment.</p>
              </div>
            )}
          </section>

          {/* Testimonials */}
          <section className="py-16 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold premium-gradient-text mb-6 tracking-tight">
                What Our Users Say
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Creators, educators, and influencers are already amplifying their impact
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full border-2 border-purple-500/30 mr-3"
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm">{testimonial.name}</h4>
                      <p className="text-slate-400 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 text-center">
            <div className="glass-card p-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-semibold premium-gradient-text mb-6 tracking-tight">
                Ready to Amplify Your Impact?
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Join the AI revolution and take your digital presence to the next level
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create" className="clean-btn-primary text-sm px-8 py-3">
                  Create My Clone Now
                </Link>
                <Link href="/marketplace" className="clean-btn-secondary text-sm px-8 py-3">
                  Explore Marketplace
                </Link>
              </div>
              <p className="text-slate-400 text-xs mt-6">No commitments • Setup in minutes • 24/7 support</p>
            </div>
          </section>
        </main>

        {/* Profile Modal */}
        {selectedAgent && (
          <ProfileModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} onPayment={handlePayment} />
        )}
      </div>
    </div>
  )
}
