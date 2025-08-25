import { NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('Validating discount code:', body)
    console.log('API URL:', `${BRAINCORE_API}/urbe/discount-codes/validate-discount`)
    
    // Forward the request to the braincore API
    const response = await fetch(`${BRAINCORE_API}/urbe/discount-codes/validate-discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response text:', responseText)

    if (!response.ok) {
      let error
      try {
        error = JSON.parse(responseText)
      } catch {
        error = { detail: responseText || 'Validation failed' }
      }
      
      return NextResponse.json(
        { 
          error: error.detail || error.message || 'Validation failed',
          valid: false,
          discount_amount: 0,
          final_amount: body.amount || 0,
          discount_type: '',
          discount_value: 0,
          message: error.detail || error.message || 'Validation failed'
        },
        { status: 200 } // Return 200 with error in body to avoid axios throwing
      )
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Discount validation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to validate discount code',
        valid: false,
        discount_amount: 0,
        final_amount: 0,
        discount_type: '',
        discount_value: 0,
        message: 'Failed to validate discount code'
      },
      { status: 200 } // Return 200 with error in body to avoid axios throwing
    )
  }
}