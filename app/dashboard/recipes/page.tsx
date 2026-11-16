'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Layers,
  Copy,
  Clock,
  Palette,
  Search,
  Check,
  X,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { DEMO_RECIPES } from '@/lib/data'
import { Recipe } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  async function loadRecipes() {
    setLoading(true)
    try {
      const dbRecipes = await api.getRecipes()
      setRecipes(dbRecipes || [])
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  const filteredRecipes = recipes.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) ||
      (r.colorName && r.colorName.toLowerCase().includes(q)) ||
      (r.colorHex && r.colorHex.toLowerCase().includes(q)) ||
      r.ingredients.some((i) => i.paintName.toLowerCase().includes(q))
    )
  })

  async function handleDeleteRecipe(id: string) {
    // Optimistic update
    setRecipes((prev) => prev.filter((r) => r.id !== id))
    setSelectedRecipe(null)

    // Sync with backend
    await api.deleteRecipe(id)
    toast.success('Recette supprimée avec succès.')
  }

  const ingredientColors = ['#E34234', '#FADA5E', '#0047AB', '#40826D', '#8A3324', '#F5F5F0', '#231F20']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DC]">
        <div>
          <h2 className="text-2xl font-bold text-[#20242B] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#D99A55]" />
            Carnet des Recettes de Peinture
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Formulations pigmentaires, dosages manuels et protocoles de mélange d’atelier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRecipes}
            disabled={loading}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            title="Rafraîchir les recettes"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Button asChild className="bg-[#D99A55] hover:bg-[#C4873D] text-white shadow-xs">
            <Link href="/dashboard/studio" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Créer dans le Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E3DC] shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre de recette, pigment (ex: Cadmium, Umber) ou nuance..."
            className="pl-9 h-10 border-zinc-200 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recipes Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E3DC] p-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#20242B]">Aucune recette trouvée</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Associez des recettes à vos teintes directement depuis le Color Studio.
          </p>
          <Button asChild size="sm" className="bg-[#D99A55] hover:bg-[#C4873D] text-white">
            <Link href="/dashboard/studio">Composer une recette</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const totalQuantity = recipe.ingredients.reduce((s, i) => s + (Number(i.quantity) || 0), 0)

            return (
              <Card
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="group cursor-pointer border border-[#E5E3DC] bg-white shadow-xs hover:shadow-md hover:border-[#D99A55]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top Header: Swatch + Title */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-14 h-14 rounded-2xl shrink-0 shadow-xs border border-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: recipe.colorHex || '#E68A62' }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#20242B] truncate group-hover:text-[#D99A55] transition-colors">
                        {recipe.name}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate">{recipe.colorName || 'Nuance'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-zinc-400 uppercase">
                          {recipe.colorHex}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-2 font-medium">
                          {recipe.ingredients.length} pigments
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Proportional visual bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full overflow-hidden flex bg-zinc-100 border border-zinc-200">
                      {recipe.ingredients.map((ing, idx) => {
                        const width = totalQuantity > 0 ? (ing.quantity / totalQuantity) * 100 : 0
                        return (
                          <div
                            key={ing.id || idx}
                            className="h-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: ingredientColors[idx % ingredientColors.length],
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Ingredients Summary List */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                    {recipe.ingredients.slice(0, 3).map((ing, i) => (
                      <div key={ing.id || i} className="flex items-center justify-between text-zinc-600">
                        <span className="truncate pr-2">{ing.paintName || 'Pigment'}</span>
                        <span className="font-mono font-semibold text-zinc-800 shrink-0">
                          {ing.quantity} {ing.unit}
                        </span>
                      </div>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <p className="text-[11px] text-zinc-400 italic">
                        +{recipe.ingredients.length - 3} autre(s) composant(s)...
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Créée le {formatDate(recipe.createdAt)}</span>
                  <span className="text-[#D99A55] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Détails
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        {selectedRecipe && (
          <DialogContent className="max-w-lg bg-white p-6 border border-[#E5E3DC]">
            <DialogHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl shrink-0 shadow-xs border border-black/10"
                  style={{ backgroundColor: selectedRecipe.colorHex || '#E68A62' }}
                />
                <div>
                  <DialogTitle className="text-lg font-bold text-[#20242B]">
                    {selectedRecipe.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-500">
                    Nuance cible : <strong className="text-zinc-800">{selectedRecipe.colorName}</strong> ({selectedRecipe.colorHex})
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-3 text-xs">
              {/* Formula Table */}
              <div className="space-y-2">
                <span className="font-semibold text-zinc-700 block">Formulation Pigmentaire :</span>
                <div className="rounded-xl border border-zinc-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-200">
                      <tr>
                        <th className="p-2.5">Peinture / Pigment</th>
                        <th className="p-2.5 text-right">Dosage</th>
                        <th className="p-2.5 text-right">Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedRecipe.ingredients.map((ing, i) => {
                        const total = selectedRecipe.ingredients.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
                        const pct = total > 0 ? Math.round((ing.quantity / total) * 100) : 0

                        return (
                          <tr key={ing.id || i} className="hover:bg-zinc-50/50">
                            <td className="p-2.5 font-medium text-zinc-800 flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: ingredientColors[i % ingredientColors.length] }}
                              />
                              {ing.paintName}
                            </td>
                            <td className="p-2.5 text-right font-mono text-zinc-700">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-zinc-800">
                              {pct} %
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Instructions */}
              {selectedRecipe.instructions && (
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-700 block">Instructions de préparation :</span>
                  <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E5E3DC] text-zinc-700 leading-relaxed">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRecipe.notes && (
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-700 block">Notes d’atelier :</span>
                  <p className="text-zinc-600 italic">{selectedRecipe.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-zinc-100 pt-3 flex items-center justify-between sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                className="text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Supprimer la recette
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedRecipe(null)}
                className="bg-[#20242B] hover:bg-[#20242B]/90 text-white text-xs"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
