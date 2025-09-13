import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can save images
    const user = verifyAuth(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { uploadUrl, pathname, filename, originalFilename, contentType, size, albumId } = await request.json()

    if (!uploadUrl || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: uploadUrl and filename' },
        { status: 400 }
      )
    }

    // Create the public URL from the pathname
    const publicUrl = `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('.')[0]}.public.blob.vercel-storage.com${pathname}`

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // If albumId is provided, save to database
    if (albumId) {
      const { data: newImage, error } = await supabase
        .from('images')
        .insert({
          album_id: parseInt(albumId),
          src: publicUrl,
          alt: originalFilename || filename,
          title: (originalFilename || filename).split('.')[0], // Remove extension for title
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
      url: publicUrl,
      filename: originalFilename || filename,
      size,
      type: contentType
    })
  } catch (error) {
    console.error('Save image error:', error)
    
    return NextResponse.json(
      { error: 'Failed to save image metadata' },
      { status: 500 }
    )
  }
}
