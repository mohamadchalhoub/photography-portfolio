import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can test
    const user = verifyAuth(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Check environment variables
    const tokenExists = !!process.env.BLOB_READ_WRITE_TOKEN
    const tokenLength = process.env.BLOB_READ_WRITE_TOKEN?.length || 0
    const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) || 'N/A'

    return NextResponse.json({
      blobTokenExists: tokenExists,
      blobTokenLength: tokenLength,
      blobTokenPrefix: tokenPrefix,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test blob error:', error)
    return NextResponse.json(
      { error: 'Failed to test blob configuration' },
      { status: 500 }
    )
  }
}
