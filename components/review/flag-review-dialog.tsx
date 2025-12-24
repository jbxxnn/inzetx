"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { flagReview } from "@/app/actions/review"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FlagReviewDialogProps {
  reviewId: string
  flaggedByProfileId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const FLAG_REASONS = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "spam", label: "Spam or Fake Review" },
  { value: "harassment", label: "Harassment or Bullying" },
  { value: "false_information", label: "False Information" },
  { value: "other", label: "Other" },
]

export function FlagReviewDialog({
  reviewId,
  flaggedByProfileId,
  isOpen,
  onClose,
  onSuccess,
}: FlagReviewDialogProps) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!reason) {
      setError("Please select a reason")
      return
    }

    setIsSubmitting(true)

    try {
      await flagReview(
        reviewId,
        flaggedByProfileId,
        reason,
        description.trim() || undefined
      )
      
      // Call success callback
      onSuccess?.()
      
      // Close dialog
      onClose()
      
      // Reset form
      setReason("")
      setDescription("")
      
      // Refresh page
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to flag review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("")
      setDescription("")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-primary-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-secondary-foreground">
            Flag Review
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground/70">
            Help us maintain a safe and respectful community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base font-heading font-bold text-secondary-foreground">
              Reason for Flagging <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-primary-foreground border border-accent text-secondary-foreground rounded-xl">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {FLAG_REASONS.map((flagReason) => (
                  <SelectItem key={flagReason.value} value={flagReason.value}>
                    {flagReason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-heading font-bold text-secondary-foreground">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context that would help us review this report..."
              className="min-h-[100px] bg-primary-foreground border border-accent text-secondary-foreground placeholder:text-secondary-foreground/50 rounded-xl resize-none"
              maxLength={500}
            />
            <p className="text-xs text-secondary-foreground/60 text-right">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-secondary/50 text-secondary-foreground/70 text-xs p-3 rounded-md">
            <p className="font-semibold mb-1">What happens next?</p>
            <p>Our moderation team will review this report and take appropriate action if necessary. You will be notified of the outcome.</p>
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
              disabled={isSubmitting || !reason}
              className="flex-1 bg-destructive text-white hover:bg-destructive/90 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Flag Review"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

