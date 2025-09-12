import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
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
        { error: `File too large, must be under 10 MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
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

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `photo_${timestamp}_${randomString}.${fileExtension}`

    // Upload to Vercel Blob Storage bucket named "photos"
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false, // We're already generating unique filenames
    })

    // Use the blob URL for database storage
    const fileUrl = blob.url

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
