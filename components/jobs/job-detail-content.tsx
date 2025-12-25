"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsLocation02Icon,
  Calendar02Icon,
  CoinsEuroIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"

interface JobRequest {
  id: string;
  description: string;
  location?: { city?: string; postcode?: string; address?: string } | null;
  time_window?: {
    start?: string;
    end?: string;
    date?: string;
    time?: string;
    notes?: string;
    flexible?: boolean;
  } | null;
  budget?: string | null;
  created_at: string;
  client_profile_id: string;
}

interface JobDetailContentProps {
  job: JobRequest;
  jobId: string;
  role: string;
}

export function JobDetailContent({ job, jobId, role }: JobDetailContentProps) {

  // Format location
  let locationStr = '';
  if (job.location) {
    const parts: string[] = [];
    if (job.location.address) parts.push(job.location.address);
    if (job.location.postcode) parts.push(job.location.postcode);
    if (job.location.city) parts.push(job.location.city);
    locationStr = parts.length > 0 ? parts.join(', ') : '';
  }

  // Format time window
  let timeWindowStr = '';
  if (job.time_window) {
    if (job.time_window.date) {
      try {
        const date = new Date(job.time_window.date);
        timeWindowStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (job.time_window.time) {
          timeWindowStr += `, ${job.time_window.time}`;
        }
      } catch {
        timeWindowStr = job.time_window.date;
      }
    } else if (job.time_window.start) {
      try {
        timeWindowStr = new Date(job.time_window.start).toLocaleString();
        if (job.time_window.end) {
          timeWindowStr += ` - ${new Date(job.time_window.end).toLocaleString()}`;
        }
      } catch {
        timeWindowStr = job.time_window.start;
      }
    } else if (job.time_window.flexible) {
      timeWindowStr = 'Flexible';
    }
  }

  // Extract price from budget
  const extractPrice = (budget: string | null | undefined): number => {
    if (!budget) return 0;
    const match = budget.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  return (
    <DashboardLayout role={role as 'client' | 'freelancer'} activePath={role === 'client' ? "/dashboard/jobs" : "/dashboard/invites"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-secondary-foreground/10"
          >
            <Link href={role === 'client' ? "/dashboard/jobs" : "/dashboard/bookings"}>
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
              Job Details
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
              View and manage your job request
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Description Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  {/* <HugeiconsIcon icon={FileText02Icon} className="w-5 h-5 text-secondary-foreground" /> */}
                </div>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-secondary-foreground/80 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:gap-6">
              {locationStr && (
                <div className="flex items-start gap-3 sm:gap-4 p-4 bg-secondary rounded-xl border border-secondary-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={MapsLocation02Icon} className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-secondary-foreground mb-1">Location</p>
                    <p className="text-sm sm:text-base text-secondary-foreground/70">
                      {locationStr}
                    </p>
                  </div>
                </div>
              )}

              {timeWindowStr && (
                <div className="flex items-start gap-3 sm:gap-4 p-4 bg-secondary rounded-xl border border-secondary-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Calendar02Icon} className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-secondary-foreground mb-1">Time Window</p>
                    <p className="text-sm sm:text-base text-secondary-foreground">
                      {timeWindowStr}
                    </p>
                    {job.time_window?.notes && (
                      <p className="text-sm text-secondary-foreground mt-2 italic">
                        {job.time_window.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {job.budget && extractPrice(job.budget) > 0 && (
                <div className="flex items-start gap-3 sm:gap-4 p-4 bg-secondary rounded-xl border border-secondary-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={CoinsEuroIcon} className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-secondary-foreground mb-1">Budget</p>
                    <p className="text-base sm:text-lg font-bold text-secondary-foreground">
                      €{extractPrice(job.budget)}
                    </p>
                    {(job.budget.includes('hour') || job.budget.includes('day') || job.budget.includes('project')) && (
                      <p className="text-xs sm:text-sm text-secondary-foreground/60 mt-1">
                        {job.budget}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Actions Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {role === 'client' ? (
                <>
                  <Button
                    asChild
                    className="w-full bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/dashboard/jobs/${jobId}/matches`} className="flex items-center justify-center gap-2">
                      Find Matches
                      <ArrowUpRight size={18} />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-11 font-medium transition-all duration-300"
                  >
                    <Link href="/dashboard/jobs" className="flex items-center justify-center gap-2">
                      <ArrowLeft size={18} />
                      Back to Jobs
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-11 font-medium transition-all duration-300"
                  >
                    <Link href="/dashboard/bookings" className="flex items-center justify-center gap-2">
                      <ArrowLeft size={18} />
                      Back to Bookings
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-11 font-medium transition-all duration-300"
                  >
                    <Link href="/dashboard/invites" className="flex items-center justify-center gap-2">
                      <ArrowLeft size={18} />
                      Back to Invites
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div>
                  <Badge className="bg-primary text-secondary-foreground rounded-full px-3 py-1 font-semibold">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-secondary/20">
                <p className="text-xs sm:text-sm text-secondary-foreground/60">
                  Created {new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

