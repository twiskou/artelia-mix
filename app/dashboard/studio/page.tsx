'use client'

import React, { useState } from 'react'
import {
  Pipette,
  Scan,
  Save,
  BookOpen,
  Plus,
  Trash2,
  Check,
  Copy,
  Info,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Palette,
  AlertCircle,
  Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  hexToRgb,
  rgbToHex,
  getContrastColor,
  generateSimulatedColor,
  generateId
} from '@/lib/utils'
import { Color, Recipe, RecipeIngredient } from '@/lib/types'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import {
  SmartPaletteSimulator,
  MeasuredColorData,
  PigmentProportions,
} from '@/components/studio/SmartPaletteSimulator'

const COLOR_CATEGORIES = [
  'Rouge',
  'Orange',
  'Jaune',
  'Vert',
  'Bleu',
  'Violet',
  'Neutre',
  'Blanc',
  'Noir',
  'Autre',
]

export default function ColorStudioPage() {
  // Studio interaction mode: physical smart palette simulator or digital sliders
  const [studioMode, setStudioMode] = useState<'palette' | 'digital'>('palette')

  // Current active color state (initial default matching Red 4 + Yellow 8)
  const [hex, setHex] = useState('#FFAE0D')
  const [rgb, setRgb] = useState({ red: 255, green: 174, blue: 13 })
  const [colorName, setColorName] = useState('Cadmium Orange Solaire')
  const [category, setCategory] = useState('Orange')
  const [description, setDescription] = useState('Mélange chaud et vibrant dosé au capteur optique.')
  const [notes, setNotes] = useState('Idéal pour les lumières chaudes et les crépuscules.')

  // Scan status
  const [isScanning, setIsScanning] = useState(false)
  const [isSimulatedScan, setIsSimulatedScan] = useState(true)
  const [copiedHex, setCopiedHex] = useState(false)

  // Saved color reference
  const [savedColor, setSavedColor] = useState<Color | null>(null)
  const [isSavingColor, setIsSavingColor] = useState(false)
  const [isSavingRecipe, setIsSavingRecipe] = useState(false)

  // Recipe Builder State
  const [recipeName, setRecipeName] = useState('Recette Cadmium Orange Solaire')
  const [recipeInstructions, setRecipeInstructions] = useState('Mélanger 33% de Rouge de Cadmium avec 67% de Jaune de Cadmium au couteau à peindre.')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { id: 'ing_1', paintName: 'Rouge de Cadmium', quantity: 33, unit: '%', order: 0 },
    { id: 'ing_2', paintName: 'Jaune de Cadmium', quantity: 67, unit: '%', order: 1 },
  ])

  // Sync when HEX changes manually
  function handleHexChange(val: string) {
    let clean = val.trim()
    if (!clean.startsWith('#')) clean = `#${clean}`
    setHex(clean)

    const parsed = hexToRgb(clean)
    if (parsed) {
      setRgb(parsed)
      setIsSimulatedScan(false)
    }
  }

  // Sync when RGB sliders change
  function handleRgbChange(channel: 'red' | 'green' | 'blue', val: number) {
    const nextRgb = { ...rgb, [channel]: val }
    setRgb(nextRgb)
    const newHex = rgbToHex(nextRgb.red, nextRgb.green, nextRgb.blue)
    setHex(newHex)
    setIsSimulatedScan(false)
  }

  // Trigger simulated scan from the header button
  async function triggerScan() {
    setIsScanning(true)
    toast.info('Scan du capteur en cours...', {
      description: 'Lecture optique de la surface de peinture...',
    })

    setTimeout(async () => {
      const simulated = generateSimulatedColor()
      setHex(simulated.hex)
      setRgb({ red: simulated.red, green: simulated.green, blue: simulated.blue })
      setColorName(simulated.name)
      setCategory(simulated.category)
      setDescription(`Nuance optique capturée (${simulated.name}).`)
      setRecipeName(`Recette pour ${simulated.name}`)
      setIsScanning(false)
      setIsSimulatedScan(true)

      // Record scan in backend
      await api.recordScan({
        hex: simulated.hex,
        red: simulated.red,
        green: simulated.green,
        blue: simulated.blue,
        isSimulated: true,
      })

      toast.success('Lecture terminée & enregistrée !', {
        description: `Couleur détectée : ${simulated.name} (${simulated.hex})`,
      })
    }, 1500)
  }

  // Handle measurement from the SmartPaletteSimulator
  async function handlePaletteMeasure(data: MeasuredColorData) {
    setHex(data.hex)
    setRgb(data.rgb)
    setColorName(data.name)
    setCategory(data.category)
    setDescription(
      `Nuance optique mesurée au capteur (${data.name}). Formulation basée sur ${data.totalParts} part${data.totalParts > 1 ? 's' : ''} de pigments.`
    )
    setRecipeName(`Recette ${data.name}`)
    setIsSimulatedScan(true)

    // Build automated ingredients based on pigment dosage
    const pigmentNames: Record<keyof PigmentProportions, string> = {
      red: 'Rouge de Cadmium',
      yellow: 'Jaune de Cadmium',
      blue: 'Bleu d’Outremer',
      white: 'Blanc de Titane',
      black: 'Noir d’Ivoire',
    }

    const newIngredients: RecipeIngredient[] = []
    let order = 0
    const keys: (keyof PigmentProportions)[] = ['red', 'yellow', 'blue', 'white', 'black']

    for (const k of keys) {
      if (data.proportions[k] > 0) {
        const percentage = Math.round((data.proportions[k] / data.totalParts) * 100)
        newIngredients.push({
          id: generateId('ing'),
          paintName: pigmentNames[k],
          quantity: percentage,
          unit: '%',
          order: order++,
        })
      }
    }

    if (newIngredients.length > 0) {
      setIngredients(newIngredients)
      setRecipeInstructions(
        `Dosage étalonné : ${newIngredients
          .map((i) => `${i.quantity}% de ${i.paintName}`)
          .join(', ')}. Mélanger soigneusement au couteau à peindre jusqu’à homogénéité.`
      )
    }

    // Save scan to backend
    await api.recordScan({
      hex: data.hex,
      red: data.rgb.red,
      green: data.rgb.green,
      blue: data.rgb.blue,
      isSimulated: true,
    })

    toast.success('Mesure optique terminée & synchronisée !', {
      description: `Couleur analysée : ${data.name} (${data.hex}) avec ${newIngredients.length} pigments dosés.`,
    })
  }

  // Copy HEX code
  function handleCopy() {
    navigator.clipboard.writeText(hex)
    setCopiedHex(true)
    toast.success(`Code ${hex} copié !`)
    setTimeout(() => setCopiedHex(false), 2000)
  }

  // Save color to library
  async function handleSaveColor() {
    if (!colorName.trim()) {
      toast.error('Veuillez renseigner un nom pour cette couleur.')
      return
    }

    setIsSavingColor(true)
    try {
      const res = await api.createColor({
        name: colorName,
        hex: hex.toUpperCase(),
        red: rgb.red,
        green: rgb.green,
        blue: rgb.blue,
        category,
        description,
        notes,
      })

      if (res.success && res.data) {
        setSavedColor(res.data)
        toast.success('Couleur enregistrée dans votre nuancier !', {
          description: `"${res.data.name}" est archivée dans votre nuancier d'atelier.`,
        })
      } else {
        toast.error('Erreur lors de la sauvegarde : ' + (res.error || 'Erreur inconnue'))
      }
    } catch {
      toast.error('Erreur réseau ou base de données')
    } finally {
      setIsSavingColor(false)
    }
  }

  // Recipe Ingredient management
  function addIngredient() {
    setIngredients([
      ...ingredients,
      {
        id: generateId('ing'),
        paintName: '',
        quantity: 10,
        unit: '%',
        order: ingredients.length,
      },
    ])
  }

  function removeIngredient(id: string) {
    if (ingredients.length <= 1) {
      toast.error('Une recette doit comporter au moins un ingrédient.')
      return
    }
    setIngredients(ingredients.filter((i) => i.id !== id))
  }

  function updateIngredient(id: string, field: keyof RecipeIngredient, val: any) {
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: val } : ing))
    )
  }

  async function handleSaveRecipe() {
    if (!recipeName.trim()) {
      toast.error('Veuillez donner un nom à la recette.')
      return
    }

    setIsSavingRecipe(true)
    try {
      const res = await api.createRecipe({
        colorId: savedColor?.id || 'c1',
        name: recipeName,
        instructions: recipeInstructions,
        ingredients,
      })

      if (res.success) {
        toast.success('Recette enregistrée dans votre carnet !', {
          description: `La recette "${recipeName}" est archivée dans votre atelier.`,
        })
      } else {
        toast.error('Erreur lors de l’enregistrement de la recette')
      }
    } catch {
      toast.error('Erreur serveur lors de la sauvegarde de la recette')
    } finally {
      setIsSavingRecipe(false)
    }
  }

  const contrastColor = getContrastColor(hex)
  const totalIngredientQuantity = ingredients.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DC]">
        <div>
          <h2 className="text-2xl font-bold text-[#20242B] flex items-center gap-2.5">
            <Pipette className="w-6 h-6 text-[#D99A55]" />
            Color Studio & Laboratoire Chromatique
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Dosage pigmentaire sur palette intelligente, simulation optique et sauvegarde de vos formulations d'atelier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={triggerScan}
            disabled={isScanning}
            className="bg-[#20242B] hover:bg-[#20242B]/90 text-white shadow-xs font-semibold cursor-pointer"
          >
            <Scan className={`w-4 h-4 mr-2 text-[#D99A55] ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scan en cours...' : 'Scan Optique Rapide'}
          </Button>
        </div>
      </div>

      {/* Main 2-Column Studio Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Smart Palette Simulator or Digital Sliders */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-[#EBE8E0] rounded-2xl border border-[#D8D2C4]">
            <button
              type="button"
              onClick={() => setStudioMode('palette')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'palette'
                  ? 'bg-white text-[#20242B] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 shrink-0 ${studioMode === 'palette' ? 'text-teal-600' : ''}`} />
              <span className="hidden sm:inline">Palette Intelligente (Capteur)</span>
              <span className="sm:hidden">Palette Capteur</span>
            </button>

            <button
              type="button"
              onClick={() => setStudioMode('digital')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'digital'
                  ? 'bg-white text-[#20242B] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sliders className={`w-3.5 h-3.5 shrink-0 ${studioMode === 'digital' ? 'text-[#D99A55]' : ''}`} />
              <span className="hidden sm:inline">Ajustement Numérique (RGB)</span>
              <span className="sm:hidden">Sliders RGB</span>
            </button>
          </div>

          {/* Mode 1: Interactive Smart Palette Simulator (from uploaded design) */}
          {studioMode === 'palette' && (
            <SmartPaletteSimulator
              onMeasureColor={handlePaletteMeasure}
              initialProportions={{ red: 4, yellow: 8, blue: 0, white: 0, black: 0 }}
            />
          )}

          {/* Mode 2: Digital Manual Color Controls (Pick, HEX, RGB) */}
          {studioMode === 'digital' && (
            <Card className="border border-[#E5E3DC] bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-zinc-100">
                <CardTitle className="text-base font-bold text-[#20242B] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D99A55]" />
                  Sélecteur & Ajustement Chromatique
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Ajustez manuellement les curseurs RGB ou la pipette visuelle
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-6">
                {/* Native Visual Color Picker Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span>Pipette chromatique directe</span>
                    <span className="font-mono text-[11px] text-zinc-400">Interactif</span>
                  </label>
                  <div className="relative h-14 w-full rounded-xl overflow-hidden border border-zinc-200 shadow-xs cursor-pointer">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="w-full h-full flex items-center justify-center font-mono font-bold text-sm tracking-wider shadow-inner"
                      style={{ backgroundColor: hex, color: contrastColor }}
                    >
                      Cliquez pour ouvrir la palette visuelle
                    </div>
                  </div>
                </div>

                {/* HEX Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span>Code Hexadécimal</span>
                    <span className="font-mono text-[10px] text-zinc-400">Format #RRGGBB</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        value={hex}
                        onChange={(e) => handleHexChange(e.target.value)}
                        placeholder="#FFAE0D"
                        className="font-mono font-bold text-base h-11 border-zinc-200 uppercase focus-visible:ring-[#D99A55]"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="h-11 px-3 border-zinc-200 text-zinc-700 hover:bg-zinc-50 shrink-0 cursor-pointer"
                      title="Copier le code HEX"
                    >
                      {copiedHex ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* RGB Sliders */}
                <div className="space-y-4 pt-2 border-t border-zinc-100">
                  <div className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span>Composantes RGB (0 à 255)</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      rgb({rgb.red}, {rgb.green}, {rgb.blue})
                    </span>
                  </div>

                  {/* Red Channel */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-600">
                      <span className="text-red-700 font-semibold">Rouge (Red)</span>
                      <span className="font-mono">{rgb.red}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={rgb.red}
                      onChange={(e) => handleRgbChange('red', parseInt(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                    />
                  </div>

                  {/* Green Channel */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-600">
                      <span className="text-emerald-700 font-semibold">Vert (Green)</span>
                      <span className="font-mono">{rgb.green}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={rgb.green}
                      onChange={(e) => handleRgbChange('green', parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                    />
                  </div>

                  {/* Blue Channel */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-600">
                      <span className="text-blue-700 font-semibold">Bleu (Blue)</span>
                      <span className="font-mono">{rgb.blue}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={rgb.blue}
                      onChange={(e) => handleRgbChange('blue', parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Large Visual Swatch, Save Color & Recipe Builder */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual Color Swatch */}
          <Card className="border border-[#E5E3DC] bg-white shadow-xs overflow-hidden">
            <div
              className="h-44 w-full p-6 flex flex-col justify-between transition-all duration-300 relative"
              style={{ backgroundColor: hex }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-xs"
                  style={{
                    backgroundColor: contrastColor === '#FFFFFF' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                    color: contrastColor,
                  }}
                >
                  {category}
                </span>

                {isSimulatedScan && (
                  <Badge variant="outline" className="bg-amber-100/90 text-amber-900 border-amber-300 font-bold text-[11px] px-2.5 py-0.5 shadow-xs flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>SIMULATED SCAN</span>
                  </Badge>
                )}
              </div>

              <div>
                <h3
                  className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-xs"
                  style={{ color: contrastColor }}
                >
                  {colorName || 'Nuance en cours'}
                </h3>
                <p
                  className="font-mono text-sm tracking-wider uppercase opacity-90 mt-0.5"
                  style={{ color: contrastColor }}
                >
                  {hex} · rgb({rgb.red}, {rgb.green}, {rgb.blue})
                </p>
              </div>
            </div>

            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-zinc-500">Rouge : <strong className="text-zinc-800 font-mono">{rgb.red}</strong></span>
                  <span className="text-zinc-500">Vert : <strong className="text-zinc-800 font-mono">{rgb.green}</strong></span>
                  <span className="text-zinc-500">Bleu : <strong className="text-zinc-800 font-mono">{rgb.blue}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs text-zinc-600 cursor-pointer">
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copier HEX
                  </Button>
                </div>
              </div>

              {/* Formulaire Sauvegarder la Couleur */}
              <div className="pt-4 space-y-4">
                <h4 className="font-bold text-sm text-[#20242B] flex items-center gap-2">
                  <Save className="w-4 h-4 text-[#D99A55]" />
                  Enregistrer cette nuance dans votre nuancier
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Nom de la couleur</label>
                    <Input
                      type="text"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="Cadmium Orange Solaire"
                      className="border-zinc-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Catégorie chromatique</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus:ring-[#D99A55] focus:outline-none"
                    >
                      {COLOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Description (facultative)</label>
                  <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Mélange pour les lumières du ciel en fin de journée"
                    className="border-zinc-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Notes personnelles d'atelier</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Remarques sur le séchage, le liant ou la transparence..."
                    rows={2}
                    className="border-zinc-200 text-xs"
                  />
                </div>

                <Button
                  onClick={handleSaveColor}
                  disabled={isSavingColor}
                  className="w-full h-10 bg-[#20242B] hover:bg-[#20242B]/90 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2 text-[#D99A55]" />
                  {isSavingColor ? 'Sauvegarde en cours...' : 'Sauvegarder dans « Mes Couleurs »'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire Recette de Peinture (Pigment Formulation) */}
          <Card className="border border-[#E5E3DC] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#20242B] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#D99A55]" />
                    Recette de Peinture Associée
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Formulation pigmentaire issue du dosage ou personnalisée à la main
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#D99A55] text-[#D99A55] font-semibold text-[11px]">
                  Dosage Automatique & Édition
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Titre de la recette</label>
                <Input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Recette Cadmium Orange Solaire"
                  className="border-zinc-200 text-xs h-9"
                />
              </div>

              {/* Dynamic Ingredients List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">
                    Ingrédients & Proportions ({ingredients.length})
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Total : <strong className="text-zinc-800">{totalIngredientQuantity} %</strong>
                  </span>
                </div>

                {/* Visual Proportional Bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-100 border border-zinc-200">
                  {ingredients.map((ing, idx) => {
                    const widthPercent = totalIngredientQuantity > 0 ? (ing.quantity / totalIngredientQuantity) * 100 : 0
                    const barColors = ['#E34234', '#FACC15', '#2563EB', '#FAFAFA', '#18181B', '#40826D']
                    return (
                      <div
                        key={ing.id}
                        className="h-full transition-all"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: barColors[idx % barColors.length],
                        }}
                        title={`${ing.paintName || 'Ingrédient'} : ${ing.quantity} ${ing.unit}`}
                      />
                    )
                  })}
                </div>

                {/* Table of Ingredients */}
                <div className="space-y-2">
                  {ingredients.map((ing) => (
                    <div key={ing.id} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={ing.paintName}
                        onChange={(e) => updateIngredient(ing.id, 'paintName', e.target.value)}
                        placeholder="Ex: Rouge de Cadmium"
                        className="flex-1 h-9 text-xs border-zinc-200"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Quantité"
                        className="w-20 h-9 text-xs font-mono text-center border-zinc-200"
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                        className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-xs focus:ring-[#D99A55] focus:outline-none"
                      >
                        <option value="%">%</option>
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="gouttes">gouttes</option>
                        <option value="parts">parts</option>
                      </select>
                      <button
                        onClick={() => removeIngredient(ing.id)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Supprimer cet ingrédient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="w-full border-dashed border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs h-8 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-[#D99A55]" />
                  Ajouter un ingrédient
                </Button>
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Instructions de préparation</label>
                <Textarea
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  placeholder="Ordre d'incorporation, mélange à sec, solvant..."
                  rows={2}
                  className="border-zinc-200 text-xs"
                />
              </div>

              <Button
                onClick={handleSaveRecipe}
                disabled={isSavingRecipe}
                className="w-full h-10 bg-[#D99A55] hover:bg-[#C4873D] text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {isSavingRecipe ? 'Enregistrement en cours...' : 'Enregistrer cette Recette dans mon Carnet'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
