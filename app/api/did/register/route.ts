import { type NextRequest, NextResponse } from "next/server"

// Mock verified identities database
const verifiedIdentities = new Map([
  ["did:mirrormind:user:001", {
    did: "did:mirrormind:user:001",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    verificationStatus: "verified",
    verificationMethod: "self_verification",
    verifiedAt: "2024-01-10T14:30:00Z",
    expiresAt: "2025-01-10T14:30:00Z",
    attributes: {
      age: "verified_18_plus",
      identity: "verified_government_id",
      ofac: "compliant",
      kyc: "completed"
    },
    documents: [
      {
        type: "government_id",
        status: "verified",
        verifiedAt: "2024-01-10T14:30:00Z"
      },
      {
        type: "age_verification",
        status: "verified",
        verifiedAt: "2024-01-10T14:30:00Z"
      }
    ]
  }],
  ["did:mirrormind:user:002", {
    did: "did:mirrormind:user:002",
    walletAddress: "0x8ba1f109551bD432803012645Hac136c772c3c7",
    verificationStatus: "pending",
    verificationMethod: "self_verification",
    verifiedAt: null,
    expiresAt: null,
    attributes: {
      age: "pending",
      identity: "pending",
      ofac: "pending",
      kyc: "pending"
    },
    documents: [
      {
        type: "government_id",
        status: "pending",
        verifiedAt: null
      }
    ]
  }],
  ["did:mirrormind:user:003", {
    did: "did:mirrormind:user:003",
    walletAddress: "0x1234567890123456789012345678901234567890",
    verificationStatus: "expired",
    verificationMethod: "self_verification",
    verifiedAt: "2023-06-15T10:20:00Z",
    expiresAt: "2024-01-01T10:20:00Z",
    attributes: {
      age: "verified_18_plus",
      identity: "verified_government_id",
      ofac: "compliant",
      kyc: "completed"
    },
    documents: [
      {
        type: "government_id",
        status: "expired",
        verifiedAt: "2023-06-15T10:20:00Z"
      }
    ]
  }]
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const did = searchParams.get('did')
    const walletAddress = searchParams.get('wallet')
    const status = searchParams.get('status')

    if (did) {
      // Get specific DID
      const identity = verifiedIdentities.get(did)
      if (!identity) {
        return NextResponse.json(
          {
            success: false,
            error: "DID not found",
          },
          { status: 404 },
        )
      }
      return NextResponse.json({
        success: true,
        identity
      })
    }

    if (walletAddress) {
      // Get by wallet address
      const identity = Array.from(verifiedIdentities.values()).find(
        id => id.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      )
      if (!identity) {
        return NextResponse.json(
          {
            success: false,
            error: "Wallet address not found",
          },
          { status: 404 },
        )
      }
      return NextResponse.json({
        success: true,
        identity
      })
    }

    // Get all identities with optional status filter
    let identities = Array.from(verifiedIdentities.values())
    if (status) {
      identities = identities.filter(id => id.verificationStatus === status)
    }

    return NextResponse.json({
      success: true,
      data: {
        identities,
        total: identities.length,
        stats: {
          verified: Array.from(verifiedIdentities.values()).filter(id => id.verificationStatus === 'verified').length,
          pending: Array.from(verifiedIdentities.values()).filter(id => id.verificationStatus === 'pending').length,
          expired: Array.from(verifiedIdentities.values()).filter(id => id.verificationStatus === 'expired').length
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve verified identities",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, verificationData, documents } = await request.json()

    // Generate new DID
    const did = `did:mirrormind:user:${Date.now()}`
    
    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newIdentity = {
      did,
      walletAddress,
      verificationStatus: "pending",
      verificationMethod: "self_verification",
      verifiedAt: null,
      expiresAt: null,
      attributes: {
        age: "pending",
        identity: "pending",
        ofac: "pending",
        kyc: "pending"
      },
      documents: documents || [],
      createdAt: new Date().toISOString()
    }

    verifiedIdentities.set(did, newIdentity)

    return NextResponse.json({
      success: true,
      message: "Identity registration initiated",
      did,
      status: "pending"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to register identity",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { did, verificationStatus, attributes, documents } = await request.json()

    const identity = verifiedIdentities.get(did)
    if (!identity) {
      return NextResponse.json(
        {
          success: false,
          error: "DID not found",
        },
        { status: 404 },
      )
    }

    // Update identity
    const updatedIdentity = {
      ...identity,
      verificationStatus: verificationStatus || identity.verificationStatus,
      verifiedAt: verificationStatus === 'verified' ? new Date().toISOString() : identity.verifiedAt,
      expiresAt: verificationStatus === 'verified' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : identity.expiresAt,
      attributes: { ...identity.attributes, ...attributes },
      documents: documents || identity.documents,
      updatedAt: new Date().toISOString()
    }

    verifiedIdentities.set(did, updatedIdentity)

    return NextResponse.json({
      success: true,
      message: "Identity updated successfully",
      identity: updatedIdentity
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update identity",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const did = searchParams.get('did')

    if (!did) {
      return NextResponse.json(
        {
          success: false,
          error: "DID parameter required",
        },
        { status: 400 },
      )
    }

    const deleted = verifiedIdentities.delete(did)
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "DID not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Identity deleted successfully"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete identity",
      },
      { status: 500 },
    )
  }
} 