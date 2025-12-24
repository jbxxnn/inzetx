"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StarRating } from "./star-rating"
import { updateReview, canEditReview, type Review } from "@/app/actions/review"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditReviewFormProps {
  review: Review
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditReviewForm({
  review,
  isOpen,
  onClose,
  onSuccess,
}: EditReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isOpen && review.id) {
      setIsChecking(true)
      canEditReview(review.id)
        .then((editable: boolean) => {
          setCanEdit(editable)
          if (!editable) {
            setError("This review can only be edited within 7 days of creation")
          }
        })
        .catch(() => {
          setCanEdit(false)
          setError("Unable to verify if review can be edited")
        })
        .finally(() => setIsChecking(false))
    }
  }, [isOpen, review.id])

  useEffect(() => {
    if (isOpen) {
      setRating(review.rating)
      setComment(review.comment || "")
      setError(null)
    }
  }, [isOpen, review])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (!canEdit) {
      setError("This review can no longer be edited")
      return
    }

    setIsSubmitting(true)

    try {
      await updateReview(review.id, {
        rating,
        comment: comment.trim() || undefined,
      })
      
      // Call success callback
      onSuccess?.()
      
      // Close dialog
      onClose()
      
      // Refresh page to update UI
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(review.rating)
      setComment(review.comment || "")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-primary-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-secondary-foreground">
            Edit Review
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground/70">
            You can edit your review within 7 days of posting
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !canEdit ? (
          <div className="py-8">
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md border border-destructive/20">
              <p className="font-semibold mb-1">Editing Period Expired</p>
              <p>This review can only be edited within 7 days of creation.</p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full mt-4 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            {review.editCount && review.editCount > 0 && (
              <div className="bg-secondary/50 text-secondary-foreground/70 text-xs p-2 rounded-md">
                This review has been edited {review.editCount} {review.editCount === 1 ? 'time' : 'times'}
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="rating" className="text-base font-heading font-bold text-secondary-foreground">
                Overall Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <StarRating
                  rating={rating}
                  interactive
                  onRatingChange={setRating}
                  size={32}
                />
                {rating > 0 && (
                  <span className="text-sm text-secondary-foreground/70">
                    {rating === 5 && "Excellent"}
                    {rating === 4 && "Very Good"}
                    {rating === 3 && "Good"}
                    {rating === 2 && "Fair"}
                    {rating === 1 && "Poor"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="text-base font-heading font-bold text-secondary-foreground">
                Your Review (Optional)
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience. What went well? What could be improved?"
                className="min-h-[120px] bg-primary-foreground border border-accent text-secondary-foreground placeholder:text-secondary-foreground/50 rounded-xl resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-secondary-foreground/60 text-right">
                {comment.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Review"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

