"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Agent } from "@/types/agent"
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'

interface Message {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
}

interface ChatInterfaceProps {
  agent: Agent
  onBack: () => void
}

export default function ChatInterface({ agent, onBack }: ChatInterfaceProps) {
  const { wallets } = useWallets()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello! I'm ${agent.name}. I'm here to help you with ${agent.specialties.join(", ")}. What would you like to know?`,
      sender: "agent",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [tokensRemaining, setTokensRemaining] = useState(0)
  const [userBalance, setUserBalance] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false)
  const [addBalanceAmount, setAddBalanceAmount] = useState("")
  const [isAddingBalance, setIsAddingBalance] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Get user balance from contract
  const getUserBalance = async () => {
    console.log('🔍 Starting getUserBalance...')
    
    try {
      if (!wallets || wallets.length === 0) {
        console.log('❌ No wallets available')
        setUserBalance(0)
        setTokensRemaining(0)
        return
      }

      const wallet = wallets[0]
      console.log('✅ Got wallet:', wallet)
      
      const provider = await wallet.getEthereumProvider()
      console.log('✅ Got provider')
      
      const accounts = await provider.request({ method: 'eth_accounts' })
      console.log('✅ Got accounts:', accounts)
      
      if (!accounts || accounts.length === 0) {
        console.log('❌ No accounts available')
        setUserBalance(0)
        setTokensRemaining(0)
        return
      }

      const userAddress = accounts[0]
      const contractAddress = '0x833b9997a708D84065d252c0E008C3e8103962DA'
      
      console.log('🔍 Getting balance for user:', userAddress)
      console.log('🔍 Contract address:', contractAddress)
      
      // Simplified approach - try to call the contract directly
      try {
        // Contract ABI for getUser function
        const getUserABI = [
          "function getUser(address user) external view returns (tuple(bool isVerified, uint256 totalSpent, uint256 lastActivity, uint256 balance))"
        ]

        const iface = new ethers.Interface(getUserABI)
        const data = iface.encodeFunctionData("getUser", [userAddress])

        console.log('🔍 Encoded data:', data)

        const result = await provider.request({
          method: 'eth_call',
          params: [{
            to: contractAddress,
            data: data
          }, 'latest']
        })

        console.log('✅ Raw result:', result)
        
        const decoded = iface.decodeFunctionResult("getUser", result)
        console.log('✅ Decoded result:', decoded)
        
        // The result should be a tuple with the User struct
        const userStruct = decoded[0]
        console.log('✅ User struct:', userStruct)
        
        // Extract balance (4th field - index 3)
        const rawBalance = userStruct[3] // balance is always index 3
        console.log('✅ Raw balance:', rawBalance?.toString())
        
        const balance = rawBalance ? Number(rawBalance) / 1000000 : 0 // Convert from 6 decimals to USDC
        const tokens = Math.floor(balance * 100) // 1 USDC = 100 tokens
        
        console.log('✅ Final balance:', balance, 'USDC')
        console.log('✅ Final tokens:', tokens)
        
        setUserBalance(balance)
        setTokensRemaining(tokens)
        
      } catch (contractError) {
        console.error('❌ Contract call error:', contractError)
        // Set defaults if contract call fails
        setUserBalance(0)
        setTokensRemaining(0)
      }

    } catch (error) {
      console.error('❌ General error getting user balance:', error)
      // Set defaults on error
      setUserBalance(0)
      setTokensRemaining(0)
    } finally {
      console.log('🏁 Finishing getUserBalance, setting loading to false')
      setIsLoadingBalance(false)
    }
  }

  // Add balance to contract
  const addBalance = async () => {
    try {
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallet connected')
      }

      const amount = parseFloat(addBalanceAmount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      setIsAddingBalance(true)

      const wallet = wallets[0]
      const provider = await wallet.getEthereumProvider()
      const accounts = await provider.request({ method: 'eth_accounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available')
      }

      const fromAddress = accounts[0]
      const usdcAddress = '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B'
      const contractAddress = '0x833b9997a708D84065d252c0E008C3e8103962DA'
      const amountInUnits = Math.floor(amount * 1000000) // Convert to 6 decimals

      // First approve USDC
      const approveABI = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ]
      
      const approveIface = new ethers.Interface(approveABI)
      const approveData = approveIface.encodeFunctionData("approve", [
        contractAddress,
        amountInUnits
      ])
      
      const approveRequest = {
        from: fromAddress,
        to: usdcAddress,
        data: approveData,
        value: '0x0',
        gas: '0x30D40'
      }
      
      console.log('Approving USDC...')
      const approveHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [approveRequest]
      })

      // Wait for approval
      const celoRpcUrl = 'https://alfajores-forno.celo-testnet.org'
      const ethersProvider = new ethers.JsonRpcProvider(celoRpcUrl)
      
      let approveReceipt = null
      let attempts = 0
      while (!approveReceipt && attempts < 30) {
        try {
          approveReceipt = await ethersProvider.getTransactionReceipt(approveHash)
          if (approveReceipt) break
        } catch (error) {
          console.log('Waiting for approval...')
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
      }

      if (!approveReceipt || approveReceipt.status === 0) {
        throw new Error('USDC approval failed')
      }

      // Now add balance
      const addBalanceABI = [
        "function addBalance(uint256 amount) external"
      ]

      const addBalanceIface = new ethers.Interface(addBalanceABI)
      const addBalanceData = addBalanceIface.encodeFunctionData("addBalance", [amountInUnits])

      const addBalanceRequest = {
        from: fromAddress,
        to: contractAddress,
        data: addBalanceData,
        value: '0x0',
        gas: '0x186A0'
      }

      console.log('Adding balance...')
      const balanceHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [addBalanceRequest]
      })

      // Wait for balance transaction
      let balanceReceipt = null
      attempts = 0
      while (!balanceReceipt && attempts < 30) {
        try {
          balanceReceipt = await ethersProvider.getTransactionReceipt(balanceHash)
          if (balanceReceipt) break
        } catch (error) {
          console.log('Waiting for balance transaction...')
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
      }

      if (!balanceReceipt || balanceReceipt.status === 0) {
        throw new Error('Add balance transaction failed')
      }

      console.log('Balance added successfully!')
      setShowAddBalanceModal(false)
      setAddBalanceAmount("")
      
      // Refresh user balance
      setIsLoadingBalance(true)
      await getUserBalance()

    } catch (error: any) {
      console.error('Error adding balance:', error)
      alert(`Failed to add balance: ${error.message}`)
    } finally {
      setIsAddingBalance(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    console.log('🔄 useEffect triggered, wallets:', wallets)
    if (wallets && wallets.length > 0) {
      setIsLoadingBalance(true)
      getUserBalance()
    } else {
      console.log('⏳ No wallets yet, setting loading to false')
      setIsLoadingBalance(false)
    }
  }, [wallets])

  const sendMessage = async () => {
    if (!inputText.trim() || tokensRemaining <= 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = inputText
    setInputText("")
    setIsLoading(true)

    try {
      // First, call purchaseService on the blockchain
      console.log('🔄 Calling purchaseService for agent:', agent.id)
      
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallet connected')
      }

      const wallet = wallets[0]
      const provider = await wallet.getEthereumProvider()
      const accounts = await provider.request({ method: 'eth_accounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available')
      }

      const fromAddress = accounts[0]
      const contractAddress = '0x833b9997a708D84065d252c0E008C3e8103962DA'
      
      // Create service data JSON
      const serviceData = JSON.stringify({
        message: messageText,
        timestamp: new Date().toISOString(),
        agentName: agent.name
      })

      // Contract ABI for purchaseService
      const purchaseServiceABI = [
        "function purchaseService(uint256 agentId, string memory serviceData) external"
      ]

      const iface = new ethers.Interface(purchaseServiceABI)
      const data = iface.encodeFunctionData("purchaseService", [
        agent.id, // agentId
        serviceData // serviceData
      ])

      const purchaseRequest = {
        from: fromAddress,
        to: contractAddress,
        data: data,
        value: '0x0',
        gas: '0xF4240'
      }

      console.log('🔄 Sending purchaseService transaction...')
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [purchaseRequest]
      })

      console.log('✅ Transaction sent:', txHash)

      // Wait for transaction confirmation
      const celoRpcUrl = 'https://alfajores-forno.celo-testnet.org'
      const ethersProvider = new ethers.JsonRpcProvider(celoRpcUrl)
      
      let receipt = null
      let attempts = 0
      while (!receipt && attempts < 30) {
        try {
          receipt = await ethersProvider.getTransactionReceipt(txHash)
          if (receipt) break
        } catch (error) {
          console.log('⏳ Waiting for transaction confirmation...')
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
      }

      if (!receipt || receipt.status === 0) {
        throw new Error('Transaction failed or timed out')
      }

      console.log('✅ Transaction confirmed!')

      // Now call the AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          agentId: agent.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          sender: "agent",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, agentMessage])
        
        // Refresh balance after successful purchase
        await getUserBalance()
      }
    } catch (error: any) {
      console.error("❌ Chat error:", error)
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message}. Please try again.`,
        sender: "agent",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="glass-nav p-4 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <img
              src={agent.avatar || "/placeholder.svg"}
              alt={agent.name}
              className="w-10 h-10 rounded-full border-2 border-purple-500/30"
            />
            <div>
              <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
              <p className="text-sm text-gray-400">AI Agent</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">
                {isLoadingBalance ? 'Loading...' : `${tokensRemaining} tokens left`}
              </span>
            </div>
            <button
              onClick={() => setShowAddBalanceModal(true)}
              className="px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 hover:bg-green-500/30 transition-colors"
            >
              <span className="text-green-300 text-sm font-medium">Add Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "glass-card text-gray-100"
                } p-4 rounded-2xl`}
              >
                <p className="mb-2">{message.text}</p>
                <p className={`text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-6 flex justify-start">
              <div className="glass-card p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="p-4 border-t border-white/10 flex-shrink-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={tokensRemaining > 0 ? "Type your message..." : "No tokens remaining"}
                disabled={tokensRemaining <= 0}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                rows={3}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || tokensRemaining <= 0 || isLoading}
              className="liquid-glass-btn-sm px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add Balance Modal */}
      {showAddBalanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add Balance</h3>
              <button
                onClick={() => setShowAddBalanceModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-2">Current Balance: {userBalance.toFixed(2)} USDC</p>
              <p className="text-gray-400 text-xs">1 USDC = 100 tokens</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={addBalanceAmount}
                onChange={(e) => setAddBalanceAmount(e.target.value)}
                placeholder="Enter amount in USDC"
                min="0"
                step="0.01"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddBalanceModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addBalance}
                disabled={isAddingBalance || !addBalanceAmount}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingBalance ? 'Adding...' : 'Add Balance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
