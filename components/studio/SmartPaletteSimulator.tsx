'use client'

import React, { useState, useId } from 'react'
import {
  Scan,
  RotateCcw,
  Layers,
  Cpu,
  Sparkles,
  Check,
  Info,
  Plus,
  Minus,
  Sliders,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PigmentProportions {
  red: number
  yellow: number
  blue: number
  white: number
  black: number
}

export interface MeasuredColorData {
  hex: string
  rgb: { red: number; green: number; blue: number }
  name: string
  category: string
  proportions: PigmentProportions
  totalParts: number
}

interface SmartPaletteSimulatorProps {
  onMeasureColor: (data: MeasuredColorData) => void
  initialProportions?: PigmentProportions
}

interface PalettePreset {
  name: string
  parts: PigmentProportions
}

const PRESET_FORMULAS: PalettePreset[] = [
  { name: 'Orange Solaire', parts: { red: 4, yellow: 8, blue: 0, white: 0, black: 0 } },
  { name: 'Vert Émeraude', parts: { red: 0, yellow: 6, blue: 5, white: 0, black: 0 } },
  { name: 'Pourpre Royal', parts: { red: 6, yellow: 0, blue: 5, white: 0, black: 0 } },
  { name: 'Terre d’Ombre', parts: { red: 3, yellow: 3, blue: 2, white: 0, black: 2 } },
  { name: 'Pêche Douce', parts: { red: 3, yellow: 3, blue: 0, white: 6, black: 0 } },
]

/**
 * Optical subtractive pigment blending model
 * Simulates physical oil/acrylic paint mixing with pigment absorption and white/black diluents
 */
export function blendArtistPigments(parts: PigmentProportions) {
  const { red, yellow, blue, white, black } = parts
  const total = red + yellow + blue + white + black

  if (total === 0) {
    return {
      r: 232,
      g: 227,
      b: 215,
      hex: '#E8E3D7',
      name: 'Palette Vierge',
      category: 'Neutre',
    }
  }

  // Subtractive physical color simulation
  let c = (blue * 0.95) / total
  let m = (red * 0.95 + blue * 0.7) / total
  let y = (yellow * 1.0 + red * 0.85) / total
  let k = (black * 1.0) / total

  // White dilution / tinting effect
  const whiteRatio = white / total
  c *= (1 - whiteRatio * 0.85)
  m *= (1 - whiteRatio * 0.85)
  y *= (1 - whiteRatio * 0.85)
  k *= (1 - whiteRatio * 0.9)

  c = Math.min(1, Math.max(0, c))
  m = Math.min(1, Math.max(0, m))
  y = Math.min(1, Math.max(0, y))
  k = Math.min(1, Math.max(0, k))

  let r = Math.round(255 * (1 - c) * (1 - k))
  let g = Math.round(255 * (1 - m) * (1 - k))
  let b = Math.round(255 * (1 - y) * (1 - k))

  if (whiteRatio > 0) {
    r = Math.min(255, Math.round(r + (255 - r) * whiteRatio * 0.7))
    g = Math.min(255, Math.round(g + (255 - g) * whiteRatio * 0.7))
    b = Math.min(255, Math.round(b + (255 - b) * whiteRatio * 0.7))
  }

  const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()

  let category = 'Autre'
  let name = 'Nuance Sur Mesure'

  if (black > 0 && black >= total * 0.7) {
    category = 'Noir'
    name = 'Noir d’Ivoire Profond'
  } else if (white > 0 && white >= total * 0.7) {
    category = 'Blanc'
    name = 'Blanc de Titane Voilé'
  } else if (red > 0 && yellow > 0 && blue === 0) {
    category = 'Orange'
    if (yellow > red * 1.5) {
      name = 'Jaune Orangé Lumineux'
    } else if (red > yellow * 1.5) {
      name = 'Orange Corail Intense'
    } else {
      name = 'Cadmium Orange Solaire'
    }
  } else if (yellow > 0 && blue > 0 && red === 0) {
    category = 'Vert'
    if (yellow > blue) {
      name = 'Vert Feuillage Tendre'
    } else {
      name = 'Vert Émeraude Profond'
    }
  } else if (red > 0 && blue > 0 && yellow === 0) {
    category = 'Violet'
    if (red > blue) {
      name = 'Pourpre Magenta Velouté'
    } else {
      name = 'Violet Outremer Nocturne'
    }
  } else if (red > 0 && yellow === 0 && blue === 0) {
    category = 'Rouge'
    name = 'Rouge de Cadmium Pur'
  } else if (yellow > 0 && red === 0 && blue === 0) {
    category = 'Jaune'
    name = 'Jaune Primaire Cadmium'
  } else if (blue > 0 && red === 0 && yellow === 0) {
    category = 'Bleu'
    name = 'Bleu Outremer Royal'
  } else if (red > 0 && yellow > 0 && blue > 0) {
    category = 'Neutre'
    name = 'Terre d’Ombre Naturelle'
  }

  return { r, g, b, hex, name, category }
}

export function SmartPaletteSimulator({
  onMeasureColor,
  initialProportions = { red: 4, yellow: 8, blue: 0, white: 0, black: 0 },
}: SmartPaletteSimulatorProps) {
  const [proportions, setProportions] = useState<PigmentProportions>(initialProportions)
  const [isExplodedView, setIsExplodedView] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [lastClickedPigment, setLastClickedPigment] = useState<string | null>(null)

  const uid = useId().replace(/:/g, '')

  const blended = blendArtistPigments(proportions)
  const totalParts = proportions.red + proportions.yellow + proportions.blue + proportions.white + proportions.black

  function handleSliderChange(colorKey: keyof PigmentProportions, val: number) {
    setProportions((prev) => ({
      ...prev,
      [colorKey]: Math.max(0, Math.min(10, val)),
    }))
    setScanSuccess(false)
  }

  function handleStep(colorKey: keyof PigmentProportions, delta: number) {
    handleSliderChange(colorKey, proportions[colorKey] + delta)
  }

  function handlePaletteDollopClick(colorKey: keyof PigmentProportions, name: string) {
    if (proportions[colorKey] < 10) {
      handleStep(colorKey, 1)
      setLastClickedPigment(name)
      setTimeout(() => setLastClickedPigment(null), 1200)
    }
  }

  function handleApplyPreset(preset: PalettePreset) {
    setProportions(preset.parts)
    setScanSuccess(false)
  }

  function handleReset() {
    setProportions({ red: 0, yellow: 0, blue: 0, white: 0, black: 0 })
    setScanSuccess(false)
  }

  function handleMeasure() {
    if (isScanning) return
    setIsScanning(true)
    setScanSuccess(false)

    setTimeout(() => {
      setIsScanning(false)
      setScanSuccess(true)
      onMeasureColor({
        hex: blended.hex,
        rgb: { red: blended.r, green: blended.g, blue: blended.b },
        name: blended.name,
        category: blended.category,
        proportions,
        totalParts,
      })
    }, 1300)
  }

  // Pigment rows definition
  const PIGMENT_CONFIGS: {
    key: keyof PigmentProportions
    label: string
    subLabel: string
    colorClass: string
    hex: string
    dollopCoords: { x: number; y: number }
  }[] = [
    {
      key: 'red',
      label: 'Rouge',
      subLabel: 'Cadmium',
      colorClass: 'bg-red-600',
      hex: '#DC2626',
      dollopCoords: { x: 100, y: 84 },
    },
    {
      key: 'yellow',
      label: 'Jaune',
      subLabel: 'Cadmium',
      colorClass: 'bg-amber-400',
      hex: '#FACC15',
      dollopCoords: { x: 144, y: 62 },
    },
    {
      key: 'blue',
      label: 'Bleu',
      subLabel: 'Outremer',
      colorClass: 'bg-blue-600',
      hex: '#2563EB',
      dollopCoords: { x: 92, y: 122 },
    },
    {
      key: 'white',
      label: 'Blanc',
      subLabel: 'Titane',
      colorClass: 'bg-white border border-zinc-400',
      hex: '#FAFAFA',
      dollopCoords: { x: 190, y: 54 },
    },
    {
      key: 'black',
      label: 'Noir',
      subLabel: 'Ivoire',
      colorClass: 'bg-zinc-950 border border-zinc-700',
      hex: '#18181B',
      dollopCoords: { x: 114, y: 148 },
    },
  ]

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#1C2028] via-[#161921] to-[#12141B] border border-zinc-700/70 text-zinc-100 shadow-2xl overflow-hidden p-5 sm:p-6 flex flex-col justify-between">
      {/* Subtle Cyan Ambient Radial Backlight */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Modern Hardware Header Bar */}
      <div className="relative z-10 flex items-start justify-between pb-3.5 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-semibold mb-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Capteur Optique Connecté</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Palette Intelligente Interactive
          </h3>
          <p className="text-[11px] text-zinc-400">
            Modèle physique 2.5D & banc d'étalonnage optique
          </p>
        </div>

        {/* Live Hardware Status Pill */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 px-3 py-1.5 rounded-full shadow-inner">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
          </div>
          <span className="text-[11px] font-semibold text-zinc-300">Calibré</span>
        </div>
      </div>

      {/* 2.5D Interactive Palette Simulator Centerpiece */}
      <div className="relative z-10 py-3 my-auto flex flex-col items-center justify-center select-none">
        {/* Floating Notification Tooltip when clicking dollops */}
        {lastClickedPigment && (
          <div className="absolute top-1 z-30 px-3 py-1 rounded-full bg-cyan-500/90 text-zinc-950 text-xs font-bold shadow-lg animate-bounce">
            +1 part de {lastClickedPigment}
          </div>
        )}

        <div className="w-full max-w-[360px] aspect-[16/11] relative flex items-center justify-center">
          <svg
            viewBox="0 0 360 230"
            className="w-full h-full drop-shadow-2xl overflow-visible"
          >
            <defs>
              {/* Neon Glow Filter */}
              <filter id={`neonGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* 3D Depth Shadow for Baseplate */}
              <filter id={`baseShadow-${uid}`} x="-15%" y="-15%" width="130%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#000000" floodOpacity="0.7" />
              </filter>

              {/* 3D Drop Shadow for Palette */}
              <filter id={`paletteShadow-${uid}`} x="-15%" y="-15%" width="130%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#000000" floodOpacity="0.55" />
              </filter>

              {/* Baseplate Metallic Cylindrical Gradient */}
              <linearGradient id={`dockGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A5262" />
                <stop offset="25%" stopColor="#2E3441" />
                <stop offset="65%" stopColor="#1B1F27" />
                <stop offset="100%" stopColor="#0E1015" />
              </linearGradient>

              {/* Baseplate Chamfer Rim Highlight */}
              <linearGradient id={`dockRim-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748B" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Fine Ceramic Satin Palette Surface */}
              <linearGradient id={`paletteGrad-${uid}`} x1="10%" y1="5%" x2="90%" y2="95%">
                <stop offset="0%" stopColor="#FAF6EE" />
                <stop offset="40%" stopColor="#EFE8DB" />
                <stop offset="85%" stopColor="#E2D8C7" />
                <stop offset="100%" stopColor="#D4C8B4" />
              </linearGradient>

              {/* Specular Liquid Gloss Highlight */}
              <linearGradient id={`glossHigh-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* 3D Pigment Gradients with volume */}
              <radialGradient id={`redVol-${uid}`} cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="45%" stopColor="#DC2626" />
                <stop offset="85%" stopColor="#991B1B" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </radialGradient>

              <radialGradient id={`yellowVol-${uid}`} cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#A16207" />
              </radialGradient>

              <radialGradient id={`blueVol-${uid}`} cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="35%" stopColor="#2563EB" />
                <stop offset="80%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#172554" />
              </radialGradient>

              <radialGradient id={`whiteVol-${uid}`} cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#F8FAFC" />
                <stop offset="85%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#94A3B8" />
              </radialGradient>

              <radialGradient id={`blackVol-${uid}`} cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#52525B" />
                <stop offset="40%" stopColor="#27272A" />
                <stop offset="85%" stopColor="#09090B" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
            </defs>

            {/* BASEPLATE: Heavy 3D Precision Sensor Platter */}
            <g id="sensor-baseplate" filter={`url(#baseShadow-${uid})`}>
              {/* Lower pedestal rim (depth extrusion) */}
              <ellipse
                cx="180"
                cy="154"
                rx="160"
                ry="58"
                fill="#0C0E13"
              />

              {/* Main bevel cylinder */}
              <ellipse
                cx="180"
                cy="148"
                rx="160"
                ry="58"
                fill={`url(#dockGrad-${uid})`}
                stroke={`url(#dockRim-${uid})`}
                strokeWidth="1.5"
              />

              {/* Precision Sensor Calibration Bed */}
              <ellipse
                cx="180"
                cy="145"
                rx="145"
                ry="50"
                fill="#13161C"
                stroke="#252A34"
                strokeWidth="1.5"
              />

              {/* Concentric Precision Optical Grooves */}
              <ellipse
                cx="180"
                cy="145"
                rx="115"
                ry="38"
                fill="none"
                stroke="#232832"
                strokeWidth="1"
                strokeDasharray="4 6"
              />

              {/* Front Center Laser Diode with Optical Flare */}
              <ellipse
                cx="180"
                cy="204"
                rx="4.5"
                ry="2.5"
                fill="#22D3EE"
                filter={`url(#neonGlow-${uid})`}
                className="animate-diode-pulse"
              />
              <circle
                cx="180"
                cy="204"
                r="1.5"
                fill="#FFFFFF"
              />

              {/* Floor Light Beam Reflection */}
              <ellipse
                cx="180"
                cy="212"
                rx="28"
                ry="4"
                fill="#22D3EE"
                opacity="0.25"
                filter={`url(#neonGlow-${uid})`}
              />

              {/* EXPLODED VIEW: Laser Alignment Beams & Optical Sensors */}
              {isExplodedView && (
                <g id="exploded-schematic">
                  {/* Vertical cyan laser guides */}
                  <line x1="70" y1="145" x2="70" y2="105" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                  <line x1="180" y1="142" x2="180" y2="100" stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
                  <line x1="295" y1="145" x2="295" y2="105" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />

                  {/* Optical sensor emitter rings on bed */}
                  <g transform="translate(255, 134)">
                    <circle cx="0" cy="0" r="14" fill="#0891B2" opacity="0.2" className="animate-ping" />
                    <circle cx="0" cy="0" r="12" fill="none" stroke="#22D3EE" strokeWidth="1.5" filter={`url(#neonGlow-${uid})`} />
                    <circle cx="0" cy="0" r="4" fill="#22D3EE" />
                    {/* Laser crosshair */}
                    <line x1="-16" y1="0" x2="16" y2="0" stroke="#22D3EE" strokeWidth="1" opacity="0.75" />
                    <line x1="0" y1="-16" x2="0" y2="16" stroke="#22D3EE" strokeWidth="1" opacity="0.75" />
                  </g>
                </g>
              )}
            </g>

            {/* ARTIST PALETTE (Smooth 3D Hover & Exploded Levitation) */}
            <g
              id="artist-palette"
              filter={`url(#paletteShadow-${uid})`}
              className="transition-transform duration-700 ease-out"
              style={{
                transform: isExplodedView
                  ? 'translateY(-34px)'
                  : 'translateY(0px)',
              }}
            >
              {/* Outer Palette Bevel Rim (gives authentic 3D plate thickness) */}
              <path
                d="M 68 114 
                   C 52 64, 115 35, 185 35 
                   C 260 35, 314 66, 314 116 
                   C 314 163, 252 178, 185 178 
                   C 112 178, 58 154, 68 114 Z"
                fill="#C6BAA5"
              />

              {/* Main Satin Ceramic/Maple Palette Face */}
              <path
                d="M 68 110 
                   C 52 60, 115 32, 185 32 
                   C 260 32, 314 62, 314 112 
                   C 314 159, 252 174, 185 174 
                   C 112 174, 58 150, 68 110 Z"
                fill={`url(#paletteGrad-${uid})`}
                stroke="#EFE8DB"
                strokeWidth="1.5"
              />

              {/* Palette Thumbhole with Inner Drop Shadow & Rim */}
              <g transform="translate(262, 82)">
                <ellipse cx="0" cy="0" rx="22" ry="14" fill="#0C0E13" stroke="#BAAD98" strokeWidth="1.5" />
                <ellipse cx="0" cy="-2" rx="20" ry="11" fill="none" stroke="#222733" strokeWidth="1" opacity="0.8" />
              </g>

              {/* 5 3D PHYSICAL PIGMENT DOLLOPS (Interactive Click to add parts) */}
              {/* 1. Cadmium Red */}
              <g
                transform="translate(100, 84)"
                onClick={() => handlePaletteDollopClick('red', 'Rouge')}
                className="cursor-pointer group hover:scale-110 transition-transform"
              >
                <ellipse cx="0" cy="2" rx="15" ry="13" fill="#000000" opacity="0.2" />
                <ellipse cx="0" cy="0" rx="15" ry="13" fill={`url(#redVol-${uid})`} />
                <ellipse cx="-4" cy="-4" rx="6.5" ry="3.5" fill={`url(#glossHigh-${uid})`} />
                <title>Cliquer pour ajouter +1 part de Rouge de Cadmium</title>
              </g>

              {/* 2. Cadmium Yellow */}
              <g
                transform="translate(144, 62)"
                onClick={() => handlePaletteDollopClick('yellow', 'Jaune')}
                className="cursor-pointer group hover:scale-110 transition-transform"
              >
                <ellipse cx="0" cy="2" rx="15" ry="13" fill="#000000" opacity="0.2" />
                <ellipse cx="0" cy="0" rx="15" ry="13" fill={`url(#yellowVol-${uid})`} />
                <ellipse cx="-4" cy="-4" rx="6.5" ry="3.5" fill={`url(#glossHigh-${uid})`} />
                <title>Cliquer pour ajouter +1 part de Jaune de Cadmium</title>
              </g>

              {/* 3. Titanium White */}
              <g
                transform="translate(190, 54)"
                onClick={() => handlePaletteDollopClick('white', 'Blanc')}
                className="cursor-pointer group hover:scale-110 transition-transform"
              >
                <ellipse cx="0" cy="2" rx="15" ry="13" fill="#000000" opacity="0.2" />
                <ellipse cx="0" cy="0" rx="15" ry="13" fill={`url(#whiteVol-${uid})`} stroke="#CBD5E1" strokeWidth="0.5" />
                <ellipse cx="-4" cy="-4" rx="6.5" ry="3.5" fill={`url(#glossHigh-${uid})`} />
                <title>Cliquer pour ajouter +1 part de Blanc de Titane</title>
              </g>

              {/* 4. Ultramarine Blue */}
              <g
                transform="translate(92, 122)"
                onClick={() => handlePaletteDollopClick('blue', 'Bleu')}
                className="cursor-pointer group hover:scale-110 transition-transform"
              >
                <ellipse cx="0" cy="2" rx="15" ry="13" fill="#000000" opacity="0.2" />
                <ellipse cx="0" cy="0" rx="15" ry="13" fill={`url(#blueVol-${uid})`} />
                <ellipse cx="-4" cy="-4" rx="6.5" ry="3.5" fill={`url(#glossHigh-${uid})`} />
                <title>Cliquer pour ajouter +1 part de Bleu d'Outremer</title>
              </g>

              {/* 5. Ivory Black */}
              <g
                transform="translate(114, 148)"
                onClick={() => handlePaletteDollopClick('black', 'Noir')}
                className="cursor-pointer group hover:scale-110 transition-transform"
              >
                <ellipse cx="0" cy="2" rx="15" ry="13" fill="#000000" opacity="0.25" />
                <ellipse cx="0" cy="0" rx="15" ry="13" fill={`url(#blackVol-${uid})`} />
                <ellipse cx="-4" cy="-4" rx="6.5" ry="3.5" fill={`url(#glossHigh-${uid})`} />
                <title>Cliquer pour ajouter +1 part de Noir d'Ivoire</title>
              </g>

              {/* 6. THE MIXED PAINT WELL (Zone de mélange live & Viseur Laser) */}
              <g transform="translate(255, 134)">
                {/* Under-well shadow */}
                <ellipse cx="0" cy="3" rx="24" ry="19" fill="#000000" opacity="0.2" />

                {/* Live blended paint liquid pool */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="21"
                  ry="17"
                  fill={blended.hex}
                  stroke="#FFFFFF"
                  strokeWidth="0.75"
                  className="transition-colors duration-300"
                />

                {/* Liquid surface gloss reflection */}
                <ellipse cx="-5" cy="-5" rx="9" ry="4.5" fill={`url(#glossHigh-${uid})`} />

                {/* TARGETING RETICLE: Cyan High-Precision Optical Rings */}
                {/* Outer Rotating Dashed Ring */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="28"
                  ry="23"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  className="animate-spin origin-[255px_134px]"
                  style={{ animationDuration: isScanning ? '2s' : '12s' }}
                  filter={`url(#neonGlow-${uid})`}
                />

                {/* Inner Static Sensor Ring */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="31"
                  ry="26"
                  fill="none"
                  stroke="#0891B2"
                  strokeWidth="0.75"
                  opacity="0.7"
                />

                {/* Expanding Radar Wave Pulse on scan or idle */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="26"
                  ry="21"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1"
                  className={isScanning ? 'animate-ping' : ''}
                  opacity={isScanning ? 0.8 : 0}
                />

                {/* Center Crosshairs */}
                <g stroke="#22D3EE" strokeWidth="1" opacity="0.8">
                  <line x1="-8" y1="0" x2="-3" y2="0" />
                  <line x1="3" y1="0" x2="8" y2="0" />
                  <line x1="0" y1="-8" x2="0" y2="-3" />
                  <line x1="0" y1="3" x2="0" y2="8" />
                </g>

                {/* HIGH-TECH LASER SCAN SWEEP BEAM (during measurement) */}
                {isScanning && (
                  <g className="animate-laser-sweep">
                    <line
                      x1="-26"
                      y1="0"
                      x2="26"
                      y2="0"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      filter={`url(#neonGlow-${uid})`}
                    />
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="18"
                      ry="3"
                      fill="#22D3EE"
                      opacity="0.8"
                      filter={`url(#neonGlow-${uid})`}
                    />
                  </g>
                )}
              </g>
            </g>
          </svg>
        </div>

        {/* View Toggle Pill: "Vue Éclatée du Capteur" */}
        <button
          type="button"
          onClick={() => setIsExplodedView(!isExplodedView)}
          className={`mt-1.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isExplodedView
              ? 'bg-zinc-800 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-700/60 hover:text-white hover:border-zinc-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isExplodedView ? 'Reposer la Palette (Vue Normale)' : 'Vue Éclatée du Capteur'}</span>
        </button>
      </div>

      {/* Preset 1-Click Formulas (High-Value Artist Shortcuts) */}
      <div className="pt-2 pb-1 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#D99A55]" />
            <span>Formules Rapides d'Atelier</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">1 clic</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_FORMULAS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Precision Sliders Section: "Dosage des pigments (parts)" */}
      <div className="space-y-3 pt-3 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
          <span>Dosage des pigments (parts)</span>
          <span className="font-mono text-cyan-300 text-[11px] bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/40 shadow-xs">
            Total : {totalParts} part{totalParts > 1 ? 's' : ''}
          </span>
        </div>

        {/* 5 Pigment Sliders with Step Micro-Buttons */}
        {PIGMENT_CONFIGS.map((pigment) => {
          const val = proportions[pigment.key]
          const percent = (val / 10) * 100

          return (
            <div key={pigment.key} className="flex items-center gap-2.5">
              {/* Part Count Monospace Pill */}
              <div className="w-7 h-7 shrink-0 rounded-lg bg-zinc-900 border border-zinc-700/80 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shadow-inner">
                {val}
              </div>

              {/* Micro Step Minus */}
              <button
                type="button"
                onClick={() => handleStep(pigment.key, -1)}
                disabled={val <= 0}
                className="w-6 h-6 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer"
                title="Diminuer d'une part"
              >
                <Minus className="w-3 h-3" />
              </button>

              {/* Dynamic Styled Range Slider Track */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={val}
                  onChange={(e) => handleSliderChange(pigment.key, parseInt(e.target.value) || 0)}
                  style={{
                    background: `linear-gradient(to right, #0D9488 0%, #06B6D4 ${percent}%, #27272A ${percent}%, #27272A 100%)`,
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-300 shadow-inner"
                />
              </div>

              {/* Micro Step Plus */}
              <button
                type="button"
                onClick={() => handleStep(pigment.key, 1)}
                disabled={val >= 10}
                className="w-6 h-6 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer"
                title="Augmenter d'une part"
              >
                <Plus className="w-3 h-3" />
              </button>

              {/* Pigment Name & Glossy Color Bead */}
              <div className="flex items-center gap-2 w-28 justify-end">
                <div className="text-right">
                  <span className="block text-xs font-semibold text-zinc-200 leading-tight">
                    {pigment.label}
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-mono leading-none">
                    {pigment.subLabel}
                  </span>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full ${pigment.colorClass} shadow-md shrink-0`}
                  style={{ boxShadow: `0 0 6px ${pigment.hex}66` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Buttons: "Mesurer la couleur" (قياس اللون) & "Vider l'unité" (تفريغ الوحدة) */}
      <div className="pt-4 flex items-center gap-3">
        <Button
          type="button"
          onClick={handleReset}
          variant="outline"
          className="flex-1 h-11 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-semibold cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          <span>Vider l'unité</span>
        </Button>

        <Button
          type="button"
          onClick={handleMeasure}
          disabled={isScanning || totalParts === 0}
          className="flex-1 h-11 relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 hover:from-teal-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer disabled:opacity-50 border-0"
        >
          {/* Shimmer sweep animation */}
          <div className="absolute inset-0 w-1/3 bg-white/20 skew-x-12 animate-shimmer-slide pointer-events-none" />

          {isScanning ? (
            <>
              <Scan className="w-4 h-4 mr-2 animate-spin text-white" />
              <span>Acquisition Optique...</span>
            </>
          ) : scanSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2 text-white" />
              <span>Nuance Calibrée</span>
            </>
          ) : (
            <>
              <Scan className="w-4 h-4 mr-2 text-white" />
              <span>Mesurer la couleur</span>
            </>
          )}
        </Button>
      </div>

      {/* Hardware Caption / Explanatory Note */}
      <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-start gap-2 text-[11px] text-zinc-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          Ajustez les parts de pigments ou cliquez sur les touches de couleur de la palette pour doser, puis lancez la mesure optique pour étalonner votre recette.
        </p>
      </div>
    </div>
  )
}
