import { NextRequest, NextResponse } from 'next/server'
import { createUploadUrl } from '@vercel/blob'
import { verifyAuth } from '@/lib/auth'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can upload
    const user = verifyAuth(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    // Validate request body
    if (!name) {
      return NextResponse.json(
        { error: 'Missing filename' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = name.split('.').pop()
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`

    // Create a signed upload URL for direct upload to Vercel Blob Storage
    const uploadUrl = await createUploadUrl({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      name: uniqueFileName,
      bucket: "photos",
      maxSize: MAX_FILE_SIZE
    })

    return NextResponse.json({ 
      uploadUrl,
      filename: uniqueFileName,
      originalFilename: name
    })
  } catch (error) {
    console.error('Upload URL generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
