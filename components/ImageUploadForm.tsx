"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react"
import { put } from '@vercel/blob'

interface UploadResponse {
  url: string
  filename: string
  size: number
  type: string
}

interface AlbumUploadResponse {
  id: number
  src: string
  alt: string
  title: string
  location: string
  aspectRatio: string
}

interface ImageUploadFormProps {
  albumId?: string
  onUploadSuccess?: (response: UploadResponse | AlbumUploadResponse) => void
  onUploadError?: (error: string) => void
}

export default function ImageUploadForm({ 
  albumId, 
  onUploadSuccess, 
  onUploadError 
}: ImageUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset previous states
    setUploadStatus('idle')
    setErrorMessage('')
    setSuccessMessage('')

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File too large. Maximum size is 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      setUploadStatus('error')
      return
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
      setUploadStatus('error')
      return
    }

    setSelectedFile(file)
    setUploadStatus('idle')
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    // Frontend validation before upload
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(`File too large! Max 10MB allowed. Current size: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`)
      setUploadStatus('error')
      return
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setErrorMessage('Invalid file type! Only JPEG, PNG, and WebP are allowed.')
      setUploadStatus('error')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus('idle')
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Step 1: Get signed upload URL from our API (metadata only)
      setUploadProgress(10)
      const uploadUrlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: selectedFile.name, 
          size: selectedFile.size, 
          type: selectedFile.type 
        }),
      })

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json()
        throw new Error(errorData.error || 'Failed to get upload URL')
      }

      const responseData = await uploadUrlResponse.json()
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to get upload URL')
      }

      const { filename: uniqueFilename, token } = responseData
      setUploadProgress(30)

      // Step 2: Upload file directly to Vercel Blob using the client
      setUploadProgress(50)
      const blob = await put(uniqueFilename, selectedFile, {
        access: 'public',
        token: token,
      })

      setUploadProgress(80)

      // Step 3: Save image metadata to database
      const saveResponse = await fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadUrl: blob.url,
          filename: uniqueFilename,
          originalFilename: selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size,
          albumId: albumId,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save image metadata')
      }

      const result = await saveResponse.json()
      setUploadProgress(100)
      
      setUploadStatus('success')
      setSuccessMessage(albumId ? 'Image uploaded and added to album successfully!' : 'Image uploaded successfully!')
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result)
      }

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
        setUploadStatus('idle')
        setSuccessMessage('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 2000)

    } catch (error) {
      setUploadStatus('error')
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      setErrorMessage(errorMsg)
      
      if (onUploadError) {
        onUploadError(errorMsg)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setErrorMessage('')
    setSuccessMessage('')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <Card className="bg-stone-800 border-stone-700">
      <CardHeader>
        <CardTitle className="text-stone-100 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Image
        </CardTitle>
        <CardDescription className="text-stone-400">
          Upload images up to 10MB. Supported formats: JPEG, PNG, WebP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-stone-300">
            Select Image File
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="bg-stone-700 border-stone-600 text-stone-100 file:bg-amber-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:text-sm"
          />
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="bg-stone-700 rounded-lg p-4 border border-stone-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-stone-100 font-medium">{selectedFile.name}</p>
                  <p className="text-stone-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-stone-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-stone-400">
              <span>
                {uploadProgress < 30 ? 'Getting upload URL...' :
                 uploadProgress < 80 ? 'Uploading to storage...' :
                 'Saving metadata...'}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'error' && errorMessage && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'success' && successMessage && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>

        {/* Album Info */}
        {albumId && (
          <p className="text-stone-500 text-sm text-center">
            This image will be added to album ID: {albumId}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
