"use client"

import { useState } from "react"
import type { Agent } from "@/types/agent"
import InteractionMenu from "./interaction-menu"

interface ProfileModalProps {
  agent: Agent
  onClose: () => void
  onPayment: (agent: Agent) => void
}

export default function ProfileModal({ agent, onClose, onPayment }: ProfileModalProps) {
  const [showInteractionMenu, setShowInteractionMenu] = useState(false)

  const handleStartConversation = () => {
    setShowInteractionMenu(true)
  }

  const handleStartChat = () => {
    setShowInteractionMenu(false)
    onPayment(agent)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
        <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 md:p-12">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 md:mb-10">
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="relative">
                  <img
                    src={agent.avatar || "/placeholder.svg"}
                    alt={agent.name}
                    className="w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl"
                  />
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2">
                    <div className="verification-badge">
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold premium-gradient-text mb-2 md:mb-3 tracking-tight">
                    {agent.name}
                  </h2>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <span
                      className={`${
                        agent.type === "clone" ? "type-badge-clone" : "type-badge-generic"
                      } text-xs md:text-sm font-bold`}
                    >
                      {agent.type === "clone" ? "Clone" : "Generic"} Assistant
                    </span>
                  </div>
                  {agent.createdBy && (
                    <div className="mt-1 md:mt-2">
                      <span className="text-xs md:text-sm text-purple-400 font-medium">
                        Created by {agent.createdBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors duration-300 p-1 md:p-2 rounded-xl hover:bg-white/5"
              >
                <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
              <div className="stat-card">
                <div className="text-xl md:text-3xl font-bold premium-gradient-text mb-1 md:mb-2">{agent.rating}</div>
                <div className="text-xs md:text-sm text-slate-400 font-semibold tracking-wide uppercase">Rating</div>
              </div>
              <div className="stat-card">
                <div className="text-xl md:text-3xl font-bold premium-gradient-text mb-1 md:mb-2">
                  {agent.totalChats.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-slate-400 font-semibold tracking-wide uppercase">
                  Conversations
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xl md:text-3xl font-bold accent-gradient-text mb-1 md:mb-2">${agent.price}</div>
                <div className="text-xs md:text-sm text-slate-400 font-semibold tracking-wide uppercase">Price</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 md:mb-10">
              <h3 className="text-lg md:text-2xl font-bold premium-gradient-text mb-3 md:mb-6 tracking-tight">
                About This Assistant
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm md:text-lg font-medium">{agent.description}</p>
            </div>

            {/* Specialties */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-lg md:text-2xl font-bold premium-gradient-text mb-3 md:mb-6 tracking-tight">
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {agent.specialties.map((specialty) => (
                  <span key={specialty} className="specialty-tag text-xs md:text-sm font-semibold">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handleStartConversation}
              className="liquid-glass-btn w-full text-base md:text-xl py-4 md:py-6 font-bold"
            >
              Start Conversation - ${agent.price} USDC
            </button>
          </div>
        </div>
      </div>

      {/* Interaction Menu */}
      <InteractionMenu
        agent={agent}
        isOpen={showInteractionMenu}
        onClose={() => setShowInteractionMenu(false)}
        onStartChat={handleStartChat}
      />
    </>
  )
}
