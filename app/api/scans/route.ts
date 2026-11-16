import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestUser } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const scans = await prisma.scan.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ success: true, data: scans })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    const body = await req.json()
    const { hex, red, green, blue, isSimulated = true, colorId } = body

    if (!hex) {
      return NextResponse.json({ success: false, error: 'Code HEX requis.' }, { status: 400 })
    }

    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        colorId: colorId || null,
        hex: hex.toUpperCase(),
        red: Number(red) || 0,
        green: Number(green) || 0,
        blue: Number(blue) || 0,
        isSimulated: Boolean(isSimulated),
      },
    })

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'scan_performed',
        description: isSimulated ? 'Scan optique simulé effectué' : 'Lecture capteur physique BLE',
        colorHex: scan.hex,
      },
    })

    return NextResponse.json({ success: true, data: scan }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
