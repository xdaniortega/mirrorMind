import type { Agent } from "@/types/agent"

// Transform metadata API agents to Agent type
export function transformMetadataAgent(agent: any): Agent {
  return {
    id: agent.id,
    name: agent.name,
    type: agent.type === 'personal_clone' ? 'clone' : 'generic',
    category: agent.personality?.expertise?.[0]?.toLowerCase().replace(/\s+/g, '-') || 'general',
    description: agent.biography?.background || agent.biography?.professionalTitle || 'AI Assistant',
    avatar: "/placeholder.svg?height=80&width=80",
    price: 15.99, // Default price
    rating: 4.5 + (agent.state?.userSatisfaction || 0) / 10, // Convert satisfaction to rating
    totalChats: agent.state?.totalInteractions || 0,
    specialties: agent.personality?.expertise || [],
    verified: agent.status === 'active',
    featured: agent.state?.learningProgress > 0.8, // Feature well-trained agents
    lastUpdated: agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : 'Unknown',
  }
}

export async function fetchAgentFromAlliance(names?: string): Promise<{ success: boolean; data?: Agent[]; error?: string }> {
  try {
    // Build query parameters
    const queryParams = names ? `?names=${encodeURIComponent(names)}` : ''
    
    // Fetch agents from the alliance API
    const response = await fetch(`/api/agents/alliance${queryParams}`)
    const result = await response.json()
    
    if (result.success) {
      // Transform the API data to match the Agent type
      const transformedAgents: Agent[] = result.data.agents.map(transformMetadataAgent)
      
      return {
        success: true,
        data: transformedAgents
      }
    } else {
      return {
        success: false,
        error: 'Failed to fetch agents'
      }
    }
  } catch (err) {
    console.error('Error fetching agents:', err)
    return {
      success: false,
      error: 'Failed to load agents'
    }
  }
} 