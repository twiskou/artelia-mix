'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Palette,
  Pipette,
  BookOpen,
  Scan,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Mail,
  Layers,
  ChevronDown,
  Droplets,
  Sliders,
  Cpu,
  LogIn,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null)

  const samplePalette = [
    { name: 'Ocre Doré', hex: '#D99A55' },
    { name: 'Rouge Cadmium', hex: '#E34234' },
    { name: 'Bleu Outremer', hex: '#1B263B' },
    { name: 'Vert Oxyde', hex: '#40826D' },
    { name: 'Terre d’Ombre', hex: '#8A3324' },
    { name: 'Jaune Naples', hex: '#FADA5E' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#252525] flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <Navbar activePage="home" />

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E3DC] shadow-xs text-xs font-semibold text-[#20242B] mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#D99A55]" />
            <span>Assistant numérique d’atelier pour peintres & artistes</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#20242B] leading-[1.1] mb-6">
            Enregistrez. Organisez. <br />
            <span className="text-[#D99A55] underline decoration-[#D99A55]/30 underline-offset-8">
              Reproduisez vos couleurs.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#252525]/75 mb-10 leading-relaxed font-normal">
            Ne perdez plus jamais la nuance parfaite créée sur votre palette. Artelia Mix mémorise vos mélanges de peinture, vos proportions exactes et vos recettes pour les recréer à l’infini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 bg-[#20242B] hover:bg-[#20242B]/90 text-white font-medium text-base rounded-xl shadow-md">
              <Link href="/dashboard/studio" className="flex items-center gap-2">
                <span>Découvrir le Color Studio</span>
                <ArrowRight className="w-4 h-4 text-[#D99A55]" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-zinc-50 border-[#E5E3DC] text-[#20242B] font-medium text-base rounded-xl shadow-xs">
              <Link href="/dashboard">
                <span>Accéder au Dashboard</span>
              </Link>
            </Button>
          </div>

          {/* Interactive Palette Preview Ribbon with Real Atelier Imagery */}
          <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-2xl border border-[#E5E3DC] shadow-lg">
            {/* Visual Studio Showcase */}
            <div className="relative rounded-xl overflow-hidden mb-6 border border-zinc-200/80 shadow-xs h-56 sm:h-72 md:h-80 group">
              <img
                src="/images/hero-palette.jpg"
                alt="Palette d'artiste avec mélanges de peinture à l'huile"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 md:p-6 text-left text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D99A55] text-white text-[11px] font-semibold tracking-wide uppercase shadow-xs">
                    <Scan className="w-3 h-3" />
                    Lecture couleur en cours
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-mono">
                    #D99A55 · RGB(217, 154, 85)
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1">
                  Ocre Doré d'Atelier
                </h3>
                <p className="text-xs md:text-sm text-zinc-300 max-w-lg leading-relaxed">
                  Recette enregistrée : 60% Ocre Jaune · 25% Blanc de Titane · 15% Terre d'Ombre Brûlée
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 text-xs font-medium text-zinc-500">
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#D99A55]" />
                Palette active en cours d’étude
              </span>
              <span className="font-mono text-zinc-400">Simulation MVP · Nuances professionnelles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {samplePalette.map((color) => (
                <div key={color.hex} className="group flex flex-col rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div
                    className="h-20 w-full transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="p-2.5 text-left">
                    <p className="font-semibold text-xs text-[#20242B] truncate">{color.name}</p>
                    <p className="font-mono text-[11px] text-zinc-500 uppercase">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section Le Problème */}
      <section id="probleme" className="py-20 bg-white border-y border-[#E5E3DC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-3 border border-red-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Le défi permanent des peintres</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#20242B]">
              Pourquoi reproduire une couleur est un casse-tête ?
            </h2>
            <p className="mt-4 text-[#252525]/75">
              Chaque artiste s'est déjà retrouvé face à une toile inachevée, incapable de retrouver le mélange précis préparé la veille.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* The 3 Cards */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border border-[#E5E3DC] shadow-xs hover:border-[#D99A55]/40 transition-colors bg-[#F7F6F2]/40">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-100/70 text-red-800 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#20242B] mb-1">Mémoire pigmentaire volatile</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Sur la palette, les couleurs se mélangent par intuition. Une fois le travail sec, retrouver les proportions exactes entre trois pigments relève de l’improvisation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E5E3DC] shadow-xs hover:border-[#D99A55]/40 transition-colors bg-[#F7F6F2]/40">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#20242B] mb-1">Gaspillage de peinture coûteuse</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Recommencer dix essais pour réapprocher une teinte brûle de la matière précieuse : tubes d’huile extra-fine, pigments rares ou médiums coûteux.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E5E3DC] shadow-xs hover:border-[#D99A55]/40 transition-colors bg-[#F7F6F2]/40">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#20242B] mb-1">Carnets papier introuvables</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Les notes manuscrites tachées de térébenthine se perdent, manquent de repères visuels HEX/RGB et sont impossibles à trier ou rechercher par nuance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real Photographic Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#E5E3DC] shadow-md bg-zinc-100 group">
                <img
                  src="/images/paint-mixing.jpg"
                  alt="Mélange de peinture à l'huile sur palette"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#20242B]/90 via-[#20242B]/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D99A55] mb-1">
                    Réalité de l'atelier
                  </span>
                  <p className="text-sm font-medium text-zinc-200 leading-snug">
                    « La couleur humide change en séchant. Sans archive rigoureuse, chaque retouche de tableau devient une incertitude. »
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section La Solution */}
      <section id="solution" className="py-20 bg-[#F7F6F2]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-[#20242B] rounded-3xl p-8 md:p-14 text-white shadow-xl relative overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D99A55] text-xs font-semibold mb-4 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Le pont entre la matière et le digital</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                  Artelia Mix : Votre carnet de recettes chromatiques intelligent
                </h2>

                <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8">
                  Nous combinons la précision numérique des codes couleur avec la réalité physique de votre atelier. L’application enregistre la nuance obtenue et vous permet de documenter pas à pas la recette pigmentaire qui lui a donné naissance.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D99A55] shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-200">
                      <strong className="text-white block font-semibold">Simulation optique immédiate</strong>
                      Testez dès maintenant toute la logique métier sans attendre le capteur physique.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D99A55] shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-200">
                      <strong className="text-white block font-semibold">Proportions sur-mesure</strong>
                      Saisissez vos pourcentages, millilitres ou parts de chaque pigment avec exactitude.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real Photo in Solution */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="/images/color-swatches.jpg"
                    alt="Nuancier de couleurs et touches d'essai pour artistes"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                    <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                      <p className="text-xs font-semibold text-[#D99A55] uppercase tracking-wider mb-0.5">
                        Archivage de Nuancier
                      </p>
                      <p className="text-xs text-white">
                        Chaque teinte testée est reliée à sa formule exacte et son historique de fabrication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section Fonctionnalités (6 piliers) */}
      <section id="fonctionnalites" className="py-20 bg-white border-t border-[#E5E3DC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#20242B]">
              Toutes les fonctions pour dompter votre palette
            </h2>
            <p className="mt-3 text-zinc-600">
              Chaque outil a été pensé pour s’intégrer naturellement dans la routine d’un atelier d’art.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2]/30 hover:border-[#D99A55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center mb-4">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#20242B] mb-2">Scanner & Simuler</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Lecture instantanée de la teinte via notre moteur de simulation optique avec génération des coordonnées HEX et RGB précises.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2]/30 hover:border-[#D99A55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center mb-4">
                <Pipette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#20242B] mb-2">Color Studio Interactif</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Ajustez manuellement vos curseurs RGB ou sélectionnez un code HEX à la pipette pour explorer et peaufiner vos harmonies.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2]/30 hover:border-[#D99A55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#20242B] mb-2">Recettes Pigmentaires</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Associez chaque couleur à sa liste d'ingrédients précis (ex. 60% Rouge cadmium + 30% Jaune + 10% Blanc) et vos instructions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2]/30 hover:border-[#D99A55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#20242B] mb-2">Bibliothèque Personnelle</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Classez vos couleurs par famille (Rouges, Ocres, Bleus, Noirs...), épinglez vos favoris et copiez les codes en un clic.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2]/30 hover:border-[#D99A55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#20242B] mb-2">Journal d'Activité Complet</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Retrouvez l’historique chronologique de chaque scan, recette modifiée ou couleur enregistrée lors de vos séances passées.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E5E3DC] bg-[#F7F6F2]/30 hover:border-[#D99A55] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#20242B] mb-2">Prêt pour le Capteur BLE</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Architecture logicielle prête à accueillir la connexion Bluetooth pour le futur capteur matériel sans rupture de vos données.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section Fonctionnement (4 étapes) */}
      <section id="fonctionnement" className="py-20 bg-[#F7F6F2] border-t border-[#E5E3DC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#20242B]">
              Comment fonctionne Artelia Mix ?
            </h2>
            <p className="mt-3 text-zinc-600">
              Un workflow intuitif pensé pour que l'artiste reste concentré sur sa création.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#D99A55] text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-[#20242B] mb-2">Création du mélange</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Vous préparez physiquement votre mélange de peinture sur votre palette ou carnet d’études.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#20242B] text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-[#20242B] mb-2">Capture ou saisie</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Utilisez le simulateur de scan ou saisissez directement les valeurs HEX/RGB de la couleur obtenue.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#20242B] text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-[#20242B] mb-2">Saisie de la recette</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Indiquez les tubes utilisés (ex. Outremer, Blanc) et leurs proportions en pourcentages ou volumes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-[#D99A55] text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-base text-[#20242B] mb-2">Reproduction fidèle</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Retrouvez la recette des mois plus tard pour repeindre la même nuance sans la moindre déviation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section Public Cible */}
      <section className="py-20 bg-white border-t border-[#E5E3DC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#20242B]">
              Conçu pour qui ?
            </h2>
            <p className="mt-3 text-zinc-600">
              Des créateurs passionnés aux ateliers professionnels les plus exigeants.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-2xl bg-[#F7F6F2] border border-[#E5E3DC] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="/images/artist-traditional.jpg"
                  alt="Artiste peintre traditionnel dans son atelier"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-[#20242B]/90 backdrop-blur-xs text-[#D99A55] flex items-center justify-center font-bold shadow-xs">
                  <Palette className="w-4 h-4" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#20242B] mb-2">Artistes & Peintres</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Que vous peigniez à l’huile, à l’acrylique ou à la gouache, archivez vos découvertes chromatiques et gardez la mémoire vivante de chaque tableau.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-[#F7F6F2] border border-[#E5E3DC] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="/images/artist-student.jpg"
                  alt="Étudiant en art apprenant les mélanges de pigments"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-[#20242B]/90 backdrop-blur-xs text-[#D99A55] flex items-center justify-center font-bold shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#20242B] mb-2">Étudiants en Art</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Comprenez la colorimétrie appliquée, expérimentez les interactions pigmentaires et construisez un carnet méthodologique de référence.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-[#F7F6F2] border border-[#E5E3DC] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="/images/studio-easel.jpg"
                  alt="Atelier professionnel de restauration d'œuvres d'art"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-[#20242B]/90 backdrop-blur-xs text-[#D99A55] flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#20242B] mb-2">Restaurateurs & Pros</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Assurez une traçabilité rigoureuse des retouches et des formules employées pour des restaurations d’œuvres ou des commandes décoratives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section Abonnement */}
      <section id="abonnement" className="py-20 bg-white border-t border-[#E5E3DC]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#F7F6F2] rounded-3xl p-8 md:p-12 border border-[#E5E3DC] shadow-sm relative overflow-hidden">
            {/* Subtle decorative gold glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-[#D99A55]/10 rounded-full blur-3xl" />

            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E3DC] text-[#20242B] text-xs font-semibold mb-6 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D99A55]" />
                <span>Formule d’Accès Atelier</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-[#20242B] tracking-tight mb-4">
                Un abonnement conçu pour accompagner votre art
              </h2>

              <p className="text-base md:text-lg text-[#252525]/75 leading-relaxed mb-10">
                Artelia Mix propose un modèle d’accès sur abonnement afin de mettre à votre disposition l’ensemble des fonctionnalités de l’application. Bénéficiez d’un environnement d’atelier complet pour formuler, archiver et reproduire vos couleurs en toute sérénité.
              </p>
            </div>

            {/* Feature highlights grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              <div className="bg-white p-5 rounded-2xl border border-[#E5E3DC] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center shrink-0">
                  <Pipette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#20242B] mb-1">Color Studio & Dosages</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Accès complet à la palette interactive, aux simulations optiques et au calcul précis des dosages pigmentaires.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E3DC] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#20242B] mb-1">Carnet de Recettes Illimité</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Enregistrement de toutes vos recettes, pourcentages et protocoles de mélange pour retrouver chaque teinte à l’identique.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E3DC] shadow-xs flex items-start gap-3.5 sm:col-span-2 lg:col-span-1">
                <div className="w-9 h-9 rounded-xl bg-[#20242B] text-[#D99A55] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#20242B] mb-1">Sauvegarde & Évolutions</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Conservation sécurisée de vos nuanciers personnels et accès direct aux futures améliorations de l'application.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 bg-[#20242B] hover:bg-[#20242B]/90 text-white font-medium text-base rounded-xl shadow-md cursor-pointer">
                <Link href="/register" className="flex items-center gap-2">
                  <span>Commencer maintenant</span>
                  <ArrowRight className="w-4 h-4 text-[#D99A55]" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-zinc-50 border-[#E5E3DC] text-[#20242B] font-medium text-base rounded-xl shadow-xs cursor-pointer">
                <Link href="/register">
                  <span>Découvrir l'abonnement</span>
                </Link>
              </Button>
            </div>

            <p className="text-center text-xs text-zinc-500 mt-4">
              Rejoignez les peintres et artistes qui structurent leur mémoire chromatique avec Artelia Mix.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="py-20 bg-[#F7F6F2] border-t border-[#E5E3DC]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-zinc-700 text-xs font-semibold mb-3 border border-zinc-200">
              <HelpCircle className="w-3.5 h-3.5 text-[#D99A55]" />
              <span>Questions fréquentes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#20242B]">
              Tout savoir sur le MVP Artelia Mix
            </h2>
          </div>

          <Accordion className="space-y-4">
            <AccordionItem value="item-1" className="bg-white border border-[#E5E3DC] rounded-xl px-5 py-1">
              <AccordionTrigger className="text-left font-semibold text-[#20242B] hover:no-underline">
                Pourquoi utiliser l'application sans le capteur physique ?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 text-sm leading-relaxed">
                Cette version MVP permet de valider toute l’organisation de vos recettes et de vos teintes sans dépendre du matériel électronique. Le Color Studio intègre un simulateur optique fidèle pour tester dès aujourd’hui la numérisation et l’archivage de vos mélanges.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white border border-[#E5E3DC] rounded-xl px-5 py-1">
              <AccordionTrigger className="text-left font-semibold text-[#20242B] hover:no-underline">
                Le capteur pourra-t-il deviner les tubes de peinture utilisés ?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 text-sm leading-relaxed">
                Non. Un capteur optique mesure la lumière réfléchie (la couleur finale), mais plusieurs combinaisons différentes de pigments peuvent produire une même nuance visuelle. C’est pourquoi l’artiste renseigne lui-même ses ingrédients et ses proportions dans la recette.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white border border-[#E5E3DC] rounded-xl px-5 py-1">
              <AccordionTrigger className="text-left font-semibold text-[#20242B] hover:no-underline">
                Quelles unités de mesure sont supportées pour les recettes ?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 text-sm leading-relaxed">
                Vous pouvez saisir vos quantités en pourcentages (%), en millilitres (ml), en grammes (g), en gouttes ou en parts de volume. L’application calcule automatiquement la barre de répartition visuelle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white border border-[#E5E3DC] rounded-xl px-5 py-1">
              <AccordionTrigger className="text-left font-semibold text-[#20242B] hover:no-underline">
                Puis-je exporter mes couleurs pour les utiliser dans Photoshop ou Procreate ?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 text-sm leading-relaxed">
                Chaque couleur dispose d'un bouton de copie instantanée de son code HEX et de ses composantes RGB. Vous pouvez les coller dans n'importe quel logiciel graphique.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 9. Contact & Footer */}
      <Footer />
    </div>
  )
}
