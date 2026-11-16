import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Artelia Mix database...')

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { email: 'anis@gmail.com' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Anis',
      email: 'anis@gmail.com',
      passwordHash: 'secret123_hash',
    },
  })

  console.log(`User created or verified: ${user.name} (${user.email})`)

  // 2. Initial Colors
  const initialColors = [
    {
      id: 'c1',
      name: 'Cadmium Red',
      hex: '#E34234',
      red: 227,
      green: 66,
      blue: 52,
      category: 'Rouge',
      description: 'Rouge primaire puissant et éclatant de force chromatique.',
      notes: 'Excellent pouvoir couvrant, à manier avec parcimonie avec les blancs.',
      isFavorite: true,
    },
    {
      id: 'c2',
      name: 'Prussian Blue',
      hex: '#003153',
      red: 0,
      green: 49,
      blue: 83,
      category: 'Bleu',
      description: 'Bleu sombre et intense aux nuances légèrement verdâtres.',
      notes: 'Idéal pour les ombres portées et les ciels nocturnes.',
      isFavorite: true,
    },
    {
      id: 'c3',
      name: 'Raw Sienna',
      hex: '#C68642',
      red: 198,
      green: 134,
      blue: 66,
      category: 'Neutre',
      description: 'Terre naturelle dorée, semi-transparente.',
      notes: 'Parfaite pour les glacis et les carnations en sous-couche.',
      isFavorite: false,
    },
    {
      id: 'c4',
      name: 'Viridian Green',
      hex: '#40826D',
      red: 64,
      green: 130,
      blue: 109,
      category: 'Vert',
      description: 'Vert émeraude profond, transparent et froid.',
      notes: 'Sublime dans les paysages lorsqu’il est rompu avec une terre de Sienne.',
      isFavorite: false,
    },
    {
      id: 'c5',
      name: 'Naples Yellow',
      hex: '#FADA5E',
      red: 250,
      green: 218,
      blue: 94,
      category: 'Jaune',
      description: 'Jaune doux, légèrement opaque, tirant sur l’ivoire.',
      notes: 'Idéal pour capter les rehauts de lumière sans blanchir.',
      isFavorite: true,
    },
    {
      id: 'c6',
      name: 'Burnt Umber',
      hex: '#8A3324',
      red: 138,
      green: 51,
      blue: 36,
      category: 'Neutre',
      description: 'Brun chaud sépia, séchage rapide.',
      notes: 'Fondation indispensable de toute palette académique.',
      isFavorite: false,
    },
    {
      id: 'c7',
      name: 'Cobalt Blue',
      hex: '#0047AB',
      red: 0,
      green: 71,
      blue: 171,
      category: 'Bleu',
      description: 'Bleu pur et équilibré, pigment minéral de référence.',
      notes: 'Très stable à la lumière, teinte semi-opaque.',
      isFavorite: true,
    },
    {
      id: 'c8',
      name: 'Rose Madder',
      hex: '#E32636',
      red: 227,
      green: 38,
      blue: 54,
      category: 'Rouge',
      description: 'Garance transparente aux sous-tons carmin.',
      notes: 'Pour des glacis profonds sur les étoffes et les fleurs.',
      isFavorite: false,
    },
    {
      id: 'c9',
      name: 'Ivory Black',
      hex: '#231F20',
      red: 35,
      green: 31,
      blue: 32,
      category: 'Noir',
      description: 'Noir velouté, légèrement chaud en couche mince.',
      notes: 'Créé des gris argentés très élégants en mélange avec du blanc.',
      isFavorite: false,
    },
    {
      id: 'c10',
      name: 'Titanium White',
      hex: '#F5F5F0',
      red: 245,
      green: 245,
      blue: 240,
      category: 'Blanc',
      description: 'Blanc opaque au pouvoir éclaircissant maximal.',
      notes: 'Le blanc universel indispensable en atelier moderne.',
      isFavorite: false,
    },
  ]

  for (const c of initialColors) {
    await prisma.color.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        userId: user.id,
        name: c.name,
        hex: c.hex,
        red: c.red,
        green: c.green,
        blue: c.blue,
        category: c.category,
        description: c.description,
        notes: c.notes,
        isFavorite: c.isFavorite,
      },
    })
  }

  console.log(`Seeded ${initialColors.length} colors.`)

  // 3. Initial Recipes with Ingredients
  const initialRecipes = [
    {
      id: 'r1',
      colorId: 'c1',
      name: 'Rouge Tomate Profond',
      instructions: 'Mélanger d’abord le Cadmium et l’Ocre, puis éclaircir au blanc.',
      notes: 'Formule idéale pour des natures mortes chaudes.',
      ingredients: [
        { paintName: 'Cadmium Red', quantity: 70, unit: '%', order: 0 },
        { paintName: 'Burnt Umber', quantity: 20, unit: '%', order: 1 },
        { paintName: 'Titanium White', quantity: 10, unit: '%', order: 2 },
      ],
    },
    {
      id: 'r2',
      colorId: 'c2',
      name: 'Bleu Nuit Velours',
      instructions: 'Diluer légèrement au médium pour obtenir une belle transparence.',
      notes: 'Garder une consistance onctueuse.',
      ingredients: [
        { paintName: 'Prussian Blue', quantity: 80, unit: '%', order: 0 },
        { paintName: 'Ivory Black', quantity: 20, unit: '%', order: 1 },
      ],
    },
    {
      id: 'r3',
      colorId: 'c5',
      name: 'Jaune Lumineux Solaire',
      instructions: 'Appliquer en touches fines sur les rehauts de lumière.',
      notes: 'Ne pas surcharger le blanc pour conserver l’éclat doré.',
      ingredients: [
        { paintName: 'Naples Yellow', quantity: 60, unit: '%', order: 0 },
        { paintName: 'Titanium White', quantity: 30, unit: '%', order: 1 },
        { paintName: 'Raw Sienna', quantity: 10, unit: '%', order: 2 },
      ],
    },
    {
      id: 'r4',
      colorId: 'c4',
      name: 'Vert Forêt Profond',
      instructions: 'Mélanger à sec avant incorporation du liant d’huile.',
      notes: 'Teinte dense convenant aux fonds d’arbres.',
      ingredients: [
        { paintName: 'Viridian Green', quantity: 50, unit: '%', order: 0 },
        { paintName: 'Prussian Blue', quantity: 30, unit: '%', order: 1 },
        { paintName: 'Ivory Black', quantity: 20, unit: '%', order: 2 },
      ],
    },
    {
      id: 'r5',
      colorId: 'c3',
      name: 'Terre Chaude d’Ombrage',
      instructions: 'Idéal pour les premières couches et modelés de visages.',
      notes: 'Séchage modéré, glacis parfait.',
      ingredients: [
        { paintName: 'Raw Sienna', quantity: 55, unit: '%', order: 0 },
        { paintName: 'Burnt Umber', quantity: 35, unit: '%', order: 1 },
        { paintName: 'Naples Yellow', quantity: 10, unit: '%', order: 2 },
      ],
    },
  ]

  for (const r of initialRecipes) {
    const existing = await prisma.recipe.findUnique({ where: { id: r.id } })
    if (!existing) {
      await prisma.recipe.create({
        data: {
          id: r.id,
          userId: user.id,
          colorId: r.colorId,
          name: r.name,
          instructions: r.instructions,
          notes: r.notes,
          ingredients: {
            create: r.ingredients.map((ing) => ({
              paintName: ing.paintName,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ing.order,
            })),
          },
        },
      })
    }
  }

  console.log(`Seeded ${initialRecipes.length} recipes with ingredients.`)

  // 4. Initial Activities
  const initialActivities = [
    { type: 'color_saved', description: 'Couleur "Cadmium Red" sauvegardée dans la palette', colorHex: '#E34234' },
    { type: 'recipe_created', description: 'Recette "Rouge Tomate Profond" formulée', colorHex: '#E34234' },
    { type: 'scan_performed', description: 'Scan optique simulé sur toile d’étude', colorHex: '#40826D' },
    { type: 'color_saved', description: 'Couleur "Prussian Blue" enregistrée', colorHex: '#003153' },
    { type: 'recipe_created', description: 'Recette "Bleu Nuit Velours" ajoutée', colorHex: '#003153' },
    { type: 'scan_performed', description: 'Scan optique simulé exécuté', colorHex: '#FADA5E' },
  ]

  for (const a of initialActivities) {
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: a.type,
        description: a.description,
        colorHex: a.colorHex,
      },
    })
  }

  console.log('Seeded initial activities.')
  console.log('Artelia Mix database successfully seeded!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

