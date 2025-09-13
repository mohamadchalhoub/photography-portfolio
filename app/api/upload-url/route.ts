import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

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

    // Step 3: Parse JSON request body
    console.log('Step 3: Parsing JSON request body...')
    let requestBody: { name?: string }
    
    try {
      requestBody = await request.json()
      console.log('✅ Request body parsed successfully:', requestBody)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return createErrorResponse('Invalid JSON in request body. Expected: { "name": "filename.jpg" }', 400)
    }

    // Step 4: Validate request body
    const { name } = requestBody
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.log('❌ Invalid filename:', name)
      return createErrorResponse('Missing or invalid filename. Expected a non-empty string.', 400)
    }

    console.log('✅ Filename validation passed:', name)

    // Step 5: Generate unique filename
    console.log('Step 4: Generating unique filename...')
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = name.split('.').pop() || 'jpg'
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`
    
    console.log('✅ Generated unique filename:', uniqueFileName)

    // Step 6: Generate signed upload URL
    console.log('Step 5: Generating signed upload URL...')
    
    try {
      // Create a signed upload URL for direct client upload
      // The handleUploadUrl should be the API endpoint that will handle the upload
      const handleUploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload-handler`
      
      console.log('✅ Upload URL generated successfully')
      console.log('Handle Upload URL:', handleUploadUrl)

      return createSuccessResponse({
        handleUploadUrl,
        fileName: uniqueFileName
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
