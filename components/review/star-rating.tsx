"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  className?: string
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  className,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1)
    }
  }

  // Visual feedback could be added here if needed

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= Math.round(rating)
        const isHalfFilled = starValue - 0.5 <= rating && rating < starValue

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(
                isFilled || isHalfFilled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-secondary-foreground/30",
                "transition-all"
              )}
            />
          </button>
        )
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-secondary-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

