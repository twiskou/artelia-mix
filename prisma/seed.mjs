import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding SQLite database dev.db...')

  const user = await prisma.user.upsert({
    where: { email: 'marie@example.com' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Marie Dupont',
      email: 'marie@example.com',
      passwordHash: 'secret123_hash',
    },
  })

  console.log('User OK:', user.name)

  const colors = [
    { id: 'c1', name: 'Cadmium Red', hex: '#E34234', red: 227, green: 66, blue: 52, category: 'Rouge', description: 'Rouge primaire puissant et éclatant.', notes: 'Haut pouvoir couvrant.', isFavorite: true },
    { id: 'c2', name: 'Prussian Blue', hex: '#003153', red: 0, green: 49, blue: 83, category: 'Bleu', description: 'Bleu sombre aux nuances verdâtres.', notes: 'Idéal pour les ciels nocturnes.', isFavorite: true },
    { id: 'c3', name: 'Raw Sienna', hex: '#C68642', red: 198, green: 134, blue: 66, category: 'Neutre', description: 'Terre naturelle dorée, semi-transparente.', notes: 'Parfaite pour les glacis.', isFavorite: false },
    { id: 'c4', name: 'Viridian Green', hex: '#40826D', red: 64, green: 130, blue: 109, category: 'Vert', description: 'Vert émeraude profond et froid.', notes: 'Idéal pour paysages naturels.', isFavorite: false },
    { id: 'c5', name: 'Naples Yellow', hex: '#FADA5E', red: 250, green: 218, blue: 94, category: 'Jaune', description: 'Jaune doux tirant sur l’ivoire.', notes: 'Pour les rehauts de lumière.', isFavorite: true },
    { id: 'c6', name: 'Burnt Umber', hex: '#8A3324', red: 138, green: 51, blue: 36, category: 'Neutre', description: 'Brun chaud sépia, séchage rapide.', notes: 'Fondation indispensable.', isFavorite: false },
    { id: 'c7', name: 'Cobalt Blue', hex: '#0047AB', red: 0, green: 71, blue: 171, category: 'Bleu', description: 'Bleu pur et équilibré.', notes: 'Très stable à la lumière.', isFavorite: true },
    { id: 'c8', name: 'Rose Madder', hex: '#E32636', red: 227, green: 38, blue: 54, category: 'Rouge', description: 'Garance transparente aux sous-tons carmin.', notes: 'Pour les glacis étoffes.', isFavorite: false },
    { id: 'c9', name: 'Ivory Black', hex: '#231F20', red: 35, green: 31, blue: 32, category: 'Noir', description: 'Noir velouté, légèrement chaud.', notes: 'Pour des gris argentés.', isFavorite: false },
    { id: 'c10', name: 'Titanium White', hex: '#F5F5F0', red: 245, green: 245, blue: 240, category: 'Blanc', description: 'Blanc universel extra opaque.', notes: 'Indispensable en atelier.', isFavorite: false },
  ]

  for (const c of colors) {
    await prisma.color.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, userId: user.id },
    })
  }
  console.log(`Colors seeded: ${colors.length}`)

  const recipes = [
    {
      id: 'r1',
      colorId: 'c1',
      name: 'Rouge Tomate Profond',
      instructions: 'Mélanger Cadmium et Umber, puis éclaircir au blanc.',
      notes: 'Pour natures mortes chaudes.',
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
      notes: 'Consistance onctueuse.',
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
      notes: 'Garder l’éclat doré.',
      ingredients: [
        { paintName: 'Naples Yellow', quantity: 60, unit: '%', order: 0 },
        { paintName: 'Titanium White', quantity: 30, unit: '%', order: 1 },
        { paintName: 'Raw Sienna', quantity: 10, unit: '%', order: 2 },
      ],
    },
  ]

  for (const r of recipes) {
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
            create: r.ingredients,
          },
        },
      })
    }
  }
  console.log(`Recipes seeded: ${recipes.length}`)

  const activities = [
    { userId: user.id, type: 'color_saved', description: 'Couleur "Cadmium Red" sauvegardée dans la palette SQLite', colorHex: '#E34234' },
    { userId: user.id, type: 'recipe_created', description: 'Recette "Rouge Tomate Profond" formulée', colorHex: '#E34234' },
    { userId: user.id, type: 'scan_performed', description: 'Scan optique simulé sur toile d’étude', colorHex: '#40826D' },
    { userId: user.id, type: 'color_saved', description: 'Couleur "Prussian Blue" enregistrée', colorHex: '#003153' },
    { userId: user.id, type: 'recipe_created', description: 'Recette "Bleu Nuit Velours" ajoutée', colorHex: '#003153' },
  ]

  for (const a of activities) {
    await prisma.activity.create({ data: a })
  }
  console.log('Activities seeded.')

  const totalColors = await prisma.color.count()
  const totalRecipes = await prisma.recipe.count()
  console.log(`SUCCESS! dev.db populated with ${totalColors} colors and ${totalRecipes} recipes.`)
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

