'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pipette, Bell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const pageInfo = PAGE_TITLES[pathname] || {
    title: 'Atelier Artelia Mix',
    subtitle: 'Gestion intelligente des mélanges de peinture',
  }

  return (
    <header className="h-16 bg-white border-b border-[#E5E3DC] px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div>
        <h1 className="text-base font-bold text-[#20242B] leading-tight flex items-center gap-2">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-zinc-500 hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {pathname !== '/dashboard/studio' && (
          <Button asChild size="sm" className="bg-[#D99A55] hover:bg-[#C4873D] text-white shadow-xs">
            <Link href="/dashboard/studio" className="flex items-center gap-1.5">
              <Pipette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ouvrir le Color Studio</span>
              <span className="sm:hidden">Studio</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}

