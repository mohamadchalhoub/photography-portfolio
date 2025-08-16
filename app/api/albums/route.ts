import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get albums with images using Supabase client
    const { data: albumsData, error: albumsError } = await supabase
      .from('albums')
      .select(`
        *,
        images (*)
      `)
      .order('created_at', { ascending: false })

    if (albumsError) {
      console.error('Error fetching albums:', albumsError)
      return NextResponse.json(
        { error: 'Failed to fetch albums' },
        { status: 500 }
      )
    }

    // Convert to frontend format
    const formattedAlbums = albumsData.map(album => ({
      id: album.slug,
      title: album.title,
      description: album.description,
      coverImage: album.cover_image,
      location: album.location,
      year: album.year,
      aspectRatio: album.aspect_ratio,
      images: album.images?.map(image => ({
        id: image.id.toString(),
        src: image.src,
        alt: image.alt,
        title: image.title,
        location: image.location,
        aspectRatio: image.aspect_ratio
      })) || []
    }))
    
    return NextResponse.json(formattedAlbums)
  } catch (error) {
    console.error('Error fetching albums:', error)
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await request.json()
    const { title, description, coverImage, location, year, aspectRatio, images: albumImages } = body

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Insert album using Supabase client
    const { data: newAlbum, error: albumError } = await supabase
      .from('albums')
      .insert({
        slug,
        title,
        description,
        cover_image: coverImage,
        location,
        year,
        aspect_ratio: aspectRatio || '3/2',
      })
      .select()
      .single()

    if (albumError) {
      console.error('Error creating album:', albumError)
      return NextResponse.json(
        { error: 'Failed to create album' },
        { status: 500 }
      )
    }

    // Insert images if provided
    if (albumImages && albumImages.length > 0) {
      const imageData = albumImages.map((img: any, index: number) => ({
        album_id: newAlbum.id,
        src: img.src,
        alt: img.alt,
        title: img.title,
        location: img.location,
        aspect_ratio: img.aspectRatio || '3/2',
        order: index,
      }))

      const { error: imagesError } = await supabase
        .from('images')
        .insert(imageData)

      if (imagesError) {
        console.error('Error creating images:', imagesError)
        // Album was created but images failed - you might want to handle this
      }
    }

    return NextResponse.json({
      id: newAlbum.slug,
      title: newAlbum.title,
      description: newAlbum.description,
      coverImage: newAlbum.cover_image,
      location: newAlbum.location,
      year: newAlbum.year,
      aspectRatio: newAlbum.aspect_ratio,
      images: albumImages || []
    })
  } catch (error) {
    console.error('Error creating album:', error)
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    )
  }
}
