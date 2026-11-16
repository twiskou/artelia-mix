'use client'

import React from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}

