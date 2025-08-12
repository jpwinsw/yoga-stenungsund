import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const searchParams = request.nextUrl.searchParams
  const contactId = searchParams.get('contact_id')
  const locale = searchParams.get('locale') || 'en'
  
  try {
    // Build query params
    const queryParams = new URLSearchParams()
    if (contactId) queryParams.append('contact_id', contactId)
    queryParams.append('locale', locale)
    
    const url = `${BRAINCORE_API}/public/urbe/session/${sessionId}/booking-options?${queryParams.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching booking options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking options' },
      { status: 500 }
    )
  }
}