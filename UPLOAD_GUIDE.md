# Image Upload Guide

## Overview
The photography portfolio now supports secure image uploads using Vercel Blob Storage with the following features:

## Features
- **File Size Limit**: 10MB maximum per image
- **Supported Formats**: JPEG, PNG, WebP
- **Cloud Storage**: Images stored in Vercel Blob Storage (photos bucket)
- **Public Access**: Images are publicly accessible via blob URLs
- **Database Integration**: Blob URLs stored in database, not base64 data
- **Error Handling**: Comprehensive error handling and validation
- **Lazy Loading**: Images load efficiently with intersection observer
- **Browser Compatibility**: Works across all modern browsers
- **Scalability**: Cloud storage provides better performance and reliability

## How It Works

### Upload Process
1. User selects an image file (up to 10MB)
2. Frontend validates file size and type
3. File is uploaded via FormData to `/api/upload`
4. Server validates file again and uploads to Vercel Blob Storage
5. Database stores the blob URL (e.g., `https://xyz.public.blob.vercel-storage.com/photo_1234567890_abc123.jpg`)
6. Frontend displays the uploaded image using the blob URL

### File Naming
Uploaded files are automatically renamed with:
- "photo_" prefix for organization
- Timestamp (for uniqueness)
- Random string (for security)
- Original file extension

Example: `photo_1704067200000_abc123def456.jpg`

### Database Schema
The `images` table stores:
- `src`: Blob URL (e.g., `https://xyz.public.blob.vercel-storage.com/photo_filename.jpg`)
- `alt`: Alt text for accessibility
- `title`: Image title
- `location`: Location metadata
- `aspect_ratio`: Image aspect ratio

### Lazy Loading
- Images load only when they come into viewport
- First 3 images load immediately (priority loading)
- Loading states with skeleton animations
- Error handling with fallback images

## Security Features
- File type validation (only image formats allowed)
- File size limits enforced
- Unique file naming prevents conflicts
- Cleanup on database save failure

## Performance Optimizations
- Lazy loading reduces initial page load time
- Images are served from Vercel's global CDN
- No base64 encoding in database (reduces storage)
- Efficient image loading with Next.js Image component
- Cloud storage provides better scalability and reliability

## Troubleshooting

### Common Issues
1. **File too large**: Check file size is under 10MB
2. **Invalid format**: Only JPEG, PNG, WebP allowed
3. **Upload fails**: Check server logs for specific error
4. **Images not displaying**: Verify blob URL is accessible and BLOB_READ_WRITE_TOKEN is set
5. **Blob token error**: Ensure BLOB_READ_WRITE_TOKEN environment variable is configured

### Environment Setup
Ensure the following environment variables are set:
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob Storage token
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Migration from Local Storage
If migrating from local file storage:
1. Export existing images from `/public/uploads/`
2. Upload them to Vercel Blob Storage
3. Update database records with new blob URLs
4. Remove old local file paths

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

All modern browsers support the required APIs (FormData, FileReader, IntersectionObserver).
