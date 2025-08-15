import { NextRequest, NextResponse } from 'next/server'
import { db, albums, images } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all albums with their images
    const albumsWithImages = await db
      .select()
      .from(albums)
      .leftJoin(images, eq(albums.id, images.albumId))
      .orderBy(desc(albums.createdAt))

    // Group images by album
    const albumsMap = new Map()
    
    albumsWithImages.forEach((row) => {
      const album = row.albums
      const image = row.images
      
      if (!albumsMap.has(album.id)) {
        albumsMap.set(album.id, {
          id: album.slug, // Use slug as frontend ID for compatibility
          title: album.title,
          description: album.description,
          coverImage: album.coverImage,
          location: album.location,
          year: album.year,
          aspectRatio: album.aspectRatio,
          images: []
        })
      }
      
      if (image) {
        albumsMap.get(album.id).images.push({
          id: image.id.toString(),
          src: image.src,
          alt: image.alt,
          title: image.title,
          location: image.location,
          aspectRatio: image.aspectRatio
        })
      }
    })

    const albumsList = Array.from(albumsMap.values())
    
    return NextResponse.json(albumsList)
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
    const body = await request.json()
    const { title, description, coverImage, location, year, aspectRatio, images: albumImages } = body

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Insert album
    const [newAlbum] = await db
      .insert(albums)
      .values({
        slug,
        title,
        description,
        coverImage,
        location,
        year,
        aspectRatio: aspectRatio || '3/2',
      })
      .returning()

    // Insert images if provided
    if (albumImages && albumImages.length > 0) {
      const imageData = albumImages.map((img: any, index: number) => ({
        albumId: newAlbum.id,
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
      id: newAlbum.slug,
      title: newAlbum.title,
      description: newAlbum.description,
      coverImage: newAlbum.coverImage,
      location: newAlbum.location,
      year: newAlbum.year,
      aspectRatio: newAlbum.aspectRatio,
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
