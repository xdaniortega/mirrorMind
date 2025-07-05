import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Received agent creation data after blockchain confirmation:', data)
    
    // Validate required fields
    if (!data.agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      )
    }
    
    if (!data.transactionHash) {
      return NextResponse.json(
        { success: false, message: 'Transaction hash is required' },
        { status: 400 }
      )
    }
    
    if (!data.userAddress) {
      return NextResponse.json(
        { success: false, message: 'User address is required' },
        { status: 400 }
      )
    }
    
    // TODO: Here will go the database integration
    // For now, we'll store the data in memory/hardcoded values
    
    // Hardcoded storage (temporary until database is implemented)
    const agentData = {
      id: data.agentId, // Use the agent ID from blockchain
      userAddress: data.userAddress,
      age: data.age,
      specialization: data.specialization,
      character: data.character,
      knowledgeBase: data.knowledgeBase,
      twitterInteractions: data.twitterInteractions,
      mediaContent: data.mediaContent,
      verificationSuccess: data.verificationSuccess,
      timestamp: data.timestamp,
      transactionHash: data.transactionHash, // Store blockchain transaction hash
      blockNumber: data.blockNumber, // Store block number
      status: 'confirmed', // Agent is confirmed on blockchain
      createdAt: new Date().toISOString()
    }
    
    console.log('Agent data confirmed and stored:', agentData)
    
    // TODO: Save to database with blockchain confirmation
    // await db.agents.create(agentData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agent created successfully and confirmed on blockchain',
      agentId: agentData.id,
      transactionHash: data.transactionHash,
      blockNumber: data.blockNumber,
      status: 'confirmed'
    })
    
  } catch (error) {
    console.error('Error processing agent creation:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 