'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Palette, LogIn, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        toast.success('Connexion réussie', {
          description: 'Bienvenue dans votre atelier Artelia Mix.',
        })
        router.push('/dashboard')
      } else {
        setError(result.error || 'Identifiants invalides.')
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#252525] flex flex-col font-sans">
      <Navbar hideNavLinks activePage="login" />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-16">
        <Card className="w-full max-w-md border border-[#E5E3DC] shadow-md bg-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-[#20242B]">Accès Artiste</CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              Retrouvez vos nuanciers et vos recettes de peinture
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Adresse email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@atelier.fr"
                    className="pl-9 h-10 border-zinc-200 focus-visible:ring-[#D99A55]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">Mot de passe</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-10 border-zinc-200 focus-visible:ring-[#D99A55]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#20242B] hover:bg-[#20242B]/90 text-white font-medium rounded-lg mt-2 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4 mr-2 text-[#D99A55]" />
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-zinc-100 pt-4 text-xs text-zinc-500">
            <span>Pas encore de compte ?</span>
            <Link href="/register" className="ml-1.5 font-semibold text-[#D99A55] hover:underline flex items-center gap-1">
              Créer un atelier
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardFooter>
        </Card>
      </main>

    <Footer />
  </div>
)
}

