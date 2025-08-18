"use client"
import Image from "next/image"
import Link from "next/link"
import { Camera, ArrowLeft, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { useState, useEffect } from "react"

// This would normally come from a context or props, but for now we'll duplicate the data structure
interface PortfolioImage {
  id: string
  src: string
  alt: string
  title: string
  location: string
  aspectRatio: string
}

interface PortfolioAlbum {
  id: string
  title: string
  description: string
  coverImage: string
  location: string
  year: string
  aspectRatio: string
  images: PortfolioImage[]
}

const defaultAlbums: PortfolioAlbum[] = [
  {
    id: "voices-of-conflict",
    title: "Voices of Conflict",
    description: "Documentary photography from conflict zones across Eastern Europe",
    coverImage: "/placeholder.svg?height=400&width=600",
    location: "Eastern Europe",
    year: "2023",
    aspectRatio: "3/2",
    images: [
      {
        id: "1",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Documentary photography from conflict zone",
        title: "Voices of Conflict 1",
        location: "Eastern Europe, 2023",
        aspectRatio: "3/2",
      },
      {
        id: "2",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Local residents during conflict",
        title: "Voices of Conflict 2",
        location: "Eastern Europe, 2023",
        aspectRatio: "3/2",
      },
      {
        id: "3",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Community resilience in wartime",
        title: "Voices of Conflict 3",
        location: "Eastern Europe, 2023",
        aspectRatio: "3/2",
      },
    ],
  },
  {
    id: "hope-in-crisis",
    title: "Hope in Crisis",
    description: "Humanitarian efforts and refugee assistance across the Mediterranean",
    coverImage: "/placeholder.svg?height=400&width=600",
    location: "Mediterranean",
    year: "2023",
    aspectRatio: "3/2",
    images: [
      {
        id: "4",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Humanitarian workers assisting refugees",
        title: "Hope in Crisis 1",
        location: "Mediterranean, 2023",
        aspectRatio: "3/2",
      },
      {
        id: "5",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Rescue operations at sea",
        title: "Hope in Crisis 2",
        location: "Mediterranean, 2023",
        aspectRatio: "3/2",
      },
    ],
  },
  {
    id: "displaced-dreams",
    title: "Displaced Dreams",
    description: "Stories of families forced to leave their homes",
    coverImage: "/placeholder.svg?height=400&width=600",
    location: "Middle East",
    year: "2022",
    aspectRatio: "3/2",
    images: [
      {
        id: "6",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Displaced families in temporary shelter",
        title: "Displaced Dreams 1",
        location: "Middle East, 2022",
        aspectRatio: "3/2",
      },
      {
        id: "7",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Children in refugee camps",
        title: "Displaced Dreams 2",
        location: "Middle East, 2022",
        aspectRatio: "3/2",
      },
    ],
  },
  {
    id: "healing-hands",
    title: "Healing Hands",
    description: "Medical assistance and healthcare in conflict areas",
    coverImage: "/placeholder.svg?height=400&width=600",
    location: "Africa",
    year: "2022",
    aspectRatio: "3/2",
    images: [
      {
        id: "8",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Medical assistance in conflict area",
        title: "Healing Hands 1",
        location: "Africa, 2022",
        aspectRatio: "3/2",
      },
      {
        id: "9",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Healthcare workers in the field",
        title: "Healing Hands 2",
        location: "Africa, 2022",
        aspectRatio: "3/2",
      },
    ],
  },
  {
    id: "resilient-spirits",
    title: "Resilient Spirits",
    description: "Children finding joy and hope amid adversity",
    coverImage: "/placeholder.svg?height=400&width=600",
    location: "South America",
    year: "2023",
    aspectRatio: "3/2",
    images: [
      {
        id: "10",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Children finding joy amid adversity",
        title: "Resilient Spirits 1",
        location: "South America, 2023",
        aspectRatio: "3/2",
      },
      {
        id: "11",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Young faces of hope",
        title: "Resilient Spirits 2",
        location: "South America, 2023",
        aspectRatio: "3/2",
      },
    ],
  },
  {
    id: "guardians-of-peace",
    title: "Guardians of Peace",
    description: "Peacekeeping forces working to maintain stability",
    coverImage: "/placeholder.svg?height=400&width=600",
    location: "Central Africa",
    year: "2022",
    aspectRatio: "3/2",
    images: [
      {
        id: "12",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Peacekeeping forces on patrol",
        title: "Guardians of Peace 1",
        location: "Central Africa, 2022",
        aspectRatio: "3/2",
      },
      {
        id: "13",
        src: "/placeholder.svg?height=400&width=600",
        alt: "Peace negotiations in progress",
        title: "Guardians of Peace 2",
        location: "Central Africa, 2022",
        aspectRatio: "3/2",
      },
    ],
  },
]

interface AlbumPageProps {
  params: {
    slug: string
  }
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const [portfolioAlbums, setPortfolioAlbums] = useState<PortfolioAlbum[]>(defaultAlbums)
  const [album, setAlbum] = useState<PortfolioAlbum | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load albums from localStorage on component mount
    const savedAlbums = localStorage.getItem("portfolioAlbums")
    let albumsToUse = defaultAlbums
    if (savedAlbums) {
      try {
        albumsToUse = JSON.parse(savedAlbums)
        if (Array.isArray(albumsToUse) && albumsToUse.length > 0) {
          setPortfolioAlbums(albumsToUse)
        } else {
          // If localStorage data is invalid, fall back to defaults
          albumsToUse = defaultAlbums
          setPortfolioAlbums(defaultAlbums)
        }
      } catch (error) {
        // If localStorage data is corrupted, fall back to defaults
        albumsToUse = defaultAlbums
        setPortfolioAlbums(defaultAlbums)
      }
    }

    // Find the specific album
    const foundAlbum = albumsToUse.find((album) => album.id === params.slug)
    
    setAlbum(foundAlbum || null)
    setIsLoading(false)

    // Listen for storage changes to sync with admin panel updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "portfolioAlbums" && e.newValue) {
        const updatedAlbums = JSON.parse(e.newValue)
        setPortfolioAlbums(updatedAlbums)
        const updatedAlbum = updatedAlbums.find((album: PortfolioAlbum) => album.id === params.slug)
        setAlbum(updatedAlbum || null)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      const savedAlbums = localStorage.getItem("portfolioAlbums")
      if (savedAlbums) {
        const updatedAlbums = JSON.parse(savedAlbums)
        setPortfolioAlbums(updatedAlbums)
        const updatedAlbum = updatedAlbums.find((album: PortfolioAlbum) => album.id === params.slug)
        setAlbum(updatedAlbum || null)
      }
    }

    window.addEventListener("portfolioAlbumsUpdated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("portfolioAlbumsUpdated", handleCustomStorageChange)
    }
  }, [params.slug])

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-xl text-stone-400">Loading album...</p>
        </div>
      </div>
    )
  }

  // Show 404 only after loading is complete and album is still not found
  if (!album) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-700 bg-stone-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/gallery"
                className="flex items-center space-x-2 text-stone-300 hover:text-amber-500 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Gallery</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold">Alex Morgan Photography</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-stone-600 text-stone-300 hover:bg-stone-700">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Album Header */}
      <section className="py-16 px-4 bg-stone-800">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-amber-500 text-sm font-medium uppercase tracking-wider">
                  {album.location} • {album.year}
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-stone-100 leading-tight">
                  {album.title}
                </h1>
                <p className="text-xl text-stone-400 leading-relaxed">{album.description}</p>
              </div>
              <div className="flex items-center space-x-6 text-stone-300">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">{album.images.length}</div>
                  <div className="text-sm">Photographs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">{album.year}</div>
                  <div className="text-sm">Year</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-lg border-4 border-stone-600"
                style={{ aspectRatio: album.aspectRatio || "3/2" }}
              >
                <Image
                  src={album.coverImage}
                  alt={album.description}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Images Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {album.images.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg bg-stone-800 transition-all duration-300 hover:scale-105"
            >
              <div className="relative" style={{ aspectRatio: image.aspectRatio || "3/2" }}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Image overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-lg font-bold text-stone-100 mb-1">{image.title}</h3>
                  <p className="text-sm text-amber-500">{image.location}</p>
                </div>

                {/* Download button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-stone-900/80 backdrop-blur-sm border-stone-600 text-stone-200 hover:bg-stone-800"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation to other albums */}
        <div className="mt-20 border-t border-stone-700 pt-16">
          <h2 className="text-3xl font-bold text-stone-100 mb-8 text-center">Explore More Albums</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioAlbums
              .filter((otherAlbum) => otherAlbum.id !== album.id)
              .slice(0, 3)
              .map((otherAlbum) => (
                <Link
                  key={otherAlbum.id}
                  href={`/album/${otherAlbum.id}`}
                  className="group relative overflow-hidden rounded-lg bg-stone-800 transition-all duration-300 hover:scale-105"
                >
                  <div className="relative" style={{ aspectRatio: otherAlbum.aspectRatio || "3/2" }}>
                    <Image
                      src={otherAlbum.coverImage}
                      alt={otherAlbum.description}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold text-stone-100 mb-1">{otherAlbum.title}</h3>
                      <p className="text-sm text-amber-500">
                        {otherAlbum.location}, {otherAlbum.year}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/gallery">
              <Button className="bg-amber-600 hover:bg-amber-700 text-stone-900 font-semibold">
                View All Albums
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-700 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Camera className="h-5 w-5 text-amber-500" />
              <span className="text-stone-100 font-semibold">Alex Morgan Photography</span>
            </div>
            <p className="text-stone-400 text-sm">
              © {new Date().getFullYear()} All rights reserved. Documenting humanity with respect and dignity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

