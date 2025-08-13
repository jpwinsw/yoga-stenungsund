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
    
    const response = await fetch(
      `${BRAINCORE_API}/api/urbe/member-portal/recovery-credits`,
      {
        method: 'GET',
        headers
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch recovery credits' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch recovery credits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recovery credits' },
      { status: 500 }
    )
  }
}