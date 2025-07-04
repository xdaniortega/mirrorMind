"use client"

import { useState } from "react"
import type { FilterState } from "@/types/agent"

interface MarketplaceFiltersProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  totalResults: number
}

const categories = [
  { id: "all", name: "All Categories" },
  { id: "content-creation", name: "Content Creation" },
  { id: "education", name: "Education" },
  { id: "social-media", name: "Social Media" },
  { id: "video-production", name: "Video Production" },
  { id: "podcasting", name: "Podcasting" },
  { id: "branding", name: "Branding" },
  { id: "email-marketing", name: "Email Marketing" },
  { id: "influencer-marketing", name: "Influencer Marketing" },
  { id: "youtube", name: "YouTube" },
  { id: "streaming", name: "Live Streaming" },
  { id: "monetization", name: "Monetization" },
  { id: "copywriting", name: "Copywriting" },
  { id: "community", name: "Community Building" },
]

const specialties = [
  "Content Strategy",
  "Viral Marketing",
  "Audience Growth",
  "Course Design",
  "Learning Psychology",
  "Social Media Growth",
  "Video Production",
  "Storytelling",
  "Brand Identity",
  "Email Marketing",
  "YouTube Algorithm",
  "TikTok Growth",
  "Live Streaming",
  "Revenue Optimization",
  "Copywriting",
  "Community Building",
]

export default function MarketplaceFilters({ filters, onFilterChange, totalResults }: MarketplaceFiltersProps) {
  const [isPriceExpanded, setIsPriceExpanded] = useState(true)
  const [isRatingExpanded, setIsRatingExpanded] = useState(true)
  const [isSpecialtiesExpanded, setIsSpecialtiesExpanded] = useState(false)

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter((s) => s !== specialty)
      : [...filters.specialties, specialty]

    onFilterChange({ specialties: newSpecialties })
  }

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "all",
      priceRange: [0, 50],
      minRating: 0,
      specialties: [],
    })
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold premium-gradient-text mb-6">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search assistants..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="premium-input"
          />
          <svg
            className="absolute right-4 top-4 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold premium-gradient-text mb-6">Categories</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onFilterChange({ category: category.id })}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                filters.category === category.id
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="glass-card p-8">
        <button
          onClick={() => setIsPriceExpanded(!isPriceExpanded)}
          className="flex items-center justify-between w-full text-xl font-bold premium-gradient-text mb-6"
        >
          Price Range
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${isPriceExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isPriceExpanded && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-slate-300 font-medium">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  onFilterChange({ priceRange: [filters.priceRange[0], Number.parseInt(e.target.value)] })
                }
                className="premium-slider"
              />
            </div>
            <div className="flex space-x-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  onFilterChange({ priceRange: [Number.parseInt(e.target.value) || 0, filters.priceRange[1]] })
                }
                className="premium-input text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  onFilterChange({ priceRange: [filters.priceRange[0], Number.parseInt(e.target.value) || 50] })
                }
                className="premium-input text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="glass-card p-8">
        <button
          onClick={() => setIsRatingExpanded(!isRatingExpanded)}
          className="flex items-center justify-between w-full text-xl font-bold premium-gradient-text mb-6"
        >
          Minimum Rating
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${isRatingExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isRatingExpanded && (
          <div className="space-y-3">
            {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
              <button
                key={rating}
                onClick={() => onFilterChange({ minRating: rating })}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                  filters.minRating === rating
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-slate-600"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium">{rating === 0 ? "Any rating" : `${rating}+ stars`}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Specialties */}
      <div className="glass-card p-8">
        <button
          onClick={() => setIsSpecialtiesExpanded(!isSpecialtiesExpanded)}
          className="flex items-center justify-between w-full text-xl font-bold premium-gradient-text mb-6"
        >
          Specialties
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${isSpecialtiesExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isSpecialtiesExpanded && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {specialties.map((specialty) => (
              <label key={specialty} className="flex items-center space-x-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.specialties.includes(specialty)}
                  onChange={() => handleSpecialtyToggle(specialty)}
                  className="w-5 h-5 text-blue-500 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors duration-300">
                  {specialty}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Results & Clear */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between">
          <span className="premium-gradient-text font-bold text-lg">{totalResults} Results</span>
          <button
            onClick={clearFilters}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
