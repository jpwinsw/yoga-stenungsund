import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const { paymentIntentId } = await params
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Forward request to Braincore API
    const response = await axios.get(
      `${BRAINCORE_API}/api/finance/stripe/payment-status/${paymentIntentId}`,
      { headers }
    )

    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Payment status error:', error.response?.data || error.message)
      
      if (error.response) {
        return NextResponse.json(
          error.response.data,
          { status: error.response.status }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    )
  }
}