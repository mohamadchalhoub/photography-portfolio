import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { imageData, filename, albumId } = await request.json()

    if (!imageData || !filename) {
      return NextResponse.json(
        { error: 'Image data and filename are required' },
        { status: 400 }
      )
    }

    // For now, we'll store the base64 data directly in the database
    // In a production environment, you'd want to upload to a proper storage service
    // like Vercel Blob, AWS S3, or Supabase Storage
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // If albumId is provided, we're adding an image to an album
    if (albumId) {
      const { data: newImage, error } = await supabase
        .from('images')
        .insert({
          album_id: albumId,
          src: imageData,
          alt: filename,
          title: filename,
          location: '',
          aspect_ratio: '3/2'
        })
        .select()
        .single()

      if (error) {
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
      url: imageData,
      filename: filename,
      size: imageData.length,
      type: 'image/jpeg'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
