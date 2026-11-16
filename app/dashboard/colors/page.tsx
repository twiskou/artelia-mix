'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Palette,
  Search,
  Bookmark,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
  Eye,
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
import { ReverseRecipeModal } from '@/components/studio/ReverseRecipeModal'
import { DEMO_COLORS } from '@/lib/data'
import { Color } from '@/lib/types'
import { getContrastColor, formatDate } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import Fuse from 'fuse.js'

const CATEGORIES = ['Toutes', 'Rouge', 'Orange', 'Jaune', 'Vert', 'Bleu', 'Violet', 'Neutre', 'Blanc', 'Noir']

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Toutes')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const [recipeModalColor, setRecipeModalColor] = useState<Color | null>(null)

  // Load colors for current user
  async function loadColors() {
    setLoading(true)
    try {
      const dbColors = await api.getColors()
      setColors(dbColors || [])
    } catch {
      setColors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadColors()
  }, [])

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(colors, {
      keys: ['name', 'hex', 'category', 'description'],
      threshold: 0.35,
    })
  }, [colors])

  // Filtered colors
  const filteredColors = useMemo(() => {
    let result = colors

    if (searchQuery.trim()) {
      result = fuse.search(searchQuery).map((r) => r.item)
    }

    if (selectedCategory !== 'Toutes') {
      result = result.filter((c) => c.category === selectedCategory)
    }

    if (onlyFavorites) {
      result = result.filter((c) => c.isFavorite)
    }

    return result
  }, [colors, searchQuery, selectedCategory, onlyFavorites, fuse])

  function handleCopyHex(e: React.MouseEvent, hex: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    toast.success(`Code ${hex} copié dans le presse-papier`)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  async function toggleFavorite(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const target = colors.find((c) => c.id === id)
    if (!target) return

    const nextState = !target.isFavorite
    // Optimistic update
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: nextState } : c))
    )

    // Sync with backend
    await api.toggleFavorite(id, nextState)
    toast.info('Favori mis à jour dans votre nuancier.')
  }

  async function handleDeleteColor(id: string) {
    // Optimistic update
    setColors((prev) => prev.filter((c) => c.id !== id))
    setSelectedColor(null)

    // Sync with SQLite backend
    await api.deleteColor(id)
    toast.success('Couleur supprimée de la base de données.')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DC]">
        <div>
          <h2 className="text-2xl font-bold text-[#20242B] flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-[#D99A55]" />
            Mes Couleurs & Nuancier d'Atelier
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {filteredColors.length} nuance{filteredColors.length > 1 ? 's' : ''} enregistrée{filteredColors.length > 1 ? 's' : ''} dans votre bibliothèque d'artiste.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadColors}
            disabled={loading}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            title="Rafraîchir depuis l'atelier"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Button asChild className="bg-[#D99A55] hover:bg-[#C4873D] text-white shadow-xs">
            <Link href="/dashboard/studio" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Créer ou Scanner</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E3DC] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom (ex: Cadmium, Sienna), code #HEX ou description..."
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

          <Button
            variant={onlyFavorites ? 'default' : 'outline'}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`h-10 text-xs shrink-0 ${
              onlyFavorites
                ? 'bg-[#20242B] text-white'
                : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${onlyFavorites ? 'fill-current text-[#D99A55]' : 'text-zinc-500'}`} />
            <span>Favoris uniquement</span>
          </Button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-400 font-semibold uppercase text-[10px] mr-1 shrink-0">
            Catégorie :
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-[#20242B] text-white font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Colors Grid */}
      {filteredColors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E3DC] p-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#20242B]">Aucune couleur ne correspond à votre recherche</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Essayez d'ajuster vos filtres de recherche ou ajoutez un nouveau mélange depuis le Color Studio.
          </p>
          <Button asChild size="sm" className="bg-[#D99A55] hover:bg-[#C4873D] text-white">
            <Link href="/dashboard/studio">Aller au Color Studio</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredColors.map((color) => {
            const contrast = getContrastColor(color.hex)
            const isCopied = copiedHex === color.hex

            return (
              <div
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E5E3DC] bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
              >
                {/* Large Color Swatch */}
                <div
                  className="h-32 w-full p-3 flex flex-col justify-between relative transition-transform"
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
                      {color.category || 'Peinture'}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(e, color.id)}
                      className="p-1 rounded-full backdrop-blur-xs hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: contrast === '#FFFFFF' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
                        color: contrast,
                      }}
                      title="Ajouter aux favoris"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${color.isFavorite ? 'fill-current text-[#D99A55]' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Info Card Content */}
                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    <h4 className="font-bold text-xs text-[#20242B] truncate group-hover:text-[#D99A55] transition-colors">
                      {color.name}
                    </h4>
                    <p className="font-mono text-[11px] text-zinc-500 uppercase mt-0.5">{color.hex}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setRecipeModalColor(color)
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#D99A55]/15 text-[#C4873D] hover:bg-[#D99A55] hover:text-white transition-all font-bold flex items-center gap-1"
                      title="Reconstituer cette couleur avec vos tubes"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Recette</span>
                    </button>
                    <button
                      onClick={(e) => handleCopyHex(e, color.hex)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                      title="Copier le code HEX"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Color Detail Dialog */}
      <Dialog open={!!selectedColor} onOpenChange={(open) => !open && setSelectedColor(null)}>
        {selectedColor && (
          <DialogContent className="max-w-md bg-white p-0 overflow-hidden border border-[#E5E3DC]">
            <div
              className="h-44 w-full p-6 flex flex-col justify-between"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md"
                  style={{
                    backgroundColor: getContrastColor(selectedColor.hex) === '#FFFFFF' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                    color: getContrastColor(selectedColor.hex),
                  }}
                >
                  {selectedColor.category}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => toggleFavorite(e, selectedColor.id)}
                  style={{ color: getContrastColor(selectedColor.hex) }}
                >
                  <Bookmark className={`w-4 h-4 ${selectedColor.isFavorite ? 'fill-current text-[#D99A55]' : ''}`} />
                </Button>
              </div>

              <div>
                <h3
                  className="text-2xl font-extrabold"
                  style={{ color: getContrastColor(selectedColor.hex) }}
                >
                  {selectedColor.name}
                </h3>
                <p
                  className="font-mono text-sm tracking-wider uppercase opacity-90"
                  style={{ color: getContrastColor(selectedColor.hex) }}
                >
                  {selectedColor.hex}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-center font-mono">
                <div>
                  <span className="block text-[10px] text-zinc-400 font-sans uppercase">Rouge</span>
                  <span className="font-bold text-sm text-zinc-800">{selectedColor.red}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-sans uppercase">Vert</span>
                  <span className="font-bold text-sm text-zinc-800">{selectedColor.green}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-sans uppercase">Bleu</span>
                  <span className="font-bold text-sm text-zinc-800">{selectedColor.blue}</span>
                </div>
              </div>

              {selectedColor.description && (
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-700">Description :</span>
                  <p className="text-zinc-600 leading-relaxed">{selectedColor.description}</p>
                </div>
              )}

              {selectedColor.notes && (
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-700">Notes d’atelier :</span>
                  <p className="text-zinc-600 leading-relaxed italic">{selectedColor.notes}</p>
                </div>
              )}

              <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span>Enregistrée le {formatDate(selectedColor.createdAt)}</span>
                <button
                  onClick={(e) => handleCopyHex(e, selectedColor.hex)}
                  className="text-[#D99A55] font-semibold hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copier le code HEX
                </button>
              </div>
            </div>

            <DialogFooter className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteColor(selectedColor.id)}
                className="text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Supprimer
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedColor(null)}
                  variant="outline"
                  className="text-xs"
                >
                  Fermer
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    const target = selectedColor
                    setSelectedColor(null)
                    setRecipeModalColor(target)
                  }}
                  className="bg-[#D99A55] hover:bg-[#C4873D] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Calculer la recette avec mes tubes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Reverse Recipe Calculator Modal */}
      <ReverseRecipeModal
        isOpen={!!recipeModalColor}
        onClose={() => setRecipeModalColor(null)}
        targetColor={recipeModalColor}
        savedColors={colors}
      />
    </div>
  )
}
