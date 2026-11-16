'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Palette,
  Pipette,
  BookOpen,
  Scan,
  Sparkles,
  Droplets,
  Bookmark,
  Layers,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Color, Recipe, Activity, Scan as ScanType } from '@/lib/types'
import { getContrastColor } from '@/lib/utils'
import { RelativeTime } from '@/components/dashboard/RelativeTime'
import { api } from '@/lib/api-client'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user } = useAuth()
  const rawName = user?.name || (user?.email ? user.email.split('@')[0] : '')
  const displayName = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : 'Artiste'

  const [colors, setColors] = useState<Color[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [scans, setScans] = useState<ScanType[]>([])
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function refreshDashboard() {
    setLoading(true)
    try {
      const [dbColors, dbRecipes, dbActivities, dbScans] = await Promise.all([
        api.getColors(),
        api.getRecipes(),
        api.getHistory(),
        api.getScans(),
      ])

      setColors(dbColors || [])
      setRecipes(dbRecipes || [])
      setActivities(dbActivities || [])
      setScans(dbScans || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDashboard()
  }, [user?.id, user?.email])

  const totalColors = colors.length
  const totalRecipes = recipes.length
  const totalFavorites = colors.filter((c) => c.isFavorite).length
  const totalScans = scans.length

  function handleCopyHex(hex: string) {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    toast.success(`Code ${hex} copié dans le presse-papier`)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#20242B] to-[#2c323c] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D99A55] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier {displayName} · Synchronisé</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Bonjour, {displayName}
          </h2>
          <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
            Votre palette contient actuellement <strong className="text-white">{totalColors} couleur{totalColors > 1 ? 's' : ''}</strong> et{' '}
            <strong className="text-white">{totalRecipes} recette{totalRecipes > 1 ? 's' : ''} de mélanges</strong> stockées dans votre espace d&apos;artiste.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="outline"
            onClick={refreshDashboard}
            disabled={loading}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Synchroniser
          </Button>

          <Button asChild size="lg" className="bg-[#D99A55] hover:bg-[#C4873D] text-white font-medium shadow-sm">
            <Link href="/dashboard/studio" className="flex items-center gap-2">
              <Pipette className="w-4 h-4" />
              <span>Lancer le Color Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <Card className="border border-[#E5E3DC] bg-white shadow-xs hover:border-[#D99A55]/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Couleurs de l&apos;Atelier
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-[#20242B] flex items-center justify-center">
                <Palette className="w-4 h-4 text-[#D99A55]" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#20242B]">{totalColors}</div>
            <p className="text-xs text-zinc-500 mt-1">Nuance{totalColors > 1 ? 's' : ''} archivée{totalColors > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card className="border border-[#E5E3DC] bg-white shadow-xs hover:border-[#D99A55]/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Carnet de Recettes
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-[#20242B] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#D99A55]" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#20242B]">{totalRecipes}</div>
            <p className="text-xs text-zinc-500 mt-1">Mélange{totalRecipes > 1 ? 's' : ''} dosé{totalRecipes > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card className="border border-[#E5E3DC] bg-white shadow-xs hover:border-[#D99A55]/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Scans Similés
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-[#20242B] flex items-center justify-center">
                <Scan className="w-4 h-4 text-[#D99A55]" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#20242B]">{totalScans}</div>
            <p className="text-xs text-zinc-500 mt-1">Capture{totalScans > 1 ? 's' : ''} optique{totalScans > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card className="border border-[#E5E3DC] bg-white shadow-xs hover:border-[#D99A55]/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Coups de Cœur
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-[#20242B] flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-[#D99A55]" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#20242B]">{totalFavorites}</div>
            <p className="text-xs text-zinc-500 mt-1">Couleur{totalFavorites > 1 ? 's' : ''} favorite{totalFavorites > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Colors & Activities */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Colors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#20242B]">Dernières Couleurs Enregistrées</h3>
              <p className="text-xs text-zinc-500">Nuances enregistrées dans votre atelier</p>
            </div>
            {colors.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="text-xs text-[#D99A55] hover:text-[#C4873D]">
                <Link href="/dashboard/colors" className="flex items-center gap-1">
                  <span>Voir toutes les couleurs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </div>

          {colors.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-[#E5E3DC] bg-white/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D99A55]/10 text-[#D99A55] flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#20242B]">Votre nuancier est encore vide</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Composez vos premières teintes pigmentaires et scannez des couleurs depuis le Color Studio.
                </p>
              </div>
              <Button asChild size="sm" className="bg-[#D99A55] hover:bg-[#C4873D] text-white text-xs">
                <Link href="/dashboard/studio" className="inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Créer ma première nuance
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {colors.slice(0, 6).map((color) => {
                const contrast = getContrastColor(color.hex)
                const isCopied = copiedHex === color.hex

                return (
                  <Card key={color.id} className="border border-[#E5E3DC] bg-white overflow-hidden shadow-xs hover:shadow-sm transition-all group">
                    <div
                      className="h-24 w-full relative p-3 flex flex-col justify-between transition-transform group-hover:scale-102"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs"
                          style={{
                            backgroundColor: contrast === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                            color: contrast,
                          }}
                        >
                          {color.category || 'Couleur'}
                        </span>
                        {color.isFavorite && (
                          <Bookmark
                            className="w-3.5 h-3.5 fill-current"
                            style={{ color: contrast }}
                          />
                        )}
                      </div>
                    </div>

                    <CardContent className="p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-xs text-[#20242B] truncate">{color.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-zinc-500 uppercase">{color.hex}</span>
                        <button
                          onClick={() => handleCopyHex(color.hex)}
                          title="Copier le code HEX"
                          className="p-1 rounded text-zinc-400 hover:text-[#20242B] hover:bg-zinc-100 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Quick Access to Recipes */}
          <div className="pt-4 border-t border-[#E5E3DC]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#20242B]">Recettes Clés Prêtes à l’Emploi</h3>
                <p className="text-xs text-zinc-500">Mélanges prêts à être reconstitués sur votre palette</p>
              </div>
              {recipes.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="text-xs text-[#D99A55] hover:text-[#C4873D]">
                  <Link href="/dashboard/recipes" className="flex items-center gap-1">
                    <span>Voir le carnet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            {recipes.length === 0 ? (
              <div className="p-6 rounded-xl border border-zinc-200 bg-white/50 text-center text-xs text-zinc-500">
                <BookOpen className="w-5 h-5 mx-auto text-zinc-400 mb-1.5" />
                Aucune recette formulée pour le moment. Rendez-vous dans le Studio pour doser vos pigments.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recipes.slice(0, 2).map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 rounded-xl border border-[#E5E3DC] bg-white shadow-xs flex items-center gap-3.5 hover:border-[#D99A55]/40 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 shadow-xs border border-black/10"
                      style={{ backgroundColor: recipe.colorHex || '#E68A62' }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-[#20242B] truncate">{recipe.name}</h4>
                      <p className="text-[11px] text-zinc-500 truncate">{recipe.colorName || 'Nuance'}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
                        <span>{recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span className="font-mono">{recipe.colorHex}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#20242B]">Activité Récente de l&apos;Atelier</h3>
            {activities.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="text-xs text-[#D99A55] hover:text-[#C4873D]">
                <Link href="/dashboard/history">Tout l’historique</Link>
              </Button>
            )}
          </div>

          <Card className="border border-[#E5E3DC] bg-white shadow-xs">
            <CardContent className="p-4 space-y-4">
              {activities.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-[#D99A55]" />
                  </div>
                  <p className="text-xs font-semibold text-[#20242B]">Bienvenue dans votre atelier !</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Vos scans optiques, enregistrements de nuances et formulations apparaîtront ici chronologiquement.
                  </p>
                </div>
              ) : (
                activities.slice(0, 7).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-xs pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                      {activity.type === 'color_saved' && <Droplets className="w-3.5 h-3.5 text-[#D99A55]" />}
                      {activity.type === 'recipe_created' && <BookOpen className="w-3.5 h-3.5 text-blue-600" />}
                      {activity.type === 'scan_performed' && <Scan className="w-3.5 h-3.5 text-purple-600" />}
                      {activity.type === 'color_updated' && <Palette className="w-3.5 h-3.5 text-amber-600" />}
                      {activity.type === 'recipe_updated' && <BookOpen className="w-3.5 h-3.5 text-blue-600" />}
                      {activity.type === 'color_deleted' && <Layers className="w-3.5 h-3.5 text-red-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-800 leading-snug">{activity.description}</p>
                      <RelativeTime date={activity.createdAt} className="text-[10px] text-zinc-400" />
                    </div>

                    {activity.colorHex && (
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border border-black/10 mt-1"
                        style={{ backgroundColor: activity.colorHex }}
                        title={activity.colorHex}
                      />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Studio Callout */}
          <div className="p-4 rounded-2xl bg-[#D99A55]/10 border border-[#D99A55]/30">
            <h4 className="font-bold text-xs text-[#20242B] flex items-center gap-1.5 mb-1">
              <Pipette className="w-4 h-4 text-[#D99A55]" />
              Sauvegarde Automatique Active
            </h4>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Toutes vos créations dans le Color Studio sont enregistrées et synchronisées en temps réel dans votre atelier d&apos;artiste.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
