"use client"
import { PrivyProvider } from '@privy-io/react-auth'
import { celo, celoAlfajores } from 'viem/chains'

const privyApiKey = process.env.NEXT_PUBLIC_PRIVY_API_KEY!;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyApiKey}
      config={{
        defaultChain: celo,
        supportedChains: [celo, celoAlfajores],
      }}
    >
      {children}
    </PrivyProvider>
  )
} 