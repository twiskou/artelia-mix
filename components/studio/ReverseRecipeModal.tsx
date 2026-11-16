'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  Check,
  Copy,
  Save,
  BookOpen,
  Pipette,
  Layers,
  AlertCircle,
  CheckCircle2,
  Palette,
  X,
  ChevronRight,
  Info,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  // Available pigments selected by the artist (default: Magenta, Jaune, Cyan, Blanc, Noir)
  const [selectedPigmentIds, setSelectedPigmentIds] = useState<string[]>([
    'pig-magenta',
    'pig-yellow-primary',
    'pig-cyan',
    'pig-white-titanium'
  ])

  const [currentColor, setCurrentColor] = useState(targetColor)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Keep currentColor in sync with targetColor prop
  React.useEffect(() => {
    if (targetColor) {
      setCurrentColor(targetColor)
    }
  }, [targetColor])

  // Get list of selected ArtistPigment objects
  const availablePigments = useMemo(() => {
    return STANDARD_ARTIST_PIGMENTS.filter((p) =>
      selectedPigmentIds.includes(p.id)
    )
  }, [selectedPigmentIds])

  // AUTOMATED CALCULATION: Runs in real time without the user adjusting sliders
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

  // Toggle pigment selection
  function togglePigment(id: string) {
    setSelectedPigmentIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          toast.warning('Conservez au moins un pigment sélectionné.')
          return prev
        }
        return prev.filter((pId) => pId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Quick preset selections
  function setPresetPrimaries() {
    setSelectedPigmentIds([
      'pig-magenta',
      'pig-yellow-primary',
      'pig-cyan',
      'pig-white-titanium'
    ])
    toast.info('Palette primaire sélectionnée (Magenta, Jaune, Cyan, Blanc).')
  }

  function setPresetAll() {
    setSelectedPigmentIds(STANDARD_ARTIST_PIGMENTS.map((p) => p.id))
    toast.info('Tous les 10 tubes de la palette d’atelier sélectionnés.')
  }

  // Copy recipe to clipboard
  function handleCopyRecipe() {
    if (!currentColor) return
    const text = [
      `🎨 Formule Artelia Mix : "${currentColor.name}" (${currentColor.hex})`,
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
    toast.success('Recette copiée dans le presse-papier !')
    setTimeout(() => setCopied(false), 2000)
  }

  // Save recipe to Neon / Prisma database
  async function handleSaveRecipe() {
    if (!currentColor) return
    setIsSaving(true)

    try {
      const activeIngredients = recipeResult.ingredients.filter((i) => i.percentage > 0)

      const res = await api.createRecipe({
        name: `Recette pour ${currentColor.name}`,
        colorId: currentColor.id || 'custom',
        instructions: recipeResult.mixingAdvice,
        notes: `Dosage calculé automatiquement par Artelia Mix : ${recipeResult.partsSummary}. Précision chromatique : ${recipeResult.accuracyPercentage}%.`,
        ingredients: activeIngredients.map((ing, idx) => ({
          paintName: ing.pigment.name,
          quantity: ing.percentage,
          unit: '%',
          order: idx,
        })),
      })

      if (res.success) {
        toast.success('Recette enregistrée dans votre carnet !', {
          description: `La formulation pour "${currentColor.name}" est archivée.`,
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
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border border-[#E5E3DC] bg-[#FAF9F5] shadow-2xl">
        {/* Header Modal */}
        <div className="bg-[#20242B] text-white p-5 sm:p-6 rounded-t-3xl border-b border-[#2d323b] relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D99A55]/20 text-[#D99A55] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formulateur Automatique de Recettes</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white">
                Reconstituer « {currentColor.name} »
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-zinc-300">
                L’algorithme calcule automatiquement les proportions (%) optimales selon vos tubes disponibles.
              </DialogDescription>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Color Comparison Ribbon */}
          <div className="mt-5 grid grid-cols-2 gap-3 p-2 bg-white/5 rounded-2xl border border-white/10">
            {/* Target */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20">
              <div
                className="w-12 h-12 rounded-xl shrink-0 shadow-md border border-white/20 flex items-center justify-center font-bold text-[10px]"
                style={{ backgroundColor: currentColor.hex, color: targetContrast }}
              >
                Cible
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Couleur Cible</span>
                <p className="text-xs font-bold text-white truncate">{currentColor.name}</p>
                <span className="font-mono text-[11px] text-[#D99A55]">{currentColor.hex}</span>
              </div>
            </div>

            {/* Simulated Mixed */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20">
              <div
                className="w-12 h-12 rounded-xl shrink-0 shadow-md border border-white/20 flex items-center justify-center font-bold text-[10px]"
                style={{ backgroundColor: recipeResult.simulatedHex, color: resultContrast }}
              >
                Mélange
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Résultat Estimé</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 border-0 ${
                      recipeResult.accuracyPercentage >= 90
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : recipeResult.accuracyPercentage >= 75
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {recipeResult.accuracyPercentage}% ({recipeResult.matchQuality})
                  </Badge>
                </div>
                <p className="text-xs font-bold text-white truncate">Teinte obtenue</p>
                <span className="font-mono text-[11px] text-zinc-300">{recipeResult.simulatedHex}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* STEP 1: Select Available Pigment Tubes */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#20242B] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D99A55] text-white text-xs flex items-center justify-center font-bold">1</span>
                  Cochez les tubes d’artiste disponibles sur votre table :
                </h4>
                <p className="text-xs text-zinc-500">
                  L’algorithme adaptera instantanément la formule avec UNIQUEMENT les pigments cochés.
                </p>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={setPresetPrimaries}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
                >
                  Les 3 Primaires + Blanc
                </button>
                <button
                  type="button"
                  onClick={setPresetAll}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
                >
                  Tout cocher (10 tubes)
                </button>
              </div>
            </div>

            {/* Pigments Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
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
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between relative group cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#D99A55] shadow-xs ring-2 ring-[#D99A55]/20'
                        : 'bg-zinc-100/70 border-zinc-200 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-5 h-5 rounded-full shadow-inner border border-black/15 shrink-0"
                        style={{ backgroundColor: pigment.hex }}
                      />
                      <div className="text-zinc-400 group-hover:text-zinc-700">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#D99A55]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-300" />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#20242B] truncate leading-tight">
                        {pigment.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {pigment.code}
                      </p>
                    </div>

                    {isUsedInRecipe && (
                      <span className="absolute bottom-1.5 right-2 text-[9px] font-extrabold text-[#D99A55]">
                        Retenu
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* STEP 2: Automatic Calculated Proportions Result */}
          <div className="space-y-3 pt-4 border-t border-[#E5E3DC]">
            <div>
              <h4 className="text-sm font-bold text-[#20242B] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D99A55] text-white text-xs flex items-center justify-center font-bold">2</span>
                Formule de dosage calculée automatiquement par l’IA :
              </h4>
              <p className="text-xs text-zinc-500">
                Aucun réglage manuel requis : voici les proportions exactes calculées pour votre palette.
              </p>
            </div>

            <Card className="border border-[#E5E3DC] bg-white shadow-xs overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Visual Ingredient Proportion Bars */}
                <div className="space-y-3">
                  {recipeResult.ingredients.map((ing) => {
                    const isZero = ing.percentage === 0
                    return (
                      <div
                        key={ing.pigment.id}
                        className={`space-y-1.5 transition-opacity ${
                          isZero ? 'opacity-40' : 'opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: ing.pigment.hex }}
                            />
                            <span className="font-bold text-zinc-800">
                              {ing.pigment.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ({ing.pigment.code})
                            </span>
                            {ing.isDominant && (
                              <Badge className="bg-[#D99A55]/15 text-[#C4873D] border-0 text-[9px] font-bold py-0">
                                Base majeure
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {ing.percentage > 0 && (
                              <span className="text-[11px] text-zinc-500 font-medium">
                                {ing.parts} part{ing.parts > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="font-extrabold text-sm font-mono text-[#20242B] w-12 text-right">
                              {ing.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/50">
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
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Dosage Pratique sur Palette
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-zinc-900">
                      {recipeResult.partsSummary}
                    </p>
                  </div>
                  <Badge className="bg-amber-600 text-white border-0 self-start sm:self-auto text-xs py-1">
                    Précision : {recipeResult.accuracyPercentage}%
                  </Badge>
                </div>

                {/* Atelier Advice */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#D99A55] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-800 block mb-0.5 font-semibold">Conseil d’atelier pour ce mélange :</strong>
                    {recipeResult.mixingAdvice}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-zinc-100/80 border-t border-[#E5E3DC] rounded-b-3xl flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-900 text-xs"
          >
            Fermer
          </Button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyRecipe}
              className="border-zinc-300 text-zinc-800 hover:bg-white text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Copier la formule</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSaveRecipe}
              disabled={isSaving || !recipeResult.canAchieve}
              className="bg-[#D99A55] hover:bg-[#C4873D] text-white font-bold text-xs shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer dans mon Carnet de Recettes'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
