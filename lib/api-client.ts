import { Color, Recipe, Activity, Scan } from '@/lib/types'

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('artelia_auth')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed.user) {
      return {
        'x-user-id': parsed.user.id || '',
        'x-user-email': parsed.user.email || '',
        'x-user-name': encodeURIComponent(parsed.user.name || ''),
      }
    }
  } catch {
    // ignore
  }
  return {}
}

export const api = {
  // Colors
  async getColors(params?: { category?: string; favorites?: boolean; q?: string }): Promise<Color[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.category) searchParams.set('category', params.category)
      if (params?.favorites) searchParams.set('favorites', 'true')
      if (params?.q) searchParams.set('q', params.q)

      const res = await fetch(`/api/colors?${searchParams.toString()}`, {
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (json.success) return json.data
      return []
    } catch {
      return []
    }
  },

  async createColor(colorData: Partial<Color>): Promise<{ success: boolean; data?: Color; error?: string }> {
    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(colorData),
      })
      return await res.json()
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
    try {
      const res = await fetch(`/api/colors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ isFavorite }),
      })
      const json = await res.json()
      return json.success
    } catch {
      return false
    }
  },

  async deleteColor(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/colors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      return json.success
    } catch {
      return false
    }
  },

  // Recipes
  async getRecipes(params?: { colorId?: string; q?: string }): Promise<Recipe[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.colorId) searchParams.set('colorId', params.colorId)
      if (params?.q) searchParams.set('q', params.q)

      const res = await fetch(`/api/recipes?${searchParams.toString()}`, {
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (json.success) {
        return json.data.map((r: any) => ({
          ...r,
          colorHex: r.color?.hex || r.colorHex || '#E68A62',
          colorName: r.color?.name || r.colorName || 'Nuance',
        }))
      }
      return []
    } catch {
      return []
    }
  },

  async createRecipe(recipeData: any): Promise<{ success: boolean; data?: Recipe; error?: string }> {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(recipeData),
      })
      return await res.json()
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  },

  async deleteRecipe(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      return json.success
    } catch {
      return false
    }
  },

  // Scans
  async getScans(): Promise<Scan[]> {
    try {
      const res = await fetch('/api/scans', {
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (json.success) return json.data
      return []
    } catch {
      return []
    }
  },

  async recordScan(scanData: any): Promise<{ success: boolean; data?: Scan; error?: string }> {
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(scanData),
      })
      return await res.json()
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  },

  // History
  async getHistory(): Promise<Activity[]> {
    try {
      const res = await fetch('/api/history', {
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (json.success) return json.data
      return []
    } catch {
      return []
    }
  },

  // Seed
  async seedDatabase(): Promise<any> {
    try {
      const res = await fetch('/api/seed', {
        headers: getAuthHeaders(),
      })
      return await res.json()
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  },
}
