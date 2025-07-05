import { SelfBackendVerifier, DefaultConfigStore } from '@selfxyz/core'

const configStore = new DefaultConfigStore({
  minimumAge: 18,
  ofac: true
})

const verifier = new SelfBackendVerifier(
  'mirrormind-clone',  // Same scope as frontend
  'https://v0-react-web3-8e8z3ru3n-blockbyvlog-4382s-projects.vercel.app/api/verify',
  true,  // Production mode (set to true for development)
  'AllIds',  // Accept all document types
  configStore,
  'hex'  // User ID type
)

export async function POST(request: Request) {
  try {
    const { attestationId, proof, pubSignals, userContextData } = await request.json()
    
    console.log('Received verification request:', {
      attestationId,
      userContextData: userContextData ? JSON.parse(Buffer.from(userContextData, 'hex').toString()) : null
    })
    
    const result = await verifier.verify(
      attestationId,
      proof,
      pubSignals,
      userContextData
    )
    
    console.log('Verification result:', result)
    
    if (result.isValidDetails.isValid && result.isValidDetails.isOlderThanValid) {
      return Response.json({ 
        verified: true,
        age_verified: true,
        message: "Age verification successful"
      })
    }
    
    return Response.json({ 
      verified: false,
      message: "Age verification failed"
    }, { status: 400 })
    
  } catch (error) {
    console.error('Verification error:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      verified: false
    }, { status: 500 })
  }
} 