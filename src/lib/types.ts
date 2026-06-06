// Database Schema and Validation Types

export interface SlideshowSlide {
  id?: string
  title: string
  image: string // URL to uploaded image
  caption: string
  order: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Initiative {
  id?: string
  title: string
  type: 'constituency' | 'ministry'
  date: string
  description: string
  achievements: string[]
  newsArticles: NewsArticle[]
  createdAt?: Date
  updatedAt?: Date
}

export interface NewsArticle {
  id?: string
  title: string
  source: string
  date: string
  snippet: string
  image?: string // URL to uploaded image
}

export type PressCategory = 'Release' | 'Statement' | 'Article'

export interface PressItem {
  id?: string
  slug: string
  title: string
  date: string
  category: PressCategory
  summary: string
  source: string
  link: string // URL to external article or PDF under /press
  thumbnail?: string // optional image
  isFeatured?: boolean // show in homepage carousel
  createdAt?: Date
  updatedAt?: Date
}

export type EventStatus = 'Upcoming' | 'Past'
export type EventCategory = 'Public Meeting' | 'Government Event' | 'Rally' | 'Conference' | 'Other'

export interface EventItem {
  id?: string
  slug: string
  title: string
  date: string // YYYY-MM-DD
  status: EventStatus
  category: EventCategory
  location?: string
  summary: string
  link?: string // external link if any
  thumbnail?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface GalleryItem {
  id?: string
  title: string
  date: string // YYYY-MM-DD
  description: string
  image: string // URL under /images/admin/gallery or /gallery
  createdAt?: Date
  updatedAt?: Date
}

// Validation Rules
export const VALIDATION_RULES = {
  slideshow: {
    title: { maxLength: 100, required: true },
    caption: { maxLength: 200, required: true },
    image: { 
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      recommendedDimensions: { width: 1920, height: 1080 },
      aspectRatio: 16/9
    }
  },
  initiative: {
    title: { maxLength: 150, required: true },
    description: { maxLength: 500, required: true },
    date: { required: true, format: 'YYYY-MM-DD' },
    achievements: { minItems: 1, maxItems: 5, required: true }
  },
  newsArticle: {
    title: { maxLength: 200, required: true },
    source: { maxLength: 100, required: true },
    snippet: { maxLength: 300, required: true },
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
    }
  }
}

// Helper function to validate image
export function validateImage(file: File, rules: any): { valid: boolean; error?: string } {
  const sizeInMB = file.size / (1024 * 1024)
  
  if (sizeInMB > rules.maxSize / (1024 * 1024)) {
    return { valid: false, error: `Image size must be less than ${rules.maxSize / (1024 * 1024)}MB` }
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !rules.allowedFormats.includes(extension)) {
    return { valid: false, error: `Only ${rules.allowedFormats.join(', ')} formats are allowed` }
  }

  return { valid: true }
}

// Helper function to validate text content
export function validateText(text: string, rules: any): { valid: boolean; error?: string } {
  if (rules.required && !text.trim()) {
    return { valid: false, error: 'This field is required' }
  }

  if (text.length > rules.maxLength) {
    return { valid: false, error: `Maximum ${rules.maxLength} characters allowed` }
  }

  return { valid: true }
}

