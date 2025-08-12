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
    const { confirmation_code, email } = body

    if (!confirmation_code || !email) {
      return NextResponse.json(
        { error: 'Confirmation code and email are required' },
        { status: 400 }
      )
    }

    // Call the backend guest booking cancellation endpoint
    const response = await axios.post(
      `${BRAINCORE_API}/public/urbe/booking/${bookingId}/cancel`,
      {
        confirmation_code,
        email
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('Guest booking cancellation error:', axios.isAxiosError(error) ? error.response?.data : error)
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      
      if (error.response?.status === 403) {
        return NextResponse.json(
          { error: 'Invalid email or confirmation code' },
          { status: 403 }
        )
      }
      
      if (error.response?.status === 400) {
        return NextResponse.json(
          { error: error.response.data.detail || 'Cannot cancel this booking' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}