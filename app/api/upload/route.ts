import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { createClient } from '@supabase/supabase-js'
import { IncomingForm } from 'formidable'
import { readFile } from 'fs/promises'
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

    // Configure Formidable
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      filter: ({ mimetype }) => {
        // Only allow image files
        return ALLOWED_TYPES.includes(mimetype || '')
      }
    })

    // Parse the form data
    const [fields, files] = await form.parse(await request.arrayBuffer())
    
    // Get the uploaded file
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    
    if (!uploadedFile) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Additional file size validation (Formidable should catch this, but let's be sure)
    if (uploadedFile.size && uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large, must be under 10 MB. Current size: ${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!uploadedFile.mimetype || !ALLOWED_TYPES.includes(uploadedFile.mimetype)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Read the file buffer
    const fileBuffer = await readFile(uploadedFile.filepath)
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = uploadedFile.originalFilename?.split('.').pop() || 'jpg'
    const fileName = `photo_${timestamp}_${randomString}.${fileExtension}`

    // Create a File object for Vercel Blob
    const file = new File([fileBuffer], fileName, {
      type: uploadedFile.mimetype,
    })

    // Upload to Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false, // We're already generating unique filenames
    })

    // Use the blob URL for database storage
    const fileUrl = blob.url

    // Get albumId from form fields
    const albumId = Array.isArray(fields.albumId) ? fields.albumId[0] : fields.albumId

    // If albumId is provided, save to database
    if (albumId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: newImage, error } = await supabase
        .from('images')
        .insert({
          album_id: parseInt(albumId),
          src: fileUrl,
          alt: uploadedFile.originalFilename || fileName,
          title: (uploadedFile.originalFilename || fileName).split('.')[0], // Remove extension for title
          location: '',
          aspect_ratio: '3/2'
        })
        .select()
        .single()

      if (error) {
        console.error('Database save error:', error)
        return NextResponse.json(
          { error: 'Failed to save image to database' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        id: newImage.id,
        src: newImage.src,
        alt: newImage.alt,
        title: newImage.title,
        location: newImage.location,
        aspectRatio: newImage.aspect_ratio
      })
    }

    // For general uploads (not album-specific)
    return NextResponse.json({
      url: fileUrl,
      filename: uploadedFile.originalFilename || fileName,
      size: uploadedFile.size || fileBuffer.length,
      type: uploadedFile.mimetype
    })
  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle specific Formidable errors
    if (error instanceof Error) {
      if (error.message.includes('maxFileSize')) {
        return NextResponse.json(
          { error: 'File too large, must be under 10 MB' },
          { status: 400 }
        )
      }
      if (error.message.includes('filter')) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
