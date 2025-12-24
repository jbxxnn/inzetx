"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateBookingStatus, updateBookingScheduledTime } from "@/app/actions/booking"
import { Loader2, Calendar, XCircle, CheckCircle2 } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon } from "@hugeicons/core-free-icons"

interface ManageBookingDialogProps {
  bookingId: string
  currentStatus: string
  scheduledTime?: {
    start?: string
    end?: string
    date?: string
    time?: string
    notes?: string
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ManageBookingDialog({
  bookingId,
  currentStatus,
  scheduledTime,
  isOpen,
  onClose,
  onSuccess,
}: ManageBookingDialogProps) {
  const [action, setAction] = useState<'complete' | 'cancel' | 'reschedule' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reschedule form state
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newNotes, setNewNotes] = useState(scheduledTime?.notes || '')

  const handleComplete = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await updateBookingStatus(bookingId, 'completed')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await updateBookingStatus(bookingId, 'cancelled')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!newDate) {
      setError('Please select a date')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const updatedScheduledTime = {
        ...scheduledTime,
        date: newDate,
        time: newTime || scheduledTime?.time,
        notes: newNotes || scheduledTime?.notes,
      }
      await updateBookingScheduledTime(bookingId, updatedScheduledTime)
      onSuccess()
      onClose()
      // Reset form
      setAction(null)
      setNewDate('')
      setNewTime('')
      setNewNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setAction(null)
      setError(null)
      setNewDate('')
      setNewTime('')
      setNewNotes(scheduledTime?.notes || '')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-primary-foreground border-2 border-secondary/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-secondary-foreground">
            Manage Booking
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground/70">
            Update the status or schedule of your booking
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive text-sm p-4 rounded-2xl">
            {error}
          </div>
        )}

        {!action ? (
          <div className="space-y-3">
            <Button
              onClick={() => setAction('complete')}
              className="w-full bg-green-500/20 text-green-700 border-2 border-green-500/30 hover:bg-green-500/30 rounded-full h-12 font-semibold transition-all duration-300 justify-start gap-3"
              disabled={isLoading || currentStatus === 'completed'}
            >
              <CheckCircle2 size={20} />
              <span>Mark as Completed</span>
            </Button>

            <Button
              onClick={() => setAction('reschedule')}
              className="w-full bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-12 font-semibold transition-all duration-300 justify-start gap-3"
              disabled={isLoading}
            >
              <HugeiconsIcon icon={Calendar02Icon} className="w-5 h-5" />
              <span>Reschedule</span>
            </Button>

            <Button
              onClick={() => setAction('cancel')}
              className="w-full bg-destructive/20 text-destructive border-2 border-destructive/30 hover:bg-destructive/30 rounded-full h-12 font-semibold transition-all duration-300 justify-start gap-3"
              disabled={isLoading || currentStatus === 'cancelled'}
            >
              <XCircle size={20} />
              <span>Cancel Booking</span>
            </Button>
          </div>
        ) : action === 'reschedule' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-date" className="text-secondary-foreground text-lg font-heading font-bold">
                New Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-time" className="text-secondary-foreground text-lg font-heading font-bold">
                New Time (Optional)
              </Label>
              <Input
                id="new-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-notes" className="text-secondary-foreground text-lg font-heading font-bold">
                Notes (Optional)
              </Label>
              <textarea
                id="new-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Add any additional notes about the rescheduled time..."
                className="flex min-h-[100px] w-full text-secondary-foreground rounded-md border border-accent bg-primary-foreground px-4 py-3 text-base shadow-sm placeholder:text-secondary-foreground/50 focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderRadius: '30px',
                }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setAction(null)}
                variant="outline"
                className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-12 font-medium transition-all duration-300"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleReschedule}
                className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-12 font-semibold transition-all duration-300"
                disabled={isLoading || !newDate}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Reschedule'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-secondary-foreground">
              {action === 'complete' 
                ? 'Are you sure you want to mark this booking as completed?'
                : 'Are you sure you want to cancel this booking? This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setAction(null)}
                variant="outline"
                className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-12 font-medium transition-all duration-300"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={action === 'complete' ? handleComplete : handleCancel}
                className={`flex-1 rounded-full h-12 font-semibold transition-all duration-300 ${
                  action === 'complete'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-destructive text-white hover:bg-destructive/90'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : action === 'complete' ? (
                  'Mark as Completed'
                ) : (
                  'Cancel Booking'
                )}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="rounded-full"
            disabled={isLoading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

