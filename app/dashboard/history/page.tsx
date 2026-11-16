'use client'

import React, { useState, useEffect } from 'react'
import {
  Clock,
  Scan,
  Palette,
  BookOpen,
  Pencil,
  Trash2,
  Droplets,
  Calendar,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEMO_ACTIVITIES } from '@/lib/data'
import { Activity } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { RelativeTime } from '@/components/dashboard/RelativeTime'
import { api } from '@/lib/api-client'

export default function HistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  async function loadHistory() {
    setLoading(true)
    try {
      const dbActivities = await api.getHistory()
      setActivities(dbActivities || [])
    } catch {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'all') return true
    if (filterType === 'colors') return act.type === 'color_saved' || act.type === 'color_updated' || act.type === 'color_deleted'
    if (filterType === 'recipes') return act.type === 'recipe_created' || act.type === 'recipe_updated'
    if (filterType === 'scans') return act.type === 'scan_performed'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DC]">
        <div>
          <h2 className="text-2xl font-bold text-[#20242B] flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-[#D99A55]" />
            Historique & Journal des Activités
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Traçabilité chronologique de tous vos scans, couleurs enregistrées et recettes formulées dans votre atelier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistory}
            disabled={loading}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            title="Rafraîchir l'historique"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5E3DC] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-[#20242B] text-white font-semibold' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Toutes ({activities.length})
            </button>
            <button
              onClick={() => setFilterType('colors')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'colors' ? 'bg-[#20242B] text-white font-semibold' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Couleurs
            </button>
            <button
              onClick={() => setFilterType('recipes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'recipes' ? 'bg-[#20242B] text-white font-semibold' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Recettes
            </button>
            <button
              onClick={() => setFilterType('scans')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'scans' ? 'bg-[#20242B] text-white font-semibold' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Scans
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Card Feed */}
      {filteredActivities.length === 0 ? (
        <Card className="border border-[#E5E3DC] bg-white shadow-xs p-12 text-center">
          <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#20242B]">Aucune activité enregistrée</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
            Vos créations, scans optiques et formulations de recettes apparaîtront automatiquement dans ce journal.
          </p>
        </Card>
      ) : (
        <Card className="border border-[#E5E3DC] bg-white shadow-xs p-6">
          <div className="relative border-l-2 border-zinc-200 ml-4 md:ml-6 space-y-6 pb-2">
            {filteredActivities.map((act) => {
              let IconComponent = Palette
              let iconBg = 'bg-[#20242B] text-[#D99A55]'
              let badgeText = 'Couleur'

              if (act.type === 'scan_performed') {
                IconComponent = Scan
                iconBg = 'bg-purple-600 text-white'
                badgeText = 'Scan'
              } else if (act.type === 'recipe_created' || act.type === 'recipe_updated') {
                IconComponent = BookOpen
                iconBg = 'bg-blue-600 text-white'
                badgeText = 'Recette'
              } else if (act.type === 'color_deleted') {
                IconComponent = Trash2
                iconBg = 'bg-red-500 text-white'
                badgeText = 'Suppression'
              }

              return (
                <div key={act.id} className="relative pl-6 md:pl-8 group">
                  {/* Node on the timeline */}
                  <div
                    className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-xs border-2 border-white ${iconBg}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-100 bg-[#F7F6F2]/40 hover:bg-white hover:border-[#D99A55]/30 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {act.colorHex && (
                        <div
                          className="w-10 h-10 rounded-xl shrink-0 shadow-xs border border-black/10 mt-0.5"
                          style={{ backgroundColor: act.colorHex }}
                          title={act.colorHex}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-semibold py-0 px-2">
                            {badgeText}
                          </Badge>
                          {act.colorHex && (
                            <span className="font-mono text-xs font-bold text-zinc-700">
                              {act.colorHex}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-zinc-800 mt-1 leading-snug">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <RelativeTime date={act.createdAt} className="text-xs font-semibold text-zinc-700 block" />
                      <span className="text-[10px] text-zinc-400">
                        {formatDate(act.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
