"use client"
import Image from "next/image"
import Link from "next/link"
import { Camera, ArrowLeft, Download, Share, Copy, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { useState, useEffect, use } from "react"
import LazyImage from "@/components/LazyImage"

// Site content interface
interface SiteContent {
  photographerName: string
  language: string
  // Add other fields as needed
}

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
  params: Promise<{
    slug: string
  }>
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const resolvedParams = use(params)
  const [portfolioAlbums, setPortfolioAlbums] = useState<PortfolioAlbum[]>(defaultAlbums)
  const [album, setAlbum] = useState<PortfolioAlbum | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)
  const [showFullscreen, setShowFullscreen] = useState(false)

  useEffect(() => {
    // Load site content first
    const loadSiteContent = async () => {
      try {
        const response = await fetch('/api/site-content')
        if (response.ok) {
          const content = await response.json()
          setSiteContent(content)
        }
      } catch (error) {
        // Fallback to cached content if available
        const cachedContent = localStorage.getItem("cachedDbContentEn") || localStorage.getItem("cachedDbContentAr")
        if (cachedContent) {
          try {
            setSiteContent(JSON.parse(cachedContent))
          } catch (e) {
            // Use default if all else fails
            setSiteContent({ photographerName: "Abdul Kader Al Bay", language: "en" })
          }
        } else {
          setSiteContent({ photographerName: "Abdul Kader Al Bay", language: "en" })
        }
      }
    }

    loadSiteContent()

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
    const foundAlbum = albumsToUse.find((album) => album.id === resolvedParams.slug)
    
    setAlbum(foundAlbum || null)
    setIsLoading(false)

    // Listen for storage changes to sync with admin panel updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "portfolioAlbums" && e.newValue) {
        const updatedAlbums = JSON.parse(e.newValue)
        setPortfolioAlbums(updatedAlbums)
        const updatedAlbum = updatedAlbums.find((album: PortfolioAlbum) => album.id === resolvedParams.slug)
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
        const updatedAlbum = updatedAlbums.find((album: PortfolioAlbum) => album.id === resolvedParams.slug)
        setAlbum(updatedAlbum || null)
      }
    }

    window.addEventListener("portfolioAlbumsUpdated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("portfolioAlbumsUpdated", handleCustomStorageChange)
    }
  }, [resolvedParams.slug])

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  // Share functions
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const albumTitle = album?.title || 'Photo Album'
  const photographerName = siteContent?.photographerName || "Abdul Kader Al Bay"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOnSocial = (platform: string) => {
    const shareText = `Check out this amazing photo album "${albumTitle}" by ${photographerName} Photography!`
    const encodedUrl = encodeURIComponent(currentUrl)
    const encodedText = encodeURIComponent(shareText)
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Photo Album: ${albumTitle}`)}&body=${encodeURIComponent(`${shareText}\n\nView the album here: ${currentUrl}`)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  // Fullscreen viewer functions
  const openFullscreen = (image: PortfolioImage) => {
    setSelectedImage(image)
    setShowFullscreen(true)
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeFullscreen = () => {
    setShowFullscreen(false)
    setSelectedImage(null)
    document.body.style.overflow = 'unset' // Restore scrolling
  }

  const nextImage = () => {
    if (!selectedImage || !album) return
    const currentIndex = album.images.findIndex(img => img.id === selectedImage.id)
    const nextIndex = (currentIndex + 1) % album.images.length
    setSelectedImage(album.images[nextIndex])
  }

  const previousImage = () => {
    if (!selectedImage || !album) return
    const currentIndex = album.images.findIndex(img => img.id === selectedImage.id)
    const prevIndex = currentIndex === 0 ? album.images.length - 1 : currentIndex - 1
    setSelectedImage(album.images[prevIndex])
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullscreen) return
      
      switch (e.key) {
        case 'Escape':
          closeFullscreen()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'ArrowLeft':
          previousImage()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showFullscreen, selectedImage, album])

  // Download photo function
  const downloadPhoto = async (imageSrc: string, imageTitle: string) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = imageSrc
      
      // Generate filename from image title and current timestamp
      const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
      const sanitizedTitle = imageTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      const filename = `${sanitizedTitle}_${timestamp}.jpg`
      
      link.download = filename
      link.target = '_blank'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success feedback
      const originalText = 'Download'
      const button = document.querySelector(`[data-download="${imageTitle}"]`) as HTMLButtonElement
      if (button) {
        const originalContent = button.innerHTML
        button.innerHTML = '<Check className="h-4 w-4" />'
        button.disabled = true
        button.className = button.className.replace('hover:bg-stone-800', 'bg-green-600')
        
        setTimeout(() => {
          button.innerHTML = originalContent
          button.disabled = false
          button.className = button.className.replace('bg-green-600', 'hover:bg-stone-800')
        }, 2000)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

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
              <span className="text-xl font-bold">{siteContent?.photographerName || "Abdul Kader Al Bay"} Photography</span>
            </div>
            <div className="flex items-center space-x-2 relative share-menu-container">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-stone-600 text-stone-300 hover:bg-stone-700"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-stone-800 border border-stone-600 rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <h3 className="text-stone-100 font-semibold mb-3">Share this album</h3>
                    
                    {/* Copy Link */}
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center space-x-3 p-3 text-stone-300 hover:bg-stone-700 rounded-lg transition-colors mb-2"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                      <span>{copied ? 'Link copied!' : 'Copy link'}</span>
                    </button>
                    
                    {/* Social Media Options */}
                    <div className="space-y-2">
                      <button
                        onClick={() => shareOnSocial('facebook')}
                        className="w-full flex items-center space-x-3 p-3 text-stone-300 hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <Facebook className="h-5 w-5 text-blue-500" />
                        <span>Share on Facebook</span>
                      </button>
                      
                      <button
                        onClick={() => shareOnSocial('twitter')}
                        className="w-full flex items-center space-x-3 p-3 text-stone-300 hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <Twitter className="h-5 w-5 text-blue-400" />
                        <span>Share on Twitter</span>
                      </button>
                      
                      <button
                        onClick={() => shareOnSocial('linkedin')}
                        className="w-full flex items-center space-x-3 p-3 text-stone-300 hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <Linkedin className="h-5 w-5 text-blue-600" />
                        <span>Share on LinkedIn</span>
                      </button>
                      
                      <button
                        onClick={() => shareOnSocial('email')}
                        className="w-full flex items-center space-x-3 p-3 text-stone-300 hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span>Share via Email</span>
                      </button>
                      
                      <button
                        onClick={() => shareOnSocial('whatsapp')}
                        className="w-full flex items-center space-x-3 p-3 text-stone-300 hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="text-center">
                  <Button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share Album
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div
                className="relative overflow-hidden rounded-lg border-4 border-stone-600"
                style={{ aspectRatio: album.aspectRatio || "3/2" }}
              >
                <LazyImage
                  src={album.coverImage}
                  alt={album.description}
                  className="object-cover"
                  aspectRatio={album.aspectRatio || "3/2"}
                  priority={true}
                />
                {/* Download button for cover image */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-stone-900/80 backdrop-blur-sm border-stone-600 text-stone-200 hover:bg-stone-800"
                    onClick={() => downloadPhoto(album.coverImage, `${album.title} - Cover`)}
                    data-download={`${album.title} - Cover`}
                    title={`Download ${album.title} Cover`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
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
              className="group relative overflow-hidden rounded-lg bg-stone-800 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => openFullscreen(image)}
            >
              <div className="relative" style={{ aspectRatio: image.aspectRatio || "3/2" }}>
                <LazyImage
                  src={image.src}
                  alt={image.alt}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  aspectRatio={image.aspectRatio || "3/2"}
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
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening fullscreen when clicking download
                      downloadPhoto(image.src, image.title)
                    }}
                    data-download={image.title}
                    title={`Download ${image.title}`}
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
                    <LazyImage
                      src={otherAlbum.coverImage}
                      alt={otherAlbum.description}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      aspectRatio={otherAlbum.aspectRatio || "3/2"}
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
                              <span className="text-stone-100 font-semibold">{siteContent?.photographerName || "Abdul Kader Al Bay"} Photography</span>
            </div>
            <p className="text-stone-400 text-sm">
              © {new Date().getFullYear()} All rights reserved. Documenting humanity with respect and dignity.
            </p>
          </div>
        </div>
      </footer>

      {/* Fullscreen Image Modal */}
      {showFullscreen && selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 p-2 bg-stone-900/80 rounded-full text-stone-300 hover:text-white transition-colors"
            aria-label="Close fullscreen view"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={previousImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-stone-900/80 rounded-full text-stone-300 hover:text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-stone-900/80 rounded-full text-stone-300 hover:text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>
          </div>

          {/* Image info overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-stone-900/80 backdrop-blur-sm rounded-lg p-4 text-stone-100">
            <h3 className="text-xl font-bold mb-1">{selectedImage.title}</h3>
            <p className="text-amber-500">{selectedImage.location}</p>
            <p className="text-sm text-stone-400 mt-2">
              {album.images.findIndex(img => img.id === selectedImage.id) + 1} of {album.images.length}
            </p>
          </div>

          {/* Download button in fullscreen */}
          <button
            onClick={() => downloadPhoto(selectedImage.src, selectedImage.title)}
            className="absolute top-4 left-4 z-10 p-2 bg-stone-900/80 rounded-full text-stone-300 hover:text-white transition-colors"
            aria-label="Download image"
          >
            <Download className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}

