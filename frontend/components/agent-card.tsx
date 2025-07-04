"use client"

import type { Agent } from "@/types/agent"

interface AgentCardProps {
  agent: Agent
  onSelect: (agent: Agent) => void
}

export default function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <div
      className="glass-card p-6 cursor-pointer hover:scale-105 transition-all duration-300 group"
      onClick={() => onSelect(agent)}
    >
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={agent.avatar || "/placeholder.svg"}
          alt={agent.name}
          className="w-16 h-16 rounded-full border-2 border-purple-500/30 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">{agent.name}</h3>
          <div className="flex items-center space-x-2 mb-2">
            {agent.verified && (
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                agent.type === "clone"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-green-500/20 text-green-300 border border-green-500/30"
              }`}
            >
              {agent.type === "clone" ? "Clone" : "Generic"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 text-xs">{agent.category}</span>
          </div>
          {agent.createdBy && (
            <div className="mb-2">
              <span className="text-xs text-purple-400 font-medium">Created by {agent.createdBy}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-300 text-sm">{agent.rating}</span>
          </div>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400 text-sm">{agent.totalChats} chats</span>
        </div>
        <span className="text-purple-400 font-semibold">{agent.price} USDC</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {agent.specialties.slice(0, 3).map((specialty) => (
          <span
            key={specialty}
            className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
          >
            {specialty}
          </span>
        ))}
        {agent.specialties.length > 3 && (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full border border-gray-500/30">
            +{agent.specialties.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {agent.verified && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-400 text-xs">Verified</span>
            </div>
          )}
          {agent.featured && (
            <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
              Featured
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">Updated {agent.lastUpdated}</div>
      </div>
    </div>
  )
}
