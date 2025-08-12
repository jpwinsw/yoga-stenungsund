// lib/api/company-settings.ts
/**
 * Fetch company website settings from braincore
 */

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'http://localhost:8010'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

export interface CompanySettings {
  name: string
  description?: string
  tagline?: string
  contact: {
    phone?: string
    email?: string
    address?: string
    address2?: string
    city?: string
    zipCode?: string
    country?: string
  }
  visitingAddress?: {
    address?: string
    city?: string
    zipCode?: string
    country?: string
    latitude?: number
    longitude?: number
    googlePlaceId?: string
  }
  social: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  content: {
    heroTitle?: string
    heroSubtitle?: string
    heroDescription?: string
    aboutContent?: string
  }
  branding: {
    logoUrl?: string
  }
  openingHours?: {
    monday?: { open?: string; close?: string }
    tuesday?: { open?: string; close?: string }
    wednesday?: { open?: string; close?: string }
    thursday?: { open?: string; close?: string }
    friday?: { open?: string; close?: string }
    saturday?: { open?: string; close?: string }
    sunday?: { open?: string; close?: string }
  }
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const response = await fetch(
      `${BRAINCORE_API}/public/company/${COMPANY_ID}/website-settings`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )
    
    if (!response.ok) {
      console.error('Failed to fetch company settings:', response.status)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return null
  }
}