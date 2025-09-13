import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
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
  console.log('=== Direct Upload Started ===')
  
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

    // Step 3: Parse form data
    console.log('Step 3: Parsing form data...')
    let formData: FormData
    
    try {
      formData = await request.formData()
      console.log('✅ Form data parsed successfully')
    } catch (parseError) {
      console.error('❌ Form data parse error:', parseError)
      return createErrorResponse('Invalid form data. Expected multipart/form-data.', 400)
    }

    // Step 4: Get file from form data
    const file = formData.get('file') as File
    if (!file) {
      console.log('❌ No file found in form data')
      return createErrorResponse('No file provided. Please select a file to upload.', 400)
    }

    console.log('✅ File found:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Step 5: Validate file
    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ File too large:', file.size, 'Max allowed:', MAX_FILE_SIZE)
      return createErrorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`, 400)
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return createErrorResponse(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400)
    }

    console.log('✅ File validation passed')

    // Step 6: Generate unique filename
    console.log('Step 4: Generating unique filename...')
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const uniqueFileName = `photo_${timestamp}_${randomString}.${fileExtension}`
    
    console.log('✅ Generated unique filename:', uniqueFileName)

    // Step 7: Upload file directly to Vercel Blob
    console.log('Step 5: Uploading file to Vercel Blob...')
    
    try {
      const blob = await put(uniqueFileName, file, {
        access: 'public',
        token: blobToken,
      })

      console.log('✅ File uploaded successfully')
      console.log('Blob URL:', blob.url)

      return createSuccessResponse({
        url: blob.url,
        filename: uniqueFileName,
        originalFilename: file.name,
        size: file.size,
        type: file.type
      })

    } catch (blobError) {
      console.error('❌ Vercel Blob upload error:', blobError)
      
      // Log detailed error information
      if (blobError instanceof Error) {
        console.error('Error message:', blobError.message)
        console.error('Error stack:', blobError.stack)
      }
      
      // Check for specific error types
      const errorMessage = blobError instanceof Error ? blobError.message : 'Unknown error'
      
      if (errorMessage.includes('token') || errorMessage.includes('auth')) {
        return createErrorResponse('Authentication error with Vercel Blob. Please check BLOB_READ_WRITE_TOKEN.', 500)
      } else if (errorMessage.includes('size') || errorMessage.includes('limit')) {
        return createErrorResponse('File size limit exceeded or invalid.', 400)
      } else {
        return createErrorResponse(`Vercel Blob error: ${errorMessage}`, 500)
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error in file upload:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return createErrorResponse('Internal server error during file upload', 500)
  } finally {
    console.log('=== Direct Upload Completed ===')
  }
}
