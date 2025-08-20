"use client"
import Image from "next/image"
import type React from "react"

import Link from "next/link"
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  ArrowUp,
  Settings,
  Plus,
  Trash2,
  Upload,
  X,
  Save,
  User,
  Globe,
  Languages,
  Palette,
  Menu,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface PortfolioImage {
  id: string
  src: string
  alt: string
  title: string
  location: string
  aspectRatio: string // e.g., "3/2", "16/9", "1/1"
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

interface SiteContent {
  // Hero Section
  photographerName: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroImage: string
  heroImageAspectRatio: string // Added for hero image aspect ratio
  experienceYears: string

  // About Section
  aboutTitle: string
  aboutDescription: string[]
  stats: {
    countries: string
    publications: string
    awards: string
  }
  aboutImage: string
  aboutImageAspectRatio: string // Added for about image aspect ratio

  // Contact Section
  contactTitle: string
  contactDescription: string
  email: string
  phone: string
  location: string

  // Social Links
  instagramUrl: string
  twitterUrl: string

  // Portfolio Section
  portfolioTitle: string
  portfolioDescription: string

  // Navigation
  navHome: string
  navPortfolio: string
  navAbout: string
  navContact: string

  // Buttons
  btnViewPortfolio: string
  btnGetInTouch: string
  btnViewFullGallery: string

  // Labels
  labelCountries: string
  labelPublications: string
  labelAwards: string
  labelExperience: string
  labelEmail: string
  labelPhone: string
  labelBasedIn: string
}

interface ThemeColors {
  primary: string // rgb(R, G, B) string
  primaryHover: string // rgb(R, G, B) string
  primaryText: string // rgb(R, G, B) string (black or white)
  name: string
}

type Language = "en" | "ar"

// Utility function to calculate contrast text color (black or white)
const getContrastTextColor = (rgb: string): string => {
  const parts = rgb.match(/\d+/g)?.map(Number)
  if (!parts || parts.length < 3) return "rgb(255, 255, 255)" // Default to white if invalid

  const [r, g, b] = parts
  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "rgb(41, 37, 36)" : "rgb(255, 255, 255)" // Return stone-900 for light, white for dark
}

// Utility function to get a slightly darker/lighter hover color
const getHoverColor = (rgb: string): string => {
  const parts = rgb.match(/\d+/g)?.map(Number)
  if (!parts || parts.length < 3) return rgb // Return original if invalid

  const [r, g, b] = parts
  const darkenAmount = 20 // Adjust this value to control darkness

  const newR = Math.max(0, r - darkenAmount)
  const newG = Math.max(0, g - darkenAmount)
  const newB = Math.max(0, b - darkenAmount)

  return `rgb(${newR}, ${newG}, ${newB})`
}

export default function PhotographerPortfolio() {
  const defaultAlbums: PortfolioAlbum[] = [
    // No default albums - load from database or allow user to create new ones
  ]

  const defaultContentEn: SiteContent = {
    photographerName: "Your Name",
    heroTitle: "Your",
    heroSubtitle: "Photography",
    heroDescription:
      "Tell your story here. Edit this content in the admin dashboard to personalize your portfolio.",
    heroImage: "/placeholder.svg?height=800&width=640",
    heroImageAspectRatio: "4/5",
    experienceYears: "0+",

    aboutTitle: "About My Work",
    aboutDescription: [
      "This is your about section. Edit this content in the admin dashboard to tell your unique story.",
      "You can have multiple paragraphs to describe your journey, vision, and photographic style.",
      "Use the admin panel to customize all content to reflect your personal brand and message.",
    ],
    stats: {
      countries: "0",
      publications: "0",
      awards: "0",
    },
    aboutImage: "/placeholder.svg?height=800&width=640",
    aboutImageAspectRatio: "4/5",

    contactTitle: "Let's Work Together",
    contactDescription:
      "Edit your contact information and message in the admin dashboard.",
    email: "your.email@example.com",
    phone: "+1 (000) 000-0000",
    location: "Your City, Your Country",

    instagramUrl: "#",
    twitterUrl: "#",

    portfolioTitle: "Portfolio",
    portfolioDescription:
      "Your portfolio description goes here. Customize it in the admin dashboard.",

    navHome: "Home",
    navPortfolio: "Portfolio",
    navAbout: "About",
    navContact: "Contact",

    btnViewPortfolio: "View Portfolio",
    btnGetInTouch: "Get in Touch",
    btnViewFullGallery: "View Full Gallery",

    labelCountries: "Countries",
    labelPublications: "Publications",
    labelAwards: "Awards",
    labelExperience: "Experience",
    labelEmail: "Email",
    labelPhone: "Phone",
    labelBasedIn: "Based in",
  }

  const defaultContentAr: SiteContent = {
    photographerName: "اسمك هنا",
    heroTitle: "التصوير",
    heroSubtitle: "الفوتوغرافي",
    heroDescription:
      "أخبر قصتك هنا. قم بتحرير هذا المحتوى في لوحة الإدارة لتخصيص معرضك الشخصي.",
    heroImage: "/placeholder.svg?height=800&width=640",
    heroImageAspectRatio: "4/5",
    experienceYears: "0+",

    aboutTitle: "عن عملي",
    aboutDescription: [
      "لأكثر من خمسة عشر عامًا، كرست حياتي لتوثيق الحالة الإنسانية في بعض أصعب البيئات في العالم. يركز عملي على مناطق الصراع والأزمات الإنسانية والمرونة الرائعة للأشخاص الذين يواجهون الشدائد.",
      "من خلال عدستي، أسعى لإعطاء صوت لمن لا صوت لهم ولفت الانتباه إلى القصص التي قد تبقى غير مروية. كل صورة هي شاهد على القوة والكرامة والأمل الذي يستمر حتى في أحلك الأوقات.",
      "تم عرض أعمالي في منشورات رئيسية حول العالم وساهمت في زيادة الوعي بالقضايا الإنسانية عبر الكرة الأرضية.",
    ],
    stats: {
      countries: "0",
      publications: "0",
      awards: "0",
    },
    aboutImage: "/placeholder.svg?height=800&width=640",
    aboutImageAspectRatio: "4/5",

    contactTitle: "لنعمل معًا",
    contactDescription: "متاح للمهام والمعارض والتعاون. دعونا نناقش كيف يمكننا سرد القصص المهمة معًا.",
    email: "your.email@example.com",
    phone: "+1 (555) 123-4567",
    location: "نيويورك، نيويورك",

    instagramUrl: "#",
    twitterUrl: "#",

    portfolioTitle: "المعرض",
    portfolioDescription:
      "مجموعة من القصص من خطوط المواجهة للتجربة الإنسانية، توثق الظلام والنور في إنسانيتنا المشتركة.",

    navHome: "الرئيسية",
    navPortfolio: "المعرض",
    navAbout: "عني",
    navContact: "التواصل",

    btnViewPortfolio: "عرض المعرض",
    btnGetInTouch: "تواصل معي",
    btnViewFullGallery: "عرض المعرض الكامل",

    labelCountries: "دولة",
    labelPublications: "منشور",
    labelAwards: "جائزة",
    labelExperience: "خبرة",
    labelEmail: "البريد الإلكتروني",
    labelPhone: "الهاتف",
    labelBasedIn: "مقيم في",
  }

  // Predefined theme colors
  const themeOptions: ThemeColors[] = [
    {
      name: "Amber (Default)",
      primary: "rgb(217, 119, 6)", // amber-600
      primaryHover: "rgb(180, 83, 9)", // amber-700
      primaryText: "rgb(41, 37, 36)", // stone-900
    },
    {
      name: "Emerald",
      primary: "rgb(5, 150, 105)", // emerald-600
      primaryHover: "rgb(4, 120, 87)", // emerald-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Blue",
      primary: "rgb(37, 99, 235)", // blue-600
      primaryHover: "rgb(29, 78, 216)", // blue-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Red",
      primary: "rgb(220, 38, 38)", // red-600
      primaryHover: "rgb(185, 28, 28)", // red-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Purple",
      primary: "rgb(147, 51, 234)", // purple-600
      primaryHover: "rgb(126, 34, 206)", // purple-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Orange",
      primary: "rgb(234, 88, 12)", // orange-600
      primaryHover: "rgb(194, 65, 12)", // orange-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Teal",
      primary: "rgb(13, 148, 136)", // teal-600
      primaryHover: "rgb(15, 118, 110)", // teal-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Pink",
      primary: "rgb(219, 39, 119)", // pink-600
      primaryHover: "rgb(190, 24, 93)", // pink-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Indigo",
      primary: "rgb(79, 70, 229)", // indigo-600
      primaryHover: "rgb(67, 56, 202)", // indigo-700
      primaryText: "rgb(255, 255, 255)", // white
    },
    {
      name: "Rose Gold",
      primary: "rgb(244, 63, 94)", // rose-500
      primaryHover: "rgb(225, 29, 72)", // rose-600
      primaryText: "rgb(255, 255, 255)", // white
    },
  ]

  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")
  const [portfolioAlbums, setPortfolioAlbums] = useState<PortfolioAlbum[]>(defaultAlbums)
  const [siteContentEn, setSiteContentEn] = useState<SiteContent>(defaultContentEn)
  const [siteContentAr, setSiteContentAr] = useState<SiteContent>(defaultContentAr)
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const [isDbContentLoaded, setIsDbContentLoaded] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(themeOptions[0])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [editingContentEn, setEditingContentEn] = useState<SiteContent>(defaultContentEn)
  const [editingContentAr, setEditingContentAr] = useState<SiteContent>(defaultContentAr)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Album management states
  const [editingAlbum, setEditingAlbum] = useState<PortfolioAlbum | null>(null)
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [isCreatingNewAlbum, setIsCreatingNewAlbum] = useState(false)

  // States for custom RGB input
  const [customPrimaryR, setCustomPrimaryR] = useState(217)
  const [customPrimaryG, setCustomPrimaryG] = useState(119)
  const [customPrimaryB, setCustomPrimaryB] = useState(6)

  // Get current content based on language - only return content if we're ready to show it
  const siteContent = isContentLoaded ? (currentLanguage === "en" ? siteContentEn : siteContentAr) : null
  const editingContent = currentLanguage === "en" ? editingContentEn : editingContentAr
  const setEditingContent = currentLanguage === "en" ? setEditingContentEn : setEditingContentAr

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Load albums from database first, then fallback to localStorage
    const loadAlbums = async () => {
      try {
        const response = await fetch('/api/albums')
        if (response.ok) {
          const albumsFromDB = await response.json()
          if (albumsFromDB.length > 0) {
            setPortfolioAlbums(albumsFromDB)
            return // Don't load from localStorage if we have database data
          }
        }
      } catch (error) {
        // Silent error handling for production
      }

      // Fallback to localStorage only if no database albums
      const savedAlbums = localStorage.getItem("portfolioAlbums")
      if (savedAlbums) {
        setPortfolioAlbums(JSON.parse(savedAlbums))
      }
    }

    // Load site content from database with better error handling
    const loadSiteContent = async () => {
      try {
        const response = await fetch('/api/site-content', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        if (response.ok) {
          const contentFromDB = await response.json()
          
          // Set the content based on language and cache it for next time
          if (contentFromDB.language === 'en') {
            setSiteContentEn(contentFromDB)
            setEditingContentEn(contentFromDB)
            localStorage.setItem("cachedDbContentEn", JSON.stringify(contentFromDB))
            localStorage.setItem("cachedDbContentEn_timestamp", Date.now().toString())
          } else if (contentFromDB.language === 'ar') {
            setSiteContentAr(contentFromDB)
            setEditingContentAr(contentFromDB)
            localStorage.setItem("cachedDbContentAr", JSON.stringify(contentFromDB))
            localStorage.setItem("cachedDbContentAr_timestamp", Date.now().toString())
          }
          setIsDbContentLoaded(true)
          
          // If this is the first load (no cached content), mark as ready now
          if (!isContentLoaded) {
            setIsContentLoaded(true)
          }
          
          return true // Successfully loaded from database
        } else {
          // Don't overwrite existing content with defaults on API failure
          return false
        }
      } catch (error) {
        // DON'T revert to defaults - keep whatever content we have
        return false
      }
    }

    const initializeData = async () => {
      // Load other settings from localStorage first (fast)
      const savedLanguage = localStorage.getItem("currentLanguage") as Language
      const savedTheme = localStorage.getItem("currentTheme")
      
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
      if (savedTheme) {
        const loadedTheme: ThemeColors = JSON.parse(savedTheme)
        setCurrentTheme(loadedTheme)
        const parts = loadedTheme.primary.match(/\d+/g)?.map(Number)
        if (parts && parts.length === 3) {
          setCustomPrimaryR(parts[0])
          setCustomPrimaryG(parts[1])
          setCustomPrimaryB(parts[2])
        }
      }
      
      // Check for cached database content first (INSTANT) - with validation
      const cachedContentEn = localStorage.getItem("cachedDbContentEn")
      const cachedContentAr = localStorage.getItem("cachedDbContentAr")
      const cacheTimestampEn = localStorage.getItem("cachedDbContentEn_timestamp")
      const cacheTimestampAr = localStorage.getItem("cachedDbContentAr_timestamp")
      
      // Validate cache is not too old (24 hours max)
      const isCacheValid = (timestamp: string | null) => {
        if (!timestamp) return false
        const cacheAge = Date.now() - parseInt(timestamp)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        return cacheAge < maxAge
      }
      
      if (cachedContentEn && isCacheValid(cacheTimestampEn)) {
        try {
          const parsed = JSON.parse(cachedContentEn)
          // Additional validation - make sure it's real content, not defaults
          if (parsed.photographerName && parsed.photographerName !== "Your Name") {
            setSiteContentEn(parsed)
            setEditingContentEn(parsed)
            setIsDbContentLoaded(true)
            setIsContentLoaded(true)
          } else {
            localStorage.removeItem("cachedDbContentEn")
            localStorage.removeItem("cachedDbContentEn_timestamp")
          }
        } catch (error) {
          localStorage.removeItem("cachedDbContentEn")
          localStorage.removeItem("cachedDbContentEn_timestamp")
        }
      } else {
        if (cachedContentEn && !isCacheValid(cacheTimestampEn)) {
          localStorage.removeItem("cachedDbContentEn")
          localStorage.removeItem("cachedDbContentEn_timestamp")
        }
      }
      
      if (cachedContentAr && isCacheValid(cacheTimestampAr)) {
        try {
          const parsed = JSON.parse(cachedContentAr)
          if (parsed.photographerName && parsed.photographerName !== "اسمك هنا") {
            setSiteContentAr(parsed)
            setEditingContentAr(parsed)
          } else {
            localStorage.removeItem("cachedDbContentAr")
            localStorage.removeItem("cachedDbContentAr_timestamp")
          }
        } catch (error) {
          localStorage.removeItem("cachedDbContentAr")
          localStorage.removeItem("cachedDbContentAr_timestamp")
        }
      }
      
      // Load fresh database content in background to update cache
      loadAlbums()
      loadSiteContent()
    }

    initializeData()
  }, [])

  useEffect(() => {
    // Save albums to localStorage whenever portfolioAlbums changes
    localStorage.setItem("portfolioAlbums", JSON.stringify(portfolioAlbums))
    
    // Dispatch custom event to notify other pages/components of the change
    window.dispatchEvent(new CustomEvent("portfolioAlbumsUpdated"))
  }, [portfolioAlbums])

  useEffect(() => {
    // Only save to localStorage if content isn't database-driven
    // We'll let database be the source of truth for saved content
    localStorage.setItem("currentLanguage", currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    // Save theme to localStorage and apply CSS variables
    localStorage.setItem("currentTheme", JSON.stringify(currentTheme))

    // Apply theme colors as CSS custom properties
    document.documentElement.style.setProperty("--theme-primary", currentTheme.primary)
    document.documentElement.style.setProperty("--theme-primary-hover", currentTheme.primaryHover)
    document.documentElement.style.setProperty("--theme-primary-text", currentTheme.primaryText)
  }, [currentTheme])

  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === "en" ? "ar" : "en"))
  }

  const changeTheme = (theme: ThemeColors) => {
    setCurrentTheme(theme)
    const parts = theme.primary.match(/\d+/g)?.map(Number)
    if (parts && parts.length === 3) {
      setCustomPrimaryR(parts[0])
      setCustomPrimaryG(parts[1])
      setCustomPrimaryB(parts[2])
    }
  }

  const handleCustomColorChange = useCallback(() => {
    const newPrimary = `rgb(${customPrimaryR}, ${customPrimaryG}, ${customPrimaryB})`
    setCurrentTheme({
      name: "Custom Color",
      primary: newPrimary,
      primaryHover: getHoverColor(newPrimary),
      primaryText: getContrastTextColor(newPrimary),
    })
  }, [customPrimaryR, customPrimaryG, customPrimaryB])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navHeight = 80
      const elementPosition = element.offsetTop - navHeight
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
    }
  }

  const handleMobileLinkClick = (sectionId: string) => {
    scrollToSection(sectionId)
    setMobileMenuOpen(false) // Close the mobile menu after clicking a link
  }

  const handleAdminLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: adminPassword,
        }),
      })

      if (response.ok) {
        setIsAdminAuthenticated(true)
        setAdminPassword("")
        alert("Login successful!")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Login failed")
      }
    } catch (error) {
      // Silent error handling for production
      alert("Login failed - please try again")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteContent) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditingContent((prev) => ({
          ...prev,
          [field]: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const saveContentChanges = async () => {
    try {
      const contentToSave = currentLanguage === "en" ? editingContentEn : editingContentAr
      
      const response = await fetch('/api/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contentToSave,
          language: currentLanguage,
        }),
      })

      if (response.ok) {
        const savedContent = await response.json()
        
        if (currentLanguage === "en") {
          setSiteContentEn(savedContent)
          // Update cache immediately
          localStorage.setItem("cachedDbContentEn", JSON.stringify(savedContent))
        } else {
          setSiteContentAr(savedContent)
          // Update cache immediately
          localStorage.setItem("cachedDbContentAr", JSON.stringify(savedContent))
        }
        
        alert("Content saved to database successfully!")
      } else {
        throw new Error("Failed to save content")
      }
    } catch (error) {
      // Silent error handling for production
      
      // Fallback to local storage update
      if (currentLanguage === "en") {
        setSiteContentEn(editingContentEn)
      } else {
        setSiteContentAr(editingContentAr)
      }
      
      alert("Content updated locally (database save failed)")
    }
  }

  const resetToDefault = () => {
    setPortfolioAlbums(defaultAlbums)
    setSiteContentEn(defaultContentEn)
    setSiteContentAr(defaultContentAr)
    setEditingContentEn(defaultContentEn)
    setEditingContentAr(defaultContentAr)
    setCurrentTheme(themeOptions[0])
    setCustomPrimaryR(217)
    setCustomPrimaryG(119)
    setCustomPrimaryB(6)
    
    // Clear all cached data (both old and new cache keys)
    localStorage.removeItem("portfolioAlbums")
    localStorage.removeItem("siteContentEn") // old cache
    localStorage.removeItem("siteContentAr") // old cache
    localStorage.removeItem("cachedDbContentEn") // new cache
    localStorage.removeItem("cachedDbContentAr") // new cache
    localStorage.removeItem("currentTheme")
    
    // Reset database content loaded flag
    setIsDbContentLoaded(false)
    setIsContentLoaded(false) // Force reload
    
    alert("Website reset to default settings!")
  }

  // Album management functions
  const handleEditAlbum = (album: PortfolioAlbum) => {
    setEditingAlbum({ ...album })
    setIsCreatingNewAlbum(false)
    setShowAlbumModal(true)
  }

  const handleCreateNewAlbum = () => {
    const newAlbum: PortfolioAlbum = {
      id: `album-${Date.now()}`,
      title: "New Album",
      description: "Album description",
      coverImage: "/placeholder.svg?height=400&width=600",
      location: "Location",
      year: new Date().getFullYear().toString(),
      aspectRatio: "3/2",
      images: []
    }
    setEditingAlbum(newAlbum)
    setIsCreatingNewAlbum(true)
    setShowAlbumModal(true)
  }

  const handleDeleteAlbum = async (albumId: string) => {
    if (confirm("Are you sure you want to delete this album? This action cannot be undone.")) {
      try {
        // Delete from database first
        const response = await fetch(`/api/albums/${albumId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove from local state only if database deletion succeeded
          setPortfolioAlbums(prev => prev.filter(album => album.id !== albumId))
          alert("Album deleted successfully!")
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete album")
        }
      } catch (error) {
        // Silent error handling for production
        alert("Failed to delete album from database. Please try again.")
      }
    }
  }

  const handleSaveAlbum = async () => {
    if (!editingAlbum) return

    try {
      if (isCreatingNewAlbum) {
        // Create new album in database
        const response = await fetch('/api/albums', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editingAlbum.title,
            description: editingAlbum.description,
            coverImage: editingAlbum.coverImage,
            location: editingAlbum.location,
            year: editingAlbum.year,
            aspectRatio: editingAlbum.aspectRatio,
            images: editingAlbum.images,
          }),
        })

        if (response.ok) {
          const newAlbum = await response.json()
          setPortfolioAlbums(prev => [...prev, newAlbum])
          alert("Album created and saved to database!")
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create album")
        }
      } else {
        // Update existing album in database
        const response = await fetch(`/api/albums/${editingAlbum.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editingAlbum.title,
            description: editingAlbum.description,
            coverImage: editingAlbum.coverImage,
            location: editingAlbum.location,
            year: editingAlbum.year,
            aspectRatio: editingAlbum.aspectRatio,
            images: editingAlbum.images,
          }),
        })

        if (response.ok) {
          const updatedAlbum = await response.json()
          setPortfolioAlbums(prev => prev.map(album => 
            album.id === editingAlbum.id ? updatedAlbum : album
          ))
          alert("Album updated and saved to database!")
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update album")
        }
      }

      setShowAlbumModal(false)
      setEditingAlbum(null)
      setIsCreatingNewAlbum(false)
    } catch (error) {
      console.error('Album save error:', error)
      alert(`Failed to save album: ${error.message}`)
    }
  }

  const handleAlbumImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'newPhoto') => {
    const file = e.target.files?.[0]
    if (file && editingAlbum) {
      try {
        // Convert file to base64
        const reader = new FileReader()
        reader.onload = async (e) => {
          const imageData = e.target?.result as string
          
          if (field === 'coverImage') {
            // For cover image, just update locally for now
            setEditingAlbum(prev => prev ? { ...prev, coverImage: imageData } : null)
          } else if (field === 'newPhoto') {
            // For new photos, upload to server if album exists in database
            if (!isCreatingNewAlbum && editingAlbum.id) {
              try {
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    imageData: imageData,
                    filename: file.name,
                    albumId: editingAlbum.id
                  }),
                })

                if (response.ok) {
                  const uploadedImage = await response.json()
                  const newPhoto: PortfolioImage = {
                    id: uploadedImage.id.toString(),
                    src: uploadedImage.src,
                    alt: uploadedImage.alt,
                    title: uploadedImage.title,
                    location: uploadedImage.location,
                    aspectRatio: uploadedImage.aspectRatio
                  }
                  setEditingAlbum(prev => prev ? {
                    ...prev,
                    images: [...prev.images, newPhoto]
                  } : null)
                  alert("Photo uploaded and saved to database!")
                } else {
                  throw new Error("Failed to upload photo")
                }
              } catch (error) {
                // Fallback to local storage if upload fails
                const newPhoto: PortfolioImage = {
                  id: `photo-${Date.now()}`,
                  src: imageData,
                  alt: `Photo from ${editingAlbum.title}`,
                  title: `${editingAlbum.title} Photo`,
                  location: `${editingAlbum.location}, ${editingAlbum.year}`,
                  aspectRatio: editingAlbum.aspectRatio
                }
                setEditingAlbum(prev => prev ? {
                  ...prev,
                  images: [...prev.images, newPhoto]
                } : null)
                alert("Photo saved locally (upload failed)")
              }
            } else {
              // For new albums, save locally until album is created
              const newPhoto: PortfolioImage = {
                id: `photo-${Date.now()}`,
                src: imageData,
                alt: `Photo from ${editingAlbum.title}`,
                title: `${editingAlbum.title} Photo`,
                location: `${editingAlbum.location}, ${editingAlbum.year}`,
                aspectRatio: editingAlbum.aspectRatio
              }
              setEditingAlbum(prev => prev ? {
                ...prev,
                images: [...prev.images, newPhoto]
              } : null)
            }
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        alert("Failed to process image. Please try again.")
      }
    }
  }

  const handleDeletePhoto = (photoId: string) => {
    if (!editingAlbum) return
    
    setEditingAlbum(prev => prev ? {
      ...prev,
      images: prev.images.filter(photo => photo.id !== photoId)
    } : null)
  }

  // Skeleton loader component
  const SkeletonText = ({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) => (
    <div className={`${width} ${height} bg-stone-700 animate-pulse rounded`}></div>
  )

  const SkeletonLoader = () => (
    <div className={`min-h-screen bg-stone-900 text-stone-100 ${currentLanguage === "ar" ? "rtl" : "ltr"}`}>
      {/* Navigation Skeleton */}
      <nav className="fixed top-0 w-full bg-stone-900/95 backdrop-blur-sm border-b border-stone-700 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6 text-stone-500" />
              <SkeletonText width="w-32" height="h-6" />
            </div>
            <div className="hidden md:flex space-x-8">
              <SkeletonText width="w-16" height="h-5" />
              <SkeletonText width="w-20" height="h-5" />
              <SkeletonText width="w-16" height="h-5" />
              <SkeletonText width="w-18" height="h-5" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <section className="pt-24 md:pt-32 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="space-y-8">
              <div className="space-y-4">
                <SkeletonText width="w-24" height="h-6" />
                <SkeletonText width="w-48" height="h-16" />
                <div className="space-y-2">
                  <SkeletonText width="w-full" height="h-4" />
                  <SkeletonText width="w-4/5" height="h-4" />
                  <SkeletonText width="w-3/4" height="h-4" />
                </div>
              </div>
              <div className="flex space-x-4">
                <SkeletonText width="w-32" height="h-12" />
                <SkeletonText width="w-28" height="h-12" />
              </div>
            </div>
            <div className="relative">
              <SkeletonText width="w-full" height="h-96" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-16 bg-stone-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <SkeletonText width="w-16 mx-auto" height="h-8" />
                <SkeletonText width="w-20 mx-auto" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section Skeleton */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SkeletonText width="w-40" height="h-8" />
              <div className="space-y-4">
                <SkeletonText width="w-full" height="h-4" />
                <SkeletonText width="w-full" height="h-4" />
                <SkeletonText width="w-4/5" height="h-4" />
                <SkeletonText width="w-full" height="h-4" />
                <SkeletonText width="w-3/4" height="h-4" />
              </div>
            </div>
            <div className="relative">
              <SkeletonText width="w-full" height="h-96" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  // Show skeleton loader if content is not ready yet
  if (!siteContent) {
    return <SkeletonLoader />
  }

  return (
    <div className={`min-h-screen bg-stone-900 text-stone-100 ${currentLanguage === "ar" ? "rtl" : "ltr"}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-stone-900/95 backdrop-blur-sm border-b border-stone-700 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6" style={{ color: "var(--theme-primary)" }} />
              <span className="text-xl font-bold text-stone-100">{siteContent.photographerName}</span>
            </div>
            <div className="flex items-center space-x-8">
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-8">
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-stone-300 transition-colors hover:text-[var(--theme-primary)]"
                >
                  {siteContent.navHome}
                </button>
                <button
                  onClick={() => scrollToSection("portfolio")}
                  className="text-stone-300 transition-colors hover:text-[var(--theme-primary)]"
                >
                  {siteContent.navPortfolio}
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-stone-300 transition-colors hover:text-[var(--theme-primary)]"
                >
                  {siteContent.navAbout}
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-stone-300 transition-colors hover:text-[var(--theme-primary)]"
                >
                  {siteContent.navContact}
                </button>
              </div>
              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
                aria-label="Toggle Language"
              >
                <Languages className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                <span className="text-stone-100 text-sm font-medium">
                  {currentLanguage === "en" ? "العربية" : "English"}
                </span>
              </button>
              {/* Mobile Hamburger Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-stone-300 hover:bg-stone-700"
                    aria-label="Open mobile menu"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side={currentLanguage === "ar" ? "right" : "left"}
                  className="bg-stone-900 text-stone-100 w-64"
                >
                  <div className="flex flex-col items-start space-y-6 pt-8">
                    <button
                      onClick={() => handleMobileLinkClick("home")}
                      className="text-2xl font-bold text-stone-100 hover:text-[var(--theme-primary)] transition-colors w-full text-left"
                    >
                      {siteContent.navHome}
                    </button>
                    <button
                      onClick={() => handleMobileLinkClick("portfolio")}
                      className="text-2xl font-bold text-stone-100 hover:text-[var(--theme-primary)] transition-colors w-full text-left"
                    >
                      {siteContent.navPortfolio}
                    </button>
                    <button
                      onClick={() => handleMobileLinkClick("about")}
                      className="text-2xl font-bold text-stone-100 hover:text-[var(--theme-primary)] transition-colors w-full text-left"
                    >
                      {siteContent.navAbout}
                    </button>
                    <button
                      onClick={() => handleMobileLinkClick("contact")}
                      className="text-2xl font-bold text-stone-100 hover:text-[var(--theme-primary)] transition-colors w-full text-left"
                    >
                      {siteContent.navContact}
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 md:pt-32 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-stone-100 leading-tight">
                  {siteContent.heroTitle}
                  <span className="block" style={{ color: "var(--theme-primary)" }}>
                    {siteContent.heroSubtitle}
                  </span>
                </h1>
                <p className="text-xl text-stone-400 leading-relaxed">{siteContent.heroDescription}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="font-semibold transition-colors"
                  style={{
                    backgroundColor: "var(--theme-primary)",
                    color: "var(--theme-primary-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--theme-primary-hover)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--theme-primary)"
                  }}
                  onClick={() => scrollToSection("portfolio")}
                >
                  {siteContent.btnViewPortfolio}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-stone-100 bg-transparent"
                  onClick={() => scrollToSection("contact")}
                >
                  {siteContent.btnGetInTouch}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-lg border-4 border-stone-700"
                style={{ aspectRatio: siteContent.heroImageAspectRatio || "4/5" }}
              >
                <Image
                  src={siteContent.heroImage || "/placeholder.svg"}
                  alt={`${siteContent.photographerName} - Documentary Photographer`}
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute -bottom-6 -right-6 p-4 rounded-lg"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "var(--theme-primary-text)",
                }}
              >
                <p className="font-bold text-sm">
                  {siteContent.experienceYears} {currentLanguage === "ar" ? "سنة" : "Years"}
                </p>
                <p className="text-xs">{siteContent.labelExperience}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 px-4 bg-stone-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-100 mb-4">{siteContent.portfolioTitle}</h2>
            <p className="text-xl text-stone-400 max-w-3xl mx-auto">{siteContent.portfolioDescription}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioAlbums.map((album, index) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group relative overflow-hidden rounded-lg bg-stone-700 cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <div className="relative" style={{ aspectRatio: album.aspectRatio || "3/2" }}>
                  <Image
                    src={album.coverImage || "/placeholder.svg"}
                    alt={album.description}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-stone-900/70 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs text-stone-300">{album.images.length} photos</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold text-stone-100 mb-2">{album.title}</h3>
                  <p className="text-sm text-stone-300 mb-2">{album.description}</p>
                  <p className="text-sm" style={{ color: "var(--theme-primary)" }}>
                    {album.location}, {album.year}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button size="lg" className="bg-stone-700 hover:bg-stone-600 text-stone-100 border border-stone-600">
                {siteContent.btnViewFullGallery}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-stone-100">{siteContent.aboutTitle}</h2>
              <div className="space-y-4 text-stone-400 leading-relaxed">
                {siteContent.aboutDescription.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: "var(--theme-primary)" }}>
                    {siteContent.stats.countries}
                  </div>
                  <div className="text-sm text-stone-400">{siteContent.labelCountries}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: "var(--theme-primary)" }}>
                    {siteContent.stats.publications}
                  </div>
                  <div className="text-sm text-stone-400">{siteContent.labelPublications}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: "var(--theme-primary)" }}>
                    {siteContent.stats.awards}
                  </div>
                  <div className="text-sm text-stone-400">{siteContent.labelAwards}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: siteContent.aboutImageAspectRatio || "4/5" }}
              >
                <Image
                  src={siteContent.aboutImage || "/placeholder.svg"}
                  alt="Photographer at work in the field"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-stone-800">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-100 mb-8">{siteContent.contactTitle}</h2>
            <p className="text-xl text-stone-400 mb-12 max-w-2xl mx-auto">{siteContent.contactDescription}</p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  <Mail className="h-6 w-6" style={{ color: "var(--theme-primary-text)" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-100">{siteContent.labelEmail}</h3>
                  <p className="text-stone-400">{siteContent.email}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  <Phone className="h-6 w-6" style={{ color: "var(--theme-primary-text)" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-100">{siteContent.labelPhone}</h3>
                  <p className="text-stone-400">{siteContent.phone}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  <MapPin className="h-6 w-6" style={{ color: "var(--theme-primary-text)" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-100">{siteContent.labelBasedIn}</h3>
                  <p className="text-stone-400">{siteContent.location}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-6">
              <Link
                href={siteContent.instagramUrl}
                className="w-12 h-12 bg-stone-700 rounded-full flex items-center justify-center transition-colors group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-primary)"
                  const icon = e.currentTarget.querySelector("svg")
                  if (icon) icon.style.color = "var(--theme-primary-text)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgb(68, 64, 60)"
                  const icon = e.currentTarget.querySelector("svg")
                  if (icon) icon.style.color = "rgb(214, 211, 209)"
                }}
              >
                <Instagram className="h-6 w-6 text-stone-300 transition-colors" />
              </Link>
              <Link
                href={siteContent.twitterUrl}
                className="w-12 h-12 bg-stone-700 rounded-full flex items-center justify-center transition-colors group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-primary)"
                  const icon = e.currentTarget.querySelector("svg")
                  if (icon) icon.style.color = "var(--theme-primary-text)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgb(68, 64, 60)"
                  const icon = e.currentTarget.querySelector("svg")
                  if (icon) icon.style.color = "rgb(214, 211, 209)"
                }}
              >
                <Twitter className="h-6 w-6 text-stone-300 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel Button */}
      <button
        onClick={() => setShowAdminPanel(true)}
        className="fixed bottom-8 left-8 w-12 h-12 bg-stone-700 hover:bg-stone-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-40"
        aria-label="Admin Panel"
      >
        <Settings className="h-6 w-6" style={{ color: "var(--theme-primary)" }} />
      </button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-40"
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "var(--theme-primary-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-primary-hover)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-primary)"
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-100">Complete Website Admin Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-stone-300">
                  <Languages className="h-4 w-4" />
                  <span className="text-sm">Editing: {currentLanguage === "en" ? "English" : "Arabic"}</span>
                </div>
                <button
                  onClick={() => {
                    setShowAdminPanel(false)
                    setIsAdminAuthenticated(false)
                    setAdminPassword("")
                  }}
                  className="text-stone-400 hover:text-stone-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {!isAdminAuthenticated ? (
              <div className="p-6">
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-stone-300">
                      Admin Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="bg-stone-700 border-stone-600 text-stone-100"
                      placeholder="Enter admin password"
                      onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                    />
                  </div>
                  <Button
                    onClick={handleAdminLogin}
                    className="w-full font-semibold"
                    style={{
                      backgroundColor: "var(--theme-primary)",
                      color: "var(--theme-primary-text)",
                    }}
                  >
                    Login
                  </Button>

                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-6 flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setCurrentLanguage("en")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentLanguage === "en" ? "text-stone-900" : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }`}
                    style={
                      currentLanguage === "en"
                        ? { backgroundColor: "var(--theme-primary)", color: "var(--theme-primary-text)" }
                        : {}
                    }
                  >
                    Edit English Content
                  </button>
                  <button
                    onClick={() => setCurrentLanguage("ar")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentLanguage === "ar" ? "text-stone-900" : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }`}
                    style={
                      currentLanguage === "ar"
                        ? { backgroundColor: "var(--theme-primary)", color: "var(--theme-primary-text)" }
                        : {}
                    }
                  >
                    تحرير المحتوى العربي
                  </button>
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-stone-700">
                    <TabsTrigger
                      value="content"
                      className="data-[state=active]:text-stone-900"
                      style={{
                        "--theme-active-bg": "var(--theme-primary)",
                        "--theme-active-color": "var(--theme-primary-text)",
                      } as React.CSSProperties}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger
                      value="portfolio"
                      className="data-[state=active]:text-stone-900"
                      style={{
                        "--theme-active-bg": "var(--theme-primary)",
                        "--theme-active-color": "var(--theme-primary-text)",
                      } as React.CSSProperties}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Portfolio
                    </TabsTrigger>
                    <TabsTrigger
                      value="theme"
                      className="data-[state=active]:text-stone-900"
                      style={{
                        "--theme-active-bg": "var(--theme-primary)",
                        "--theme-active-color": "var(--theme-primary-text)",
                      } as React.CSSProperties}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Theme
                    </TabsTrigger>
                    <TabsTrigger
                      value="profile"
                      className="data-[state=active]:text-stone-900"
                      style={{
                        "--theme-active-bg": "var(--theme-primary)",
                        "--theme-active-color": "var(--theme-primary-text)",
                      } as React.CSSProperties}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:text-stone-900"
                      style={{
                        "--theme-active-bg": "var(--theme-primary)",
                        "--theme-active-color": "var(--theme-primary-text)",
                      } as React.CSSProperties}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  {/* Theme Customization Tab */}
                  <TabsContent value="theme" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-stone-100 flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme Customization
                      </h3>

                      <div className="bg-stone-700 p-6 rounded-lg space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-stone-100">Current Theme</h4>
                            <p className="text-stone-400 text-sm">
                              Currently using:{" "}
                              <span style={{ color: "var(--theme-primary)" }}>{currentTheme.name}</span>
                            </p>
                          </div>
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-stone-600"
                            style={{ backgroundColor: "var(--theme-primary)" }}
                          />
                        </div>

                        <div>
                          <h5 className="text-md font-semibold text-stone-100 mb-4">Choose a Theme Color</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {themeOptions.map((theme, index) => (
                              <button
                                key={index}
                                onClick={() => changeTheme(theme)}
                                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                  currentTheme.name === theme.name
                                    ? "border-stone-300 ring-2 ring-stone-400"
                                    : "border-stone-600 hover:border-stone-500"
                                }`}
                                style={{ backgroundColor: theme.primary }}
                              >
                                <div className="flex flex-col items-center space-y-2">
                                  <div
                                    className="w-8 h-8 rounded-full"
                                    style={{ backgroundColor: theme.primaryHover }}
                                  />
                                  <span className="text-xs font-medium" style={{ color: theme.primaryText }}>
                                    {theme.name}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-stone-600 p-4 rounded-lg space-y-4">
                          <h5 className="text-md font-semibold text-stone-100 mb-3">Custom RGB Color</h5>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="rgb-r" className="text-stone-300">
                                Red (0-255)
                              </Label>
                              <Input
                                id="rgb-r"
                                type="number"
                                min="0"
                                max="255"
                                value={customPrimaryR}
                                onChange={(e) => setCustomPrimaryR(Number(e.target.value))}
                                className="bg-stone-700 border-stone-600 text-stone-100"
                              />
                            </div>
                            <div>
                              <Label htmlFor="rgb-g" className="text-stone-300">
                                Green (0-255)
                              </Label>
                              <Input
                                id="rgb-g"
                                type="number"
                                min="0"
                                max="255"
                                value={customPrimaryG}
                                onChange={(e) => setCustomPrimaryG(Number(e.target.value))}
                                className="bg-stone-700 border-stone-600 text-stone-100"
                              />
                            </div>
                            <div>
                              <Label htmlFor="rgb-b" className="text-stone-300">
                                Blue (0-255)
                              </Label>
                              <Input
                                id="rgb-b"
                                type="number"
                                min="0"
                                max="255"
                                value={customPrimaryB}
                                onChange={(e) => setCustomPrimaryB(Number(e.target.value))}
                                className="bg-stone-700 border-stone-600 text-stone-100"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={handleCustomColorChange}
                            className="w-full font-semibold"
                            style={{
                              backgroundColor: "var(--theme-primary)",
                              color: "var(--theme-primary-text)",
                            }}
                          >
                            Apply Custom Color
                          </Button>
                        </div>

                        <div className="bg-stone-600 p-4 rounded-lg">
                          <h5 className="text-md font-semibold text-stone-100 mb-3">Theme Preview</h5>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: "var(--theme-primary)" }}
                              />
                              <span className="text-stone-300">Primary Color: {currentTheme.primary}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: "var(--theme-primary-hover)" }}
                              />
                              <span className="text-stone-300">Hover Color: {currentTheme.primaryHover}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: "var(--theme-primary-text)" }}
                              />
                              <span className="text-stone-300">Text Color: {currentTheme.primaryText}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-stone-600 p-4 rounded-lg">
                          <h5 className="text-md font-semibold text-stone-100 mb-3">Live Preview</h5>
                          <div className="space-y-3">
                            <button
                              className="px-4 py-2 rounded-lg font-semibold transition-colors"
                              style={{
                                backgroundColor: "var(--theme-primary)",
                                color: "var(--theme-primary-text)",
                              }}
                            >
                              Sample Button
                            </button>
                            <div className="flex items-center space-x-2">
                              <Camera className="h-5 w-5" style={{ color: "var(--theme-primary)" }} />
                              <span style={{ color: "var(--theme-primary)" }}>Sample Icon & Text</span>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: "var(--theme-primary)" }}>
                              Sample Heading
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Content Management Tab */}
                  <TabsContent value="content" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-stone-100">
                        Website Content Management ({currentLanguage === "en" ? "English" : "Arabic"})
                      </h3>

                      {/* Hero Section */}
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                          Hero Section
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-stone-300">Photographer Name</Label>
                            <Input
                              value={editingContent.photographerName}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, photographerName: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Experience Years</Label>
                            <Input
                              value={editingContent.experienceYears}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, experienceYears: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Hero Title</Label>
                            <Input
                              value={editingContent.heroTitle}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, heroTitle: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Hero Subtitle</Label>
                            <Input
                              value={editingContent.heroSubtitle}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-stone-300">Hero Description</Label>
                          <Textarea
                            value={editingContent.heroDescription}
                            onChange={(e) =>
                              setEditingContent((prev) => ({ ...prev, heroDescription: e.target.value }))
                            }
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label className="text-stone-300">Hero Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "heroImage")}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                          />
                        </div>
                        <div>
                          <Label className="text-stone-300">Hero Image Aspect Ratio (e.g., 4/5, 16/9)</Label>
                          <Input
                            value={editingContent.heroImageAspectRatio}
                            onChange={(e) =>
                              setEditingContent((prev) => ({ ...prev, heroImageAspectRatio: e.target.value }))
                            }
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            placeholder="e.g., 4/5"
                          />
                        </div>
                      </div>

                      {/* Navigation Labels */}
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                          Navigation & Buttons
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-stone-300">Home</Label>
                            <Input
                              value={editingContent.navHome}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, navHome: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Portfolio</Label>
                            <Input
                              value={editingContent.navPortfolio}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, navPortfolio: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">About</Label>
                            <Input
                              value={editingContent.navAbout}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, navAbout: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Contact</Label>
                            <Input
                              value={editingContent.navContact}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, navContact: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">View Portfolio Button</Label>
                            <Input
                              value={editingContent.btnViewPortfolio}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, btnViewPortfolio: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Get in Touch Button</Label>
                            <Input
                              value={editingContent.btnGetInTouch}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, btnGetInTouch: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Portfolio Section */}
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                          Portfolio Section
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-stone-300">Portfolio Title</Label>
                            <Input
                              value={editingContent.portfolioTitle}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, portfolioTitle: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">View Full Gallery Button</Label>
                            <Input
                              value={editingContent.btnViewFullGallery}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, btnViewFullGallery: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-stone-300">Portfolio Description</Label>
                          <Textarea
                            value={editingContent.portfolioDescription}
                            onChange={(e) =>
                              setEditingContent((prev) => ({ ...prev, portfolioDescription: e.target.value }))
                            }
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* About Section */}
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                          About Section
                        </h4>
                        <div>
                          <Label className="text-stone-300">About Title</Label>
                          <Input
                            value={editingContent.aboutTitle}
                            onChange={(e) => setEditingContent((prev) => ({ ...prev, aboutTitle: e.target.value }))}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-stone-300">About Description (Paragraph 1)</Label>
                          <Textarea
                            value={editingContent.aboutDescription[0]}
                            onChange={(e) => {
                              const newDesc = [...editingContent.aboutDescription]
                              newDesc[0] = e.target.value
                              setEditingContent((prev) => ({ ...prev, aboutDescription: newDesc }))
                            }}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-stone-300">About Description (Paragraph 2)</Label>
                          <Textarea
                            value={editingContent.aboutDescription[1]}
                            onChange={(e) => {
                              const newDesc = [...editingContent.aboutDescription]
                              newDesc[1] = e.target.value
                              setEditingContent((prev) => ({ ...prev, aboutDescription: newDesc }))
                            }}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-stone-300">About Description (Paragraph 3)</Label>
                          <Textarea
                            value={editingContent.aboutDescription[2]}
                            onChange={(e) => {
                              const newDesc = [...editingContent.aboutDescription]
                              newDesc[2] = e.target.value
                              setEditingContent((prev) => ({ ...prev, aboutDescription: newDesc }))
                            }}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-stone-300">Countries</Label>
                            <Input
                              value={editingContent.stats.countries}
                              onChange={(e) =>
                                setEditingContent((prev) => ({
                                  ...prev,
                                  stats: { ...prev.stats, countries: e.target.value },
                                }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Publications</Label>
                            <Input
                              value={editingContent.stats.publications}
                              onChange={(e) =>
                                setEditingContent((prev) => ({
                                  ...prev,
                                  stats: { ...prev.stats, publications: e.target.value },
                                }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Awards</Label>
                            <Input
                              value={editingContent.stats.awards}
                              onChange={(e) =>
                                setEditingContent((prev) => ({
                                  ...prev,
                                  stats: { ...prev.stats, awards: e.target.value },
                                }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label className="text-stone-300">Countries Label</Label>
                            <Input
                              value={editingContent.labelCountries}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, labelCountries: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Publications Label</Label>
                            <Input
                              value={editingContent.labelPublications}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, labelPublications: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Awards Label</Label>
                            <Input
                              value={editingContent.labelAwards}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, labelAwards: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Experience Label</Label>
                            <Input
                              value={editingContent.labelExperience}
                              onChange={(e) =>
                                setEditingContent((prev) => ({ ...prev, labelExperience: e.target.value }))
                              }
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-stone-300">About Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "aboutImage")}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                          />
                        </div>
                        <div>
                          <Label className="text-stone-300">About Image Aspect Ratio (e.g., 4/5, 16/9)</Label>
                          <Input
                            value={editingContent.aboutImageAspectRatio}
                            onChange={(e) =>
                              setEditingContent((prev) => ({ ...prev, aboutImageAspectRatio: e.target.value }))
                            }
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            placeholder="e.g., 4/5"
                          />
                        </div>
                      </div>

                      {/* Contact Section */}
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                          Contact Section
                        </h4>
                        <div>
                          <Label className="text-stone-300">Contact Title</Label>
                          <Input
                            value={editingContent.contactTitle}
                            onChange={(e) => setEditingContent((prev) => ({ ...prev, contactTitle: e.target.value }))}
                            className="bg-stone-600 border-stone-500 text-stone-100"
                          />
                        </div>
                        <div>
                          <Label className="text-stone-300">Contact Description</Label>
                          <Textarea
                            value={editingContent.contactDescription}
                            onChange={(e) =>
                              setEditingContent((prev) => ({ ...prev, contactDescription: e.target.value }))
                            }
                            className="bg-stone-600 border-stone-500 text-stone-100"
                            rows={2}
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-stone-300">Email</Label>
                            <Input
                              value={editingContent.email}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, email: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Phone</Label>
                            <Input
                              value={editingContent.phone}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, phone: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Location</Label>
                            <Input
                              value={editingContent.location}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, location: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-stone-300">Instagram URL</Label>
                            <Input
                              value={editingContent.instagramUrl}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Twitter URL</Label>
                            <Input
                              value={editingContent.twitterUrl}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, twitterUrl: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-stone-300">Email Label</Label>
                            <Input
                              value={editingContent.labelEmail}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, labelEmail: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Phone Label</Label>
                            <Input
                              value={editingContent.labelPhone}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, labelPhone: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-stone-300">Based In Label</Label>
                            <Input
                              value={editingContent.labelBasedIn}
                              onChange={(e) => setEditingContent((prev) => ({ ...prev, labelBasedIn: e.target.value }))}
                              className="bg-stone-600 border-stone-500 text-stone-100"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={saveContentChanges}
                        className="w-full font-semibold"
                        style={{
                          backgroundColor: "var(--theme-primary)",
                          color: "var(--theme-primary-text)",
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save {currentLanguage === "en" ? "English" : "Arabic"} Content Changes
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Portfolio Management Tab */}
                  <TabsContent value="portfolio" className="space-y-6 mt-6">
                    {/* Add New Album Button */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-stone-100">Manage Portfolio Albums</h3>
                      <Button
                        onClick={handleCreateNewAlbum}
                        className="font-semibold"
                        style={{
                          backgroundColor: "var(--theme-primary)",
                          color: "var(--theme-primary-text)",
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Album
                      </Button>
                    </div>

                    {/* Manage Existing Albums */}
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioAlbums.map((album) => (
                          <div key={album.id} className="bg-stone-700 rounded-lg p-4 space-y-3">
                            <div
                              className="relative rounded overflow-hidden"
                              style={{ aspectRatio: album.aspectRatio || "3/2" }}
                            >
                              <Image
                                src={album.coverImage || "/placeholder.svg"}
                                alt={album.description}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-stone-100 text-sm">{album.title}</h4>
                              <p className="text-xs text-stone-300 line-clamp-2">{album.description}</p>
                              <p className="text-xs" style={{ color: "var(--theme-primary)" }}>
                                {album.location}, {album.year}
                              </p>
                              <p className="text-xs text-stone-400">{album.images.length} photos</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditAlbum(album)}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-600 hover:text-stone-100"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteAlbum(album.id)}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-stone-100">Profile Settings</h3>
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <p className="text-stone-300">
                          Admin authentication is configured for local development.
                        </p>
                        <p className="text-stone-400 text-sm">
                          In a production environment, you would be able to change your password and manage user
                          accounts here.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-stone-100">Website Settings</h3>
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-stone-100">Reset Website</h4>
                            <p className="text-stone-400 text-sm">
                              This will reset all content, portfolio images, and theme settings to default values for
                              both languages.
                            </p>
                          </div>
                          <Button
                            onClick={resetToDefault}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reset to Default
                          </Button>
                        </div>
                      </div>
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold text-stone-100">Language Settings</h4>
                        <p className="text-stone-400 text-sm">
                          The website supports both English and Arabic languages. Content is managed separately for each
                          language. Use the language toggle buttons to switch between editing English and Arabic
                          content.
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-stone-300">Current Language:</span>
                          <span className="font-semibold" style={{ color: "var(--theme-primary)" }}>
                            {currentLanguage === "en" ? "English" : "العربية"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold text-stone-100">Theme Settings</h4>
                        <p className="text-stone-400 text-sm">
                          The website theme can be customized with different color schemes. The current theme affects
                          all accent colors, buttons, and highlights throughout the website.
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-stone-300">Current Theme:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} />
                            <span className="font-semibold" style={{ color: "var(--theme-primary)" }}>
                              {currentTheme.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                        <h4 className="text-lg font-semibold text-stone-100">Data Storage</h4>
                        <p className="text-stone-400 text-sm">
                          All your changes are automatically saved to your browser's local storage for both languages
                          and theme settings. In a production environment, this would be connected to a database.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Album Management Modal */}
      {showAlbumModal && editingAlbum && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-stone-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-100">
                {isCreatingNewAlbum ? "Create New Album" : "Edit Album"}
              </h2>
              <button
                onClick={() => {
                  setShowAlbumModal(false)
                  setEditingAlbum(null)
                  setIsCreatingNewAlbum(false)
                }}
                className="text-stone-400 hover:text-stone-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Album Basic Info */}
              <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                  Album Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-stone-300">Album Title</Label>
                    <Input
                      value={editingAlbum.title}
                      onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="bg-stone-600 border-stone-500 text-stone-100"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-300">Location</Label>
                    <Input
                      value={editingAlbum.location}
                      onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, location: e.target.value } : null)}
                      className="bg-stone-600 border-stone-500 text-stone-100"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-300">Year</Label>
                    <Input
                      value={editingAlbum.year}
                      onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, year: e.target.value } : null)}
                      className="bg-stone-600 border-stone-500 text-stone-100"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-300">Aspect Ratio (e.g., 3/2, 16/9)</Label>
                    <Input
                      value={editingAlbum.aspectRatio}
                      onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, aspectRatio: e.target.value } : null)}
                      className="bg-stone-600 border-stone-500 text-stone-100"
                      placeholder="e.g., 3/2"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-stone-300">Album Description</Label>
                  <Textarea
                    value={editingAlbum.description}
                    onChange={(e) => setEditingAlbum(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="bg-stone-600 border-stone-500 text-stone-100"
                    rows={3}
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                  Cover Image
                </h4>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div>
                    <Label className="text-stone-300">Upload New Cover Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAlbumImageUpload(e, 'coverImage')}
                      className="bg-stone-600 border-stone-500 text-stone-100"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-300">Current Cover Image</Label>
                    <div
                      className="relative rounded overflow-hidden border border-stone-600"
                      style={{ aspectRatio: editingAlbum.aspectRatio || "3/2" }}
                    >
                      <Image
                        src={editingAlbum.coverImage || "/placeholder.svg"}
                        alt={editingAlbum.description}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Management */}
              <div className="bg-stone-700 p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold" style={{ color: "var(--theme-primary)" }}>
                    Album Photos ({editingAlbum.images.length})
                  </h4>
                  <div>
                    <Label className="text-stone-300">Add New Photo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAlbumImageUpload(e, 'newPhoto')}
                      className="bg-stone-600 border-stone-500 text-stone-100 mt-1"
                    />
                  </div>
                </div>

                {editingAlbum.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {editingAlbum.images.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div
                          className="relative rounded overflow-hidden border border-stone-600"
                          style={{ aspectRatio: photo.aspectRatio || "3/2" }}
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              onClick={() => handleDeletePhoto(photo.id)}
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 mt-1 truncate">{photo.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-400">
                    <Upload className="h-12 w-12 mx-auto mb-2" />
                    <p>No photos in this album yet.</p>
                    <p className="text-sm">Use the "Add New Photo" input above to add images.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-stone-700">
                <Button
                  onClick={() => {
                    setShowAlbumModal(false)
                    setEditingAlbum(null)
                    setIsCreatingNewAlbum(false)
                  }}
                  variant="outline"
                  className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-600 hover:text-stone-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAlbum}
                  className="flex-1 font-semibold"
                  style={{
                    backgroundColor: "var(--theme-primary)",
                    color: "var(--theme-primary-text)",
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isCreatingNewAlbum ? "Create Album" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-stone-700">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Camera className="h-5 w-5" style={{ color: "var(--theme-primary)" }} />
              <span className="text-stone-100 font-semibold">{siteContent.photographerName} Photography</span>
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
