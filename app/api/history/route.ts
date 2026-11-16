import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ success: true, data: activities })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
