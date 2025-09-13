import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { verifyAuth } from '@/lib/auth'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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

    const { filename, contentType, size } = await request.json()

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large, must be under 10 MB. Current size: ${(size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = filename.split('.').pop()
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`

    // Create a signed URL for direct upload to Vercel Blob
    const blob = await put(uniqueFileName, new File([], filename, { type: contentType }), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      filename: uniqueFileName,
      originalFilename: filename,
      contentType,
      size
    })
  } catch (error) {
    console.error('Upload URL generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
