import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToRgb(hex: string): { red: number; green: number; blue: number } | null {
  const cleanHex = hex.replace('#', '').trim()
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { red: r, green: g, blue: b }
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { red: r, green: g, blue: b }
  }
  return null
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#252525'
  // Relative luminance formula
  const luminance = (0.299 * rgb.red + 0.587 * rgb.green + 0.114 * rgb.blue) / 255
  return luminance > 0.55 ? '#20242B' : '#FFFFFF'
}

const ARTIST_PIGMENTS = [
  { name: 'Ocre Jaune Doré', hex: '#D99A55', red: 217, green: 154, blue: 85, category: 'Jaune' },
  { name: 'Rouge Vermillon', hex: '#E34234', red: 227, green: 66, blue: 52, category: 'Rouge' },
  { name: 'Bleu Céruléum', hex: '#2A52BE', red: 42, green: 82, blue: 190, category: 'Bleu' },
  { name: 'Vert Oxyde de Chrome', hex: '#40826D', red: 64, green: 130, blue: 109, category: 'Vert' },
  { name: 'Terre de Sienne Brûlée', hex: '#8A3324', red: 138, green: 51, blue: 36, category: 'Neutre' },
  { name: 'Bleu Outremer Foncé', hex: '#1B263B', red: 27, green: 38, blue: 59, category: 'Bleu' },
  { name: 'Jaune de Cadmium Pur', hex: '#FFF600', red: 255, green: 246, blue: 0, category: 'Jaune' },
  { name: 'Pourpre Minéral', hex: '#702963', red: 112, green: 41, blue: 99, category: 'Violet' },
  { name: 'Noir d’Ivoire', hex: '#231F20', red: 35, green: 31, blue: 32, category: 'Noir' },
  { name: 'Blanc de Titane Extra', hex: '#F9F9F6', red: 249, green: 249, blue: 246, category: 'Blanc' },
  { name: 'Laque de Garance', hex: '#9B1B30', red: 155, green: 27, blue: 48, category: 'Rouge' },
  { name: 'Bleu Turquoise Égyptien', hex: '#1034A6', red: 16, green: 52, blue: 166, category: 'Bleu' },
  { name: 'Terre d’Ombre Naturelle', hex: '#635147', red: 99, green: 81, blue: 71, category: 'Neutre' },
  { name: 'Vert Véronèse', hex: '#568203', red: 86, green: 130, blue: 3, category: 'Vert' },
  { name: 'Orange d’Alizarine', hex: '#E68A62', red: 230, green: 138, blue: 98, category: 'Orange' },
]

export function generateSimulatedColor() {
  const randomIndex = Math.floor(Math.random() * ARTIST_PIGMENTS.length)
  return ARTIST_PIGMENTS[randomIndex]
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    // Avoid evaluating current time during SSR / prerender to prevent Next.js blocking route errors
    if (typeof window === 'undefined') {
      return formatDate(dateStr)
    }
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return "À l'instant"
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
    if (diffHours < 24) return `Il y a ${diffHours} h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    return formatDate(dateStr)
  } catch {
    return dateStr
  }
}

export function generateId(prefix = 'art'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}
