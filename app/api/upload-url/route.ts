import { NextRequest, NextResponse } from 'next/server'
import { createUploadUrl } from '@vercel/blob'
import { verifyAuth } from '@/lib/auth'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

export async function POST(request: NextRequest) {
  try {
    console.log('Upload URL generation started')

    // Check authentication - only admins can upload
    const user = verifyAuth(request)
    if (!user || user.role !== 'admin') {
      console.log('Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Parse request body with error handling
    let requestBody
    try {
      requestBody = await request.json()
      console.log('Request body parsed:', requestBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { name } = requestBody

    // Validate request body
    if (!name || typeof name !== 'string') {
      console.log('Missing or invalid filename:', name)
      return NextResponse.json(
        { error: 'Missing filename or invalid format' },
        { status: 400 }
      )
    }

    // Check if BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = name.split('.').pop() || 'jpg'
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`

    console.log('Generated filename:', uniqueFileName)
    console.log('Using bucket: photos')
    console.log('Max size:', MAX_FILE_SIZE)

    // Create a signed upload URL for direct upload to Vercel Blob Storage
    try {
      const uploadUrl = await createUploadUrl({
        token: process.env.BLOB_READ_WRITE_TOKEN,
        name: uniqueFileName,
        bucket: "photos",
        maxSize: MAX_FILE_SIZE
      })

      console.log('Upload URL generated successfully:', uploadUrl)

      return NextResponse.json({ 
        uploadUrl,
        filename: uniqueFileName,
        originalFilename: name
      })
    } catch (blobError) {
      console.error('Vercel Blob createUploadUrl error:', blobError)
      console.error('Error details:', {
        message: blobError instanceof Error ? blobError.message : 'Unknown error',
        stack: blobError instanceof Error ? blobError.stack : undefined,
        tokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
        tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0
      })
      
      return NextResponse.json(
        { error: 'Failed to generate upload URL from Vercel Blob' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in upload URL generation:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { error: 'Internal server error during upload URL generation' },
      { status: 500 }
    )
  }
}
