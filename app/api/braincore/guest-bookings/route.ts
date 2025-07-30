import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.BRAINCORE_API_URL || 'http://localhost:8000/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get IP address and user agent for tracking
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // For now, we'll create a guest booking by first creating a contact
    // In a real implementation, the backend should have a dedicated guest booking endpoint
    
    // Step 1: Create a guest contact
    const contactResponse = await fetch(
      `${BRAINCORE_API}/public/urbe/guest-contact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: body.guest_info.first_name,
          last_name: body.guest_info.last_name,
          email: body.guest_info.email,
          phone: body.guest_info.phone,
          is_guest: true
        }),
      }
    )

    if (!contactResponse.ok) {
      const error = await contactResponse.json()
      return NextResponse.json(
        { error: error.detail || 'Failed to create guest contact' },
        { status: contactResponse.status }
      )
    }

    const contact = await contactResponse.json()
    
    // Step 2: Create the booking with the guest contact ID
    const bookingResponse = await fetch(
      `${BRAINCORE_API}/public/urbe/book-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: body.session_id,
          contact_id: contact.id,
          special_requests: body.special_requests,
          ip_address: ip,
          user_agent: userAgent,
          is_guest_booking: true
        }),
      }
    )

    if (!bookingResponse.ok) {
      const error = await bookingResponse.json()
      return NextResponse.json(
        { error: error.detail || error.error || 'Failed to create booking' },
        { status: bookingResponse.status }
      )
    }

    const booking = await bookingResponse.json()
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Guest booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create guest booking' },
      { status: 500 }
    )
  }
}