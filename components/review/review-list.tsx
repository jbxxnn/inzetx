"use client"

import { ReviewCard } from "./review-card"
import { StarRating } from "./star-rating"
import type { Review } from "@/app/actions/review"

interface ReviewListProps {
  reviews: Review[]
  averageRating?: number
  totalReviews?: number
  showStats?: boolean
  currentUserProfileId?: string
  currentUserRole?: 'client' | 'freelancer'
  freelancerProfileId?: string
  onReviewUpdated?: () => void
}

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  showStats = true,
  currentUserProfileId,
  currentUserRole,
  freelancerProfileId,
  onReviewUpdated,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-foreground/70">No reviews yet</p>
        <p className="text-sm text-secondary-foreground/50 mt-2">
          Be the first to leave a review!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {showStats && (averageRating !== undefined || totalReviews !== undefined) && (
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl border border-secondary-foreground/10">
          {averageRating !== undefined && averageRating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size={24} />
              <div>
                <p className="text-lg font-heading font-bold text-secondary-foreground">
                  {averageRating.toFixed(1)}
                </p>
                {totalReviews !== undefined && (
                  <p className="text-xs text-secondary-foreground/60">
                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserProfileId={currentUserProfileId}
            currentUserRole={currentUserRole}
            freelancerProfileId={freelancerProfileId}
            onReviewUpdated={onReviewUpdated}
          />
        ))}
      </div>
    </div>
  )
}

