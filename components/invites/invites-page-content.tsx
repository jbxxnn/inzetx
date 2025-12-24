"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Mail02Icon,
  CheckmarkCircle02Icon,
  MapsLocation02Icon,
  Calendar02Icon,
  CoinsEuroIcon,
  Task02Icon,
  ArrowUpRightIcon,
} from "@hugeicons/core-free-icons"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"
import { updateJobInviteStatus } from "@/app/actions/invite"
import { createBooking } from "@/app/actions/booking"
import { Loader2 } from "lucide-react"

interface JobRequest {
  id: string;
  description: string;
  client_profile_id: string;
  location?: {
    city?: string;
    postcode?: string;
    address?: string;
  } | null;
  time_window?: {
    start?: string;
    end?: string;
    notes?: string;
    date?: string;
    time?: string;
  } | null;
  budget?: string | null;
}

interface Invite {
  id: string;
  job_request_id: string;
  freelancer_profile_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  job_requests?: JobRequest | null;
}

interface InvitesPageContentProps {
  invites: Invite[];
  role: string;
}

export default function InvitesPageContent({ invites, role }: InvitesPageContentProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, string>>(
    Object.fromEntries(invites.map((inv) => [inv.id, inv.status]))
  )

  const handleAccept = async (invite: Invite) => {
    setProcessingId(invite.id)
    setError(null)

    try {
      await updateJobInviteStatus(invite.id, 'accepted')

      if (invite.job_requests && invite.job_requests.client_profile_id) {
        const job = invite.job_requests
        await createBooking({
          jobRequestId: job.id,
          freelancerProfileId: invite.freelancer_profile_id,
          clientProfileId: job.client_profile_id,
          scheduledTime: (job.time_window as Record<string, unknown>) || {},
        })
      }

      setInviteStatuses((prev) => ({ ...prev, [invite.id]: 'accepted' }))
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to accept invite. Please try again.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId)
    setError(null)

    try {
      await updateJobInviteStatus(inviteId, 'declined')
      setInviteStatuses((prev) => ({ ...prev, [inviteId]: 'declined' }))
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to decline invite. Please try again.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border border-yellow-500/30 rounded-full px-3 py-1 font-semibold text-sm">Pending</Badge>
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-700 border border-green-500/30 rounded-full px-3 py-1 font-semibold text-sm">Accepted</Badge>
      case 'declined':
        return <Badge className="bg-red-500/20 text-red-700 border border-red-500/30 rounded-full px-3 py-1 font-semibold text-sm">Declined</Badge>
      default:
        return <Badge className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 font-semibold text-sm">{status}</Badge>
    }
  }

  // Group invites by status
  const pendingInvites = invites.filter(
    (inv) => inviteStatuses[inv.id] === 'pending'
  )
  const acceptedInvites = invites.filter(
    (inv) => inviteStatuses[inv.id] === 'accepted'
  )
  const declinedInvites = invites.filter(
    (inv) => inviteStatuses[inv.id] === 'declined'
  )

  const extractPrice = (budget: string | null | undefined): number => {
    if (!budget) return 0
    const match = budget.match(/[\d.]+/)
    return match ? parseFloat(match[0]) : 0
  }

  const formatLocation = (location: { city?: string; postcode?: string; address?: string } | null | undefined): string => {
    if (!location) return 'Location not specified'
    const parts: string[] = []
    if (location.address) parts.push(location.address)
    if (location.postcode) parts.push(location.postcode)
    if (location.city) parts.push(location.city)
    return parts.length > 0 ? parts.join(', ') : 'Location not specified'
  }

  const formatTimeWindow = (timeWindow: { start?: string; end?: string; notes?: string; date?: string; time?: string } | null | undefined): string => {
    if (!timeWindow) return 'Time flexible'
    if (timeWindow.notes) return timeWindow.notes
    if (timeWindow.date && timeWindow.time) return `${timeWindow.date}, ${timeWindow.time}`
    if (timeWindow.start && timeWindow.end) return `${timeWindow.start} - ${timeWindow.end}`
    return 'Time flexible'
  }

  return (
    <DashboardLayout role={role as 'client' | 'freelancer'} activePath="/dashboard/invites">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
            Job Invitations
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
            View and respond to job invitations from clients
          </p>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20 mb-6">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {invites.length === 0 ? (
        <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center gap-6 py-16 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center">
              <HugeiconsIcon icon={Mail02Icon} className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground mb-2">
                No invitations yet
              </h3>
              <p className="text-sm sm:text-base text-secondary-foreground/70 mb-6 max-w-md mx-auto">
                When clients invite you for jobs, they&apos;ll appear here.
              </p>
              <Button asChild className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2">
                <Link href="/onboarding">
                  Update Your Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                Pending Invitations ({pendingInvites.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {pendingInvites.map((invite) => {
                  const job = invite.job_requests
                  const isProcessing = processingId === invite.id

                  if (!job) return null

                  return (
                    <Card
                      key={invite.id}
                      className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <HugeiconsIcon icon={Task02Icon} className="w-6 h-6 text-secondary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {job.description.substring(0, 60)}
                              {job.description.length > 60 ? '...' : ''}
                            </CardTitle>
                          </div>
                        </div>
                        {getStatusBadge(inviteStatuses[invite.id])}
                        <p className="text-xs text-secondary-foreground/60 mt-2">
                          Invited {new Date(invite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm sm:text-base text-secondary-foreground/80 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Job Details */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-secondary/20">
                          {job.location && (
                            <div className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                              <HugeiconsIcon icon={MapsLocation02Icon} className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate">{formatLocation(job.location)}</span>
                            </div>
                          )}
                          {job.time_window && (
                            <div className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                              <HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4 text-primary shrink-0" />
                              <span>{formatTimeWindow(job.time_window)}</span>
                            </div>
                          )}
                          {job.budget && extractPrice(job.budget) > 0 && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                              <HugeiconsIcon icon={CoinsEuroIcon} className="w-4 h-4 shrink-0" />
                              <span>€{extractPrice(job.budget)}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 pt-2">
                          <Button
                            onClick={() => handleAccept(invite)}
                            disabled={isProcessing}
                            size="sm"
                            className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-9 sm:h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-1.5" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDecline(invite.id)}
                            disabled={isProcessing}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-red-500/30 h-9 sm:h-10 font-medium transition-all duration-300"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-1.5" />
                                Decline
                              </>
                            )}
                          </Button>
                        </div>

                        {job.id && (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="w-full border border-secondary-foreground/10 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/5 h-9 font-medium"
                          >
                            <Link href={`/dashboard/jobs/${job.id}`} className="flex items-center justify-center gap-1.5">
                              View Full Details
                              <HugeiconsIcon icon={ArrowUpRightIcon} className="w-4 h-4 mr-1.5" />
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Accepted Invites */}
          {acceptedInvites.length > 0 && (
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                Accepted ({acceptedInvites.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {acceptedInvites.map((invite) => {
                  const job = invite.job_requests
                  if (!job) return null

                  return (
                    <Card
                      key={invite.id}
                      className="bg-primary-foreground border-2 border-green-500/30 hover:border-green-500/50 transition-all duration-300 opacity-90"
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-green-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground line-clamp-2 mb-2">
                              {job.description.substring(0, 60)}
                              {job.description.length > 60 ? '...' : ''}
                            </CardTitle>
                          </div>
                        </div>
                        {getStatusBadge(inviteStatuses[invite.id])}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-secondary-foreground/70">
                          You accepted this invitation. Check your bookings to see the confirmed booking.
                        </p>
                        {job.id && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 h-9 font-medium"
                          >
                            <Link href={`/dashboard/jobs/${job.id}`} className="flex items-center justify-center gap-1.5">
                              View Job Details
                              <HugeiconsIcon icon={ArrowUpRightIcon} className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Declined Invites */}
          {declinedInvites.length > 0 && (
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                Declined ({declinedInvites.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {declinedInvites.map((invite) => {
                  const job = invite.job_requests
                  if (!job) return null

                  return (
                    <Card
                      key={invite.id}
                      className="bg-primary-foreground border-2 border-secondary/30 hover:border-secondary/50 transition-all duration-300 opacity-60"
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-red-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground/70 line-clamp-2 mb-2">
                              {job.description.substring(0, 60)}
                              {job.description.length > 60 ? '...' : ''}
                            </CardTitle>
                          </div>
                        </div>
                        {getStatusBadge(inviteStatuses[invite.id])}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary-foreground/60">
                          You declined this invitation.
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}

