import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Forward request to Braincore API
    const response = await axios.post(
      `${BRAINCORE_API}/finance/stripe/create-payment-intent`,
      body,
      { headers }
    )

    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Payment intent creation error:', error.response?.data || error.message)
      
      if (error.response) {
        return NextResponse.json(
          error.response.data,
          { status: error.response.status }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}