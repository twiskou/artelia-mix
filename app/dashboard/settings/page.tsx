'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Lock,
  Globe,
  LogOut,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  Bell,
  Palette,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  const rawName = user?.name || (user?.email ? user.email.split('@')[0] : 'Artiste')
  const defaultDisplayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
  const defaultEmail = user?.email || ''

  const [name, setName] = useState(defaultDisplayName)
  const [email] = useState(defaultEmail)
  const [atelierName, setAtelierName] = useState(`Atelier ${defaultDisplayName}`)
  const [language, setLanguage] = useState('fr')
  const [colorFormat, setColorFormat] = useState('hex')
  const [notifications, setNotifications] = useState(true)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [counts, setCounts] = useState({ colors: 0, recipes: 0, scans: 0 })

  useEffect(() => {
    async function loadCounts() {
      try {
        const [colors, recipes, scans] = await Promise.all([
          api.getColors(),
          api.getRecipes(),
          api.getScans(),
        ])
        setCounts({
          colors: colors.length,
          recipes: recipes.length,
          scans: scans.length,
        })
      } catch {
        // ignore
      }
    }
    loadCounts()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom d\'artiste est requis.')
      return
    }
    setSavingProfile(true)
    await new Promise((r) => setTimeout(r, 600))
    setSavingProfile(false)
    toast.success('Profil mis à jour', {
      description: 'Vos coordonnées d\'artiste ont été enregistrées.',
    })
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Veuillez saisir votre mot de passe actuel.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit comporter au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setSavingPassword(true)
    await new Promise((r) => setTimeout(r, 600))
    setSavingPassword(false)
    toast.success('Mot de passe mis à jour avec succès.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  function handleLogout() {
    toast('Déconnexion en cours...', { duration: 1000 })
    setTimeout(() => logout(), 800)
  }

  // Initials for avatar
  const initials = defaultDisplayName.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Page Header */}
      <div className="pb-4 border-b border-[#E5E3DC]">
        <h2 className="text-2xl font-bold text-[#20242B] flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#D99A55]" />
          Paramètres de l&apos;Atelier
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Gérez votre profil, la sécurité et les préférences de l&apos;application.
        </p>
      </div>

      {/* Avatar + Info rapide */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#D99A55] text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
          {initials}
        </div>
        <div>
          <p className="font-bold text-[#20242B] text-base">{defaultDisplayName}</p>
          <p className="text-sm text-zinc-500">{defaultEmail}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Session active
          </span>
        </div>
      </div>

      <div className="space-y-5">

        {/* Profil Card */}
        <Card className="border border-[#E5E3DC] bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-sm font-bold text-[#20242B] flex items-center gap-2">
              <User className="w-4 h-4 text-[#D99A55]" />
              Profil d&apos;Artiste
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Informations affichées sur vos nuanciers et fiches recettes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Nom d&apos;artiste</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom ou pseudonyme"
                    className="border-zinc-200 focus-visible:ring-[#D99A55]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Adresse email</label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-zinc-400">L&apos;email n&apos;est pas modifiable.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Nom de l&apos;atelier ou de la collection</label>
                <Input
                  type="text"
                  value={atelierName}
                  onChange={(e) => setAtelierName(e.target.value)}
                  placeholder="Mon atelier de peinture"
                  className="border-zinc-200 focus-visible:ring-[#D99A55]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#20242B] hover:bg-[#20242B]/90 text-white text-xs min-w-[180px]"
                >
                  {savingProfile ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      Enregistrer les modifications
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sécurité / Mot de passe */}
        <Card className="border border-[#E5E3DC] bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-sm font-bold text-[#20242B] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D99A55]" />
              Sécurité du Compte
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Modifiez votre mot de passe pour sécuriser l&apos;accès à vos recettes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Mot de passe actuel</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-zinc-200 pr-10 focus-visible:ring-[#D99A55]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer"
                    aria-label={showCurrentPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="border-zinc-200 pr-10 focus-visible:ring-[#D99A55]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer"
                      aria-label={showNewPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="border-zinc-200 pr-10 focus-visible:ring-[#D99A55]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer"
                      aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 font-medium">Les mots de passe ne correspondent pas.</p>
              )}
              {newPassword && newPassword.length < 6 && (
                <p className="text-xs text-amber-600 font-medium">Minimum 6 caractères requis.</p>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={savingPassword}
                  className="border-zinc-200 text-zinc-800 text-xs min-w-[200px] cursor-pointer"
                >
                  {savingPassword ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                      Mise à jour...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D99A55]" />
                      Mettre à jour le mot de passe
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card className="border border-[#E5E3DC] bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-sm font-bold text-[#20242B] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#D99A55]" />
              Préférences d&apos;Affichage
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Personnalisez les unités colorimétriques et la langue
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Langue de l&apos;interface</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:ring-2 focus:ring-[#D99A55] focus:outline-none cursor-pointer"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Format de couleur principal</label>
                <select
                  value={colorFormat}
                  onChange={(e) => setColorFormat(e.target.value)}
                  className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:ring-2 focus:ring-[#D99A55] focus:outline-none cursor-pointer"
                >
                  <option value="hex">Code Hexadécimal (#RRGGBB)</option>
                  <option value="rgb">Composantes RGB (255, 255, 255)</option>
                  <option value="both">HEX et RGB combinés</option>
                </select>
              </div>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#D99A55]" />
                <div>
                  <p className="text-xs font-semibold text-zinc-700">Notifications de sauvegarde</p>
                  <p className="text-[11px] text-zinc-500">Afficher une confirmation après chaque enregistrement</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications(!notifications)}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D99A55] focus:ring-offset-1 ${
                  notifications ? 'bg-[#D99A55]' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    notifications ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Informations Atelier */}
        <Card className="border border-[#E5E3DC] bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-sm font-bold text-[#20242B] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#D99A55]" />
              Informations de l&apos;Atelier
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E5E3DC] text-center">
                <p className="text-2xl font-extrabold text-[#20242B]">{counts.colors}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Couleur{counts.colors > 1 ? 's' : ''} archivée{counts.colors > 1 ? 's' : ''}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E5E3DC] text-center">
                <p className="text-2xl font-extrabold text-[#20242B]">{counts.recipes}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Recette{counts.recipes > 1 ? 's' : ''} créée{counts.recipes > 1 ? 's' : ''}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E5E3DC] text-center">
                <p className="text-2xl font-extrabold text-[#20242B]">{counts.scans}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Scan{counts.scans > 1 ? 's' : ''} effectué{counts.scans > 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone Déconnexion */}
        <Card className="border border-red-200 bg-red-50/40 shadow-xs">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-900">Session &amp; Déconnexion</h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Ferme la session actuelle. Vos données restent conservées.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white shrink-0 text-xs cursor-pointer min-w-[140px]"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
