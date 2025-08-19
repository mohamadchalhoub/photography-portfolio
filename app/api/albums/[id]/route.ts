import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // First, get the album ID to ensure referential integrity if needed
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('id')
      .eq('slug', albumId)
      .single()

    if (fetchError || !album) {
      return NextResponse.json(
        { error: 'Album not found or failed to fetch' },
        { status: 404 }
      )
    }

    // Delete associated images first (due to foreign key constraint)
    const { error: imagesError } = await supabase
      .from('images')
      .delete()
      .eq('album_id', album.id)

    if (imagesError) {
      return NextResponse.json(
        { error: 'Failed to delete album images' },
        { status: 500 }
      )
    }

    // Now delete the album
    const { error: albumError } = await supabase
      .from('albums')
      .delete()
      .eq('id', album.id)

    if (albumError) {
      return NextResponse.json(
        { error: 'Failed to delete album' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Album deleted successfully',
      albumId: album.id,
      albumSlug: albumId
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumSlug = params.id
    const albumData = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // First, get the album ID
    const { data: existingAlbum, error: fetchError } = await supabase
      .from('albums')
      .select('id')
      .eq('slug', albumSlug)
      .single()

    if (fetchError || !existingAlbum) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Update the album
    const { data: updatedAlbum, error: albumError } = await supabase
      .from('albums')
      .update({
        title: albumData.title,
        description: albumData.description,
        cover_image: albumData.coverImage,
        location: albumData.location,
        year: albumData.year,
        aspect_ratio: albumData.aspectRatio,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAlbum.id)
      .select()
      .single()

    if (albumError) {
      return NextResponse.json(
        { error: 'Failed to update album' },
        { status: 500 }
      )
    }

    // Delete existing images for this album
    const { error: deleteImagesError } = await supabase
      .from('images')
      .delete()
      .eq('album_id', existingAlbum.id)

    if (deleteImagesError) {
      return NextResponse.json(
        { error: 'Failed to clear existing images' },
        { status: 500 }
      )
    }

    // Insert new images
    if (albumData.images && albumData.images.length > 0) {
      const imagesToInsert = albumData.images.map((image: any) => ({
        album_id: existingAlbum.id,
        src: image.src,
        alt: image.alt,
        title: image.title,
        location: image.location,
        aspect_ratio: image.aspectRatio
      }))

      const { error: imagesError } = await supabase
        .from('images')
        .insert(imagesToInsert)

      if (imagesError) {
        return NextResponse.json(
          { error: 'Failed to update images' },
          { status: 500 }
        )
      }
    }

    // Return the updated album with images
    const { data: finalAlbum, error: finalError } = await supabase
      .from('albums')
      .select(`
        *,
        images (*)
      `)
      .eq('id', existingAlbum.id)
      .single()

    if (finalError) {
      return NextResponse.json(
        { error: 'Failed to fetch updated album' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedAlbum = {
      id: finalAlbum.slug,
      title: finalAlbum.title,
      description: finalAlbum.description,
      coverImage: finalAlbum.cover_image,
      location: finalAlbum.location,
      year: finalAlbum.year,
      aspectRatio: finalAlbum.aspect_ratio,
      images: finalAlbum.images?.map((image: any) => ({
        id: image.id.toString(),
        src: image.src,
        alt: image.alt,
        title: image.title,
        location: image.location,
        aspectRatio: image.aspect_ratio
      })) || []
    }

    return NextResponse.json(formattedAlbum)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}