import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const body = await request.json()
    
    // This is a public endpoint for guest bookings, no auth required
    const response = await axios.post(
      `${BRAINCORE_API}/public/urbe/booking/${bookingId}/confirm-payment`,
      {
        payment_intent_id: body.payment_intent_id
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Booking payment confirmation error:', error.response?.data || error.message)
      
      if (error.response) {
        return NextResponse.json(
          error.response.data,
          { status: error.response.status }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to confirm booking payment' },
      { status: 500 }
    )
  }
}