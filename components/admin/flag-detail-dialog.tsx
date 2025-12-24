"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StarRating } from "@/components/review/star-rating"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, CloseCircleIcon, User02Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface Flag {
  id: string
  review_id: string
  flagged_by_profile_id: string
  reason: string
  description: string | null
  status: string
  created_at: string
  reviews?: {
    id: string
    rating: number
    comment: string | null
    freelancer_response: string | null
    created_at: string
    profiles?: {
      id: string
      full_name: string | null
      profile_photo: string | null
    } | null
  } | null
  profiles?: {
    id: string
    full_name: string | null
  } | null
}

interface FlagDetailDialogProps {
  flag: Flag
  isOpen: boolean
  onClose: () => void
  onResolve: (flagId: string, action: 'resolved' | 'dismissed', notes?: string) => Promise<void>
  adminProfileId: string
  isProcessing: boolean
}

export function FlagDetailDialog({
  flag,
  isOpen,
  onClose,
  onResolve,
  adminProfileId,
  isProcessing,
}: FlagDetailDialogProps) {
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [action, setAction] = useState<'resolved' | 'dismissed' | null>(null)

  const review = flag.reviews
  const client = review?.profiles
  const flagger = flag.profiles

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate: "Inappropriate Content",
      spam: "Spam or Fake Review",
      harassment: "Harassment or Bullying",
      false_information: "False Information",
      other: "Other"
    }
    return labels[reason] || reason
  }

  const handleSubmit = async () => {
    if (!action) return
    await onResolve(flag.id, action, resolutionNotes.trim() || undefined)
    setResolutionNotes("")
    setAction(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-primary-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-secondary-foreground">
            Flag Details
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground/70">
            Review the flagged content and take appropriate action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flag Information */}
          <div className="p-4 bg-secondary/50 rounded-xl border border-secondary-foreground/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-secondary-foreground mb-1">Flag Reason</p>
                <p className="text-base text-secondary-foreground">{getReasonLabel(flag.reason)}</p>
              </div>
              <span className="text-xs text-secondary-foreground/60">
                {formatDate(flag.created_at)}
              </span>
            </div>
            {flag.description && (
              <div className="mt-3 pt-3 border-t border-secondary-foreground/10">
                <p className="text-sm font-semibold text-secondary-foreground mb-1">Description</p>
                <p className="text-sm text-secondary-foreground/80">{flag.description}</p>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-secondary-foreground/10">
              <p className="text-sm font-semibold text-secondary-foreground mb-1">Flagged By</p>
              <p className="text-sm text-secondary-foreground/80">
                {flagger?.full_name || 'Anonymous User'}
              </p>
            </div>
          </div>

          {/* Review Content */}
          {review && (
            <div className="p-4 bg-primary-foreground border-2 border-secondary/50 rounded-xl">
              <div className="flex items-start gap-4 mb-4">
                {client?.profile_photo ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0">
                    <Image
                      src={client.profile_photo}
                      alt={client.full_name || "Client"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 border-2 border-primary">
                    <HugeiconsIcon icon={User02Icon} className="w-6 h-6 text-secondary-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-heading font-bold text-secondary-foreground mb-1">
                    {client?.full_name || "Anonymous Client"}
                  </p>
                  <StarRating rating={review.rating} size={20} />
                  <p className="text-xs text-secondary-foreground/60 mt-1">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>

              {review.comment && (
                <div className="mt-4 pt-4 border-t border-secondary/20">
                  <p className="text-sm font-semibold text-secondary-foreground mb-2">Review Comment</p>
                  <p className="text-sm text-secondary-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              )}

              {review.freelancer_response && (
                <div className="mt-4 pt-4 border-t border-primary/30">
                  <p className="text-sm font-semibold text-primary mb-2">Freelancer Response</p>
                  <p className="text-sm text-secondary-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {review.freelancer_response}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-heading font-bold text-secondary-foreground">
              Resolution Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add any notes about your decision..."
              className="min-h-[100px] bg-primary-foreground border border-accent text-secondary-foreground placeholder:text-secondary-foreground/50 rounded-xl resize-none"
              maxLength={500}
            />
            <p className="text-xs text-secondary-foreground/60 text-right">
              {resolutionNotes.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary/20">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAction('dismissed')
                handleSubmit()
              }}
              disabled={isProcessing}
              className="flex-1 border-secondary-foreground/20 text-secondary-foreground/70 hover:bg-secondary-foreground/10 rounded-full"
            >
              {isProcessing && action === 'dismissed' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CloseCircleIcon} className="w-4 h-4 mr-2" />
                  Dismiss Flag
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setAction('resolved')
                handleSubmit()
              }}
              disabled={isProcessing}
              className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full font-semibold"
            >
              {isProcessing && action === 'resolved' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                  Resolve Flag
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

