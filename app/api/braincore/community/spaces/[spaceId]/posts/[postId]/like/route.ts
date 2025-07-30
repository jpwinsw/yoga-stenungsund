import { NextRequest, NextResponse } from 'next/server'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string; postId: string }> }
) {
  try {
    const { spaceId, postId } = await params
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const response = await fetch(
      `${BRAINCORE_API}/commune/spaces/${spaceId}/posts/${postId}/like`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
      }
    )
    
    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(
        { error: data.detail || 'Failed to like post' },
        { status: response.status }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Like post error:', error)
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    )
  }
}