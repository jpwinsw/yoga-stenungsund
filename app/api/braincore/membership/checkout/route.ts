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

    // Build request body with required fields
    const requestBody: {
      success_url: string
      cancel_url: string
      discount_code?: string
      receipt_details?: {
        personal_number?: string
        street_address?: string
        postal_code?: string
        city?: string
        company_name?: string
        vat_number?: string
      }
    } = {
      success_url: body.success_url,
      cancel_url: body.cancel_url
    }
    
    if (body.discount_code) {
      requestBody.discount_code = body.discount_code
    }
    
    if (body.receipt_details) {
      requestBody.receipt_details = body.receipt_details
    }

    const response = await fetch(
      `${BRAINCORE_API}/urbe/membership-checkout/checkout/${body.plan_id}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
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