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

    // First, get the album to ensure it exists and get the database ID
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('id, slug, title')
      .eq('slug', albumId)
      .single()

    if (fetchError || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
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
      deletedAlbum: {
        id: album.slug,
        title: album.title
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}