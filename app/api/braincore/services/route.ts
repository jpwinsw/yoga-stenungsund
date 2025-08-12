import { NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

export async function GET(request: Request) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')
    
    // Build the URL with optional IDs parameter
    let url = `${BRAINCORE_API}/public/urbe/services/${COMPANY_ID}`
    if (ids) {
      url += `?ids=${ids}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Brain-core API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}