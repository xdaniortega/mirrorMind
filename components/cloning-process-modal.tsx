"use client"

import { useState, useEffect } from "react"
import { SelfQRcodeWrapper, SelfAppBuilder, countries } from "@selfxyz/qrcode"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ethers } from "ethers"

interface CloningProcessModalProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
    { id: 1, title: "Install Self App", description: "Get started by installing the Self mobile app" },
    { id: 2, title: "Connect with ID", description: "Follow the instructions in the mobile app" },
    { id: 3, title: "Human Verification", description: "Verify you're a unique human" },
    { id: 4, title: "Character Profile", description: "Define your AI personality" },
    { id: 5, title: "Knowledge Base", description: "Upload your expertise" },
    { id: 6, title: "Payment Process", description: "Complete setup" },
]

export default function CloningProcessModal({ isOpen, onClose }: CloningProcessModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [formData, setFormData] = useState({
    age: "",
    specialization: "",
    character: "",
    twitterInteractions: null as File | null,
    mediaContent: null as File | null,
    knowledgeBase: "",
  })

  const { ready, user } = usePrivy()
  const { wallets } = useWallets()
  const userAddress = user?.wallet?.address

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleVerificationSuccess = () => {
    console.log("Age verification successful!")
    setVerificationSuccess(true)
    setCurrentStep(4)
  }

  const handleVerificationError = (error: any) => {
    console.error("Verification failed:", error)
  }

  const createSelfApp = () => {
    if (!userAddress) {
      console.error("No user address available")
      return null
    }

    // Encode user wallet address using abi.encode for robust contract decoding
    const userData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [userAddress]
    )

    console.log("address", userAddress);
    return new SelfAppBuilder({
      appName: "MirrorMind AI",
      scope: "myapp", // Keep under 25 characters
      endpoint: "0x833b9997a708D84065d252c0E008C3e8103962DA",
      endpointType: "staging_celo", // Use staging for development
      logoBase64: "",
      userId: userAddress,
      userIdType: "hex",
      version: 2, // V2 configuration
      userDefinedData: userData,
      disclosures: {
        minimumAge: 18,
        ofac: true,
        excludedCountries: [countries.BAHRAIN, countries.ANGOLA, countries.ALGERIA, countries.ALAND_ISLANDS]
      },
      devMode: true // Set to false for production
    }).build()

  }

  // Generate metadata hash from agent data
  const generateMetadataHash = (agentData: any) => {
    const metadataString = JSON.stringify({
      userAddress: agentData.userAddress,
      age: agentData.age,
      specialization: agentData.specialization,
      character: agentData.character,
      knowledgeBase: agentData.knowledgeBase,
      twitterInteractions: agentData.twitterInteractions,
      mediaContent: agentData.mediaContent,
      verificationSuccess: agentData.verificationSuccess,
      timestamp: agentData.timestamp
    })
    return ethers.keccak256(ethers.toUtf8Bytes(metadataString))
  }

  // Send transaction to register agent
  const registerAgentTransaction = async (agentId: string) => {
    try {
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallet connected')
      }

      const wallet = wallets[0]
      const provider = await wallet.getEthereumProvider()
      
      // Get the Ethereum address from the connected wallet
      const accounts = await provider.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('No Ethereum accounts available')
      }
      
      const fromAddress = accounts[0]
      console.log('Using Ethereum address from Privy wallet:', fromAddress)

      // Agent data for metadata hash
      const agentData = {
        userAddress: fromAddress,
        age: formData.age,
        specialization: formData.specialization,
        character: formData.character,
        knowledgeBase: formData.knowledgeBase,
        twitterInteractions: formData.twitterInteractions?.name || null,
        mediaContent: formData.mediaContent?.name || null,
        verificationSuccess,
        timestamp: new Date().toISOString()
      }

      // Generate metadata hash
      const metadataHash = generateMetadataHash(agentData)

      // Contract ABI for registerAgent function
      const registerAgentABI = [
        "function registerAgent(string memory name, string memory description, uint256 pricePerService, string memory metadata) external returns (uint256)"
      ]

      // Create contract interface
      const iface = new ethers.Interface(registerAgentABI)

      // Encode function call data
      const data = iface.encodeFunctionData("registerAgent", [
        agentId, // name (using agentId as name)
        ``, // description
        10000, // pricePerService (0.01 USDC - 6 decimals: 0.01 * 10^6 = 10,000)
        metadataHash // metadata hash
      ])

      console.log('Transaction data:', {
        from: fromAddress,
        to: '0x833b9997a708D84065d252c0E008C3e8103962DA',
        data: data,
        agentId: agentId,
        price: 10000,
        metadataHash: metadataHash
      })

      // Send transaction
      const transactionRequest = {
        from: fromAddress,
        to: '0x833b9997a708D84065d252c0E008C3e8103962DA',
        data: data,
        value: '0x0',
        gas: '0xF4240' // 1,000,000 gas limit (increased for Self Protocol verification)
      }
      
      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionRequest]
      })

      console.log('Transaction sent successfully:', transactionHash)
      return transactionHash

    } catch (error: any) {
      console.error('=== DETAILED ERROR LOGGING ===')
      console.error('Full error object:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error data:', error.data)
      console.error('Error reason:', error.reason)
      console.error('Error stack:', error.stack)
      
      // Log additional error properties if they exist
      if (error.error) {
        console.error('Nested error:', error.error)
      }
      if (error.transaction) {
        console.error('Transaction details:', error.transaction)
      }
      if (error.receipt) {
        console.error('Receipt details:', error.receipt)
      }
      
      console.error('=== END ERROR LOGGING ===')
      
      // More detailed error handling
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction. Please ensure you have enough USDC and gas fees.')
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user.')
      } else if (error.message?.includes('UserNotVerified') || error.message?.includes('execution reverted')) {
        throw new Error('❌ User not verified with Self Protocol. You need to complete identity verification through Self App first before registering an agent.')
      } else if (error.message?.includes('TransferFailed')) {
        throw new Error('USDC transfer failed. Please ensure you have approved the contract to spend your USDC.')
      } else if (error.message?.includes('NameRequired')) {
        throw new Error('Agent name is required and cannot be empty.')
      } else if (error.message?.includes('PriceTooLow')) {
        throw new Error('Price is too low. Minimum price is 1 USDC.')
      } else if (error.message?.includes('PriceTooHigh')) {
        throw new Error('Price is too high. Maximum price is 1000 USDC.')
      } else {
        throw new Error(`Transaction failed: ${error.message || 'Unknown error'}. Check console for detailed error logs.`)
      }
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

            <div className="glass-card p-8 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Download Self App</h3>
              <p className="text-slate-300 mb-6">Scan the QR code below to download the Self mobile app</p>
              
              <div className="bg-white p-6 rounded-2xl mb-6">
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  <img 
                    src="/qr-installation.png" 
                    alt="Self App QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

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

            <p className="text-green-400 text-sm mb-4">✓ I have completed this step</p>

            <button
              onClick={() => setCurrentStep(2)}
              className="liquid-glass-btn text-base px-8 py-3"
            >
              Next Step
            </button>
          </div>
        )

      case 2:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Connect with your ID or Passport</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Follow the instructions in the mobile app
            </p>

            <div className="glass-card p-8 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Identity Verification</h3>
              <p className="text-slate-300 mb-6">Open the Self app and follow these steps:</p>
              
              <div className="space-y-4 text-left max-w-lg mx-auto mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-slate-300 text-sm">Open the Self mobile app on your device</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-slate-300 text-sm">Tap on "Verify Identity" in the main menu</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-slate-300 text-sm">Follow the camera instructions to scan your ID or passport</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p className="text-slate-300 text-sm">Complete the verification process in the app</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                <p className="text-slate-300 text-sm">
                  <strong>Note:</strong> Make sure you have good lighting and a clear view of your document. 
                  The verification process typically takes 2-3 minutes.
                </p>
              </div>
            </div>

            <p className="text-green-400 text-sm mb-4">✓ I have completed this step</p>

            <button
              onClick={() => setCurrentStep(3)}
              className="liquid-glass-btn text-base px-8 py-3"
            >
              Next Step
            </button>
          </div>
        )

      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Verify you're a unique human</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Verify that you're a unique human to continue with the cloning process
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
                      Must be a unique human
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

      case 4:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Character Profile</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Define your AI personality characteristics
            </p>

            <div className="space-y-6 text-left max-w-2xl mx-auto mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">AGE</label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  className="premium-input"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">FIELD OF SPECIALIZATION</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "content-creation", label: "Content Creation", description: "Videos, blogs, social media" },
                    { id: "education", label: "Education", description: "Teaching and training" },
                    { id: "investment", label: "Investment", description: "Finance and trading" },
                    { id: "marketing", label: "Marketing", description: "Campaigns and strategy" }
                  ].map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, specialization: spec.id })}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.specialization === spec.id
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <div className="font-semibold mb-1">{spec.label}</div>
                      <div className="text-xs text-slate-400">{spec.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CHARACTER</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "analytical", label: "Analytical", description: "Data-driven and logical" },
                    { id: "creative", label: "Creative", description: "Innovative and artistic" },
                    { id: "social", label: "Social", description: "Outgoing and collaborative" },
                    { id: "determined", label: "Determined", description: "Focused and persistent" }
                  ].map((char) => (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, character: char.id })}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.character === char.id
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <div className="font-semibold mb-1">{char.label}</div>
                      <div className="text-xs text-slate-400">{char.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">TWITTER INTERACTIONS</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                  <input
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={(e) => setFormData({ ...formData, twitterInteractions: e.target.files?.[0] || null })}
                    className="hidden"
                    id="twitter-file"
                  />
                  <label htmlFor="twitter-file" className="cursor-pointer">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-300 font-medium">Drop your Twitter interactions file here</p>
                    <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                    {formData.twitterInteractions && (
                      <p className="text-green-400 text-sm mt-2">✓ {formData.twitterInteractions.name}</p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">INTERVIEWS/PODCASTS</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                <input
                    type="file"
                    accept=".mp3,.mp4,.wav,.m4a,.pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, mediaContent: e.target.files?.[0] || null })}
                    className="hidden"
                    id="media-file"
                  />
                  <label htmlFor="media-file" className="cursor-pointer">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-300 font-medium">Drop your media content here</p>
                    <p className="text-slate-400 text-sm mt-1">Podcasts, interviews, videos</p>
                    {formData.mediaContent && (
                      <p className="text-green-400 text-sm mt-2">✓ {formData.mediaContent.name}</p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(5)}
              className="liquid-glass-btn text-base px-8 py-3"
              disabled={false}
            >
              Continue to Knowledge Base
            </button>
          </div>
        )

      case 5:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Knowledge Base</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Upload your expertise and knowledge
            </p>

            <div className="space-y-6 text-left max-w-2xl mx-auto mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">KNOWLEDGE FIELDS</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                  <textarea
                    placeholder="Here we want you to tell us what you are an expert in..."
                    rows={6}
                    className="premium-input resize-none w-full bg-transparent border-none text-center"
                    value={formData.knowledgeBase}
                    onChange={(e) => setFormData({ ...formData, knowledgeBase: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Simply advance to payment step without saving to backend
                console.log('Advancing to payment step');
                setCurrentStep(6);
              }}
              className="liquid-glass-btn text-base px-8 py-3"
            >
              Continue to Payment
            </button>
          </div>
        )

      case 6:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold premium-gradient-text mb-4 tracking-tight">Payment Process</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Review your agent details and complete payment
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Agent Summary */}
              <div className="glass-card p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Clone Agent</h3>
                    <p className="text-slate-400 text-sm">Ready for creation</p>
              </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Age:</span>
                        <span className="text-white">{formData.age || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wallet:</span>
                        <span className="text-white font-mono text-xs">{userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Verification:</span>
                        <span className={`text-sm ${verificationSuccess ? 'text-green-400' : 'text-yellow-400'}`}>
                          {verificationSuccess ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Agent Profile</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Specialization:</span>
                        <span className="text-white capitalize">{formData.specialization?.replace('-', ' ') || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Character:</span>
                        <span className="text-white capitalize">{formData.character || 'Not selected'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Knowledge Base</h4>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-300 text-sm line-clamp-3">
                        {formData.knowledgeBase || 'No knowledge base provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Uploaded Files</h4>
                    <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                        <span className="text-slate-400">Twitter Data:</span>
                        <span className="text-white">{formData.twitterInteractions?.name || 'Not uploaded'}</span>
                </div>
                <div className="flex justify-between">
                        <span className="text-slate-400">Media Content:</span>
                        <span className="text-white">{formData.mediaContent?.name || 'Not uploaded'}</span>
                      </div>
                    </div>
                </div>
                </div>
              </div>

              {/* Right Column - Payment Summary */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-6">Payment Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>AI Training & Setup</span>
                    <span>$79 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Identity Verification</span>
                    <span>$15 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Platform Fee</span>
                    <span>$5 USDC</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-white text-lg">
                    <span>Total</span>
                    <span className="accent-gradient-text">$99 USDC</span>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm">
                      <p className="text-green-300 font-medium mb-1">Future Earnings</p>
                      <p className="text-green-200/80 text-xs leading-relaxed">
                        Your clone will generate income that will be sent directly to your connected wallet: 
                        <span className="font-mono text-green-300 block mt-1">
                          {userAddress ? `${userAddress.slice(0, 8)}...${userAddress.slice(-6)}` : 'Not connected'}
                        </span>
                      </p>
                    </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">What happens next?</p>
                    <p className="text-blue-200/80 text-xs leading-relaxed">
                        After payment, our AI team will begin training your clone. The process takes 2-3 weeks and you'll receive updates via email.
                    </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  // Get the Ethereum address from Privy wallet
                  if (!wallets || wallets.length === 0) {
                    throw new Error('No wallet connected')
                  }
                  
                  const wallet = wallets[0]
                  const provider = await wallet.getEthereumProvider()
                  const accounts = await provider.request({ method: 'eth_accounts' })
                  
                  if (!accounts || accounts.length === 0) {
                    throw new Error('No Ethereum accounts available')
                  }
                  
                  const ethAddress = accounts[0]
                  console.log('Using Ethereum address for payment:', ethAddress)

                  // Generate a temporary agent ID for the transaction
                  const tempAgentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  
                  // First, approve USDC spending for the contract
                  console.log('Approving USDC spending for contract...');
                  
                  const usdcAddress = '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B' // Celo Alfajores USDC address
                  const contractAddress = '0x833b9997a708D84065d252c0E008C3e8103962DA'
                  const creatorFee = 10000 // 0.01 USDC in 6 decimals
                  
                  // USDC approve ABI
                  const approveABI = [
                    "function approve(address spender, uint256 amount) external returns (bool)"
                  ]
                  
                  const approveIface = new ethers.Interface(approveABI)
                  const approveData = approveIface.encodeFunctionData("approve", [
                    contractAddress,
                    creatorFee
                  ])
                  
                  const approveRequest = {
                    from: ethAddress,
                    to: usdcAddress,
                    data: approveData,
                    value: '0x0',
                    gas: '0x30D40' // 200,000 gas limit for USDC approval
                  }
                  
                  console.log('Sending USDC approval transaction...');
                  const approveHash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [approveRequest]
                  })
                  
                  console.log('USDC approval sent:', approveHash);
                  
                  // Wait for approval confirmation
                  const celoRpcUrl = process.env.NEXT_PUBLIC_CELO_ALFAJORES_RPC || 'https://alfajores-forno.celo-testnet.org'
                  const ethersProviderForApproval = new ethers.JsonRpcProvider(celoRpcUrl)
                  let approveReceipt = null;
                  let approveAttempts = 0;
                  
                  while (!approveReceipt && approveAttempts < 30) {
                    try {
                      approveReceipt = await ethersProviderForApproval.getTransactionReceipt(approveHash);
                      if (approveReceipt) {
                        break;
                      }
                    } catch (error) {
                      console.log('Waiting for approval confirmation...');
                    }
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    approveAttempts++;
                  }
                  
                  if (!approveReceipt || approveReceipt.status === 0) {
                    throw new Error('USDC approval failed. Please try again.');
                  }
                  
                  console.log('USDC approval confirmed, now registering agent...');
                  
                  // Now send the agent registration transaction
                  const txHash = await registerAgentTransaction(tempAgentId);
                  
                  console.log('Transaction sent, waiting for confirmation:', txHash);
                  
                  // Wait for transaction confirmation
                  const ethersProvider = new ethers.JsonRpcProvider(celoRpcUrl)
                  let receipt = null;
                  let attempts = 0;
                  const maxAttempts = 60; // Wait up to 5 minutes (60 * 5 seconds)
                  
                  while (!receipt && attempts < maxAttempts) {
                    try {
                      receipt = await ethersProvider.getTransactionReceipt(txHash);
                      if (receipt) {
                        break;
                      }
                    } catch (error) {
                      console.log('Waiting for transaction confirmation...');
                    }
                    
                    // Wait 5 seconds before checking again
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    attempts++;
                  }
                  
                  if (!receipt) {
                    throw new Error('Transaction confirmation timeout. Please check the transaction manually.');
                  }
                  
                  if (receipt.status === 0) {
                    throw new Error('Transaction failed on blockchain');
                  }
                  
                  console.log('Transaction confirmed successfully:', receipt);

                  // Only save to backend after blockchain confirmation
                  const response = await fetch('/api/agents/create', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userAddress: ethAddress,
                      age: formData.age,
                      specialization: formData.specialization,
                      character: formData.character,
                      knowledgeBase: formData.knowledgeBase,
                      twitterInteractions: formData.twitterInteractions?.name || null,
                      mediaContent: formData.mediaContent?.name || null,
                      verificationSuccess,
                      timestamp: new Date().toISOString(),
                      transactionHash: txHash, // Include the transaction hash
                      blockNumber: receipt.blockNumber,
                      agentId: tempAgentId // Use the same agent ID from blockchain
                    })
                  });

                  if (!response.ok) {
                    console.warn('Blockchain transaction succeeded but backend save failed');
                    throw new Error('Agent created on blockchain but failed to save to database. Please contact support with transaction hash: ' + txHash);
                  }

                  const result = await response.json();
                  
                  console.log('Agent created successfully:', result);
                  alert(`Payment processed successfully! 
Transaction hash: ${txHash}
Block number: ${receipt.blockNumber}
Your clone creation has begun.`);
                  onClose();

                } catch (error) {
                  console.error('Payment error:', error);
                  alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
                }
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

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3">
                  {/* Step Circle */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep === step.id
                          ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : currentStep > step.id
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-slate-600 text-slate-500"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{step.id}</span>
                      )}
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mx-auto mt-1 transition-all duration-300 ${
                          currentStep > step.id ? "bg-green-500" : "bg-slate-600"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-4">
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
