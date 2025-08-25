import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BRAINCORE_API_URL = process.env.NEXT_PUBLIC_BRAINCORE_API_URL || 'https://braincore-backend-b7eea5688d34.herokuapp.com'

/**
 * Pattern-based Term Membership Booking
 * Handles applying a weekly pattern across an entire term
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const {
      plan_id,
      selected_template_id,
      weekly_pattern,
      term_weeks,
      auto_resolve_conflicts = true
    } = body
    
    // Call the brain-core API endpoint for pattern booking
    const response = await fetch(`${BRAINCORE_API_URL}/api/v1/urbe/pattern-booking/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        plan_id,
        selected_template_id,
        weekly_pattern,
        term_weeks,
        auto_resolve_conflicts,
        company_id: parseInt(process.env.NEXT_PUBLIC_COMPANY_ID || '5')
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Failed to apply pattern' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Pattern booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get available sessions for pattern matching
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const templateIds = searchParams.get('template_ids')?.split(',').map(Number)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    // Get aggregated sessions for all allowed templates
    const response = await fetch(
      `${BRAINCORE_API_URL}/api/v1/urbe/sessions/aggregated?` + 
      new URLSearchParams({
        template_ids: templateIds?.join(',') || '',
        start_date: startDate || '',
        end_date: endDate || '',
        company_id: process.env.NEXT_PUBLIC_COMPANY_ID || '5'
      }),
      {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Failed to fetch sessions' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Fetch sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}