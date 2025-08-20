import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentNumber: string }> }
) {
  try {
    const { documentNumber } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const headers: HeadersInit = {
      'Authorization': authHeader
    }
    
    // Call the backend API to download receipt PDF
    const response = await fetch(
      `${BRAINCORE_API}/urbe/member/receipts/download/${documentNumber}`,
      {
        method: 'GET',
        headers
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to download receipt' },
        { status: response.status }
      )
    }
    
    // Get the PDF data as a blob
    const pdfBlob = await response.blob()
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt_${documentNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Download receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to download receipt' },
      { status: 500 }
    )
  }
}