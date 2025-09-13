# Image Upload API Usage Examples

This document provides examples of how to use the image upload API with Formidable.

## API Endpoint

**POST** `/api/upload`

## Authentication

The API requires admin authentication. Include the `auth-token` cookie in your requests.

## Request Format

The API accepts `multipart/form-data` with the following fields:

- `file` (required): The image file to upload
- `albumId` (optional): If provided, the image will be added to the specified album

## Response Format

### Successful Upload (General)
```json
{
  "url": "https://blob.vercel-storage.com/photo_1234567890_abc123.jpg",
  "filename": "my-photo.jpg",
  "size": 2048576,
  "type": "image/jpeg"
}
```

### Successful Upload (With Album)
```json
{
  "id": 123,
  "src": "https://blob.vercel-storage.com/photo_1234567890_abc123.jpg",
  "alt": "my-photo.jpg",
  "title": "my-photo",
  "location": "",
  "aspectRatio": "3/2"
}
```

### Error Response
```json
{
  "error": "File too large, must be under 10 MB"
}
```

## JavaScript/TypeScript Examples

### 1. Basic Upload with Fetch API

```javascript
async function uploadImage(file, albumId = null) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (albumId) {
    formData.append('albumId', albumId);
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Usage
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

uploadImage(file)
  .then(result => {
    console.log('Image URL:', result.url);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```

### 2. Upload with Progress Tracking

```javascript
async function uploadImageWithProgress(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || 'Upload failed'));
        } catch (error) {
          reject(new Error('Upload failed'));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

// Usage with progress bar
const progressBar = document.getElementById('progressBar');

uploadImageWithProgress(file, (progress) => {
  progressBar.style.width = `${progress}%`;
  console.log(`Upload progress: ${progress.toFixed(1)}%`);
})
.then(result => {
  console.log('Upload complete:', result);
})
.catch(error => {
  console.error('Upload failed:', error);
});
```

### 3. React Hook Example

```jsx
import { useState } from 'react';

function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);

  const uploadImage = async (file, albumId = null) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (albumId) {
        formData.append('albumId', albumId);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadedImages(prev => [result, ...prev]);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress,
    uploadedImages,
  };
}

// Usage in component
function ImageUploadComponent() {
  const { uploadImage, isUploading, uploadedImages } = useImageUpload();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await uploadImage(file);
        console.log('Upload successful:', result);
      } catch (error) {
        alert('Upload failed: ' + error.message);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
      {/* Display uploaded images */}
    </div>
  );
}
```

## cURL Examples

### Basic Upload
```bash
curl -X POST \
  -H "Cookie: auth-token=your-jwt-token" \
  -F "file=@/path/to/your/image.jpg" \
  http://localhost:3000/api/upload
```

### Upload with Album ID
```bash
curl -X POST \
  -H "Cookie: auth-token=your-jwt-token" \
  -F "file=@/path/to/your/image.jpg" \
  -F "albumId=123" \
  http://localhost:3000/api/upload
```

## File Validation

The API automatically validates:

- **File size**: Maximum 10MB
- **File type**: Only JPEG, PNG, and WebP images are allowed
- **Authentication**: Only admin users can upload

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid file type or size
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error during upload

## Admin Dashboard Usage

The admin dashboard at `/admin` provides a user-friendly interface for uploading images with:

- Drag-and-drop file selection
- Real-time progress tracking
- Image preview
- Error handling
- Recently uploaded images display

Access the admin dashboard by logging in with admin credentials at `/admin`.
