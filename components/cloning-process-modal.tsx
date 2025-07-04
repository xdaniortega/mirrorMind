"use client"

import { useState, useEffect } from "react"

interface CloningProcessModalProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  { id: 1, title: "Download Self App", description: "Human verification" },
  { id: 2, title: "Scan Passport", description: "Identity verification" },
  { id: 3, title: "Fill Your Data", description: "Personal information" },
  { id: 4, title: "Payment Process", description: "Complete setup" },
]

export default function CloningProcessModal({ isOpen, onClose }: CloningProcessModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [qrCode, setQrCode] = useState("")
  const [verificationQR, setVerificationQR] = useState("")
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    professionalTitle: "",
    bio: "",
    areasOfExpertise: "",
  })

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Generate QR code URL for Self App download
      const appStoreUrl = "https://apps.apple.com/app/self-app"
      const playStoreUrl = "https://play.google.com/store/apps/details?id=com.selfapp"
      const qrData = `selfapp://download?ios=${encodeURIComponent(appStoreUrl)}&android=${encodeURIComponent(playStoreUrl)}`
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`)
    }
  }, [isOpen])

  const generateVerificationQR = async () => {
    setIsGeneratingQR(true)
    try {
      const response = await fetch("/api/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setVerificationQR(result.qrCodeUrl)
      } else {
        console.error("Failed to generate QR:", result.error)
      }
    } catch (error) {
      console.error("QR generation error:", error)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStepComplete = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Install Self App</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Get started by installing the Self mobile app to create your digital identity
            </p>

            <div className="bg-white p-6 rounded-2xl mb-6 inline-block shadow-lg">
              <img
                src={qrCode || "/placeholder.svg?height=200&width=200&text=QR"}
                alt="Self App QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-slate-400 text-sm mb-8">
              Scan this QR code with your phone camera to download the Self app
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

            <button onClick={handleStepComplete} className="liquid-glass-btn text-base px-8 py-3">
              I've Installed the App
            </button>
          </div>
        )

      case 2:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Scan Your Passport</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Use the Self app to scan your passport for identity verification
            </p>

            <div className="glass-card p-8 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Open the Self app on your phone</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Select "Verify Identity"</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Scan your passport's data page</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Complete the verification process</span>
                </div>
              </div>
            </div>

            <button onClick={handleStepComplete} className="liquid-glass-btn text-base px-8 py-3">
              Passport Verified
            </button>
          </div>
        )

      case 3:
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
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Professional Title</label>
                <input
                  type="text"
                  placeholder="e.g., Content Creator, Entrepreneur"
                  className="premium-input"
                  value={formData.professionalTitle}
                  onChange={(e) => handleInputChange("professionalTitle", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  placeholder="Tell us about yourself and your expertise..."
                  rows={4}
                  className="premium-input resize-none"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Areas of Expertise</label>
                <input
                  type="text"
                  placeholder="e.g., Marketing, Business, Technology"
                  className="premium-input"
                  value={formData.areasOfExpertise}
                  onChange={(e) => handleInputChange("areasOfExpertise", e.target.value)}
                />
              </div>
            </div>

            {/* Identity Verification QR Code */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold premium-gradient-text mb-4">Identity Verification</h3>
              <p className="text-slate-400 text-sm mb-6">Scan this QR code with the Self app to verify your identity</p>

              {!verificationQR ? (
                <button
                  onClick={generateVerificationQR}
                  disabled={isGeneratingQR || !formData.fullName}
                  className="liquid-glass-btn-sm text-sm px-6 py-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingQR ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating QR...</span>
                    </div>
                  ) : (
                    "Generate Verification QR"
                  )}
                </button>
              ) : (
                <div className="bg-white p-4 rounded-2xl mb-6 inline-block shadow-lg">
                  <img
                    src={verificationQR || "/placeholder.svg"}
                    alt="Identity Verification QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}

              {verificationQR && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm">
                      <p className="text-blue-300 font-medium mb-1">Next Steps</p>
                      <p className="text-blue-200/80 text-xs leading-relaxed">
                        Open the Self app and scan this QR code to complete your identity verification. This ensures the
                        authenticity of your AI clone.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStepComplete}
              className="liquid-glass-btn text-base px-8 py-3"
              disabled={!verificationQR}
            >
              Continue to Payment
            </button>
          </div>
        )

      case 4:
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
