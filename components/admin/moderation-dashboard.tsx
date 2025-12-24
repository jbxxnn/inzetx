"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Flag02Icon, 
  CheckmarkCircle02Icon, 
  CloseCircleIcon,
  EyeIcon,
  Filter02Icon
} from "@hugeicons/core-free-icons"
import { getPendingFlags, updateFlagStatus, type Review } from "@/app/actions/review"
import { useRouter } from "next/navigation"
import { FlagDetailDialog } from "./flag-detail-dialog"
import Image from "next/image"

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

interface ModerationDashboardProps {
  pendingFlags: Flag[]
  adminProfileId: string
}

export default function ModerationDashboard({
  pendingFlags: initialPendingFlags,
  adminProfileId,
}: ModerationDashboardProps) {
  const router = useRouter()
  const [pendingFlags, setPendingFlags] = useState(initialPendingFlags)
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleViewDetails = (flag: Flag) => {
    setSelectedFlag(flag)
    setIsDetailDialogOpen(true)
  }

  const handleResolveFlag = async (flagId: string, action: 'resolved' | 'dismissed', notes?: string) => {
    setIsProcessing(flagId)
    try {
      await updateFlagStatus(flagId, action, adminProfileId, notes)
      // Remove from pending list
      setPendingFlags(prev => prev.filter(f => f.id !== flagId))
      router.refresh()
    } catch (error) {
      console.error('Failed to update flag:', error)
      alert(error instanceof Error ? error.message : 'Failed to update flag')
    } finally {
      setIsProcessing(null)
      setIsDetailDialogOpen(false)
      setSelectedFlag(null)
    }
  }

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case 'inappropriate':
        return 'bg-destructive/20 text-destructive'
      case 'spam':
        return 'bg-yellow-500/20 text-yellow-600'
      case 'harassment':
        return 'bg-red-500/20 text-red-600'
      case 'false_information':
        return 'bg-orange-500/20 text-orange-600'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout role="client" activePath="/dashboard/admin/moderation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2">
              Review Moderation
            </h1>
            <p className="text-sm sm:text-base text-secondary-foreground/70">
              Review and manage flagged reviews
            </p>
          </div>
          <Badge className="bg-primary text-secondary-foreground px-4 py-2 text-sm font-semibold">
            {pendingFlags.length} Pending
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-primary-foreground border-2 border-secondary/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-foreground/70 mb-1">Pending Flags</p>
                  <p className="text-2xl font-heading font-bold text-secondary-foreground">
                    {pendingFlags.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <HugeiconsIcon icon={Flag02Icon} className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground border-2 border-secondary/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-foreground/70 mb-1">This Week</p>
                  <p className="text-2xl font-heading font-bold text-secondary-foreground">
                    {pendingFlags.filter(f => {
                      const flagDate = new Date(f.created_at)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return flagDate >= weekAgo
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <HugeiconsIcon icon={Filter02Icon} className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground border-2 border-secondary/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-foreground/70 mb-1">Total Reviews</p>
                  <p className="text-2xl font-heading font-bold text-secondary-foreground">
                    {new Set(pendingFlags.map(f => f.review_id)).size}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <HugeiconsIcon icon={EyeIcon} className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flags List */}
        {pendingFlags.length === 0 ? (
          <Card className="bg-primary-foreground border-2 border-secondary/50">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-heading font-bold text-secondary-foreground mb-2">
                  All Clear!
                </h3>
                <p className="text-sm text-secondary-foreground/70">
                  No pending flags to review
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingFlags.map((flag) => {
              const review = flag.reviews
              const client = review?.profiles
              const flagger = flag.profiles

              return (
                <Card 
                  key={flag.id} 
                  className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      {/* Review Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getReasonBadgeColor(flag.reason)}>
                                {flag.reason.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-secondary-foreground/60">
                                {formatDate(flag.created_at)}
                              </span>
                            </div>
                            <h3 className="font-heading font-bold text-secondary-foreground mb-1">
                              Flagged Review
                            </h3>
                            {review && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {client?.profile_photo ? (
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                      <Image
                                        src={client.profile_photo}
                                        alt={client.full_name || "Client"}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                      <span className="text-xs text-secondary-foreground">
                                        {client?.full_name?.[0] || 'C'}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-secondary-foreground">
                                    {client?.full_name || 'Anonymous Client'}
                                  </span>
                                  <span className="text-xs text-secondary-foreground/60">
                                    • Rating: {review.rating}/5
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-secondary-foreground/80 line-clamp-2">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            )}
                            {flag.description && (
                              <div className="mt-2 p-2 bg-secondary/50 rounded-md">
                                <p className="text-xs font-semibold text-secondary-foreground mb-1">
                                  Flag Reason:
                                </p>
                                <p className="text-xs text-secondary-foreground/80">
                                  {flag.description}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-secondary-foreground/60 mt-2">
                              Flagged by: {flagger?.full_name || 'Anonymous'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(flag)}
                          className="flex-1 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10 rounded-full"
                        >
                          <HugeiconsIcon icon={EyeIcon} className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveFlag(flag.id, 'resolved')}
                          disabled={isProcessing === flag.id}
                          className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500/10 rounded-full"
                        >
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveFlag(flag.id, 'dismissed')}
                          disabled={isProcessing === flag.id}
                          className="flex-1 border-secondary-foreground/20 text-secondary-foreground/70 hover:bg-secondary-foreground/10 rounded-full"
                        >
                          <HugeiconsIcon icon={CloseCircleIcon} className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Flag Detail Dialog */}
        {selectedFlag && (
          <FlagDetailDialog
            flag={selectedFlag}
            isOpen={isDetailDialogOpen}
            onClose={() => {
              setIsDetailDialogOpen(false)
              setSelectedFlag(null)
            }}
            onResolve={handleResolveFlag}
            adminProfileId={adminProfileId}
            isProcessing={isProcessing === selectedFlag.id}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

