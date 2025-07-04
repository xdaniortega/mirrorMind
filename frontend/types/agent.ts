export interface Agent {
  id: string
  name: string
  type: "clone" | "generic"
  category: string
  description: string
  avatar: string
  price: number
  rating: number
  totalChats: number
  specialties: string[]
  verified: boolean
  featured: boolean
  lastUpdated: string
  createdBy?: string
}

export interface FilterState {
  search: string
  category: string
  priceRange: [number, number]
  minRating: number
  specialties: string[]
  sortBy: string
  sortOrder: "asc" | "desc"
}
