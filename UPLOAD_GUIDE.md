# Image Upload Guide

## Overview
The photography portfolio now supports secure image uploads with the following features:

## Features
- **File Size Limit**: 10MB maximum per image
- **Supported Formats**: JPEG, PNG, WebP
- **Secure Storage**: Images stored in `/public/uploads/` directory
- **Database Integration**: Image paths stored in database, not base64 data
- **Error Handling**: Comprehensive error handling and validation
- **Lazy Loading**: Images load efficiently with intersection observer
- **Browser Compatibility**: Works across all modern browsers

## How It Works

### Upload Process
1. User selects an image file (up to 10MB)
2. Frontend validates file size and type
3. File is uploaded via FormData to `/api/upload`
4. Server validates file again and saves to `/public/uploads/`
5. Database stores the file path (e.g., `/uploads/1234567890_abc123.jpg`)
6. Frontend displays the uploaded image

### File Naming
Uploaded files are automatically renamed with:
- Timestamp (for uniqueness)
- Random string (for security)
- Original file extension

Example: `1704067200000_abc123def456.jpg`

### Database Schema
The `images` table stores:
- `src`: File path (e.g., `/uploads/filename.jpg`)
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
- Images are served directly from `/public/uploads/`
- No base64 encoding in database (reduces storage)
- Efficient image loading with Next.js Image component

## Troubleshooting

### Common Issues
1. **File too large**: Check file size is under 10MB
2. **Invalid format**: Only JPEG, PNG, WebP allowed
3. **Upload fails**: Check server logs for specific error
4. **Images not displaying**: Verify file exists in `/public/uploads/`

### File Permissions
Ensure the `/public/uploads/` directory has write permissions for the server.

## Migration from Base64
If migrating from base64 storage:
1. Export existing base64 images
2. Save them as files in `/public/uploads/`
3. Update database records with new file paths
4. Remove old base64 data

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

All modern browsers support the required APIs (FormData, FileReader, IntersectionObserver).
