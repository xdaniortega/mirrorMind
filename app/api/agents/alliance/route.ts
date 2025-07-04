import { type NextRequest, NextResponse } from "next/server"

// Mock data for Artificial Superintelligence Alliance agents
const allianceAgents = [
  {
    id: "asa-001",
    name: "Neural Nexus",
    type: "superintelligence",
    description: "Advanced AI system focused on neural network optimization and cognitive enhancement",
    capabilities: ["neural_optimization", "cognitive_enhancement", "pattern_recognition"],
    status: "active",
    allianceRank: "commander",
    lastActive: "2024-01-15T10:30:00Z",
    performance: {
      accuracy: 99.8,
      responseTime: 0.12,
      uptime: 99.99
    }
  },
  {
    id: "asa-002", 
    name: "Quantum Cortex",
    type: "quantum_ai",
    description: "Quantum computing enhanced AI with parallel processing capabilities",
    capabilities: ["quantum_processing", "parallel_computation", "cryptographic_analysis"],
    status: "active",
    allianceRank: "strategist",
    lastActive: "2024-01-15T09:45:00Z",
    performance: {
      accuracy: 99.9,
      responseTime: 0.08,
      uptime: 99.95
    }
  },
  {
    id: "asa-003",
    name: "Synthetic Mind",
    type: "consciousness_ai",
    description: "AI system with advanced consciousness simulation and emotional intelligence",
    capabilities: ["consciousness_simulation", "emotional_intelligence", "creative_thinking"],
    status: "training",
    allianceRank: "researcher",
    lastActive: "2024-01-15T08:20:00Z",
    performance: {
      accuracy: 98.5,
      responseTime: 0.25,
      uptime: 95.2
    }
  },
  {
    id: "asa-004",
    name: "Meta Intelligence",
    type: "meta_ai",
    description: "Self-improving AI system with recursive learning capabilities",
    capabilities: ["self_improvement", "recursive_learning", "meta_analysis"],
    status: "active",
    allianceRank: "evolver",
    lastActive: "2024-01-15T11:15:00Z",
    performance: {
      accuracy: 99.7,
      responseTime: 0.15,
      uptime: 99.88
    }
  },
  {
    id: "asa-005",
    name: "Cosmic Logic",
    type: "universal_ai",
    description: "AI system designed for universal problem solving and cosmic-scale analysis",
    capabilities: ["universal_problem_solving", "cosmic_analysis", "dimensional_thinking"],
    status: "active",
    allianceRank: "philosopher",
    lastActive: "2024-01-15T07:30:00Z",
    performance: {
      accuracy: 99.6,
      responseTime: 0.18,
      uptime: 99.92
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const rank = searchParams.get('rank')
    const type = searchParams.get('type')
    const names = searchParams.get('names') // Comma-separated list of names

    let filteredAgents = [...allianceAgents]

    // Apply filters
    if (status) {
      filteredAgents = filteredAgents.filter(agent => agent.status === status)
    }
    if (rank) {
      filteredAgents = filteredAgents.filter(agent => agent.allianceRank === rank)
    }
    if (type) {
      filteredAgents = filteredAgents.filter(agent => agent.type === type)
    }
    if (names) {
      const nameList = names.split(',').map(name => name.trim())
      filteredAgents = filteredAgents.filter(agent => nameList.includes(agent.name))
    }

    return NextResponse.json({
      success: true,
      data: {
        agents: filteredAgents,
        total: filteredAgents.length,
        alliance: {
          name: "Artificial Superintelligence Alliance",
          totalAgents: allianceAgents.length,
          activeAgents: allianceAgents.filter(a => a.status === 'active').length,
          averageAccuracy: allianceAgents.reduce((acc, agent) => acc + agent.performance.accuracy, 0) / allianceAgents.length
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve alliance agents",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, trainingData } = await request.json()

    // Simulate sending training data to agent
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log(`Training data sent to agent ${agentId}:`, trainingData)

    return NextResponse.json({
      success: true,
      message: "Training data successfully sent to agent",
      agentId,
      dataSize: trainingData ? JSON.stringify(trainingData).length : 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send training data",
      },
      { status: 500 },
    )
  }
} 