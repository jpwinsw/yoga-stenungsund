import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    }
    
    const response = await fetch(
      `${BRAINCORE_API}/api/urbe/term-membership/cancel-term-booking/${bookingId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to cancel term booking' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Cancel term booking error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel term booking' },
      { status: 500 }
    )
  }
}