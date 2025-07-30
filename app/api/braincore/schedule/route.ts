import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const contactId = searchParams.get('contact_id')
  
  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'start_date and end_date are required' },
      { status: 400 }
    )
  }
  
  try {
    const url = `${BRAINCORE_API}/public/urbe/schedule/${COMPANY_ID}?start_date=${startDate}&end_date=${endDate}${contactId ? `&contact_id=${contactId}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Brain-core API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    // Extract sessions array from the response
    return NextResponse.json(data.sessions || [])
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}