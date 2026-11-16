import React from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto bg-[#20242B] text-white py-16 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4 group" aria-label="Accueil Artelia Mix">
              <div className="bg-white rounded-2xl px-5 py-3 inline-flex items-center shadow-sm group-hover:scale-[1.02] transition-transform">
                <img
                  src="/images/logo.png"
                  alt="Artelia Mix - Color Intelligence for Artists"
                  className="h-16 md:h-18 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
              L’assistant d'atelier intelligent conçu pour archiver, explorer et reproduire vos mélanges de peinture avec rigueur et sensibilité artistique.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Mail className="w-4 h-4 text-[#D99A55]" />
              <span>contact@arteliamix.fr</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>
                <Link href="/dashboard" className="hover:text-[#D99A55] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/studio" className="hover:text-[#D99A55] transition-colors">
                  Color Studio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/colors" className="hover:text-[#D99A55] transition-colors">
                  Mes Couleurs
                </Link>
              </li>
              <li>
                <Link href="/dashboard/recipes" className="hover:text-[#D99A55] transition-colors">
                  Mes Recettes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Espace Artiste</h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>
                <Link href="/login" className="hover:text-[#D99A55] transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#D99A55] transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="hover:text-[#D99A55] transition-colors">
                  Paramètres
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 Artelia Mix. Tous droits réservés.</p>
          <p>Conçu avec Next.js, Tailwind CSS et des composants d'interface modernes.</p>
        </div>
      </div>
    </footer>
  )
}

