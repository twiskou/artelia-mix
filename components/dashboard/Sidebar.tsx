'use client'

import React from 'react'
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
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

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
  const rawName = user?.name || (user?.email ? user.email.split('@')[0] : 'Anis')
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
  const displayEmail = user?.email || 'anis@gmail.com'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className="w-64 bg-[#20242B] text-white flex flex-col shrink-0 border-r border-[#2d323b] select-none h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="py-4 px-4 border-b border-[#2d323b]">
        <Link href="/dashboard" className="block w-full group" aria-label="Dashboard Artelia Mix">
          <div className="bg-white rounded-2xl px-3 py-2.5 flex items-center justify-center shadow-xs border border-white/10 group-hover:scale-[1.02] transition-transform">
            <img
              src="/images/logo.png"
              alt="Artelia Mix - Atelier Numérique"
              className="h-12 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Espace de Travail
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
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

              {isActive && (
                <ChevronRight className="w-4 h-4 text-white/80" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Status Box */}
      <div className="px-4 py-3 mx-3 mb-4 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300">
        <div className="flex items-center gap-2 text-[#D99A55] font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Statut Capteur</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Mode simulation actif. Prêt pour l’appairage Bluetooth Phase 2.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#2d323b] flex items-center justify-between bg-[#191c22]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#D99A55] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {displayEmail}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Se déconnecter"
          className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}

