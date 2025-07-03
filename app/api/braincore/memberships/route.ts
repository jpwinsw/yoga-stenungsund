import { NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

export async function GET() {
  try {
    const response = await fetch(
      `${BRAINCORE_API}/public/urbe/memberships/${COMPANY_ID}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Brain-core API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching memberships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    )
  }
}