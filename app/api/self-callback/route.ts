import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const status = searchParams.get("status")
    const verificationData = searchParams.get("data")

    if (status === "success" && verificationData) {
      // Parse the verification data from Self.xyz
      const userData = JSON.parse(decodeURIComponent(verificationData))

      // Store the verified data (in production, use a proper database)
      console.log("Verification successful for session:", sessionId)
      console.log("User data:", userData)

      // Redirect to success page or back to the app
      return NextResponse.redirect(new URL(`/verification-success?session=${sessionId}`, request.url))
    } else {
      // Handle verification failure
      return NextResponse.redirect(new URL(`/verification-failed?session=${sessionId}`, request.url))
    }
  } catch (error) {
    console.error("Self callback error:", error)
    return NextResponse.redirect(new URL("/verification-failed", request.url))
  }
}
