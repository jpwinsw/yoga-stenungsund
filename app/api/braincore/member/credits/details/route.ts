import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function GET(request: NextRequest) {
  try {
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
    
    // Fetch credit details directly from member portal endpoint
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member-portal/credits/details`,
      {
        method: 'GET',
        headers
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch credit details' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch credit details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit details' },
      { status: 500 }
    )
  }
}