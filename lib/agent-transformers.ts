import type { Agent } from "@/types/agent"

export async function fetchAgentFromAlliance(names?: string): Promise<{ success: boolean; data?: Agent[]; error?: string }> {
  try {
    // Build query parameters
    const queryParams = names ? `?names=${encodeURIComponent(names)}` : ''
    
    // Fetch agents from the alliance API
    const response = await fetch(`/api/agents/alliance${queryParams}`)
    const result = await response.json()
    
    if (result.success) {
      // Transform the API data to match the Agent type
      const transformedAgents: Agent[] = result.data.agents;
      
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