"use client"

import { useState, useMemo, useEffect } from "react"
import Navbar from "@/components/navbar"
import MarketplaceFilters from "@/components/marketplace-filters"
import AgentCard from "@/components/agent-card"
import ProfileModal from "@/components/profile-modal"
import ChatInterface from "@/components/chat-interface"
import type { Agent, FilterState } from "@/types/agent"
import { fetchAgentFromAlliance } from "@/lib/agent-transformers"

export default function MarketplacePage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    priceRange: [0, 50],
    minRating: 0,
    specialties: [],
    sortBy: "rating",
    sortOrder: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch specific agents by name from the alliance API
        const result = await fetchAgentFromAlliance()
        
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

  const filteredAgents = useMemo(() => {
    const filtered = agents.filter((agent: Agent) => {
      // Search filter
      if (
        filters.search &&
        !agent.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !agent.description.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Category filter
      if (filters.category !== "all" && agent.category !== filters.category) {
        return false
      }

      // Price range filter
      if (agent.price < filters.priceRange[0] || agent.price > filters.priceRange[1]) {
        return false
      }

      // Rating filter
      if (agent.rating < filters.minRating) {
        return false
      }

      // Specialties filter
      if (filters.specialties.length > 0) {
        const hasSpecialty = filters.specialties.some((specialty) => agent.specialties.includes(specialty))
        if (!hasSpecialty) return false
      }

      return true
    })

    // Sorting
    filtered.sort((a: Agent, b: Agent) => {
      let aVal: number | string
      let bVal: number | string

      if (filters.sortBy === "name") {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else {
        const aField = a[filters.sortBy as keyof Agent]
        const bField = b[filters.sortBy as keyof Agent]
        
        // Handle different field types
        if (typeof aField === "number" && typeof bField === "number") {
          aVal = aField
          bVal = bField
        } else if (typeof aField === "string" && typeof bField === "string") {
          aVal = aField
          bVal = bField
        } else {
          // Fallback to string comparison
          aVal = String(aField || "")
          bVal = String(bField || "")
        }
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return filters.sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return filters.sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }

      return 0
    })

    return filtered
  }, [agents, filters])

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  if (showChat && activeAgent) {
    return <ChatInterface agent={activeAgent} onBack={() => setShowChat(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Assistant Marketplace
          </h1>
          <p className="text-xl text-gray-300">
            Discover specialized AI assistants for content creation, education, and influence
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <MarketplaceFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              totalResults={filteredAgents.length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-300">
                {loading ? (
                  "Loading agents..."
                ) : (
                  `Showing ${paginatedAgents.length} of ${filteredAgents.length} assistants`
                )}
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-")
                    handleFilterChange({ 
                      sortBy, 
                      sortOrder: sortOrder as "desc" | "asc" 
                    })
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="totalChats-desc">Most Popular</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="text-gray-400 mt-4">Loading marketplace agents...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-white/10 border border-white/20 rounded-lg px-6 py-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Agent Grid */}
            {!loading && !error && (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedAgents.map((agent: Agent) => (
                    <AgentCard key={agent.id} agent={agent} onSelect={handleAgentSelect} />
                  ))}
                </div>

                {/* Empty State */}
                {paginatedAgents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No agents match your current filters.</p>
                    <button 
                      onClick={() => setFilters({
                        search: "",
                        category: "all",
                        priceRange: [0, 50],
                        minRating: 0,
                        specialties: [],
                        sortBy: "rating",
                        sortOrder: "desc",
                      })} 
                      className="mt-4 bg-white/10 border border-white/20 rounded-lg px-6 py-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg backdrop-blur-sm transition-colors ${
                          currentPage === page
                            ? "bg-purple-500 border-purple-500 text-white"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {selectedAgent && (
        <ProfileModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} onPayment={handlePayment} />
      )}
    </div>
  )
}
