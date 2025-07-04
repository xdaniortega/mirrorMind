"use client"

import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [isConnected, setIsConnected] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const connectWallet = () => {
    setIsConnected(true)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold premium-gradient-text tracking-tight">MirrorMind</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/assistants"
            className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            Assistants
          </Link>
          <Link
            href="/create"
            className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            Create
          </Link>
          <Link
            href="/marketplace"
            className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            Marketplace
          </Link>
          <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm">
            Learn
          </a>
        </div>

        {/* Desktop Connect Wallet */}
        <div className="hidden md:flex items-center space-x-4">
          {isConnected ? (
            <div className="flex items-center space-x-3 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-medium">0x1234...5678</span>
            </div>
          ) : (
            <button onClick={connectWallet} className="clean-btn-primary px-6 py-2 text-sm">
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Mobile Connect Wallet - moved left */}
          {isConnected ? (
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-xs font-medium">0x12...78</span>
            </div>
          ) : (
            <button onClick={connectWallet} className="clean-btn-primary px-4 py-1.5 text-xs">
              Connect
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link
              href="/assistants"
              onClick={closeMobileMenu}
              className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm py-2"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Assistants</span>
              </div>
            </Link>

            <Link
              href="/create"
              onClick={closeMobileMenu}
              className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm py-2"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create</span>
              </div>
            </Link>

            <Link
              href="/marketplace"
              onClick={closeMobileMenu}
              className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm py-2"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>Marketplace</span>
              </div>
            </Link>

            <Link
              href="#"
              onClick={closeMobileMenu}
              className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm py-2"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Learn</span>
              </div>
            </Link>

            {/* Mobile Menu Footer */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-slate-500 text-center">MirrorMind • AI Assistant Platform</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
