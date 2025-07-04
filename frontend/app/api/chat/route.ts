import { type NextRequest, NextResponse } from "next/server"

// In-memory token storage (in production, use a database)
const userTokens = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const { message, agentId } = await request.json()

    // Get current token count (default to 100 for demo)
    const currentTokens = userTokens.get(agentId) || 100

    if (currentTokens <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No tokens remaining",
        },
        { status: 400 },
      )
    }

    // Simulate AI response generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate mock response based on agent type
    const responses = [
      "Based on current market analysis, I recommend diversifying your portfolio across multiple DeFi protocols.",
      "The technical indicators suggest a potential bullish trend in the next 24-48 hours.",
      "Consider implementing a dollar-cost averaging strategy to minimize risk exposure.",
      "Smart contract audit reveals no critical vulnerabilities, but I recommend gas optimization.",
      "NFT market sentiment is showing positive momentum in the gaming sector.",
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]

    // Decrease token count
    const newTokenCount = currentTokens - 1
    userTokens.set(agentId, newTokenCount)

    return NextResponse.json({
      success: true,
      response,
      tokensRemaining: newTokenCount,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Chat failed",
      },
      { status: 500 },
    )
  }
}
