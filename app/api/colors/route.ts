import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const onlyFavorites = searchParams.get('favorites') === 'true'
    const query = searchParams.get('q')

    const where: any = {
      userId: user.id,
    }
    if (category && category !== 'Toutes') {
      where.category = category
    }
    if (onlyFavorites) {
      where.isFavorite = true
    }
    if (query) {
      where.AND = [
        {
          OR: [
            { name: { contains: query } },
            { hex: { contains: query } },
            { description: { contains: query } },
          ],
        },
      ]
    }

    const colors = await prisma.color.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: colors })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const body = await req.json()
    const { name, hex, red, green, blue, category, description, notes } = body

    if (!name || !hex) {
      return NextResponse.json(
        { success: false, error: 'Nom et code HEX requis.' },
        { status: 400 }
      )
    }

    const color = await prisma.color.create({
      data: {
        userId: user.id,
        name,
        hex: hex.toUpperCase(),
        red: Number(red) || 0,
        green: Number(green) || 0,
        blue: Number(blue) || 0,
        category: category || 'Autre',
        description: description || null,
        notes: notes || null,
      },
    })

    // Log Activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        colorId: color.id,
        type: 'color_saved',
        description: `Couleur "${color.name}" enregistrée dans la palette`,
        colorHex: color.hex,
      },
    })

    return NextResponse.json({ success: true, data: color }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
