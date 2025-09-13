import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { handleUpload } from '@vercel/blob/client'

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
  console.log('=== Upload Handler Started ===')
  
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

    // Step 3: Handle upload using Vercel Blob client
    console.log('Step 3: Processing upload with Vercel Blob...')
    
    try {
      const jsonResponse = await handleUpload({
        token: blobToken,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          console.log('Generating token for:', pathname)
          return {
            allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maximumSizeInBytes: MAX_FILE_SIZE,
            addRandomSuffix: true,
          }
        },
        onUploadCompleted: async ({ blob, token }) => {
          console.log('Upload completed:', blob.url)
          return {
            url: blob.url,
            filename: blob.pathname,
            size: blob.size,
            type: blob.contentType
          }
        },
      })

      console.log('✅ Upload processed successfully')
      return NextResponse.json(jsonResponse)

    } catch (blobError) {
      console.error('❌ Vercel Blob upload error:', blobError)
      
      // Log detailed error information
      if (blobError instanceof Error) {
        console.error('Error message:', blobError.message)
        console.error('Error stack:', blobError.stack)
      }
      
      // Handle specific error types
      if (blobError instanceof Error) {
        if (blobError.message.includes('403')) {
          return createErrorResponse('Access denied. Please check your BLOB_READ_WRITE_TOKEN.', 403)
        } else if (blobError.message.includes('413')) {
          return createErrorResponse('File too large. Maximum size is 10MB.', 413)
        } else if (blobError.message.includes('400')) {
          return createErrorResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400)
        }
      }
      
      return createErrorResponse('Failed to process upload', 500)
    }

  } catch (error) {
    console.error('❌ Unexpected error in upload processing:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return createErrorResponse('Internal server error during upload processing', 500)
  } finally {
    console.log('=== Upload Handler Completed ===')
  }
}
