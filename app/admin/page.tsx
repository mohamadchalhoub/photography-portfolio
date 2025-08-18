"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, LogOut, Globe, Loader2 } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")

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

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-stone-800 border-stone-700">
          <CardHeader>
            <CardTitle className="text-stone-100">Welcome to Admin Dashboard</CardTitle>
            <CardDescription className="text-stone-400">
              Access your website's admin features by scrolling down on the main page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-stone-300 mb-4">
              The admin dashboard is integrated into the main website. Go back to the homepage and scroll down to access the settings button for full admin functionality.
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
