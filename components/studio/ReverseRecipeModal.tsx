'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  Check,
  Copy,
  Save,
  CheckCircle2,
  X,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  STANDARD_ARTIST_PIGMENTS,
  ArtistPigment,
  solveReverseRecipe,
  ReverseRecipeResult
} from '@/lib/recipe-solver'
import { getContrastColor } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Color } from '@/lib/types'

interface ReverseRecipeModalProps {
  isOpen: boolean
  onClose: () => void
  targetColor: {
    id?: string
    name: string
    hex: string
    category?: string
  } | null
  savedColors?: Color[]
  onSelectAnotherColor?: (color: Color) => void
  onRecipeSaved?: () => void
}

export function ReverseRecipeModal({
  isOpen,
  onClose,
  targetColor,
  savedColors = [],
  onSelectAnotherColor,
  onRecipeSaved
}: ReverseRecipeModalProps) {
  // Selected pigment tube IDs (default: primaries + white)
  const [selectedPigmentIds, setSelectedPigmentIds] = useState<string[]>([
    'pig-magenta',
    'pig-yellow-primary',
    'pig-cyan',
    'pig-white-titanium'
  ])

  const [currentColor, setCurrentColor] = useState(targetColor)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Sync state with prop
  React.useEffect(() => {
    if (targetColor) {
      setCurrentColor(targetColor)
    }
  }, [targetColor])

  // Get active pigment objects
  const availablePigments = useMemo(() => {
    return STANDARD_ARTIST_PIGMENTS.filter((p) =>
      selectedPigmentIds.includes(p.id)
    )
  }, [selectedPigmentIds])

  // Automatic real-time calculation
  const recipeResult: ReverseRecipeResult = useMemo(() => {
    if (!currentColor?.hex) {
      return {
        targetHex: '#E34234',
        simulatedHex: '#E34234',
        deltaE: 0,
        accuracyPercentage: 100,
        matchQuality: 'Excellente',
        ingredients: [],
        partsSummary: '',
        mixingAdvice: '',
        canAchieve: false
      }
    }
    return solveReverseRecipe(currentColor.hex, availablePigments)
  }, [currentColor?.hex, availablePigments])

  function togglePigment(id: string) {
    setSelectedPigmentIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          toast.warning('Conservez au moins un pigment disponible.')
          return prev
        }
        return prev.filter((pId) => pId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  function setPresetPrimaries() {
    setSelectedPigmentIds([
      'pig-magenta',
      'pig-yellow-primary',
      'pig-cyan',
      'pig-white-titanium'
    ])
    toast.info('Palette primaire activée (Magenta, Jaune, Cyan, Blanc).')
  }

  function setPresetAll() {
    setSelectedPigmentIds(STANDARD_ARTIST_PIGMENTS.map((p) => p.id))
    toast.info('Tous les 10 tubes sélectionnés.')
  }

  function handleCopyRecipe() {
    if (!currentColor) return
    const text = [
      `🎨 Recette Artelia Mix : "${currentColor.name}" (${currentColor.hex})`,
      `Précision : ${recipeResult.accuracyPercentage}% (${recipeResult.matchQuality})`,
      `---------------------------------`,
      `PROPORTIONS DE MÉLANGE :`,
      ...recipeResult.ingredients
        .filter((ing) => ing.percentage > 0)
        .map((ing) => `• ${ing.pigment.name} : ${ing.percentage}% (${ing.parts} part${ing.parts > 1 ? 's' : ''})`),
      `---------------------------------`,
      `Dosage physique : ${recipeResult.partsSummary}`,
      `Conseil d'atelier : ${recipeResult.mixingAdvice}`,
    ].join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Formulation copiée !')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveRecipe() {
    if (!currentColor) return
    setIsSaving(true)

    try {
      const activeIngredients = recipeResult.ingredients.filter((i) => i.percentage > 0)

      const res = await api.createRecipe({
        name: `Recette pour ${currentColor.name}`,
        colorId: currentColor.id || 'custom',
        instructions: recipeResult.mixingAdvice,
        notes: `Dosage calculé automatiquement par Artelia Mix : ${recipeResult.partsSummary}. Précision : ${recipeResult.accuracyPercentage}%.`,
        ingredients: activeIngredients.map((ing, idx) => ({
          paintName: ing.pigment.name,
          quantity: ing.percentage,
          unit: '%',
          order: idx,
        })),
      })

      if (res.success) {
        toast.success('Recette enregistrée dans votre carnet !', {
          description: `La formule pour "${currentColor.name}" est archivée.`,
        })
        onRecipeSaved?.()
        onClose()
      } else {
        toast.error('Erreur lors de la sauvegarde : ' + (res.error || ''))
      }
    } catch {
      toast.error('Erreur de connexion avec la base de données.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!currentColor) return null

  const targetContrast = getContrastColor(currentColor.hex)
  const resultContrast = getContrastColor(recipeResult.simulatedHex)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-2xl sm:rounded-3xl border border-[#E5E3DC] bg-[#FAF9F5] shadow-2xl overflow-hidden outline-none"
      >
        {/* Header (Fixed) */}
        <div className="bg-[#20242B] text-white p-4 sm:p-5 rounded-t-2xl sm:rounded-t-3xl border-b border-[#2d323b] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D99A55]/20 text-[#D99A55] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Formulateur Automatique de Recettes</span>
              </div>
              <DialogTitle className="text-lg sm:text-2xl font-extrabold text-white truncate">
                Reconstituer « {currentColor.name} »
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-300 line-clamp-1">
                L’algorithme calcule automatiquement les proportions (%) selon vos tubes disponibles.
              </DialogDescription>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Target & Result Visual Swatches */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
            {/* Target Color Swatch */}
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-black/25 min-w-0">
              <div
                className="w-10 h-10 rounded-lg shrink-0 shadow-sm border border-white/20 flex items-center justify-center font-bold text-[9px]"
                style={{ backgroundColor: currentColor.hex, color: targetContrast }}
              >
                Cible
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block truncate">Couleur Cible</span>
                <p className="text-xs font-bold text-white truncate">{currentColor.name}</p>
                <span className="font-mono text-[10px] text-[#D99A55]">{currentColor.hex}</span>
              </div>
            </div>

            {/* Simulated Mixed Result Swatch */}
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-black/25 min-w-0">
              <div
                className="w-10 h-10 rounded-lg shrink-0 shadow-sm border border-white/20 flex items-center justify-center font-bold text-[9px]"
                style={{ backgroundColor: recipeResult.simulatedHex, color: resultContrast }}
              >
                Mélange
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] uppercase font-bold text-zinc-400">Résultat Estimé</span>
                  <Badge
                    variant="outline"
                    className={`text-[8px] px-1 py-0 border-0 ${
                      recipeResult.accuracyPercentage >= 90
                        ? 'bg-emerald-500/25 text-emerald-300 font-bold'
                        : recipeResult.accuracyPercentage >= 75
                        ? 'bg-amber-500/25 text-amber-300'
                        : 'bg-red-500/25 text-red-300'
                    }`}
                  >
                    {recipeResult.accuracyPercentage}% ({recipeResult.matchQuality})
                  </Badge>
                </div>
                <p className="text-xs font-bold text-white truncate">Teinte obtenue</p>
                <span className="font-mono text-[10px] text-zinc-300">{recipeResult.simulatedHex}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content (Vertical only, 100% width, no horizontal scroll) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-5 w-full">
          {/* STEP 1: Select Available Tubes */}
          <div className="space-y-2.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[#20242B] flex items-center gap-1.5">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D99A55] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold shrink-0">1</span>
                  <span>Cochez les tubes disponibles sur votre table :</span>
                </h4>
                <p className="text-[11px] text-zinc-500 line-clamp-1">
                  La formule s’ajuste instantanément avec UNIQUEMENT les pigments cochés.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={setPresetPrimaries}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Primaires + Blanc
                </button>
                <button
                  type="button"
                  onClick={setPresetAll}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Tout cocher (10)
                </button>
              </div>
            </div>

            {/* Fully Responsive Pigment Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full">
              {STANDARD_ARTIST_PIGMENTS.map((pigment) => {
                const isSelected = selectedPigmentIds.includes(pigment.id)
                const isUsedInRecipe = recipeResult.ingredients.some(
                  (i) => i.pigment.id === pigment.id && i.percentage > 0
                )

                return (
                  <button
                    key={pigment.id}
                    type="button"
                    onClick={() => togglePigment(pigment.id)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between relative cursor-pointer min-w-0 w-full ${
                      isSelected
                        ? 'bg-white border-[#D99A55] shadow-2xs ring-1 ring-[#D99A55]/30'
                        : 'bg-zinc-100/60 border-zinc-200 opacity-55 hover:opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className="w-4 h-4 rounded-full shadow-inner border border-black/15 shrink-0"
                        style={{ backgroundColor: pigment.hex }}
                      />
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D99A55] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" />
                      )}
                    </div>

                    <div className="min-w-0 w-full">
                      <p className="text-[11px] font-bold text-[#20242B] truncate leading-tight">
                        {pigment.name}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-mono">
                        {pigment.code}
                      </p>
                    </div>

                    {isUsedInRecipe && (
                      <span className="absolute bottom-1 right-1.5 text-[8px] font-extrabold text-[#D99A55]">
                        • Retenu
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* STEP 2: Automatically Calculated Recipe Result */}
          <div className="space-y-2.5 pt-3 border-t border-[#E5E3DC] w-full">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#20242B] flex items-center gap-1.5">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D99A55] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold shrink-0">2</span>
                <span>Recette calculée automatiquement :</span>
              </h4>
              <p className="text-[11px] text-zinc-500">
                Voici les proportions physiques optimales pour votre palette :
              </p>
            </div>

            <Card className="border border-[#E5E3DC] bg-white shadow-xs overflow-hidden w-full">
              <CardContent className="p-3.5 sm:p-5 space-y-3.5">
                {/* Visual Ingredient Proportion Bars */}
                <div className="space-y-2 w-full">
                  {recipeResult.ingredients.map((ing) => {
                    const isZero = ing.percentage === 0
                    return (
                      <div
                        key={ing.pigment.id}
                        className={`space-y-1 transition-opacity ${
                          isZero ? 'opacity-35' : 'opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: ing.pigment.hex }}
                            />
                            <span className="font-bold text-zinc-800 text-[11px] truncate">
                              {ing.pigment.name}
                            </span>
                            {ing.isDominant && (
                              <Badge className="bg-[#D99A55]/15 text-[#C4873D] border-0 text-[8px] font-bold py-0 px-1 shrink-0">
                                Base
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {ing.percentage > 0 && (
                              <span className="text-[10px] text-zinc-500 font-medium">
                                {ing.parts} part{ing.parts > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="font-extrabold text-xs font-mono text-[#20242B] w-10 text-right">
                              {ing.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/50">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${ing.percentage}%`,
                              backgroundColor: ing.pigment.hex === '#FFFFFF' ? '#C0C0C0' : ing.pigment.hex,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Practical Ratio Box */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] uppercase font-bold text-amber-800 block">
                      Dosage Pratique sur Palette
                    </span>
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {recipeResult.partsSummary}
                    </p>
                  </div>
                  <Badge className="bg-amber-600 text-white border-0 text-[10px] py-0.5 self-start sm:self-auto shrink-0">
                    Fidélité : {recipeResult.accuracyPercentage}%
                  </Badge>
                </div>

                {/* Atelier Advice */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-600 leading-relaxed flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#D99A55] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-zinc-800 block font-semibold mb-0.5">Conseil d’atelier :</strong>
                    {recipeResult.mixingAdvice}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Footer (Fixed) */}
        <div className="p-3 sm:p-4 bg-zinc-100/90 border-t border-[#E5E3DC] shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-900 text-xs h-8 sm:h-9"
          >
            Fermer
          </Button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyRecipe}
              className="border-zinc-300 text-zinc-800 hover:bg-white text-xs h-8 sm:h-9"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copier la formule</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSaveRecipe}
              disabled={isSaving || !recipeResult.canAchieve}
              className="bg-[#D99A55] hover:bg-[#C4873D] text-white font-bold text-xs shadow-xs h-8 sm:h-9"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer dans mon Carnet'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
