"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StarRating } from "./star-rating"
import { createReview } from "@/app/actions/review"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewFormProps {
  bookingId: string
  freelancerName?: string
  jobDescription?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewForm({
  bookingId,
  freelancerName,
  jobDescription,
  isOpen,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      })
      
      // Reset form
      setRating(0)
      setComment("")
      
      // Call success callback
      onSuccess?.()
      
      // Close dialog
      onClose()
      
      // Refresh page to update UI
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setComment("")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-primary-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-secondary-foreground">
            Leave a Review
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground/70">
            {freelancerName && (
              <span>Share your experience with {freelancerName}</span>
            )}
            {!freelancerName && <span>Share your experience</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {jobDescription && (
            <div className="p-4 bg-secondary rounded-xl border border-secondary-foreground/10">
              <p className="text-sm font-medium text-secondary-foreground mb-1">Job:</p>
              <p className="text-sm text-secondary-foreground/70 line-clamp-2">
                {jobDescription}
              </p>
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
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

