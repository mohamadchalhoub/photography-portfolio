"use client"

interface AlbumSkeletonProps {
  count?: number
}

export default function AlbumSkeleton({ count = 6 }: AlbumSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-lg bg-stone-700 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="relative" style={{ aspectRatio: "3/2" }}>
            <div className="w-full h-full bg-stone-600 animate-pulse" />
            
            {/* Photo count badge skeleton */}
            <div className="absolute top-4 right-4 bg-stone-800/80 rounded-full px-3 py-1">
              <div className="w-16 h-3 bg-stone-700 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="space-y-2">
              {/* Title skeleton */}
              <div className="w-3/4 h-6 bg-stone-600 rounded animate-pulse" />
              
              {/* Description skeleton */}
              <div className="w-full h-4 bg-stone-600 rounded animate-pulse" />
              <div className="w-2/3 h-4 bg-stone-600 rounded animate-pulse" />
              
              {/* Location skeleton */}
              <div className="w-1/2 h-4 bg-amber-500/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
