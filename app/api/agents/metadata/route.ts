import { type NextRequest, NextResponse } from "next/server"

// Mock agent metadata database
const agentMetadata = new Map([
  ["agent-001", {
    id: "agent-001",
    name: "Alex Thompson",
    type: "personal_clone",
    status: "active",
    personality: {
      traits: ["analytical", "creative", "empathetic", "detail-oriented"],
      communicationStyle: "professional yet friendly",
      expertise: ["business strategy", "marketing", "technology"],
      tone: "confident and supportive",
      values: ["innovation", "collaboration", "continuous learning"]
    },
    biography: {
      fullName: "Alex Thompson",
      professionalTitle: "Strategic Business Consultant & Tech Enthusiast",
      background: "10+ years in business strategy and digital transformation",
      achievements: [
        "Led 50+ successful business transformations",
        "Published author on digital innovation",
        "Advisor to Fortune 500 companies"
      ],
      education: "MBA from Stanford, BS in Computer Science",
      interests: ["AI/ML", "sustainable business", "startup ecosystem"]
    },
    state: {
      currentMode: "active",
      lastInteraction: "2024-01-15T12:30:00Z",
      totalInteractions: 1247,
      averageResponseTime: 1.2,
      userSatisfaction: 4.8,
      learningProgress: 0.85,
      specializationAreas: ["business_consulting", "tech_advice", "strategy_planning"]
    },
    trainingData: {
      documents: ["business_plans", "market_analysis", "tech_reviews"],
      conversations: 5000,
      knowledgeBase: "comprehensive_business_tech",
      lastUpdated: "2024-01-14T18:00:00Z"
    },
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T12:30:00Z"
  }],
  ["agent-002", {
    id: "agent-002",
    name: "Sarah Chen",
    type: "celebrity_clone",
    status: "active",
    personality: {
      traits: ["charismatic", "inspirational", "authentic", "motivational"],
      communicationStyle: "warm and engaging",
      expertise: ["personal development", "motivation", "life coaching"],
      tone: "encouraging and uplifting",
      values: ["authenticity", "growth", "helping others"]
    },
    biography: {
      fullName: "Sarah Chen",
      professionalTitle: "Life Coach & Motivational Speaker",
      background: "Former corporate executive turned life transformation expert",
      achievements: [
        "Helped 10,000+ people transform their lives",
        "Best-selling author of 'Authentic Living'",
        "Featured speaker at TEDx events"
      ],
      education: "Psychology degree, Certified Life Coach",
      interests: ["mindfulness", "personal growth", "wellness"]
    },
    state: {
      currentMode: "active",
      lastInteraction: "2024-01-15T11:45:00Z",
      totalInteractions: 2156,
      averageResponseTime: 0.8,
      userSatisfaction: 4.9,
      learningProgress: 0.92,
      specializationAreas: ["life_coaching", "motivation", "personal_development"]
    },
    trainingData: {
      documents: ["speeches", "coaching_sessions", "books"],
      conversations: 8000,
      knowledgeBase: "life_coaching_motivation",
      lastUpdated: "2024-01-13T20:00:00Z"
    },
    createdAt: "2024-01-02T14:00:00Z",
    updatedAt: "2024-01-15T11:45:00Z"
  }],
  ["agent-003", {
    id: "agent-003",
    name: "Marcus Rodriguez",
    type: "expert_clone",
    status: "training",
    personality: {
      traits: ["technical", "precise", "logical", "thorough"],
      communicationStyle: "clear and methodical",
      expertise: ["software engineering", "system architecture", "AI/ML"],
      tone: "professional and educational",
      values: ["quality", "innovation", "knowledge sharing"]
    },
    biography: {
      fullName: "Marcus Rodriguez",
      professionalTitle: "Senior Software Architect & AI Researcher",
      background: "15+ years in software development and AI research",
      achievements: [
        "Built scalable systems for 100M+ users",
        "Published 20+ research papers on AI",
        "Led engineering teams at top tech companies"
      ],
      education: "PhD in Computer Science, MS in AI",
      interests: ["distributed systems", "machine learning", "open source"]
    },
    state: {
      currentMode: "training",
      lastInteraction: "2024-01-15T09:15:00Z",
      totalInteractions: 342,
      averageResponseTime: 2.1,
      userSatisfaction: 4.6,
      learningProgress: 0.45,
      specializationAreas: ["software_engineering", "ai_research", "system_design"]
    },
    trainingData: {
      documents: ["code_reviews", "research_papers", "technical_docs"],
      conversations: 2000,
      knowledgeBase: "software_engineering_ai",
      lastUpdated: "2024-01-15T09:15:00Z"
    },
    createdAt: "2024-01-10T16:00:00Z",
    updatedAt: "2024-01-15T09:15:00Z"
  }]
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('id')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    if (agentId) {
      // Get specific agent metadata
      const metadata = agentMetadata.get(agentId)
      if (!metadata) {
        return NextResponse.json(
          {
            success: false,
            error: "Agent not found",
          },
          { status: 404 },
        )
      }
      return NextResponse.json({
        success: true,
        metadata
      })
    }

    // Get all agents with optional filters
    let agents = Array.from(agentMetadata.values())
    if (type) {
      agents = agents.filter(agent => agent.type === type)
    }
    if (status) {
      agents = agents.filter(agent => agent.status === status)
    }

    return NextResponse.json({
      success: true,
      data: {
        agents,
        total: agents.length,
        stats: {
          active: Array.from(agentMetadata.values()).filter(agent => agent.status === 'active').length,
          training: Array.from(agentMetadata.values()).filter(agent => agent.status === 'training').length,
          inactive: Array.from(agentMetadata.values()).filter(agent => agent.status === 'inactive').length
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve agent metadata",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      type, 
      personality, 
      biography, 
      state, 
      trainingData 
    } = await request.json()

    // Generate new agent ID
    const agentId = `agent-${Date.now()}`
    
    // Simulate metadata creation process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newMetadata = {
      id: agentId,
      name,
      type,
      status: "training",
      personality: personality || {
        traits: [],
        communicationStyle: "",
        expertise: [],
        tone: "",
        values: []
      },
      biography: biography || {
        fullName: "",
        professionalTitle: "",
        background: "",
        achievements: [],
        education: "",
        interests: []
      },
      state: state || {
        currentMode: "training",
        lastInteraction: null,
        totalInteractions: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        learningProgress: 0,
        specializationAreas: []
      },
      trainingData: trainingData || {
        documents: [],
        conversations: 0,
        knowledgeBase: "",
        lastUpdated: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    agentMetadata.set(agentId, newMetadata)

    return NextResponse.json({
      success: true,
      message: "Agent metadata created successfully",
      agentId,
      metadata: newMetadata
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create agent metadata",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      agentId, 
      personality, 
      biography, 
      state, 
      trainingData,
      status 
    } = await request.json()

    const metadata = agentMetadata.get(agentId)
    if (!metadata) {
      return NextResponse.json(
        {
          success: false,
          error: "Agent not found",
        },
        { status: 404 },
      )
    }

    // Update metadata
    const updatedMetadata = {
      ...metadata,
      personality: { ...metadata.personality, ...personality },
      biography: { ...metadata.biography, ...biography },
      state: { ...metadata.state, ...state },
      trainingData: { ...metadata.trainingData, ...trainingData },
      status: status || metadata.status,
      updatedAt: new Date().toISOString()
    }

    agentMetadata.set(agentId, updatedMetadata)

    return NextResponse.json({
      success: true,
      message: "Agent metadata updated successfully",
      metadata: updatedMetadata
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update agent metadata",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('id')

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Agent ID parameter required",
        },
        { status: 400 },
      )
    }

    const deleted = agentMetadata.delete(agentId)
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Agent not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Agent metadata deleted successfully"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete agent metadata",
      },
      { status: 500 },
    )
  }
} 