// lib/recipe-solver.ts
// Algorithme de Formulation Chromatique Inverse pour ARTELIA MIX

export interface ArtistPigment {
  id: string
  name: string
  code: string // e.g. "PR108", "PV19", "PY35", "PB29", "PW6", "PBk9"
  hex: string
  rgb: { r: number; g: number; b: number }
  category: 'Rouge' | 'Jaune' | 'Bleu' | 'Blanc' | 'Noir' | 'Terre' | 'Vert' | 'Orange'
  tintStrength: number // force de coloration relative
  isWhite?: boolean
  isBlack?: boolean
  description: string
}

export interface CalculatedIngredient {
  pigment: ArtistPigment
  percentage: number // 0 to 100
  parts: number // e.g. 4 parts
  isDominant: boolean
}

export interface ReverseRecipeResult {
  targetHex: string
  simulatedHex: string
  deltaE: number
  accuracyPercentage: number
  matchQuality: 'Excellente' | 'Très Bonne' | 'Bonne' | 'Approximative'
  ingredients: CalculatedIngredient[]
  partsSummary: string
  mixingAdvice: string
  canAchieve: boolean
}

// Nuancier standard des pigments d'atelier d'artiste Beaux-Arts
export const STANDARD_ARTIST_PIGMENTS: ArtistPigment[] = [
  {
    id: 'pig-magenta',
    name: 'Magenta Primaire',
    code: 'PV19',
    hex: '#E0115F',
    rgb: { r: 224, g: 17, b: 95 },
    category: 'Rouge',
    tintStrength: 1.25,
    description: 'Pigment primaire pur pour les rouges froids, roses et pourpres éclatants.',
  },
  {
    id: 'pig-yellow-primary',
    name: 'Jaune Primaire',
    code: 'PY35',
    hex: '#FED700',
    rgb: { r: 254, g: 215, b: 0 },
    category: 'Jaune',
    tintStrength: 0.95,
    description: 'Jaune lumineux, base indispensable des verts vifs et des oranges chauds.',
  },
  {
    id: 'pig-cyan',
    name: 'Cyan Primaire / Phtalo',
    code: 'PB15',
    hex: '#007BA7',
    rgb: { r: 0, g: 123, b: 167 },
    category: 'Bleu',
    tintStrength: 1.5,
    description: 'Bleu primaire froid à haut pouvoir colorant, idéal pour les verts purs.',
  },
  {
    id: 'pig-cadmium-red',
    name: 'Rouge de Cadmium',
    code: 'PR108',
    hex: '#E34234',
    rgb: { r: 227, g: 66, b: 52 },
    category: 'Rouge',
    tintStrength: 1.15,
    description: 'Rouge vermillon chaud extra-couvrant et intense.',
  },
  {
    id: 'pig-ultramarine',
    name: 'Bleu Outremer',
    code: 'PB29',
    hex: '#002FA7',
    rgb: { r: 0, g: 47, b: 167 },
    category: 'Bleu',
    tintStrength: 1.1,
    description: 'Bleu profond chaud tirant sur le violet, parfait pour les ciels et ombres.',
  },
  {
    id: 'pig-white-titanium',
    name: 'Blanc de Titane',
    code: 'PW6',
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    category: 'Blanc',
    tintStrength: 1.0,
    isWhite: true,
    description: 'Blanc opaque universel pour éclaircir les teintes et monter les valeurs.',
  },
  {
    id: 'pig-black-ivory',
    name: 'Noir d’Ivoire',
    code: 'PBk9',
    hex: '#1C1B1A',
    rgb: { r: 28, g: 27, b: 26 },
    category: 'Noir',
    tintStrength: 1.35,
    isBlack: true,
    description: 'Noir chaud et soyeux pour assombrir et rabattre les tons.',
  },
  {
    id: 'pig-burnt-sienna',
    name: 'Terre de Sienne Brûlée',
    code: 'PBr7',
    hex: '#8A3324',
    rgb: { r: 138, g: 51, b: 36 },
    category: 'Terre',
    tintStrength: 1.05,
    description: 'Terre rouge-brun chaude, pilier des carnations et sous-couches.',
  },
  {
    id: 'pig-yellow-ochre',
    name: 'Ocre Jaune',
    code: 'PY43',
    hex: '#CC7722',
    rgb: { r: 204, g: 119, b: 34 },
    category: 'Jaune',
    tintStrength: 0.9,
    description: 'Terre naturelle dorée chaude, essentielle pour paysages et draperies.',
  },
  {
    id: 'pig-viridian',
    name: 'Vert Émeraude (Viridian)',
    code: 'PG18',
    hex: '#009B77',
    rgb: { r: 0, g: 155, b: 119 },
    category: 'Vert',
    tintStrength: 1.2,
    description: 'Vert froid profond et transparent, sublime pour glacis et feuillages.',
  },
]

// Utilitaires Colorimétriques
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '').trim()
  if (c.length === 3) {
    return {
      r: parseInt(c[0] + c[0], 16) || 0,
      g: parseInt(c[1] + c[1], 16) || 0,
      b: parseInt(c[2] + c[2], 16) || 0,
    }
  }
  return {
    r: parseInt(c.substring(0, 2), 16) || 0,
    g: parseInt(c.substring(2, 4), 16) || 0,
    b: parseInt(c.substring(4, 6), 16) || 0,
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  let [R, G, B] = [r, g, b].map((v) => {
    const s = v / 255
    return s > 0.04045 ? Math.pow((s + 0.055) / 1.055, 2.4) : s / 12.92
  })
  return [
    R * 0.4124 + G * 0.3576 + B * 0.1805,
    R * 0.2126 + G * 0.7152 + B * 0.0722,
    R * 0.0193 + G * 0.1192 + B * 0.9505,
  ]
}

function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const [X, Y, Z] = [x / 0.95047, y / 1.0, z / 1.08883].map((v) =>
    v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116
  )
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)]
}

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const [x, y, z] = rgbToXyz(r, g, b)
  return xyzToLab(x, y, z)
}

export function calculateDeltaE(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
      Math.pow(lab1[1] - lab2[1], 2) +
      Math.pow(lab1[2] - lab2[2], 2)
  )
}

/**
 * Modèle optique physique de mélange soustractif de pigments
 * Simule l'absorption spectrophotométrique et le pouvoir diluant du blanc
 */
export function blendPigmentsSubtractive(
  pigments: ArtistPigment[],
  weights: number[]
): { r: number; g: number; b: number } {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum === 0) return { r: 255, g: 255, b: 255 }

  let cTotal = 0
  let mTotal = 0
  let yTotal = 0
  let kTotal = 0
  let whiteFactor = 0

  for (let i = 0; i < pigments.length; i++) {
    const p = pigments[i]
    const rawW = weights[i] / sum
    if (rawW <= 0) continue

    if (p.isWhite) {
      whiteFactor += rawW
      continue
    }

    const rNorm = p.rgb.r / 255
    const gNorm = p.rgb.g / 255
    const bNorm = p.rgb.b / 255

    const c = 1 - rNorm
    const m = 1 - gNorm
    const y = 1 - bNorm
    const k = Math.min(c, Math.min(m, y))

    const strength = p.tintStrength || 1.0
    cTotal += (c - k) * rawW * strength
    mTotal += (m - k) * rawW * strength
    yTotal += (y - k) * rawW * strength
    kTotal += (p.isBlack ? 1.0 : k) * rawW * strength
  }

  let r = 255 * (1 - Math.min(1, cTotal)) * (1 - Math.min(1, kTotal))
  let g = 255 * (1 - Math.min(1, mTotal)) * (1 - Math.min(1, kTotal))
  let b = 255 * (1 - Math.min(1, yTotal)) * (1 - Math.min(1, kTotal))

  if (whiteFactor > 0) {
    r = r * (1 - whiteFactor) + 255 * whiteFactor
    g = g * (1 - whiteFactor) + 255 * whiteFactor
    b = b * (1 - whiteFactor) + 255 * whiteFactor
  }

  return {
    r: Math.max(0, Math.min(255, Math.round(r))),
    g: Math.max(0, Math.min(255, Math.round(g))),
    b: Math.max(0, Math.min(255, Math.round(b))),
  }
}

/**
 * Calculateur Inverse : Calcule automatiquement les meilleures proportions (%)
 * pour atteindre la couleur cible avec UNIQUEMENT les pigments cochés par l'artiste.
 */
export function solveReverseRecipe(
  targetHex: string,
  availablePigments: ArtistPigment[]
): ReverseRecipeResult {
  const targetRgb = hexToRgb(targetHex)
  const targetLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b)

  if (!availablePigments || availablePigments.length === 0) {
    return {
      targetHex,
      simulatedHex: '#FFFFFF',
      deltaE: 100,
      accuracyPercentage: 0,
      matchQuality: 'Approximative',
      ingredients: [],
      partsSummary: 'Aucun pigment sélectionné',
      mixingAdvice: 'Veuillez cocher au moins un pigment disponible sur votre table.',
      canAchieve: false,
    }
  }

  // 1 Pigment unique disponible
  if (availablePigments.length === 1) {
    const p = availablePigments[0]
    const pLab = rgbToLab(p.rgb.r, p.rgb.g, p.rgb.b)
    const dE = calculateDeltaE(targetLab, pLab)
    const acc = Math.max(0, Math.min(100, Math.round((1 - dE / 80) * 100)))

    return {
      targetHex,
      simulatedHex: p.hex,
      deltaE: Math.round(dE * 10) / 10,
      accuracyPercentage: acc,
      matchQuality: acc > 85 ? 'Très Bonne' : acc > 70 ? 'Bonne' : 'Approximative',
      ingredients: [
        {
          pigment: p,
          percentage: 100,
          parts: 1,
          isDominant: true,
        },
      ],
      partsSummary: `100% ${p.name}`,
      mixingAdvice: `Utiliser directement le tube de ${p.name} pur.`,
      canAchieve: acc >= 50,
    }
  }

  // Multi-pigments : Recherche d'optimisation sur le simplexe
  const n = availablePigments.length
  let bestWeights = new Array(n).fill(1 / n)
  let bestDeltaE = Infinity
  let bestRgb = targetRgb

  // Exploration systématique par maillage
  // Pas fin pour 2 et 3 pigments, pas adapté pour plus
  const step = n <= 3 ? 0.05 : n <= 5 ? 0.1 : 0.15

  function evaluate(w: number[]) {
    const mixed = blendPigmentsSubtractive(availablePigments, w)
    const mixedLab = rgbToLab(mixed.r, mixed.g, mixed.b)
    const dE = calculateDeltaE(targetLab, mixedLab)
    if (dE < bestDeltaE) {
      bestDeltaE = dE
      bestWeights = [...w]
      bestRgb = mixed
    }
  }

  // Génération des combinaisons de poids
  function search(index: number, remaining: number, current: number[]) {
    if (index === n - 1) {
      current[index] = remaining
      evaluate(current)
      return
    }

    for (let val = 0; val <= remaining + 0.001; val += step) {
      current[index] = val
      search(index + 1, Math.max(0, remaining - val), current)
    }
  }

  search(0, 1.0, new Array(n).fill(0))

  // Raffinement par descente locale
  for (let iter = 0; iter < 12; iter++) {
    const currentWeights = [...bestWeights]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const delta = 0.02
        if (currentWeights[i] >= delta) {
          const testW = [...currentWeights]
          testW[i] -= delta
          testW[j] += delta
          evaluate(testW)
        }
      }
    }
  }

  // Normalisation en pourcentages entiers (Somme = 100%)
  const rawPercentages = bestWeights.map((w) => w * 100)
  let rounded = rawPercentages.map((p) => Math.round(p))

  // Supprimer les traces négligeables (< 2%) et réajuster
  rounded = rounded.map((p) => (p <= 2 ? 0 : p))
  const roundedSum = rounded.reduce((a, b) => a + b, 0)

  if (roundedSum === 0) {
    rounded[0] = 100
  } else {
    // Équilibrer pour obtenir exactement 100%
    const diff = 100 - roundedSum
    const maxIdx = rounded.indexOf(Math.max(...rounded))
    rounded[maxIdx] += diff
  }

  // Calcul du résultat simulé final avec les pourcentages arrondis
  const finalWeights = rounded.map((p) => p / 100)
  const finalRgb = blendPigmentsSubtractive(availablePigments, finalWeights)
  const finalLab = rgbToLab(finalRgb.r, finalRgb.g, finalRgb.b)
  const finalDeltaE = Math.round(calculateDeltaE(targetLab, finalLab) * 10) / 10

  // Précision en pourcentage (Delta E < 2 est quasi imperceptible à l'œil nu)
  // Delta E = 0 -> 100%, Delta E = 5 -> ~92%, Delta E = 15 -> ~70%
  const accuracy = Math.max(
    0,
    Math.min(100, Math.round((1 - Math.min(finalDeltaE, 40) / 40) * 100))
  )

  const quality: 'Excellente' | 'Très Bonne' | 'Bonne' | 'Approximative' =
    finalDeltaE <= 3.5
      ? 'Excellente'
      : finalDeltaE <= 8
      ? 'Très Bonne'
      : finalDeltaE <= 16
      ? 'Bonne'
      : 'Approximative'

  // Calcul des parts proportionnelles simplifiées (ex: 4 parts et 1 part)
  const nonZero = rounded.filter((p) => p > 0)
  const minNonZero = nonZero.length > 0 ? Math.min(...nonZero) : 100
  const parts = rounded.map((p) => (p > 0 ? Math.max(1, Math.round(p / minNonZero)) : 0))

  const maxVal = Math.max(...rounded)
  const ingredients: CalculatedIngredient[] = availablePigments.map((pig, idx) => ({
    pigment: pig,
    percentage: rounded[idx],
    parts: parts[idx],
    isDominant: rounded[idx] === maxVal && rounded[idx] > 0,
  }))

  // Formuler le résumé des parts
  const activeIngredients = ingredients
    .filter((ing) => ing.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)

  const partsSummary = activeIngredients
    .map((ing) => `${ing.parts} part${ing.parts > 1 ? 's' : ''} de ${ing.pigment.name}`)
    .join(' + ')

  // Conseil d'atelier personnalisé
  let mixingAdvice = ''
  if (activeIngredients.length === 1) {
    mixingAdvice = `Utiliser directement le tube de ${activeIngredients[0].pigment.name} pur.`
  } else if (activeIngredients.length >= 2) {
    const base = activeIngredients.find((i) => i.pigment.category === 'Jaune' || i.pigment.isWhite) || activeIngredients[0]
    const tint = activeIngredients.find((i) => i !== base) || activeIngredients[1]

    mixingAdvice = `Déposer sur votre palette la base de ${base.pigment.name} (${base.percentage}%), puis incorporer délicatement le ${tint.pigment.name} (${tint.percentage}%) au couteau à peindre par petites touches jusqu’à fusion complète.`
  }

  return {
    targetHex,
    simulatedHex: rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b),
    deltaE: finalDeltaE,
    accuracyPercentage: accuracy,
    matchQuality: quality,
    ingredients,
    partsSummary: partsSummary || 'Mélange non réalisable avec ces tubes',
    mixingAdvice,
    canAchieve: accuracy >= 60,
  }
}
