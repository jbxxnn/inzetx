"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  Loader2,
  ArrowUpRight,
  TrendingUp,
  Star,
  Briefcase,
  MapPin,
  Calendar,
  EuroIcon,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GradientBorder } from "@/components/ui/gradient-border"
import { useRouter } from "next/navigation"
import { updateJobInviteStatus } from "@/app/actions/invite"
import { createBooking } from "@/app/actions/booking"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon, CoinsEuroIcon, Mail02Icon, Message02Icon, Task02Icon, User02Icon, Wallet02Icon } from "@hugeicons/core-free-icons"
import { DashboardLayout } from "./dashboard-sidebar"

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  completedJobs: number;
  rating: number;
  responseRate: number;
}

interface UpcomingJob {
  id: string;
  title: string;
  client: string;
  address: string;
  date: string;
  price: number;
  status: "confirmed" | "pending";
  jobRequestId?: string;
  clientProfileId?: string;
}

interface PendingInvite {
  id: string;
  jobRequestId?: string;
  title: string;
  client: string;
  address: string;
  price: number;
  clientProfileId?: string;
  freelancerProfileId: string;
  timeWindow: Record<string, unknown>;
}

interface FreelancerDashboardProps {
  stats: DashboardStats;
  upcomingJobs: UpcomingJob[];
  pendingInvites: PendingInvite[];
  userName: string;
}

export default function FreelancerDashboard({ 
  stats, 
  upcomingJobs, 
  pendingInvites,
  userName 
}: FreelancerDashboardProps) {
  // const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null)
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, string>>(
    Object.fromEntries(pendingInvites.map((inv) => [inv.id, 'pending']))
  )
  
  const visibleInvites = pendingInvites.filter(
    (inv) => inviteStatuses[inv.id] === 'pending'
  )

  const handleAcceptInvite = async (invite: PendingInvite) => {
    setProcessingInviteId(invite.id)
    try {
      await updateJobInviteStatus(invite.id, 'accepted')
      
      if (invite.jobRequestId && invite.clientProfileId) {
        await createBooking({
          jobRequestId: invite.jobRequestId,
          freelancerProfileId: invite.freelancerProfileId,
          clientProfileId: invite.clientProfileId,
          scheduledTime: invite.timeWindow,
        })
      }

      setInviteStatuses((prev) => ({ ...prev, [invite.id]: 'accepted' }))
      router.refresh()
    } catch (err) {
      console.error('Failed to accept invite:', err)
    } finally {
      setProcessingInviteId(null)
    }
  }

  const handleDeclineInvite = async (inviteId: string) => {
    setProcessingInviteId(inviteId)
    try {
      await updateJobInviteStatus(inviteId, 'declined')
      setInviteStatuses((prev) => ({ ...prev, [inviteId]: 'declined' }))
      router.refresh()
    } catch (err) {
      console.error('Failed to decline invite:', err)
    } finally {
      setProcessingInviteId(null)
    }
  }
  
  // Messages placeholder - messaging system not yet implemented
  const recentMessages: Array<{
    id: number;
    name: string;
    message: string;
    time: string;
    unread: boolean;
    avatar: string;
  }> = []

  const unreadCount = recentMessages.filter(m => m.unread).length

  return (
    <DashboardLayout 
      role="freelancer" 
      activePath="/dashboard" 
      unreadCount={unreadCount}
      pendingInvitesCount={visibleInvites.length}
    >
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
              Welcome back, {userName}!
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">Here&apos;s what&apos;s happening with your jobs today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl min-w-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Total Earnings</span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={CoinsEuroIcon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-1 sm:mb-2">
                  €{stats.totalEarnings.toFixed(0)}
                </p>
                {stats.monthlyEarnings > 0 && (
                  <div className="flex items-center gap-1 text-accent text-xs sm:text-sm font-medium">
                    <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="truncate">€{stats.monthlyEarnings.toFixed(0)} this month</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Jobs Completed</span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Task02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-1 sm:mb-2">
                  {stats.completedJobs}
                </p>
                {stats.completedJobs > 0 && (
                  <p className="text-primary text-xs sm:text-sm font-medium">Completed</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Rating</span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Star className="text-secondary-foreground fill-primary w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                   <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
                     {stats.rating > 0 ? stats.rating.toFixed(1) : '—'}
                   </p>
                   {stats.rating > 0 ? (
                     <div className="flex gap-0.5 sm:gap-1">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <Star 
                           key={star} 
                           size={12} 
                           className={`sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                             star <= Math.round(stats.rating)
                               ? 'fill-primary text-primary'
                               : 'fill-transparent text-secondary-foreground/30'
                           }`} 
                         />
                       ))}
                     </div>
                   ) : (
                     <p className="text-xs sm:text-sm text-secondary-foreground/60">No reviews yet</p>
                   )}
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Response Rate</span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Clock className="text-secondary-foreground w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
                  {stats.responseRate}%
                </p>
                <Progress value={stats.responseRate} className="h-2 sm:h-3 bg-secondary/30" />
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-w-0">
            {/* Upcoming Jobs */}
            <div className="lg:col-span-2 min-w-0">
              <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-secondary-foreground text-lg sm:text-xl lg:text-2xl font-heading font-bold">Upcoming Jobs</CardTitle>
                  <Button variant="ghost" className="text-secondary-foreground hover:text-primary rounded-full text-xs sm:text-sm" asChild>
                    <Link href="/dashboard/bookings" className="flex items-center gap-1">
                      View All <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  {upcomingJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center mb-3 sm:mb-4">
                        <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-foreground" />
                      </div>
                      <p className="text-sm sm:text-base font-medium text-secondary-foreground mb-1">No upcoming jobs</p>
                      <p className="text-xs sm:text-sm text-secondary-foreground/60">Your upcoming bookings will appear here</p>
                    </div>
                  ) : (
                    upcomingJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={job.jobRequestId ? `/dashboard/jobs/${job.jobRequestId}` : '#'}
                        className="group flex items-start gap-3 sm:gap-4 lg:gap-5 p-3 sm:p-4 lg:p-5 bg-secondary rounded-xl sm:rounded-2xl hover:bg-secondary hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-primary group-hover:bg-primary flex items-center justify-center shrink-0 transition-colors">
                        <HugeiconsIcon icon={Task02Icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-bold text-sm sm:text-base lg:text-lg text-secondary-foreground mb-1 group-hover:text-primary transition-colors truncate">
                                {job.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-secondary-foreground/70 font-medium truncate">{job.client}</p>
                          </div>
                          <Badge
                            className={
                              job.status === "confirmed"
                                  ? "bg-primary text-secondary-foreground rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-xs sm:text-sm shrink-0"
                                  : "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-xs sm:text-sm shrink-0"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-secondary-foreground/60">
                            <span className="flex items-center gap-1 sm:gap-2 font-medium bg-primary rounded-full px-2 sm:px-3 py-1">
                              <MapPin size={12} className="sm:w-4 sm:h-4 text-secondary-foreground shrink-0" />
                              <span className="truncate max-w-[120px] sm:max-w-none">{job.address}</span>
                          </span>
                            <span className="flex items-center gap-1 sm:gap-2 font-medium bg-primary rounded-full px-2 sm:px-3 py-1">
                              <Calendar size={12} className="sm:w-4 sm:h-4 text-secondary-foreground shrink-0" />
                            {job.date}
                          </span>
                            <span className="flex items-center gap-1 sm:gap-2 text-secondary-foreground font-bold bg-primary rounded-full px-2 sm:px-3 py-1">
                              <EuroIcon size={12} className="sm:w-4 sm:h-4 shrink-0" />€{job.price}
                          </span>
                        </div>
                      </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Job Invites */}
              <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-secondary-foreground text-lg sm:text-xl font-heading font-bold">Job Invites</CardTitle>
                  <Button variant="ghost" className="text-secondary-foreground hover:text-primary rounded-full text-xs sm:text-sm" asChild>
                    <Link href="/dashboard/invites" className="flex items-center gap-1">
                      View All <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  {visibleInvites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center mb-2 sm:mb-3">
                        <HugeiconsIcon icon={Mail02Icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-sm sm:text-base font-medium text-secondary-foreground">No pending invites</p>
                    </div>
                  ) : (
                    visibleInvites.map((invite) => {
                      const isProcessing = processingInviteId === invite.id;
                      return (
                        <GradientBorder 
                          key={invite.id}
                          variant="accent" 
                          borderWidth={2} 
                          borderRadius="rounded-xl sm:rounded-2xl" 
                          innerBg="bg-secondary/30"
                          className="hover:scale-[1.02] transition-transform duration-300"
                        >
                          <div className="p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <HugeiconsIcon icon={Mail02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-heading font-bold text-secondary-foreground text-xs sm:text-sm mb-1 truncate">
                                  {invite.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-secondary-foreground font-medium truncate">{invite.client}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-secondary-foreground mb-3 sm:mb-4">
                              <span className="flex items-center gap-1.5 sm:gap-2 font-medium truncate">
                                <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-secondary-foreground shrink-0" />
                                <span className="truncate">{invite.address}</span>
                              </span>
                              <span className="flex items-center gap-1.5 sm:gap-2 text-secondary-foreground font-bold">
                                <HugeiconsIcon icon={CoinsEuroIcon} className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />€{invite.price}
                              </span>
                            </div>
                            <div className="flex gap-2 mb-2 sm:mb-3">
                              <Button
                                onClick={() => handleAcceptInvite(invite)}
                                disabled={isProcessing}
                                size="sm"
                                className="flex-1 bg-primary text-secondary-foreground rounded-full hover:bg-primary font-semibold h-8 sm:h-9 text-xs sm:text-sm"
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleDeclineInvite(invite.id)}
                                disabled={isProcessing}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs sm:text-sm border-secondary-foreground rounded-full hover:bg-secondary-foreground h-8 sm:h-9"
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle size={12} className="sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                                    Decline
                                  </>
                                )}
                              </Button>
                            </div>
                            {invite.jobRequestId && (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs sm:text-sm rounded-full hover:bg-secondary-foreground h-8 sm:h-9"
                              >
                                <Link href={`/dashboard/jobs/${invite.jobRequestId}`} className="flex items-center justify-center gap-1">
                                  View Details <ArrowUpRight size={10} className="sm:w-3 sm:h-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </GradientBorder>
                      );
                    })
                  )}
                </CardContent>
              </Card>

            {/* Recent Messages */}
              <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-secondary-foreground text-lg sm:text-xl font-heading font-bold">Messages</CardTitle>
                  <Button variant="ghost" className="text-secondary-foreground hover:text-primary rounded-full text-xs sm:text-sm" disabled>
                    View All <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                  {recentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center mb-2 sm:mb-3">
                        <HugeiconsIcon icon={Message02Icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-sm sm:text-base font-medium text-secondary-foreground mb-1">No messages yet</p>
                      <p className="text-xs sm:text-sm text-secondary-foreground/60">Messages will appear here once the messaging system is available</p>
                    </div>
                  ) : (
                    recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                        className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 ${
                          msg.unread 
                            ? "bg-secondary rounded-xl sm:rounded-2xl border-2 border-primary" 
                            : "hover:bg-secondary border-2 border-transparent hover:border-secondary-foreground"
                        }`}
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <HugeiconsIcon icon={Message02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                          <h4
                              className={`font-heading font-bold text-sm sm:text-base lg:text-lg text-secondary-foreground truncate ${
                                msg.unread ? "text-secondary-foreground" : "text-secondary-foreground/60"
                              }`}
                          >
                            {msg.name}
                          </h4>
                            <span className="text-xs sm:text-sm text-secondary-foreground/60 shrink-0 ml-2">{msg.time}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-secondary-foreground truncate">{msg.message}</p>
                        </div>
                        {msg.unread && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full shrink-0 mt-2 animate-pulse" />
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-secondary-foreground text-lg sm:text-xl font-heading font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                  <Button 
                    className="w-full bg-primary text-secondary-foreground rounded-full hover:bg-primary justify-start gap-2 sm:gap-3 h-10 sm:h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base" 
                  >
                    <HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                    Update Availability
                  </Button>
                  <Button
                    className="w-full justify-start gap-2 sm:gap-3 border-2 border-secondary-foreground text-secondary-foreground bg-transparent rounded-full hover:bg-primary hover:border-secondary-foreground h-10 sm:h-12 font-medium transition-all duration-300 text-sm sm:text-base"
                  >
                    <HugeiconsIcon icon={User02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                    Edit Profile
                  </Button>
                  <Button
                    className="w-full justify-start gap-2 sm:gap-3 border-2 border-secondary-foreground text-secondary-foreground bg-transparent rounded-full hover:bg-primary hover:border-secondary-foreground h-10 sm:h-12 font-medium transition-all duration-300 text-sm sm:text-base"
                  >
                    <HugeiconsIcon icon={Wallet02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                    Request Payout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
    </DashboardLayout>
  )
}
