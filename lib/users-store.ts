/**
 * users-store.ts
 * Registre local des utilisateurs Artelia Mix.
 * Stocké dans localStorage sous la clé "artelia_users".
 * Chaque entrée : { id, name, email, password, createdAt }
 *
 * NOTE: Mot de passe stocké en clair — usage demo uniquement.
 * En production, utiliser bcrypt + base de données serveur.
 */

export interface StoredUser {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

const USERS_KEY = 'artelia_users'

/** Charge tous les utilisateurs enregistrés depuis localStorage */
function loadUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return getDefaultUsers()
    const parsed = JSON.parse(raw) as StoredUser[]
    // Toujours s'assurer que le compte démo est présent
    return ensureDemoUser(parsed)
  } catch {
    return getDefaultUsers()
  }
}

/** Utilisateur démo préchargé (anis@gmail.com) */
function getDefaultUsers(): StoredUser[] {
  const defaults: StoredUser[] = [
    {
      id: 'demo-user',
      name: 'Anis',
      email: 'anis@gmail.com',
      password: 'anis2024',
      createdAt: new Date().toISOString(),
    },
  ]
  saveUsers(defaults)
  return defaults
}

/** S'assure que le compte démo existe toujours */
function ensureDemoUser(users: StoredUser[]): StoredUser[] {
  const hasDemo = users.some((u) => u.email === 'anis@gmail.com')
  if (!hasDemo) {
    const updated = [
      {
        id: 'demo-user',
        name: 'Anis',
        email: 'anis@gmail.com',
        password: 'anis2024',
        createdAt: new Date().toISOString(),
      },
      ...users,
    ]
    saveUsers(updated)
    return updated
  }
  return users
}

/** Sauvegarde la liste dans localStorage */
function saveUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

/** Cherche un utilisateur par email (insensible à la casse) */
export function findUserByEmail(email: string): StoredUser | null {
  const users = loadUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

/** Vérifie email + password → retourne l'utilisateur ou null */
export function validateCredentials(email: string, password: string): StoredUser | null {
  const user = findUserByEmail(email)
  if (!user) return null
  if (user.password !== password) return null
  return user
}

/** Enregistre un nouvel utilisateur. Retourne une erreur si l'email existe déjà. */
export function createUser(
  name: string,
  email: string,
  password: string
): { user: StoredUser } | { error: string } {
  const existing = findUserByEmail(email)
  if (existing) {
    return { error: 'Un compte existe déjà avec cette adresse email.' }
  }

  const users = loadUsers()
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
    email: email.toLowerCase().trim(),
    password,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  saveUsers(users)
  return { user: newUser }
}
