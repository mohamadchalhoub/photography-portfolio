"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, LogOut, Globe, Loader2, Upload, Image as ImageIcon } from "lucide-react"
import ImageUploadForm from "@/components/ImageUploadForm"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [uploadedImages, setUploadedImages] = useState<any[]>([])

  // Check authentication on page load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        setIsAuthenticated(true)
      } else {
        const errorData = await response.json()
        setLoginError(errorData.error || 'Invalid credentials')
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('adminToken')
      setIsAuthenticated(false)
      router.push('/')
    } catch (error) {
      // Silent error handling for production
      localStorage.removeItem('adminToken')
      setIsAuthenticated(false)
      router.push('/')
    }
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-stone-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-stone-800 border-stone-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-amber-500/10 rounded-full w-fit">
              <Shield className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-stone-100">Admin Access</CardTitle>
            <CardDescription className="text-stone-400">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  placeholder="Username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-stone-700 border-stone-600 text-stone-100"
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-stone-700 border-stone-600 text-stone-100"
                  required
                />
              </div>
              {loginError && (
                <p className="text-red-400 text-sm">{loginError}</p>
              )}
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                Login
              </Button>
            </form>
            <div className="mt-6 pt-4 border-t border-stone-700">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="w-full text-stone-400 hover:text-stone-200"
              >
                ← Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle successful upload
  const handleUploadSuccess = (response: any) => {
    setUploadedImages(prev => [response, ...prev])
  }

  // Handle upload error
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  // Simple authenticated state - just redirect to main page with admin access
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <div className="border-b border-stone-700 bg-stone-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-stone-400 hover:text-stone-200"
              >
                <Globe className="h-4 w-4 mr-2" />
                View Website
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageUploadForm 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
          
          {/* Upload Instructions */}
          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-stone-100 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-stone-200 font-medium">File Requirements:</h4>
                <ul className="text-stone-400 text-sm space-y-1 ml-4">
                  <li>• Maximum file size: 10MB</li>
                  <li>• Supported formats: JPEG, PNG, WebP</li>
                  <li>• Images are stored in Vercel Blob Storage</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-stone-200 font-medium">How to use:</h4>
                <ol className="text-stone-400 text-sm space-y-1 ml-4 list-decimal">
                  <li>Select an image file using the file input</li>
                  <li>Click "Upload Image" to start the upload</li>
                  <li>Wait for the upload to complete</li>
                  <li>The image URL will be returned for use</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="text-stone-200 font-medium">API Usage:</h4>
                <div className="bg-stone-700 rounded p-3 text-xs font-mono text-stone-300">
                  <div>POST /api/upload</div>
                  <div>Content-Type: multipart/form-data</div>
                  <div>Body: file (image file)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recently Uploaded Images */}
        {uploadedImages.length > 0 && (
          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-stone-100 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Recently Uploaded Images
              </CardTitle>
              <CardDescription className="text-stone-400">
                Your recently uploaded images and their URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="bg-stone-700 rounded-lg p-4 border border-stone-600">
                    <div className="space-y-2">
                      <div className="aspect-video bg-stone-600 rounded flex items-center justify-center">
                        <img 
                          src={image.url || image.src} 
                          alt={image.alt || image.filename}
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-stone-200 text-sm font-medium truncate">
                          {image.filename || image.alt}
                        </p>
                        <p className="text-stone-400 text-xs">
                          {image.size ? `${(image.size / 1024 / 1024).toFixed(2)} MB` : ''}
                        </p>
                        <div className="bg-stone-600 rounded p-2">
                          <p className="text-stone-300 text-xs break-all">
                            {image.url || image.src}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Admin Info */}
        <Card className="bg-stone-800 border-stone-700">
          <CardHeader>
            <CardTitle className="text-stone-100">Admin Dashboard</CardTitle>
            <CardDescription className="text-stone-400">
              Manage your photography portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-stone-300 mb-4">
              Use the upload form above to add new images to your portfolio. All images are automatically stored in Vercel Blob Storage and can be used throughout your website.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Go to Main Website
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
