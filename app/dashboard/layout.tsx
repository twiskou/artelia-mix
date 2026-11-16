'use client'

import React, { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { useAuth } from '@/lib/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  // Always render children so Next.js instant-navigation validation
  // can see the segment. The redirect fires via useEffect above.
  return (
    <div className="flex h-screen w-full bg-[#F7F6F2] text-[#252525] overflow-hidden">
      {isAuthenticated ? (
        <>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                <Suspense
                  fallback={
                    <div className="h-64 flex items-center justify-center text-sm text-zinc-400">
                      Chargement...
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
            </main>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-zinc-400 animate-pulse">Redirection...</div>
          {/* children must stay in the tree for instant-nav validation */}
          <div className="hidden">{children}</div>
        </div>
      )}
    </div>
  )
}
