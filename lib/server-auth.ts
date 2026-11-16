import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Extrait l'utilisateur courant depuis les en-têtes ou paramètres de la requête.
 * Si l'utilisateur n'existe pas encore dans la base SQLite, il est créé à la volée.
 */
export async function getRequestUser(req: NextRequest) {
  const headerEmail = req.headers.get('x-user-email')
  const headerId = req.headers.get('x-user-id')
  const headerNameRaw = req.headers.get('x-user-name')
  let headerName = ''
  if (headerNameRaw) {
    try {
      headerName = decodeURIComponent(headerNameRaw)
    } catch {
      headerName = headerNameRaw
    }
  }

  const paramEmail = req.nextUrl.searchParams.get('userEmail')
  const paramId = req.nextUrl.searchParams.get('userId')

  const email = (headerEmail || paramEmail || '').toLowerCase().trim()
  const id = headerId || paramId

  // Si aucun email fourni, repli sur l'utilisateur démo Anis
  if (!email) {
    return await prisma.user.upsert({
      where: { email: 'anis@gmail.com' },
      update: {},
      create: {
        id: 'demo-user',
        name: 'Anis',
        email: 'anis@gmail.com',
        passwordHash: 'secret123_hash',
      },
    })
  }

  // Chercher ou créer l'utilisateur spécifique
  const user = await prisma.user.upsert({
    where: { email },
    update: headerName ? { name: headerName } : {},
    create: {
      id: id || undefined,
      email,
      name: headerName || email.split('@')[0],
      passwordHash: 'local_hash',
    },
  })

  return user
}
