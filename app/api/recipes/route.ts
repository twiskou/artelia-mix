import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const { searchParams } = new URL(req.url)
    const colorId = searchParams.get('colorId')
    const query = searchParams.get('q')

    const where: any = {
      userId: user.id,
    }
    if (colorId) {
      where.colorId = colorId
    }
    if (query) {
      where.AND = [
        {
          OR: [
            { name: { contains: query } },
            { instructions: { contains: query } },
            { ingredients: { some: { paintName: { contains: query } } } },
          ],
        },
      ]
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        color: true,
        ingredients: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: recipes })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const body = await req.json()
    const { colorId, name, instructions, notes, ingredients } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nom de recette requis.' },
        { status: 400 }
      )
    }

    // Verify color exists for this user or create one
    let targetColor = colorId ? await prisma.color.findFirst({ where: { id: colorId, userId: user.id } }) : null
    if (!targetColor) {
      targetColor = await prisma.color.findFirst({ where: { userId: user.id } })
      if (!targetColor) {
        targetColor = await prisma.color.create({
          data: {
            userId: user.id,
            name: 'Nuance de Référence',
            hex: '#D99A55',
            red: 217,
            green: 154,
            blue: 85,
            category: 'Neutre',
          },
        })
      }
    }

    const recipe = await prisma.recipe.create({
      data: {
        userId: user.id,
        colorId: targetColor.id,
        name,
        instructions: instructions || null,
        notes: notes || null,
        ingredients: {
          create: (ingredients || []).map((ing: any, idx: number) => ({
            paintName: ing.paintName || 'Pigment',
            quantity: Number(ing.quantity) || 0,
            unit: ing.unit || '%',
            order: ing.order ?? idx,
          })),
        },
      },
      include: {
        color: true,
        ingredients: true,
      },
    })

    // Log Activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        colorId: targetColor.id,
        type: 'recipe_created',
        description: `Recette "${recipe.name}" formulée`,
        colorHex: targetColor.hex,
      },
    })

    return NextResponse.json({ success: true, data: recipe }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
