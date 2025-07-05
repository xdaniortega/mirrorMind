import { type NextRequest, NextResponse } from "next/server"

// Mock data for Artificial Superintelligence Alliance agents
const allianceAgents = [
  {
    id: "1",
    name: "Content Strategy Master",
    type: "clone",
    category: "content-creation",
    description:
      "Advanced content strategy and viral marketing expert. Specializes in audience growth, engagement optimization, and platform-specific content creation.",
    avatar: "/EthHolderImage.jpeg",
    price: 15.99,
    rating: 4.9,
    totalChats: 2450,
    specialties: ["Content Strategy", "Viral Marketing", "Audience Growth", "Platform Optimization"],
    verified: true,
    featured: true,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "Educational Course Designer",
    type: "clone",
    category: "education",
    description:
      "Expert in creating engaging educational content and course structures. Specializes in learning psychology and student engagement strategies.",
    avatar: "/WillSmithBanner.jpeg",
    price: 18.99,
    rating: 4.8,
    totalChats: 1890,
    specialties: ["Course Design", "Learning Psychology", "Student Engagement", "Assessment Creation"],
    verified: true,
    featured: true,
    lastUpdated: "1 hour ago",
  },
  {
    id: "3",
    name: "Social Media Growth Hacker",
    type: "generic",
    category: "social-media",
    description:
      "Comprehensive social media growth strategies including hashtag optimization, posting schedules, and community building techniques.",
    avatar: "/GrantBanner.jpeg",
    price: 12.99,
    rating: 4.6,
    totalChats: 1200,
    specialties: ["Social Media Growth", "Hashtag Strategy", "Community Building", "Analytics"],
    verified: true,
    featured: false,
    lastUpdated: "3 hours ago",
  },
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