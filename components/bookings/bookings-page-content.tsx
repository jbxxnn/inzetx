"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  User,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon, Time04Icon, MapsLocation02Icon } from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { ManageBookingDialog } from "./manage-booking-dialog"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"

interface JobRequest {
  id: string;
  description: string;
  location?: {
    city?: string;
    postcode?: string;
    address?: string;
  } | null;
}

interface Booking {
  id: string;
  status: string;
  scheduled_time?: {
    start?: string;
    end?: string;
    date?: string;
    time?: string;
    notes?: string;
  } | null;
  created_at: string;
  job_requests?: JobRequest | null;
}

interface BookingsPageContentProps {
  bookings: Booking[];
  role: 'client' | 'freelancer';
}

export function BookingsPageContent({ bookings, role }: BookingsPageContentProps) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const router = useRouter()

  const handleManageBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setManageDialogOpen(true)
  }

  const handleBookingUpdate = () => {
    // Refresh the page to show updated bookings
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge className="bg-primary text-secondary-foreground rounded-full px-3 py-1 font-semibold">
            Upcoming
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-700 border border-green-500/30 rounded-full px-3 py-1 font-semibold">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-destructive/20 text-destructive border border-destructive/30 rounded-full px-3 py-1 font-semibold">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-secondary-foreground/20 text-secondary-foreground border border-secondary-foreground/30 rounded-full px-3 py-1 font-semibold">
            {status}
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout role={role} activePath="/dashboard/bookings">
      {/* Header Section */}
          <div className="flex flex-col gap-4 mb-6 sm:mb-8 lg:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
                My Bookings
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
                View and manage your {role} bookings
              </p>
            </div>
          </div>

          {/* Bookings Content */}
          {bookings.length === 0 ? (
            <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="flex flex-col items-center justify-center gap-6 py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center">
                  <HugeiconsIcon icon={Calendar02Icon} className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-sm sm:text-base text-secondary-foreground/70 mb-6 max-w-md mx-auto">
                    {role === 'client'
                      ? 'Bookings will appear here once you confirm with a freelancer.'
                      : 'Bookings will appear here once clients confirm your services.'}
                  </p>
                  {role === 'client' && (
                    <Button 
                      asChild 
                      className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 font-semibold"
                    >
                      <Link href="/chat/job">
                        Post a Job
                      </Link>
                    </Button>
                  )}
                  {role === 'freelancer' && (
                    <Button 
                      asChild 
                      className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 font-semibold"
                    >
                      <Link href="/dashboard/freelancer/profile">
                        Update Your Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {bookings.map((booking) => {
                const job = booking.job_requests;
                const scheduledTime = booking.scheduled_time;

                // Format location
                let locationStr = '';
                if (job?.location) {
                  const parts: string[] = [];
                  if (job.location.address) parts.push(job.location.address);
                  if (job.location.postcode) parts.push(job.location.postcode);
                  if (job.location.city) parts.push(job.location.city);
                  locationStr = parts.length > 0 ? parts.join(', ') : (job.location.city || 'Not specified');
                }

                // Format scheduled time
                let timeStr = '';
                if (scheduledTime) {
                  if (scheduledTime.date && scheduledTime.time) {
                    try {
                      const date = new Date(scheduledTime.date);
                      timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      timeStr += `, ${scheduledTime.time}`;
                    } catch {
                      timeStr = `${scheduledTime.date}, ${scheduledTime.time}`;
                    }
                  } else if (scheduledTime.start) {
                    try {
                      timeStr = new Date(scheduledTime.start).toLocaleString();
                      if (scheduledTime.end) {
                        timeStr += ` - ${new Date(scheduledTime.end).toLocaleString()}`;
                      }
                    } catch {
                      timeStr = scheduledTime.start;
                    }
                  }
                }

                return (
                  <Card 
                    key={booking.id} 
                    className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
                  >
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                              {role === 'client' ? (
                                <Briefcase size={20} className="text-secondary-foreground" />
                              ) : (
                                <User size={20} className="text-secondary-foreground" />
                              )}
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {job?.description
                                ? job.description.substring(0, 60) +
                                  (job.description.length > 60 ? '...' : '')
                                : 'Job Request'}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-secondary-foreground/70 ml-[52px]">
                            {role === 'client' ? 'Freelancer Booking' : 'Client Booking'}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {job && (
                        <div className="flex flex-col gap-3">
                          <p className="text-sm sm:text-base text-secondary-foreground/80 line-clamp-3 leading-relaxed">
                            {job.description}
                          </p>
                          {locationStr && (
                            <div className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                              <HugeiconsIcon icon={MapsLocation02Icon} className="w-4 h-4 text-primary shrink-0" />
                              <span>{locationStr}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {timeStr && (
                        <div className="flex items-start gap-3 p-4 bg-secondary rounded-xl border border-secondary-foreground/10">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={Time04Icon} className="w-5 h-5 text-secondary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-semibold text-secondary-foreground mb-1 text-sm">Scheduled Time</p>
                            <p className="text-sm text-secondary-foreground/70">
                              {timeStr}
                            </p>
                            {scheduledTime?.notes && (
                              <p className="text-sm text-secondary-foreground/60 mt-2 italic">
                                {scheduledTime.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                        {job && (
                          <Button 
                            asChild 
                            variant="outline" 
                            size="sm" 
                            className="border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-9 sm:h-10 font-medium transition-all duration-300"
                          >
                            <Link href={`/dashboard/jobs/${job.id}`} className="flex items-center justify-center gap-1.5">
                              View Job Details
                              <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => booking.status === 'upcoming' && handleManageBooking(booking)}
                          disabled={booking.status !== 'upcoming'}
                          className="border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-9 sm:h-10 font-medium transition-all duration-300 disabled:opacity-50"
                        >
                          {booking.status === 'upcoming' ? 'Manage Booking' : 'View Details'}
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-secondary/20">
                        <p className="text-xs sm:text-sm text-secondary-foreground/60">
                          Created {new Date(booking.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Manage Booking Dialog */}
          {selectedBooking && (
            <ManageBookingDialog
              bookingId={selectedBooking.id}
              currentStatus={selectedBooking.status}
              scheduledTime={selectedBooking.scheduled_time}
              isOpen={manageDialogOpen}
              onClose={() => {
                setManageDialogOpen(false)
                setSelectedBooking(null)
              }}
              onSuccess={handleBookingUpdate}
            />
          )}
    </DashboardLayout>
  )
}

