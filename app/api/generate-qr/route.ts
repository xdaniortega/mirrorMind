import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json()

    // Generate a unique session ID for this verification
    const sessionId = `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Self.xyz configuration based on their documentation
    const selfConfig = {
      // Replace with your actual Self app configuration
      appId: process.env.SELF_APP_ID || "your-app-id",
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/self-callback`,
      sessionId: sessionId,
      userData: userData,
      // Self.xyz specific parameters
      requestedAttributes: ["given_name", "family_name", "date_of_birth", "nationality", "document_number"],
      purpose: "Identity verification for AI clone creation",
    }

    // Generate the Self.xyz verification URL
    const verificationUrl =
      `https://app.self.xyz/verify?` +
      new URLSearchParams({
        app_id: selfConfig.appId,
        redirect_url: selfConfig.redirectUrl,
        session_id: sessionId,
        requested_attributes: selfConfig.requestedAttributes.join(","),
        purpose: selfConfig.purpose,
      }).toString()

    // Generate QR code using QR Server API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(verificationUrl)}`

    // Store session data (in production, use a proper database)
    // For now, we'll return the session info
    return NextResponse.json({
      success: true,
      qrCodeUrl: qrCodeUrl,
      sessionId: sessionId,
      verificationUrl: verificationUrl,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    })
  } catch (error) {
    console.error("QR generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate QR code",
      },
      { status: 500 },
    )
  }
}
