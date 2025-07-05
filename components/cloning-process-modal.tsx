"use client"

import { useState, useEffect } from "react"
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode"
import { usePrivy } from '@privy-io/react-auth'

interface CloningProcessModalProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  { id: 1, title: "Age Verification", description: "Verify you are 18+ years old" },
  { id: 2, title: "Fill Your Data", description: "Personal information" },
  { id: 3, title: "Payment Process", description: "Complete setup" },
]

export default function CloningProcessModal({ isOpen, onClose }: CloningProcessModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    professionalTitle: "",
    bio: "",
    areasOfExpertise: "",
  })

  const { ready, user } = usePrivy()
  const userAddress = user?.wallet?.address

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleVerificationSuccess = () => {
    console.log("Age verification successful!")
    setVerificationSuccess(true)
    setCurrentStep(2)
  }

  const handleVerificationError = (error: any) => {
    console.error("Verification failed:", error)
  }

  const createSelfApp = () => {
    if (!userAddress) {
      console.error("No user address available")
      return null
    }

    // Create user defined data for context
    const userDefinedData = JSON.stringify({
      action: "age_verification",
      required_age: 18
    })

    // Convert to hex and pad to 64 bytes (128 hex characters)
    const hexData = Buffer.from(userDefinedData).toString('hex').padEnd(128, '0')

    return new SelfAppBuilder({
      appName: "MirrorMind AI Clone",
      scope: "mirrormind-clone", // Keep under 25 characters
      endpoint: "https://v0-react-web3-8e8z3ru3n-blockbyvlog-4382s-projects.vercel.app/api/verify",
      endpointType: "staging_celo", // Use staging for development
      logoBase64: "",
      userId: userAddress,
      userIdType: "hex",
      version: 2, // V2 configuration
      userDefinedData: "",
      disclosures: {
        // Only request age verification (18+)
        minimumAge: 18,
        // Optional: Add OFAC compliance for financial services
        ofac: true
      },
      devMode: true // Set to false for production
    }).build()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Age Verification</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Verify that you are 18 years or older to continue with the cloning process
            </p>

            {!userAddress ? (
              <div className="glass-card p-8 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">Wallet Connection Required</h3>
                <p className="text-slate-300 mb-4">Please connect your wallet to continue with the verification process.</p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="clean-btn-primary text-sm px-6 py-2"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="glass-card p-8 mb-6">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Wallet Connected</h3>
                  <p className="text-slate-300 text-sm font-mono break-all">{userAddress}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-semibold text-white mb-3">Verification Requirements:</h4>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Must be 18 years or older
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Valid government-issued ID required
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      OFAC compliance check
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl mb-6">
                  <SelfQRcodeWrapper
                    selfApp={createSelfApp()}
                    onSuccess={handleVerificationSuccess}
                    onError={handleVerificationError}
                    size={200}
                  />
                </div>

                <p className="text-slate-400 text-sm mb-4">
                  Scan this QR code with the Self mobile app to verify your age
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <a
                    href="https://apps.apple.com/app/self-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>

                  <a
                    href="https://play.google.com/store/apps/details?id=com.selfapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Fill Your Data</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Complete your profile information to personalize your AI clone
            </p>

            <div className="space-y-6 text-left max-w-md mx-auto mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="premium-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Professional Title</label>
                <input
                  type="text"
                  placeholder="e.g., Content Creator, Entrepreneur"
                  className="premium-input"
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  placeholder="Tell us about yourself and your expertise..."
                  rows={4}
                  className="premium-input resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Areas of Expertise</label>
                <input
                  type="text"
                  placeholder="e.g., Marketing, Business, Technology"
                  className="premium-input"
                  value={formData.areasOfExpertise}
                  onChange={(e) => setFormData({ ...formData, areasOfExpertise: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(3)}
              className="liquid-glass-btn text-base px-8 py-3"
              disabled={!formData.fullName.trim()}
            >
              Continue to Payment
            </button>
          </div>
        )

      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Payment Process</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Complete your payment to start the cloning process
            </p>

            <div className="glass-card p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-300 text-lg">Clone Creation Setup</span>
                <span className="text-2xl font-bold accent-gradient-text">$99 USDC</span>
              </div>

              <div className="space-y-3 text-left text-sm text-slate-400 mb-6">
                <div className="flex justify-between">
                  <span>AI Training & Setup</span>
                  <span>$79</span>
                </div>
                <div className="flex justify-between">
                  <span>Identity Verification</span>
                  <span>$15</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>$5</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>$99 USDC</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">What happens next?</p>
                    <p className="text-blue-200/80 text-xs leading-relaxed">
                      After payment, our AI team will begin training your clone. The process takes 2-3 weeks and you'll
                      receive updates via email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Handle payment completion
                alert("Payment processed! Your clone creation has begun.")
                onClose()
              }}
              className="liquid-glass-btn text-base px-8 py-3"
            >
              Pay $99 USDC
            </button>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-6xl w-full h-[90vh] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Left Side - Progress Bar */}
          <div className="w-80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-8 border-r border-white/10">
            <div className="mb-8">
              <h3 className="text-xl font-bold premium-gradient-text mb-2">Clone Creation</h3>
              <p className="text-slate-400 text-sm">Follow these steps to create your digital twin</p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  {/* Step Circle */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep === step.id
                          ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : currentStep > step.id
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-slate-600 text-slate-500"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{step.id}</span>
                      )}
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mx-auto mt-2 transition-all duration-300 ${
                          currentStep > step.id ? "bg-green-500" : "bg-slate-600"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-6">
                    <h4
                      className={`font-semibold mb-1 transition-colors duration-300 ${
                        currentStep >= step.id ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        currentStep >= step.id ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Step Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex justify-between items-center mb-6">
                {currentStep > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Back</span>
                  </button>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-w-2xl mx-auto">{renderStepContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
