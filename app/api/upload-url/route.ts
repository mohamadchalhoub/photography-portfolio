import { NextRequest, NextResponse } from 'next/server'
import { createUploadUrl } from '@vercel/blob'
import { verifyAuth } from '@/lib/auth'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const BUCKET_NAME = 'photos'

// Helper function to create consistent error responses
function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { 
      success: false, 
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

// Helper function to create success responses
function createSuccessResponse(data: any) {
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

    // Step 2: Parse and validate request body
    console.log('Step 2: Parsing request body...')
    let requestBody: { name?: string }
    
    try {
      requestBody = await request.json()
      console.log('✅ Request body parsed successfully:', requestBody)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return createErrorResponse('Invalid JSON in request body. Expected: { "name": "filename.jpg" }', 400)
    }

    // Step 3: Validate filename
    const { name } = requestBody
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.log('❌ Invalid filename:', name)
      return createErrorResponse('Missing or invalid filename. Expected a non-empty string.', 400)
    }

    // Step 4: Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    const fileExtension = name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      console.log('❌ Invalid file extension:', fileExtension)
      return createErrorResponse(`Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`, 400)
    }

    console.log('✅ Filename validation passed:', name)

    // Step 5: Check environment variables
    console.log('Step 3: Checking environment variables...')
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

    // Step 6: Generate unique filename
    console.log('Step 4: Generating unique filename...')
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`
    
    console.log('✅ Generated unique filename:', uniqueFileName)

    // Step 7: Create upload URL with Vercel Blob
    console.log('Step 5: Creating upload URL with Vercel Blob...')
    console.log('Parameters:', {
      token: `${blobToken.substring(0, 10)}...`,
      name: uniqueFileName,
      bucket: BUCKET_NAME,
      maxSize: MAX_FILE_SIZE
    })

    try {
      const uploadUrl = await createUploadUrl({
        token: blobToken,
        name: uniqueFileName,
        bucket: BUCKET_NAME,
        maxSize: MAX_FILE_SIZE
      })

      console.log('✅ Upload URL generated successfully')
      console.log('Upload URL:', uploadUrl)

      return createSuccessResponse({
        uploadUrl,
        filename: uniqueFileName,
        originalFilename: name,
        bucket: BUCKET_NAME,
        maxSize: MAX_FILE_SIZE
      })

    } catch (blobError) {
      console.error('❌ Vercel Blob createUploadUrl error:', blobError)
      
      // Log detailed error information
      if (blobError instanceof Error) {
        console.error('Error message:', blobError.message)
        console.error('Error stack:', blobError.stack)
      }
      
      // Check for specific error types
      const errorMessage = blobError instanceof Error ? blobError.message : 'Unknown error'
      
      if (errorMessage.includes('token') || errorMessage.includes('auth')) {
        return createErrorResponse('Authentication error with Vercel Blob. Please check BLOB_READ_WRITE_TOKEN.', 500)
      } else if (errorMessage.includes('bucket')) {
        return createErrorResponse(`Bucket '${BUCKET_NAME}' not found or not accessible.`, 500)
      } else if (errorMessage.includes('size') || errorMessage.includes('limit')) {
        return createErrorResponse('File size limit exceeded or invalid.', 400)
      } else {
        return createErrorResponse(`Vercel Blob error: ${errorMessage}`, 500)
      }
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
