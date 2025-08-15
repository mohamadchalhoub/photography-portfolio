import { NextRequest, NextResponse } from 'next/server'
import { db, albums, images } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id
    
    // Get album with images
    const albumWithImages = await db
      .select()
      .from(albums)
      .leftJoin(images, eq(albums.id, images.albumId))
      .where(eq(albums.slug, slug))

    if (albumWithImages.length === 0) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const album = albumWithImages[0].albums
    const albumImages = albumWithImages
      .filter(row => row.images !== null)
      .map(row => ({
        id: row.images!.id.toString(),
        src: row.images!.src,
        alt: row.images!.alt,
        title: row.images!.title,
        location: row.images!.location,
        aspectRatio: row.images!.aspectRatio
      }))

    const result = {
      id: album.slug,
      title: album.title,
      description: album.description,
      coverImage: album.coverImage,
      location: album.location,
      year: album.year,
      aspectRatio: album.aspectRatio,
      images: albumImages
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id
    const body = await request.json()
    const { title, description, coverImage, location, year, aspectRatio, images: albumImages } = body

    // Get the album first
    const [existingAlbum] = await db
      .select()
      .from(albums)
      .where(eq(albums.slug, slug))

    if (!existingAlbum) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Update album
    const [updatedAlbum] = await db
      .update(albums)
      .set({
        title,
        description,
        coverImage,
        location,
        year,
        aspectRatio: aspectRatio || '3/2',
        updatedAt: new Date(),
      })
      .where(eq(albums.id, existingAlbum.id))
      .returning()

    // Delete existing images and insert new ones
    await db.delete(images).where(eq(images.albumId, existingAlbum.id))

    if (albumImages && albumImages.length > 0) {
      const imageData = albumImages.map((img: any, index: number) => ({
        albumId: existingAlbum.id,
        src: img.src,
        alt: img.alt,
        title: img.title,
        location: img.location,
        aspectRatio: img.aspectRatio || '3/2',
        order: index,
      }))

      await db.insert(images).values(imageData)
    }

    return NextResponse.json({
      id: updatedAlbum.slug,
      title: updatedAlbum.title,
      description: updatedAlbum.description,
      coverImage: updatedAlbum.coverImage,
      location: updatedAlbum.location,
      year: updatedAlbum.year,
      aspectRatio: updatedAlbum.aspectRatio,
      images: albumImages || []
    })
  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id

    // Get the album first
    const [existingAlbum] = await db
      .select()
      .from(albums)
      .where(eq(albums.slug, slug))

    if (!existingAlbum) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Delete album (images will be deleted automatically due to cascade)
    await db.delete(albums).where(eq(albums.id, existingAlbum.id))

    return NextResponse.json({ message: 'Album deleted successfully' })
  } catch (error) {
    console.error('Error deleting album:', error)
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    )
  }
}
