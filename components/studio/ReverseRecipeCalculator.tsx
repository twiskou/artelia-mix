'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  Check,
  Copy,
  Save,
  CheckCircle2,
  Info,
  Layers,
  Palette,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

interface ReverseRecipeCalculatorProps {
  targetColor: {
    id?: string
    name: string
    hex: string
    category?: string
  }
  savedColors?: Color[]
  onSelectColor?: (color: Color) => void
  onRecipeSaved?: () => void
  compact?: boolean
}

export function ReverseRecipeCalculator({
  targetColor,
  savedColors = [],
  onSelectColor,
  onRecipeSaved,
  compact = false
}: ReverseRecipeCalculatorProps) {
  // Available pigments selected by the artist (default: Magenta, Jaune, Cyan, Blanc)
  const [selectedPigmentIds, setSelectedPigmentIds] = useState<string[]>([
    'pig-magenta',
    'pig-yellow-primary',
    'pig-cyan',
    'pig-white-titanium'
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Get list of selected ArtistPigment objects
  const availablePigments = useMemo(() => {
    return STANDARD_ARTIST_PIGMENTS.filter((p) =>
      selectedPigmentIds.includes(p.id)
    )
  }, [selectedPigmentIds])

  // AUTOMATED CALCULATION: Runs in real time without the user adjusting sliders
  const recipeResult: ReverseRecipeResult = useMemo(() => {
    if (!targetColor?.hex) {
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
    return solveReverseRecipe(targetColor.hex, availablePigments)
  }, [targetColor?.hex, availablePigments])

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
    toast.info('Palette primaire activée (Magenta, Jaune, Cyan, Blanc).')
  }

  function setPresetAll() {
    setSelectedPigmentIds(STANDARD_ARTIST_PIGMENTS.map((p) => p.id))
    toast.info('Tous les 10 tubes sélectionnés.')
  }

  // Copy recipe to clipboard
  function handleCopyRecipe() {
    const text = [
      `🎨 Recette Artelia Mix : "${targetColor.name}" (${targetColor.hex})`,
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

  // Save recipe to Neon / Prisma database
  async function handleSaveRecipe() {
    setIsSaving(true)
    try {
      const activeIngredients = recipeResult.ingredients.filter((i) => i.percentage > 0)

      const res = await api.createRecipe({
        name: `Recette pour ${targetColor.name}`,
        colorId: targetColor.id || 'custom',
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
          description: `La formule pour "${targetColor.name}" est archivée.`,
        })
        onRecipeSaved?.()
      } else {
        toast.error('Erreur lors de la sauvegarde : ' + (res.error || ''))
      }
    } catch {
      toast.error('Erreur de connexion avec la base de données.')
    } finally {
      setIsSaving(false)
    }
  }

  const targetContrast = getContrastColor(targetColor.hex)
  const resultContrast = getContrastColor(recipeResult.simulatedHex)

  return (
    <div className="space-y-5">
      {/* Target Color & Result Comparison Banner */}
      <div className="bg-[#20242B] text-white p-4 sm:p-5 rounded-2xl border border-[#2d323b] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D99A55]/20 text-[#D99A55] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulateur Automatique de Recettes</span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 border-0 ${
              recipeResult.accuracyPercentage >= 90
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : recipeResult.accuracyPercentage >= 75
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            Précision : {recipeResult.accuracyPercentage}% ({recipeResult.matchQuality})
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
          {/* Target */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-black/20">
            <div
              className="w-10 h-10 rounded-lg shrink-0 shadow-sm border border-white/20 flex items-center justify-center font-bold text-[9px]"
              style={{ backgroundColor: targetColor.hex, color: targetContrast }}
            >
              Cible
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Cible</span>
              <p className="text-xs font-bold text-white truncate">{targetColor.name}</p>
              <span className="font-mono text-[10px] text-[#D99A55]">{targetColor.hex}</span>
            </div>
          </div>

          {/* Mixed result */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-black/20">
            <div
              className="w-10 h-10 rounded-lg shrink-0 shadow-sm border border-white/20 flex items-center justify-center font-bold text-[9px]"
              style={{ backgroundColor: recipeResult.simulatedHex, color: resultContrast }}
            >
              Mélange
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Résultat</span>
              <p className="text-xs font-bold text-white truncate">Teinte obtenue</p>
              <span className="font-mono text-[10px] text-zinc-300">{recipeResult.simulatedHex}</span>
            </div>
          </div>
        </div>

        {/* Quick selector of other saved colors if available */}
        {savedColors.length > 0 && onSelectColor && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <span className="text-[10px] text-zinc-400 shrink-0 font-medium">Changer de nuance :</span>
            {savedColors.slice(0, 8).map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => onSelectColor(sc)}
                className={`px-2 py-0.5 rounded-md text-[10px] shrink-0 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  sc.hex === targetColor.hex
                    ? 'bg-[#D99A55] text-white'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30"
                  style={{ backgroundColor: sc.hex }}
                />
                <span className="truncate max-w-[80px]">{sc.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: Select Available Pigment Tubes */}
      <Card className="border border-[#E5E3DC] bg-white shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#20242B] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D99A55] text-white text-xs flex items-center justify-center font-bold">1</span>
                Tubes d’artiste disponibles sur votre table :
              </h4>
              <p className="text-[11px] text-zinc-500">
                L’algorithme calcule la formule optimale avec UNIQUEMENT les tubes cochés.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={setPresetPrimaries}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                Primaires + Blanc
              </button>
              <button
                type="button"
                onClick={setPresetAll}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                Tous (10 tubes)
              </button>
            </div>
          </div>

          {/* Grid of Pigment chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between relative cursor-pointer ${
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D99A55]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-300" />
                    )}
                  </div>

                  <div>
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
        </CardContent>
      </Card>

      {/* STEP 2: Automatic Calculated Proportions Result */}
      <Card className="border border-[#E5E3DC] bg-white shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#20242B] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#D99A55] text-white text-xs flex items-center justify-center font-bold">2</span>
              Recette calculée automatiquement :
            </h4>
            <p className="text-[11px] text-zinc-500">
              Résultat instantané sans saisie manuelle de pourcentages.
            </p>
          </div>

          {/* Visual Ingredient Proportion Bars */}
          <div className="space-y-2.5">
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
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: ing.pigment.hex }}
                      />
                      <span className="font-bold text-zinc-800 text-[11px]">
                        {ing.pigment.name}
                      </span>
                      {ing.isDominant && (
                        <Badge className="bg-[#D99A55]/15 text-[#C4873D] border-0 text-[8px] font-bold py-0 px-1">
                          Base
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
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
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-amber-800 block">
                Dosage Pratique sur Palette
              </span>
              <p className="text-xs font-bold text-zinc-900">
                {recipeResult.partsSummary}
              </p>
            </div>
            <Badge className="bg-amber-600 text-white border-0 text-[10px] py-0.5 self-start sm:self-auto">
              Fidélité : {recipeResult.accuracyPercentage}%
            </Badge>
          </div>

          {/* Atelier Advice */}
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-600 leading-relaxed flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#D99A55] shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-800 block font-semibold mb-0.5">Conseil d’atelier :</strong>
              {recipeResult.mixingAdvice}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyRecipe}
              className="border-zinc-300 text-zinc-800 hover:bg-zinc-50 text-xs"
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
              className="bg-[#D99A55] hover:bg-[#C4873D] text-white font-bold text-xs shadow-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer dans mon Carnet de Recettes'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
