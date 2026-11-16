'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Palette,
  LayoutDashboard,
  Pipette,
  BookOpen,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useDashboardNav } from './NavContext'

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Color Studio',
    href: '/dashboard/studio',
    icon: Pipette,
    badge: 'Scan & Mix',
  },
  {
    name: 'Mes Couleurs',
    href: '/dashboard/colors',
    icon: Palette,
  },
  {
    name: 'Mes Recettes',
    href: '/dashboard/recipes',
    icon: BookOpen,
  },
  {
    name: 'Historique',
    href: '/dashboard/history',
    icon: Clock,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isOpen, close } = useDashboardNav()

  const rawName = user?.name || (user?.email ? user.email.split('@')[0] : 'Artiste')
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
  const displayEmail = user?.email || 'artiste@arteliamix.fr'
  const initials = displayName.slice(0, 2).toUpperCase()

  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  const renderNavLinks = (onItemClick?: () => void) => (
    <nav className="flex-1 px-3 py-4 sm:py-6 space-y-1.5 overflow-y-auto">
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
        Espace de Travail
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
              isActive
                ? 'bg-[#D99A55] text-white shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-[#D99A55]'
                )}
              />
              <span>{item.name}</span>
            </div>

            {item.badge && !isActive && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#D99A55]">
                {item.badge}
              </span>
            )}

            {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
          </Link>
        )
      })}
    </nav>
  )

  const renderStatusBox = () => (
    <div className="px-4 py-3 mx-3 mb-4 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300">
      <div className="flex items-center gap-2 text-[#D99A55] font-semibold mb-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Statut Capteur</span>
      </div>
      <p className="text-[11px] text-zinc-400 leading-relaxed">
        Mode simulation actif. Prêt pour l’appairage Bluetooth Phase 2.
      </p>
    </div>
  )

  const renderUserFooter = (onLogoutClick?: () => void) => (
    <div className="p-3 border-t border-[#2d323b] flex items-center justify-between bg-[#191c22]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#D99A55] text-white font-bold text-xs flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {displayName}
          </p>
          <p className="text-[11px] text-zinc-400 truncate">{displayEmail}</p>
        </div>
      </div>

      <button
        onClick={() => {
          onLogoutClick?.()
          logout()
        }}
        title="Se déconnecter"
        className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (>= lg) */}
      <aside className="hidden lg:flex w-64 bg-[#20242B] text-white flex-col shrink-0 border-r border-[#2d323b] select-none h-screen sticky top-0">
        {/* Brand Logo */}
        <div className="py-4 px-4 border-b border-[#2d323b]">
          <Link
            href="/dashboard"
            className="block w-full group"
            aria-label="Dashboard Artelia Mix"
          >
            <div className="bg-white rounded-2xl px-3 py-2.5 flex items-center justify-center shadow-xs border border-white/10 group-hover:scale-[1.02] transition-transform">
              <img
                src="/images/logo.png"
                alt="Artelia Mix - Atelier Numérique"
                className="h-12 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        {renderNavLinks()}
        {renderStatusBox()}
        {renderUserFooter()}
      </aside>

      {/* 2. Mobile Drawer (< lg) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Off-canvas sidebar */}
          <div className="relative w-72 max-w-[85vw] bg-[#20242B] text-white flex flex-col h-full shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            {/* Header with Logo and Close Button */}
            <div className="py-3 px-4 border-b border-[#2d323b] flex items-center justify-between">
              <Link
                href="/dashboard"
                onClick={close}
                className="block flex-1 mr-3 group"
                aria-label="Dashboard Artelia Mix"
              >
                <div className="bg-white rounded-xl px-2.5 py-1.5 flex items-center justify-center border border-white/10">
                  <img
                    src="/images/logo.png"
                    alt="Artelia Mix"
                    className="h-9 w-auto object-contain"
                  />
                </div>
              </Link>
              <button
                onClick={close}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderNavLinks(close)}
            {renderStatusBox()}
            {renderUserFooter(close)}
          </div>
        </div>
      )}
    </>
  )
}
