import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/server-auth'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const color = await prisma.color.findUnique({
      where: { id },
      include: { recipes: true },
    })

    if (!color) {
      return NextResponse.json({ success: false, error: 'Couleur introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: color })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getRequestUser(req)
    const { id } = await ctx.params
    const body = await req.json()

    // Verify ownership
    const existing = await prisma.color.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 })
    }

    const updated = await prisma.color.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getRequestUser(req)
    const { id } = await ctx.params
    const color = await prisma.color.findUnique({ where: { id } })

    if (color && color.userId === user.id) {
      await prisma.color.delete({ where: { id } })

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: 'color_deleted',
          description: `Couleur "${color.name}" supprimée`,
          colorHex: color.hex,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Couleur supprimée avec succès' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
