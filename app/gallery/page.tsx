"use client"
import Image from "next/image"
import Link from "next/link"
import { Camera, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export default function GalleryPage() {
  const [portfolioAlbums, setPortfolioAlbums] = useState<PortfolioAlbum[]>(defaultAlbums)
  const totalImages = portfolioAlbums.reduce((total, album) => total + album.images.length, 0)

  useEffect(() => {
    // Load albums from localStorage on component mount
    const savedAlbums = localStorage.getItem("portfolioAlbums")
    if (savedAlbums) {
      setPortfolioAlbums(JSON.parse(savedAlbums))
    }

    // Listen for storage changes to sync with admin panel updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "portfolioAlbums" && e.newValue) {
        setPortfolioAlbums(JSON.parse(e.newValue))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      const savedAlbums = localStorage.getItem("portfolioAlbums")
      if (savedAlbums) {
        setPortfolioAlbums(JSON.parse(savedAlbums))
      }
    }

    window.addEventListener("portfolioAlbumsUpdated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("portfolioAlbumsUpdated", handleCustomStorageChange)
    }
  }, [])

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-700 bg-stone-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-stone-300 hover:text-amber-500 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold">Alex Morgan Photography</span>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-stone-100 mb-6">
            Complete <span className="text-amber-500">Portfolio</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto mb-8">
            Explore the complete collection of documentary photography capturing stories of humanity,
            resilience, and hope from around the world.
          </p>
          <div className="flex justify-center space-x-8 text-stone-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{portfolioAlbums.length}</div>
              <div className="text-sm">Albums</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{totalImages}</div>
              <div className="text-sm">Photographs</div>
            </div>
          </div>
        </div>

        {/* Albums Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="group relative overflow-hidden rounded-lg bg-stone-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative" style={{ aspectRatio: album.aspectRatio || "3/2" }}>
                <Image
                  src={album.coverImage}
                  alt={album.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
                
                {/* Photo count badge */}
                <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs text-stone-200 font-medium">{album.images.length} photos</span>
                </div>

                {/* Album info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-0">
                    <h3 className="text-2xl font-bold text-stone-100 mb-2">{album.title}</h3>
                    <p className="text-stone-300 text-sm mb-3 opacity-90">{album.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-amber-500 text-sm font-medium">
                        {album.location}, {album.year}
                      </p>
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-stone-900 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        View Album
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-stone-100 mb-4">Interested in My Work?</h2>
          <p className="text-stone-400 mb-8 max-w-2xl mx-auto">
            Available for assignments, exhibitions, and collaborations. Let's discuss how we can tell important stories together.
          </p>
          <Link href="/#contact">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-stone-900 font-semibold">
              Get in Touch
            </Button>
          </Link>
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

