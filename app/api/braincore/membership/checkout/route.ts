import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      success_url: body.success_url,
      cancel_url: body.cancel_url
    })
    
    if (body.discount_code) {
      queryParams.append('discount_code', body.discount_code)
    }

    const response = await fetch(
      `${BRAINCORE_API}/urbe/membership-checkout/checkout/${body.plan_id}?${queryParams.toString()}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create checkout session' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating membership checkout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}