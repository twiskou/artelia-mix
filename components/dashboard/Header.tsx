'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pipette, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboardNav } from './NavContext'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Tableau de bord',
    subtitle: 'Vue d’ensemble de votre palette, recettes et activités récentes',
  },
  '/dashboard/studio': {
    title: 'Color Studio',
    subtitle: 'Capture optique, sélection manuelle et composition de recettes',
  },
  '/dashboard/colors': {
    title: 'Mes Couleurs',
    subtitle: 'Bibliothèque personnelle de nuances et recherche chromatique',
  },
  '/dashboard/recipes': {
    title: 'Mes Recettes',
    subtitle: 'Formulations pigmentaires, dosages et instructions d’atelier',
  },
  '/dashboard/history': {
    title: 'Historique des Activités',
    subtitle: 'Journal chronologique de vos scans et enregistrements',
  },
  '/dashboard/settings': {
    title: 'Paramètres du Compte',
    subtitle: 'Gestion de vos informations d’artiste et préférences',
  },
}

export function Header() {
  const pathname = usePathname()
  const { toggle } = useDashboardNav()

  const pageInfo = PAGE_TITLES[pathname] || {
    title: 'Atelier Artelia Mix',
    subtitle: 'Gestion intelligente des mélanges de peinture',
  }

  return (
    <header className="h-16 bg-white border-b border-[#E5E3DC] px-3.5 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-1 text-zinc-700 hover:text-[#20242B] hover:bg-zinc-100 rounded-xl transition-colors shrink-0"
          aria-label="Ouvrir le menu de navigation"
          title="Menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-[#20242B] leading-tight truncate">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-zinc-500 hidden sm:block truncate">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {pathname !== '/dashboard/studio' && (
          <Button
            asChild
            size="sm"
            className="bg-[#D99A55] hover:bg-[#C4873D] text-white shadow-xs px-2.5 sm:px-3 text-xs"
          >
            <Link href="/dashboard/studio" className="flex items-center gap-1.5">
              <Pipette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ouvrir le Color Studio</span>
              <span className="sm:hidden font-medium">Studio</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
