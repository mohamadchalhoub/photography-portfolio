import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { put } from '@vercel/blob'

// Enable JSON body parsing for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Only for metadata, not file data
    },
  },
}

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

// Helper function to create consistent error responses
function createErrorResponse(message: string, status: number = 500) {
  console.error('❌ API Error:', message, 'Status:', status)
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

// Helper function to create success responses
function createSuccessResponse(data: any) {
  console.log('✅ API Success:', data)
  return NextResponse.json({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('=== Upload URL Generation Started ===')
  
  try {
    // Step 1: Authentication check
    console.log('Step 1: Checking authentication...')
    const user = verifyAuth(request)
    if (!user || user.role !== 'admin') {
      console.log('❌ Authentication failed - user:', user)
      return createErrorResponse('Unauthorized. Admin access required.', 401)
    }
    console.log('✅ Authentication successful - user:', user.username)

    // Step 2: Check environment variables
    console.log('Step 2: Checking environment variables...')
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    
    if (!blobToken) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set')
      return createErrorResponse('Server configuration error: BLOB_READ_WRITE_TOKEN not found', 500)
    }

    if (blobToken.length < 10) {
      console.error('❌ BLOB_READ_WRITE_TOKEN appears to be invalid (too short):', blobToken.length)
      return createErrorResponse('Server configuration error: Invalid BLOB_READ_WRITE_TOKEN', 500)
    }

    console.log('✅ Environment variables validated - token length:', blobToken.length)

    // Step 3: Parse JSON metadata (not file data)
    console.log('Step 3: Parsing JSON metadata...')
    let requestBody: { name?: string; size?: number; type?: string }
    
    try {
      requestBody = await request.json()
      console.log('✅ JSON metadata parsed successfully:', requestBody)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return createErrorResponse('Invalid JSON in request body. Expected: { "name": "filename.jpg", "size": 1234567, "type": "image/jpeg" }', 400)
    }

    // Step 4: Validate metadata
    const { name, size, type } = requestBody
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.log('❌ Invalid filename:', name)
      return createErrorResponse('Missing or invalid filename. Expected a non-empty string.', 400)
    }

    if (!size || typeof size !== 'number' || size <= 0) {
      console.log('❌ Invalid file size:', size)
      return createErrorResponse('Missing or invalid file size. Expected a positive number.', 400)
    }

    if (!type || typeof type !== 'string' || type.trim() === '') {
      console.log('❌ Invalid file type:', type)
      return createErrorResponse('Missing or invalid file type. Expected a MIME type string.', 400)
    }

    console.log('✅ Metadata validation passed:', { name, size, type })

    // Step 5: Validate file size and type
    if (size > MAX_FILE_SIZE) {
      console.log('❌ File too large:', size, 'Max allowed:', MAX_FILE_SIZE)
      return createErrorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`, 400)
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(type)) {
      console.log('❌ Invalid file type:', type)
      return createErrorResponse(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400)
    }

    console.log('✅ File validation passed')

    // Step 6: Generate unique filename
    console.log('Step 4: Generating unique filename...')
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = name.split('.').pop() || 'jpg'
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`
    
    console.log('✅ Generated unique filename:', uniqueFileName)

    // Step 7: Generate signed upload URL for client-side upload
    console.log('Step 5: Generating signed upload URL...')
    
    try {
      // Generate a signed URL for client-side upload
      const baseUrl = 'https://blob.vercel-storage.com'
      const signedUploadUrl = `${baseUrl}/put/${uniqueFileName}?token=${blobToken}&access=public`
      
      // The public URL will be available after upload
      const publicUrl = `${baseUrl}/${uniqueFileName}`

      console.log('✅ Signed upload URL generated successfully')
      console.log('Upload URL:', signedUploadUrl.substring(0, 100) + '...')
      console.log('Public URL:', publicUrl)

      return createSuccessResponse({
        uploadUrl: signedUploadUrl, // This is the signed URL for PUT request
        publicUrl: publicUrl, // This is the final public URL
        filename: uniqueFileName,
        originalFilename: name,
        size: size,
        type: type
      })

    } catch (blobError) {
      console.error('❌ Vercel Blob URL generation error:', blobError)
      
      // Log detailed error information
      if (blobError instanceof Error) {
        console.error('Error message:', blobError.message)
        console.error('Error stack:', blobError.stack)
      }
      
      return createErrorResponse('Failed to generate upload URL', 500)
    }

  } catch (error) {
    console.error('❌ Unexpected error in upload URL generation:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return createErrorResponse('Internal server error during upload URL generation', 500)
  } finally {
    console.log('=== Upload URL Generation Completed ===')
  }
}
