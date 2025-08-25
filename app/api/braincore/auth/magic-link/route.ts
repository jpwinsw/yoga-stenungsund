import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, company_id } = body
    
    if (!email || !company_id) {
      return NextResponse.json(
        { error: 'Email and company_id are required' },
        { status: 400 }
      )
    }
    
    // Request magic link from URBE backend
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member-portal/magic-link/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          company_id,
          redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-magic-link`
        }),
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to send magic link' },
        { status: response.status }
      )
    }
    
    return NextResponse.json({
      message: 'Magic link sent to your email',
      ...data
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}

// Verify magic link token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    // Verify token with URBE backend
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member-portal/magic-link/verify?token=${token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Invalid or expired token' },
        { status: response.status }
      )
    }
    
    // Return session data
    return NextResponse.json(data)
  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify magic link' },
      { status: 500 }
    )
  }
}