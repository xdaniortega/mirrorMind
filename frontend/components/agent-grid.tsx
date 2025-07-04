"use client"

import type { Agent } from "@/types/agent"

interface AgentGridProps {
  agents: Agent[]
  onAgentSelect: (agent: Agent) => void
}

export default function AgentGrid({ agents, onAgentSelect }: AgentGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {agents.map((agent) => (
        <div key={agent.id} className="glass-card-hover p-8 group" onClick={() => onAgentSelect(agent)}>
          <div className="text-center">
            <div className="relative mb-6">
              <div className="relative">
                <img
                  src={agent.avatar || "/placeholder.svg"}
                  alt={agent.name}
                  className="w-16 h-16 rounded-2xl mx-auto border border-white/10 shadow-lg transition-all duration-300 group-hover:scale-105"
                />
                {agent.verified && (
                  <div className="absolute -top-1 -right-1">
                    <div className="verification-badge">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center mb-4">
              <h3 className="text-lg font-semibold premium-gradient-text tracking-tight mr-3">{agent.name}</h3>
              <span className={agent.type === "clone" ? "type-badge-clone" : "type-badge-generic"}>
                {agent.type === "clone" ? "Clone" : "Generic"}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-normal">{agent.description}</p>

            <div className="flex items-center justify-between text-sm mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-slate-300 font-medium">{agent.rating}</span>
              </div>
              <span className="accent-gradient-text font-semibold">${agent.price}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {agent.specialties.slice(0, 2).map((specialty) => (
                <span key={specialty} className="specialty-tag">
                  {specialty}
                </span>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">{agent.totalChats.toLocaleString()} conversations</div>
          </div>
        </div>
      ))}
    </div>
  )
}
