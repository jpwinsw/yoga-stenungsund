import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { confirmation_code, email } = body

    if (!confirmation_code || !email) {
      return NextResponse.json(
        { error: 'Confirmation code and email are required' },
        { status: 400 }
      )
    }

    // Call the backend guest booking lookup endpoint
    const response = await axios.post(
      `${BRAINCORE_API}/public/urbe/booking/lookup`,
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
    console.error('Guest booking lookup error:', axios.isAxiosError(error) ? error.response?.data : error)
    
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
      
      return NextResponse.json(
        { error: error.response?.data?.detail || 'Failed to lookup booking' },
        { status: error.response?.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to lookup booking' },
      { status: 500 }
    )
  }
}