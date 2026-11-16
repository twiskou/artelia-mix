import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/server-auth'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        color: true,
        ingredients: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!recipe) {
      return NextResponse.json({ success: false, error: 'Recette introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: recipe })
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
    const recipe = await prisma.recipe.findUnique({ where: { id } })

    if (recipe && recipe.userId === user.id) {
      await prisma.recipe.delete({ where: { id } })

      // Log activity
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: 'recipe_deleted',
          description: `Recette "${recipe.name}" supprimée`,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Recette supprimée avec succès' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
