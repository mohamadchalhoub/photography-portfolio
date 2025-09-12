import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const albumId = formData.get('albumId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // Create file URL path for database storage
    const fileUrl = `/uploads/${fileName}`

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
          alt: file.name,
          title: file.name.split('.')[0], // Remove extension for title
          location: '',
          aspect_ratio: '3/2'
        })
        .select()
        .single()

      if (error) {
        // If database save fails, clean up the uploaded file
        try {
          await import('fs').then(fs => fs.promises.unlink(filePath))
        } catch (unlinkError) {
          console.error('Failed to clean up uploaded file:', unlinkError)
        }
        
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
      filename: file.name,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
