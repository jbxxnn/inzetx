"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { addReviewResponse, updateReviewResponse, type Review } from "@/app/actions/review"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewResponseFormProps {
  review: Review
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewResponseForm({
  review,
  isOpen,
  onClose,
  onSuccess,
}: ReviewResponseFormProps) {
  const router = useRouter()
  const [response, setResponse] = useState(review.freelancerResponse || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!review.freelancerResponse

  useEffect(() => {
    if (isOpen) {
      setResponse(review.freelancerResponse || "")
      setError(null)
    }
  }, [isOpen, review.freelancerResponse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!response.trim()) {
      setError("Response cannot be empty")
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing) {
        await updateReviewResponse(review.id, response)
      } else {
        await addReviewResponse(review.id, response)
      }
      
      // Call success callback
      onSuccess?.()
      
      // Close dialog
      onClose()
      
      // Refresh page to update UI
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save response. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setResponse(review.freelancerResponse || "")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-primary-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-secondary-foreground">
            {isEditing ? "Edit Response" : "Respond to Review"}
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground/70">
            {isEditing
              ? "Update your response to this review"
              : "Thank the client for their feedback and address any concerns"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="p-4 bg-secondary rounded-xl border border-secondary-foreground/10">
            <p className="text-sm font-medium text-secondary-foreground mb-2">Original Review:</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "bg-primary"
                        : "bg-secondary-foreground/20"
                    } rounded-sm`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-secondary-foreground">{review.rating}</span>
            </div>
            {review.comment && (
              <p className="text-sm text-secondary-foreground/80">{review.comment}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="response" className="text-base font-heading font-bold text-secondary-foreground">
              Your Response <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Thank you for your feedback. I appreciate your review and would like to address..."
              className="min-h-[120px] bg-primary-foreground border border-accent text-secondary-foreground placeholder:text-secondary-foreground/50 rounded-xl resize-none"
              maxLength={1000}
              required
            />
            <p className="text-xs text-secondary-foreground/60 text-right">
              {response.length}/1000 characters
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
              disabled={isSubmitting || !response.trim()}
              className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Posting..."}
                </>
              ) : (
                isEditing ? "Update Response" : "Post Response"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

