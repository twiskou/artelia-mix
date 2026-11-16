'use client'

import React from 'react'
import Link from 'next/link'
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  hideNavLinks?: boolean
  activePage?: 'home' | 'login' | 'register'
}

export function Navbar({ hideNavLinks = false, activePage = 'home' }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center group py-1" aria-label="Artelia Mix Accueil">
          <img
            src="/images/logo.png"
            alt="Artelia Mix - Color Intelligence for Artists"
            className="h-14 md:h-16 lg:h-18 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Section links - hidden on login/register pages */}
        {!hideNavLinks && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#252525]/80">
            <a href="/#probleme" className="hover:text-[#D99A55] transition-colors">Le Défi</a>
            <a href="/#solution" className="hover:text-[#D99A55] transition-colors">Solution</a>
            <a href="/#fonctionnalites" className="hover:text-[#D99A55] transition-colors">Fonctionnalités</a>
            <a href="/#fonctionnement" className="hover:text-[#D99A55] transition-colors">Fonctionnement</a>
            <a href="/#faq" className="hover:text-[#D99A55] transition-colors">FAQ</a>
          </nav>
        )}

        {/* Actions according to active page */}
        <div className="flex items-center gap-3">
          {activePage === 'login' ? (
            <>
              <Button variant="ghost" asChild className="text-[#20242B] hover:text-[#D99A55] text-xs sm:text-sm">
                <Link href="/" className="flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Retour à l'accueil</span>
                  <span className="sm:hidden">Accueil</span>
                </Link>
              </Button>
              <Button asChild className="bg-[#D99A55] hover:bg-[#C4873D] text-white font-medium shadow-xs text-xs sm:text-sm">
                <Link href="/register" className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un compte</span>
                </Link>
              </Button>
            </>
          ) : activePage === 'register' ? (
            <>
              <Button variant="ghost" asChild className="text-[#20242B] hover:text-[#D99A55] text-xs sm:text-sm">
                <Link href="/" className="flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Retour à l'accueil</span>
                  <span className="sm:hidden">Accueil</span>
                </Link>
              </Button>
              <Button asChild className="bg-[#20242B] hover:bg-zinc-800 text-white font-medium shadow-xs text-xs sm:text-sm">
                <Link href="/login" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-[#20242B] hover:text-[#D99A55]">
                <Link href="/login" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Link>
              </Button>
              <Button asChild className="bg-[#D99A55] hover:bg-[#C4873D] text-white font-medium shadow-xs">
                <Link href="/register" className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un compte</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

