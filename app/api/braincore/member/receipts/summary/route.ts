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
    
    // Call the backend API to get receipts summary
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member/receipts/summary`,
      {
        method: 'GET',
        headers
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch receipts summary' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch receipts summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts summary' },
      { status: 500 }
    )
  }
}