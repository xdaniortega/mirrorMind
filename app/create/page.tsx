"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Link from "next/link"
import CloningProcessModal from "@/components/cloning-process-modal"

export default function CreatePage() {
  const [selectedOption, setSelectedOption] = useState<"clone" | "assistant" | null>(null)
  const [showCloningModal, setShowCloningModal] = useState(false)

  const handleOptionSelect = (option: "clone" | "assistant") => {
    setSelectedOption(option)
    if (option === "clone") {
      setShowCloningModal(true)
    } else {
      // Here you would typically navigate to the assistant creation flow
      console.log(`Starting ${option} creation process...`)
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/10 via-slate-950/50 to-slate-950"></div>
      <div className="relative">
        <Navbar />

        <main className="container mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xl md:text-2xl font-light text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Choose how you want to amplify your digital presence
            </p>
          </div>

          {/* Creation Options */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Clone Yourself Option */}
              <div
                className={`glass-card-hover p-8 text-center group cursor-pointer transition-all duration-500 ${
                  selectedOption === "clone" ? "ring-2 ring-blue-500/50 bg-blue-500/5" : ""
                }`}
                onClick={() => handleOptionSelect("clone")}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mx-auto mb-6 flex items-center justify-center float-animation group-hover:pulse-glow shadow-xl shadow-blue-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold premium-gradient-text mb-4 tracking-tight">Clone Yourself</h3>
                  <p className="text-slate-300 text-base leading-relaxed font-normal mb-6">
                    Create your digital twin that speaks, thinks, and responds exactly like you. Perfect for scaling
                    your personal brand and expertise.
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Maintains your unique personality and voice
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Trained on your content and knowledge
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      24/7 availability for your audience
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="text-center">
                      <span className="text-2xl font-bold accent-gradient-text">$99</span>
                      <span className="text-slate-400 ml-2 text-sm">one-time setup</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">+ revenue sharing from interactions</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOptionSelect("clone")}
                  className="clean-btn-primary w-full text-base py-3 font-semibold"
                >
                  Start Cloning Process
                </button>
              </div>

              {/* Custom Assistant Option */}
              <div
                className={`glass-card-hover p-8 text-center group cursor-pointer transition-all duration-500 ${
                  selectedOption === "assistant" ? "ring-2 ring-purple-500/50 bg-purple-500/5" : ""
                }`}
                onClick={() => handleOptionSelect("assistant")}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl mx-auto mb-6 flex items-center justify-center float-animation group-hover:pulse-glow shadow-xl shadow-purple-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold premium-gradient-text mb-4 tracking-tight">Custom Assistant</h3>
                  <p className="text-slate-300 text-base leading-relaxed font-normal mb-6">
                    Design an AI specialist for specific tasks in your field. Perfect for businesses and specialized use
                    cases.
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Specialized in your specific niche
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Optimized for specific tasks and workflows
                    </div>
                    <div className="flex items-center text-slate-300 text-sm">
                      <svg
                        className="w-4 h-4 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Easy to customize and retrain
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="text-center">
                      <span className="text-2xl font-bold accent-gradient-text">$49</span>
                      <span className="text-slate-400 ml-2 text-sm">one-time setup</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">+ usage-based pricing</p>
                  </div>
                </div>

                <button className="clean-btn-primary w-full text-base py-3 font-semibold">Create Assistant</button>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="glass-card p-6 mb-12">
              <h3 className="text-xl font-semibold premium-gradient-text mb-6 text-center tracking-tight">
                Feature Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-slate-300 font-medium text-sm">Feature</th>
                      <th className="text-center py-3 text-blue-300 font-medium text-sm">Clone Yourself</th>
                      <th className="text-center py-3 text-purple-300 font-medium text-sm">Custom Assistant</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-white/5">
                      <td className="py-3 text-slate-300 text-sm">Personal Voice & Style</td>
                      <td className="text-center py-3">
                        <svg className="w-4 h-4 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </td>
                      <td className="text-center py-3">
                        <svg className="w-4 h-4 text-slate-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 text-slate-300 text-sm">Task Specialization</td>
                      <td className="text-center py-3 text-slate-400 text-sm">Limited</td>
                      <td className="text-center py-3">
                        <svg className="w-4 h-4 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 text-slate-300 text-sm">Setup Time</td>
                      <td className="text-center py-3 text-slate-400 text-sm">2-3 weeks</td>
                      <td className="text-center py-3 text-slate-400 text-sm">1-2 weeks</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-300 text-sm">Best For</td>
                      <td className="text-center py-3 text-slate-400 text-sm">Personal Brand</td>
                      <td className="text-center py-3 text-slate-400 text-sm">Business Use</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Process Overview */}
            <div className="text-center mb-12">
              <h3 className="text-xl font-semibold premium-gradient-text mb-6 tracking-tight">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">Choose Type</h4>
                  <p className="text-slate-400 text-sm">Select clone or custom assistant</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">Upload Data</h4>
                  <p className="text-slate-400 text-sm">Provide content and training materials</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">AI Training</h4>
                  <p className="text-slate-400 text-sm">Our system learns your patterns</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">Go Live</h4>
                  <p className="text-slate-400 text-sm">Deploy and start earning</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold premium-gradient-text mb-3 tracking-tight">
                  Ready to Get Started?
                </h3>
                <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                  Join thousands of creators who are already scaling their impact with AI
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/marketplace" className="clean-btn-secondary text-sm px-6 py-2">
                    Explore Examples
                  </Link>
                  <button className="clean-btn-primary text-sm px-6 py-2">Schedule Consultation</button>
                </div>
              </div>
            </div>
            {/* Cloning Process Modal */}
            <CloningProcessModal isOpen={showCloningModal} onClose={() => setShowCloningModal(false)} />
          </div>
        </main>
      </div>
    </div>
  )
}
