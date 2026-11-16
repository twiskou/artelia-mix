'use client'

import React, { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { NavProvider } from '@/components/dashboard/NavContext'
import { useAuth } from '@/lib/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isHydrating } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Attendre la fin de l'hydratation localStorage avant de rediriger
    if (!isHydrating && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isHydrating, router])

  // Pendant l'hydratation, afficher un spinner neutre
  if (isHydrating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F7F6F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#C8853A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Chargement de l&apos;atelier...</p>
        </div>
      </div>
    )
  }

  return (
    <NavProvider>
      <div className="flex h-screen w-full bg-[#F7F6F2] text-[#252525] overflow-hidden">
        {isAuthenticated ? (
          <>
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full">
                  <Suspense
                    fallback={
                      <div className="h-64 flex items-center justify-center text-sm text-zinc-400">
                        Chargement de l&apos;atelier...
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
    </NavProvider>
  )
}
