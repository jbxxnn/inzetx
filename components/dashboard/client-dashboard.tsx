"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Task02Icon, CoinsEuroIcon, User02Icon, MapsLocation02Icon, Search02Icon, CheckmarkCircle02Icon, ArrowUp02Icon, Briefcase02Icon, Calendar02Icon, StarCircleIcon } from "@hugeicons/core-free-icons"
import { DashboardLayout } from "./dashboard-sidebar"
import { ReviewForm } from "@/components/review/review-form"

interface ClientDashboardStats {
  activeJobs: number;
  completedJobs: number;
  totalSpent: number;
  savedFreelancers: number;
}

interface ActiveJob {
  id: string;
  title: string;
  freelancer: string;
  freelancerImage?: string;
  rating: number;
  status: "in_progress" | "scheduled";
  startDate: string;
  estimatedEnd: string;
  price: number;
  jobRequestId: string;
  freelancerProfileId: string;
}

interface CompletedJob {
  id: string;
  title: string;
  freelancer: string;
  freelancerImage?: string;
  rating: number;
  completedDate: string;
  price: number;
  reviewed: boolean;
  jobRequestId: string;
  freelancerProfileId: string;
}

interface ClientDashboardProps {
  stats: ClientDashboardStats;
  activeJobs: ActiveJob[];
  completedJobs: CompletedJob[];
  userName: string;
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

export default function ClientDashboard({
  stats,
  activeJobs,
  completedJobs,
  userName
}: ClientDashboardProps) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<CompletedJob | null>(null)
  const unreadCount = recentMessages.filter(m => m.unread).length

  const handleLeaveReview = (job: CompletedJob) => {
    setSelectedBooking(job)
    setReviewDialogOpen(true)
  }

  const handleReviewSuccess = () => {
    setReviewDialogOpen(false)
    setSelectedBooking(null)
    // Refresh will be handled by the ReviewForm component
  }

  return (
    <DashboardLayout role="client" activePath="/dashboard" unreadCount={unreadCount}>
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">Manage your home projects and hired professionals.</p>
        </div>
        <Link href="/chat/job">
          <Button className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 font-semibold">
            <Plus size={20} />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
        <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Active Jobs</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Task02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-1 sm:mb-2">
              {stats.activeJobs}
            </p>
            <p className="text-primary text-xs sm:text-sm font-medium">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Completed</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-1 sm:mb-2">
              {stats.completedJobs}
            </p>
            <p className="text-secondary-foreground/60 text-xs sm:text-sm font-medium">Jobs done</p>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Total Spent</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={CoinsEuroIcon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-1 sm:mb-2">
              €{stats.totalSpent}
            </p>
            <div className="flex items-center gap-1 text-primary text-xs sm:text-sm font-medium">
              <HugeiconsIcon icon={ArrowUp02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span>This year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <span className="text-secondary-foreground text-xs sm:text-sm font-medium uppercase tracking-wide">Saved Pros</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={User02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-1 sm:mb-2">
              {stats.savedFreelancers}
            </p>
            <p className="text-secondary-foreground/60 text-xs sm:text-sm font-medium">Favorites</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        {/* Active Jobs */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
          <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-secondary-foreground text-lg sm:text-xl lg:text-2xl font-heading font-bold">Active Jobs</CardTitle>
              <Button variant="ghost" className="text-secondary-foreground hover:text-primary rounded-full text-xs sm:text-sm" asChild>
                <Link href="/dashboard/jobs" className="flex items-center gap-1">
                  View All <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              {activeJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center mb-3 sm:mb-4">
                    <HugeiconsIcon icon={Briefcase02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-secondary-foreground mb-1">No active jobs</p>
                  <p className="text-xs sm:text-sm text-secondary-foreground/60">Your active bookings will appear here</p>
                </div>
              ) : (
                activeJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={job.jobRequestId ? `/dashboard/jobs/${job.jobRequestId}` : '#'}
                    className="group flex items-start gap-3 sm:gap-4 lg:gap-5 p-3 sm:p-4 lg:p-5 bg-secondary rounded-xl sm:rounded-2xl hover:bg-secondary hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shrink-0 border-2 border-secondary-foreground/10 group-hover:border-primary/30 transition-colors">
                      <Image
                        src={job.freelancerImage || "/placeholder.svg"}
                        alt={job.freelancer}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-sm sm:text-base lg:text-lg text-secondary-foreground mb-1 transition-colors truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm text-secondary-foreground/70 font-medium truncate">{job.freelancer}</span>
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={StarCircleIcon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                              <span className="text-xs sm:text-sm text-primary font-semibold">
                                {job.rating > 0 ? job.rating.toFixed(1) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            job.status === "in_progress"
                              ? "bg-primary text-secondary-foreground rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-xs sm:text-sm shrink-0"
                              : "bg-blue-500/20 text-blue-700 border border-blue-500/30 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-xs sm:text-sm shrink-0"
                          }
                        >
                          {job.status === "in_progress" ? "In Progress" : "Scheduled"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-secondary-foreground/60">
                        <span className="flex items-center gap-1 sm:gap-2 font-medium bg-primary rounded-full px-2 sm:px-3 py-1">
                          <HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                          {job.startDate} - {job.estimatedEnd}
                        </span>
                        <span className="flex items-center gap-1 sm:gap-2 text-secondary-foreground font-bold bg-primary rounded-full px-2 sm:px-3 py-1">
                          <HugeiconsIcon icon={CoinsEuroIcon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />€{job.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Completed Jobs */}
          <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300 min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-secondary-foreground text-lg sm:text-xl lg:text-2xl font-heading font-bold">Completed Jobs</CardTitle>
              <Button variant="ghost" className="text-secondary-foreground hover:text-primary rounded-full text-xs sm:text-sm" asChild>
                <Link href="/dashboard/jobs?status=completed" className="flex items-center gap-1">
                  View All <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              {completedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center mb-3 sm:mb-4">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-secondary-foreground mb-1">No completed jobs</p>
                  <p className="text-xs sm:text-sm text-secondary-foreground/60">Your completed jobs will appear here</p>
                </div>
              ) : (
                completedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={job.jobRequestId ? `/dashboard/jobs/${job.jobRequestId}` : '#'}
                    className="group flex items-start gap-3 sm:gap-4 lg:gap-5 p-3 sm:p-4 lg:p-5 bg-secondary rounded-xl sm:rounded-2xl hover:bg-secondary hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border-2 border-secondary-foreground/10 group-hover:border-primary/30 transition-colors">
                      <Image
                        src={job.freelancerImage || "/placeholder.svg"}
                        alt={job.freelancer}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-sm sm:text-base lg:text-lg text-secondary-foreground mb-1 group-hover:text-primary transition-colors truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm text-secondary-foreground/70 font-medium truncate">{job.freelancer}</span>
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={StarCircleIcon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                              <span className="text-xs sm:text-sm text-primary font-semibold">
                                {job.rating > 0 ? job.rating.toFixed(1) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-secondary-foreground font-bold bg-primary rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm shrink-0">
                          <HugeiconsIcon icon={CoinsEuroIcon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />€{job.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 sm:mt-3 flex-wrap gap-2">
                        <span className="text-xs sm:text-sm text-secondary-foreground/60 flex items-center gap-1.5 sm:gap-2 font-medium">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                          Completed {job.completedDate}
                        </span>
                        {!job.reviewed && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleLeaveReview(job)
                            }}
                            className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full text-xs sm:text-sm h-8 sm:h-9 font-semibold"
                          >
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Messages */}
          <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-secondary-foreground text-lg sm:text-xl font-heading font-bold">Messages</CardTitle>
              <Button variant="ghost" className="text-secondary-foreground hover:text-primary rounded-full text-xs sm:text-sm" disabled>
                View All <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 ${msg.unread
                      ? "bg-secondary rounded-xl sm:rounded-2xl border-2 border-primary"
                      : "hover:bg-secondary border-2 border-transparent hover:border-secondary-foreground"
                    }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border-2 border-secondary-foreground/10">
                    <Image
                      src={msg.avatar || "/placeholder.svg"}
                      alt={msg.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-heading font-bold text-sm sm:text-base lg:text-lg text-secondary-foreground truncate ${msg.unread ? "text-secondary-foreground" : "text-secondary-foreground/60"
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
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-primary-foreground border-2 border-secondary hover:border-primary transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-secondary-foreground text-lg sm:text-xl font-heading font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
              <Link href="/chat/job" className="block">
                <Button className="w-full bg-primary text-secondary-foreground rounded-full hover:bg-primary justify-start gap-2 sm:gap-3 h-10 sm:h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                  <HugeiconsIcon icon={Search02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                  Find a Professional
                </Button>
              </Link>
              <Button
                className="w-full justify-start gap-2 sm:gap-3 border-2 border-secondary-foreground text-secondary-foreground bg-transparent rounded-full hover:bg-primary hover:border-secondary-foreground h-10 sm:h-12 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <HugeiconsIcon icon={MapsLocation02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                Manage Addresses
              </Button>
              <Button
                className="w-full justify-start gap-2 sm:gap-3 border-2 border-secondary-foreground text-secondary-foreground bg-transparent rounded-full hover:bg-primary hover:border-secondary-foreground h-10 sm:h-12 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <HugeiconsIcon icon={User02Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Form Dialog */}
      {selectedBooking && (
        <ReviewForm
          bookingId={selectedBooking.id}
          freelancerName={selectedBooking.freelancer}
          jobDescription={selectedBooking.title}
          isOpen={reviewDialogOpen}
          onClose={() => {
            setReviewDialogOpen(false)
            setSelectedBooking(null)
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </DashboardLayout>
  )
}
