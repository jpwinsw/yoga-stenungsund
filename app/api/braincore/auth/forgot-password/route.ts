import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Request password reset from URBE backend
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member-portal/password/reset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    )
    
    await response.json()
    
    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If the email exists, a reset link has been sent'
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

// Confirm password reset with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, new_password } = body
    
    if (!token || !new_password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }
    
    // Validate password strength
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    
    // Confirm password reset with URBE backend
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member-portal/password/reset/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password
        }),
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to reset password' },
        { status: response.status }
      )
    }
    
    return NextResponse.json({
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}