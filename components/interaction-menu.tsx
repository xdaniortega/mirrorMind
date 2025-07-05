"use client"

import { useState } from "react"
import type { Agent } from "@/types/agent"

interface InteractionMenuProps {
  agent: Agent
  isOpen: boolean
  onClose: () => void
  onStartChat: () => void
}

export default function InteractionMenu({ agent, isOpen, onClose, onStartChat }: InteractionMenuProps) {
  const [googleMeetLink, setGoogleMeetLink] = useState("")
  const [isJoiningMeet, setIsJoiningMeet] = useState(false)
  const [showIntegrationDetails, setShowIntegrationDetails] = useState(false)

  // Generate session token (in real app, this would come from backend)
  const sessionToken = `mk_${agent.id}_${Date.now().toString(36)}`
  const integrationUrl = `https://api.mirrormind.ai/v1/agents/${agent.id}/integrate`

  const handleJoinGoogleMeet = async () => {
    if (!googleMeetLink.trim()) return

    setIsJoiningMeet(true)

    // Simulate API call to join Google Meet session
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In real implementation, this would:
      // 1. Validate the Google Meet link
      // 2. Create a bridge session
      // 3. Join the agent to the meeting

      console.log(`Joining Google Meet: ${googleMeetLink} with agent: ${agent.name}`)

      // Open Google Meet in new tab
      window.open(googleMeetLink, "_blank")

      onClose()
    } catch (error) {
      console.error("Failed to join Google Meet:", error)
    } finally {
      setIsJoiningMeet(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
      <div className="w-full max-w-md h-full bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl overflow-y-auto">
        <div className="p-4 min-h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img
                src={agent.avatar || "/placeholder.svg"}
                alt={agent.name}
                className="w-10 h-10 rounded-full border border-white/20"
              />
              <div>
                <h3 className="text-base font-semibold premium-gradient-text">{agent.name}</h3>
                <p className="text-xs text-slate-400">Choose interaction method</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Interaction Options */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {/* Start Chat Option */}
            <div className="glass-card p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Start Chat</h4>
                  <p className="text-xs text-slate-400">Direct conversation with the AI assistant</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-300">Price per session</span>
                <span className="text-sm font-bold accent-gradient-text">${(agent.price * 0.3).toFixed(2)} USDC</span>
              </div>
              <button onClick={onStartChat} className="liquid-glass-btn-sm w-full text-sm">
                Start Chat Session
              </button>
            </div>

            {/* Google Meet Option */}
            <div className="glass-card p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Join Google Meet</h4>
                  <p className="text-xs text-slate-400">Add AI assistant to your video call</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Google Meet Link</label>
                  <input
                    type="url"
                    value={googleMeetLink}
                    onChange={(e) => setGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="premium-input text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Session duration: Up to 60 minutes</span>
                  <span className="font-semibold text-orange-400">${(agent.price * 0.5).toFixed(2)} USDC</span>
                </div>
                <button
                  onClick={handleJoinGoogleMeet}
                  disabled={!googleMeetLink.trim() || isJoiningMeet}
                  className="liquid-glass-btn-sm w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isJoiningMeet ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Joining Meeting...</span>
                    </div>
                  ) : (
                    "Join Google Meet"
                  )}
                </button>
              </div>
            </div>

            {/* Agent Integration Option */}
            <div className="glass-card p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Agent Integration</h4>
                  <p className="text-xs text-slate-400">Integrate with your applications via API</p>
                </div>
              </div>

              {!showIntegrationDetails ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300">
                    <p className="mb-2">Connect this AI assistant to your:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-xs">
                      <li>Custom applications</li>
                      <li>Slack/Discord bots</li>
                      <li>Webhook integrations</li>
                      <li>Third-party platforms</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Monthly subscription</span>
                    <span className="font-semibold text-purple-400">${(agent.price * 2).toFixed(2)} USDC/month</span>
                  </div>
                  <button
                    onClick={() => setShowIntegrationDetails(true)}
                    className="liquid-glass-btn-sm w-full text-sm"
                  >
                    Get Integration Details
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">API Endpoint</label>
                    <div className="flex items-center space-x-2">
                      <input type="text" value={integrationUrl} readOnly className="premium-input text-xs flex-1" />
                      <button
                        onClick={() => copyToClipboard(integrationUrl)}
                        className="clean-btn-secondary px-2 py-1 text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Session Token</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={sessionToken}
                        readOnly
                        className="premium-input text-xs font-mono flex-1"
                      />
                      <button
                        onClick={() => copyToClipboard(sessionToken)}
                        className="clean-btn-secondary px-2 py-1 text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <svg
                        className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-xs">
                        <p className="text-blue-300 font-medium mb-1">Integration Instructions</p>
                        <p className="text-blue-200/80 text-xs leading-relaxed">
                          Use the API endpoint with your session token in the Authorization header. Full documentation
                          available at docs.mirrormind.ai
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowIntegrationDetails(false)}
                      className="clean-btn-secondary flex-1 text-xs py-2"
                    >
                      Back
                    </button>
                    <button className="liquid-glass-btn-sm flex-1 text-xs py-2">Subscribe Now</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 flex-shrink-0">
            <p className="text-xs text-slate-500 text-center">All sessions are encrypted and secure. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
