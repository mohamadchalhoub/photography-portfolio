import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id
    console.log('🗑️ Deleting album:', albumId)

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
      console.error('Album not found:', fetchError)
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    console.log('📝 Found album to delete:', album.title, `(ID: ${album.id})`)

    // Delete associated images first (due to foreign key constraint)
    const { error: imagesError } = await supabase
      .from('images')
      .delete()
      .eq('album_id', album.id)

    if (imagesError) {
      console.error('Error deleting album images:', imagesError)
      return NextResponse.json(
        { error: 'Failed to delete album images' },
        { status: 500 }
      )
    }

    console.log('✅ Deleted album images')

    // Now delete the album
    const { error: albumError } = await supabase
      .from('albums')
      .delete()
      .eq('id', album.id)

    if (albumError) {
      console.error('Error deleting album:', albumError)
      return NextResponse.json(
        { error: 'Failed to delete album' },
        { status: 500 }
      )
    }

    console.log('✅ Album deleted successfully:', album.title)

    return NextResponse.json({
      message: 'Album deleted successfully',
      deletedAlbum: {
        id: album.slug,
        title: album.title
      }
    })
  } catch (error) {
    console.error('Unexpected error deleting album:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}