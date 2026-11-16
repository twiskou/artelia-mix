'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Palette, UserPlus, User, Mail, Lock, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const result = await register(name, email, password)
      if (result.success) {
        toast.success('Atelier créé avec succès !', {
          description: `Bienvenue parmi nous, ${name}.`,
        })
        router.push('/dashboard')
      } else {
        setError(result.error || 'Erreur lors de la création du compte.')
      }
    } catch {
      setError('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#252525] flex flex-col font-sans">
      <Navbar hideNavLinks activePage="register" />

      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-14">
        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Card className="w-full border border-[#E5E3DC] shadow-md bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-[#20242B]">Créer votre Atelier</CardTitle>
                <CardDescription className="text-zinc-500 text-sm">
                  Commencez à archiver vos teintes et recettes dès aujourd'hui
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
                    <label className="text-xs font-semibold text-zinc-700">Nom d'artiste ou nom complet</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Claire Monet"
                        className="pl-9 h-10 border-zinc-200 focus-visible:ring-[#D99A55]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">Adresse email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="claire@atelier.fr"
                        className="pl-9 h-10 border-zinc-200 focus-visible:ring-[#D99A55]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">Mot de passe (6 car. minimum)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-10 h-10 border-zinc-200 focus-visible:ring-[#D99A55]"
                        required
                        minLength={6}
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-10 h-10 border-zinc-200 focus-visible:ring-[#D99A55]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer"
                        aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#D99A55] hover:bg-[#C4873D] text-white font-medium rounded-lg mt-2 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? 'Création du compte...' : 'Créer mon atelier'}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex justify-center border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                <span>Déjà inscrit ?</span>
                <Link href="/login" className="ml-1.5 font-semibold text-[#20242B] hover:text-[#D99A55] flex items-center gap-1">
                  Se connecter
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Visual Column with Real Photography */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between relative rounded-2xl overflow-hidden border border-[#E5E3DC] shadow-md bg-[#20242B] text-white p-8 min-h-[560px]">
            <img
              src="/images/register-colors.jpg"
              alt="Pigments et couleurs d'artistes"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#20242B]/95 via-[#20242B]/40 to-black/30" />

            <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#D99A55] text-xs font-semibold border border-white/10 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Communauté des Peintres</span>
            </div>

            <div className="relative z-10 space-y-3">
              <blockquote className="text-sm font-medium italic text-zinc-100 leading-relaxed">
                « Les couleurs sont les actions et les passions de la lumière. »
              </blockquote>
              <p className="text-xs text-[#D99A55] font-semibold">— Johann Wolfgang von Goethe</p>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-zinc-300">
                <span>Rejoignez +1 200 artistes</span>
                <span className="font-mono text-[#D99A55]">MVP 100% Fonctionnel</span>
              </div>
            </div>
          </div>
        </div>
      </main>

    <Footer />
  </div>
)
}

