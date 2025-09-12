"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-stone-400 border-t-transparent rounded-full animate-spin`}
        style={{ borderTopColor: "var(--theme-primary, #f59e0b)" }}
      />
      {text && (
        <p className="text-stone-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}
