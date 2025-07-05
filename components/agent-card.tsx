"use client"

import type { Agent } from "@/types/agent"

interface AgentCardProps {
  agent: Agent
  onSelect: (agent: Agent) => void
}

export default function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <div
      className="glass-card p-0 flex flex-col items-stretch justify-between h-full min-w-[240px] max-w-xs rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
    >
      {/* Full-width rectangular image */}
      <div className="w-full flex justify-center items-center pb-2">
        <img
          src={agent.avatar || "/placeholder.svg"}
          alt={agent.name}
          className="w-full h-40 object-cover border-4 border-white/80 shadow-lg bg-white rounded-t-2xl"
        />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 pt-2 pb-2">
        {/* Name and rating */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-white truncate">{agent.name}</h3>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-yellow-300 text-base font-semibold">{agent.rating}</span>
          </div>
        </div>
        {/* Description */}
        <p className="text-gray-300 text-sm mb-2 line-clamp-2 min-h-[2.5em]">{agent.description}</p>
        {/* Chats count */}
        <div className="flex justify-end mb-2">
          <span className="text-xs text-gray-400 font-medium">{agent.totalChats.toLocaleString()} chats</span>
        </div>
      </div>
      {/* Interact button */}
      <button
        className="w-full py-2 rounded-b-2xl bg-gradient-to-r from-purple-600/80 to-emerald-600/80 text-white font-semibold tracking-wide text-base hover:from-purple-700 hover:to-emerald-700 transition-colors"
        onClick={e => { e.stopPropagation(); onSelect(agent); }}
      >
        INTERACT
      </button>
    </div>
  )
}
