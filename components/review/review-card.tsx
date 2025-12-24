"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarRating } from "./star-rating"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { User02Icon, Edit02Icon, Message02Icon, Flag02Icon } from "@hugeicons/core-free-icons"
import { EditReviewForm } from "./edit-review-form"
import { ReviewResponseForm } from "./review-response-form"
import { FlagReviewDialog } from "./flag-review-dialog"
import { useRouter } from "next/navigation"
import type { Review } from "@/app/actions/review"
// Using native date formatting instead of date-fns

interface ReviewCardProps {
  review: Review
  currentUserProfileId?: string
  currentUserRole?: 'client' | 'freelancer'
  freelancerProfileId?: string
  onReviewUpdated?: () => void
}

export function ReviewCard({
  review,
  currentUserProfileId,
  currentUserRole,
  freelancerProfileId,
  onReviewUpdated,
}: ReviewCardProps) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false)

  const isClientOwner = currentUserRole === 'client' && currentUserProfileId === review.clientProfileId
  const isFreelancerOwner = currentUserRole === 'freelancer' && freelancerProfileId === review.freelancerProfileId
  const canEdit = isClientOwner
  const canRespond = isFreelancerOwner && !review.freelancerResponse
  const canEditResponse = isFreelancerOwner && !!review.freelancerResponse


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }
  
  const formattedDate = formatDate(review.createdAt)

  return (
    <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {review.clientPhoto ? (
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
              <Image
                src={review.clientPhoto}
                alt={review.clientName || "Client"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shrink-0 border-2 border-primary">
              <HugeiconsIcon icon={User02Icon} className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-secondary-foreground text-sm sm:text-base mb-1">
                  {review.clientName || "Anonymous Client"}
                </p>
                <StarRating rating={review.rating} size={16} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {review.editedAt && (
                  <span className="text-xs text-secondary-foreground/50 italic">
                    (edited)
                  </span>
                )}
                <span className="text-xs text-secondary-foreground/60">
                  {formattedDate}
                </span>
              </div>
            </div>

            {review.jobDescription && (
              <p className="text-xs text-secondary-foreground/60 mb-2 line-clamp-1">
                {review.jobDescription}
              </p>
            )}

            {review.comment && (
              <p className="text-sm text-secondary-foreground/80 leading-relaxed mt-2">
                {review.comment}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-secondary/20">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="text-xs h-7 px-2 text-secondary-foreground/70 hover:text-primary"
                >
                  <HugeiconsIcon icon={Edit02Icon} className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
              {canRespond && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsResponseDialogOpen(true)}
                  className="text-xs h-7 px-2 text-secondary-foreground/70 hover:text-primary"
                >
                  <HugeiconsIcon icon={Message02Icon} className="w-3 h-3 mr-1" />
                  Respond
                </Button>
              )}
              {canEditResponse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsResponseDialogOpen(true)}
                  className="text-xs h-7 px-2 text-secondary-foreground/70 hover:text-primary"
                >
                  <HugeiconsIcon icon={Edit02Icon} className="w-3 h-3 mr-1" />
                  Edit Response
                </Button>
              )}
              {currentUserProfileId && !isClientOwner && !isFreelancerOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFlagDialogOpen(true)}
                  className="text-xs h-7 px-2 text-secondary-foreground/70 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Flag02Icon} className="w-3 h-3 mr-1" />
                  Flag
                </Button>
              )}
            </div>

            {/* Freelancer Response */}
            {review.freelancerResponse && (
              <div className="mt-4 pt-4 border-t border-primary/30">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Message02Icon} className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary mb-1">Freelancer Response</p>
                    <p className="text-sm text-secondary-foreground/80 leading-relaxed">
                      {review.freelancerResponse}
                    </p>
                    {review.responseCreatedAt && (
                      <p className="text-xs text-secondary-foreground/50 mt-1">
                        {formatDate(review.responseCreatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Review Dialog */}
        {canEdit && (
          <EditReviewForm
            review={review}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              onReviewUpdated?.()
              router.refresh()
            }}
          />
        )}

        {/* Response Dialog */}
        {(canRespond || canEditResponse) && (
          <ReviewResponseForm
            review={review}
            isOpen={isResponseDialogOpen}
            onClose={() => setIsResponseDialogOpen(false)}
            onSuccess={() => {
              setIsResponseDialogOpen(false)
              onReviewUpdated?.()
              router.refresh()
            }}
          />
        )}

        {/* Flag Dialog */}
        {currentUserProfileId && (
          <FlagReviewDialog
            reviewId={review.id}
            flaggedByProfileId={currentUserProfileId}
            isOpen={isFlagDialogOpen}
            onClose={() => setIsFlagDialogOpen(false)}
            onSuccess={() => {
              setIsFlagDialogOpen(false)
              router.refresh()
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

