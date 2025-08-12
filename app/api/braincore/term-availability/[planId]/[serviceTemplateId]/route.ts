import { NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string; serviceTemplateId: string }> }
) {
  try {
    const { planId, serviceTemplateId } = await params
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    
    // Build backend URL
    let backendUrl = `${BRAINCORE_API}/urbe/term-membership/term-availability/${planId}/${serviceTemplateId}`
    if (startDate) {
      backendUrl += `?start_date=${encodeURIComponent(startDate)}`
    }
    
    // Make request to backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(backendUrl, { headers })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Backend error:', error)
      throw new Error(`Backend API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching term availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch term availability' },
      { status: 500 }
    )
  }
}