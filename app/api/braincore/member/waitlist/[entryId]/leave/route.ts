import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params
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
      `${BRAINCORE_API}/urbe/member-portal/waitlist/${entryId}/leave`,
      {
        method: 'POST',
        headers
      }
    )
    
    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(
        { error: data.detail || 'Failed to leave waitlist' },
        { status: response.status }
      )
    }
    
    return NextResponse.json({ message: 'Successfully left waitlist' })
  } catch (error) {
    console.error('Leave waitlist error:', error)
    return NextResponse.json(
      { error: 'Failed to leave waitlist' },
      { status: 500 }
    )
  }
}