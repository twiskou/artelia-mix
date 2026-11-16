export type Color = {
  id: string
  userId: string
  name: string
  hex: string
  red: number
  green: number
  blue: number
  description?: string
  category?: string
  notes?: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export type RecipeIngredient = {
  id: string
  paintName: string
  quantity: number
  unit: string
  order?: number
}

export type Recipe = {
  id: string
  userId: string
  colorId: string
  colorHex: string
  colorName: string
  name: string
  instructions?: string
  notes?: string
  ingredients: RecipeIngredient[]
  createdAt: string
  updatedAt: string
}

export type Scan = {
  id: string
  userId: string
  colorId?: string
  hex: string
  red: number
  green: number
  blue: number
  isSimulated: boolean
  createdAt: string
}

export type Activity = {
  id: string
  userId: string
  type:
    | 'color_saved'
    | 'recipe_created'
    | 'scan_performed'
    | 'color_updated'
    | 'recipe_updated'
    | 'color_deleted'
    | 'recipe_deleted'
  description: string
  colorHex?: string
  createdAt: string
}

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
}
