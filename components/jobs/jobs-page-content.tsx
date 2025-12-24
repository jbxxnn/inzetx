"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Task02Icon, MapsLocation02Icon, Calendar02Icon, CoinsEuroIcon, Add02Icon } from "@hugeicons/core-free-icons"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"

interface JobRequest {
  id: string;
  description: string;
  location?: { city?: string; postcode?: string; address?: string } | null;
  time_window?: { date?: string; time?: string; flexible?: boolean } | null;
  budget?: string | null;
  created_at: string;
}

interface JobsPageContentProps {
  jobs: JobRequest[];
}

export function JobsPageContent({ jobs }: JobsPageContentProps) {
  // Extract price from budget
  const extractPrice = (budget: string | null | undefined): number => {
    if (!budget) return 0;
    const match = budget.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  return (
    <DashboardLayout role="client" activePath="/dashboard/jobs">
      {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
                My Jobs
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
                Manage your job requests and find freelancers
              </p>
            </div>
            <Button 
              asChild 
              className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 font-semibold"
            >
              <Link href="/chat/job">
                <HugeiconsIcon icon={Add02Icon} className="w-5 h-5" />
                Post a Job
              </Link>
            </Button>
          </div>

          {/* Jobs Grid */}
          {jobs.length === 0 ? (
            <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="flex flex-col items-center justify-center gap-6 py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center">
                  <HugeiconsIcon icon={Task02Icon} className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground mb-2">
                    No jobs yet
                  </h3>
                  <p className="text-sm sm:text-base text-secondary-foreground/70 mb-6 max-w-md mx-auto">
                    Create your first job request to find freelancers
                  </p>
                  <Button 
                    asChild 
                    className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 font-semibold"
                  >
                    <Link href="/chat/job">
                      <HugeiconsIcon icon={Add02Icon} className="w-5 h-5" />
                      Post Your First Job
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs.map((job) => {
                // Format location
                let locationStr = 'Location not specified';
                if (job.location) {
                  const parts: string[] = [];
                  if (job.location.address) parts.push(job.location.address);
                  if (job.location.postcode) parts.push(job.location.postcode);
                  if (job.location.city) parts.push(job.location.city);
                  locationStr = parts.length > 0 ? parts.join(', ') : locationStr;
                }

                // Format date
                let dateStr = 'Date flexible';
                if (job.time_window?.date) {
                  try {
                    const date = new Date(job.time_window.date);
                    dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (job.time_window.time) {
                      dateStr += `, ${job.time_window.time}`;
                    }
                  } catch {
                    dateStr = job.time_window.date;
                  }
                } else if (job.time_window?.flexible) {
                  dateStr = 'Date flexible';
                }

                return (
                  <Card 
                    key={job.id} 
                    className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
                  >
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start gap-3 mb-3">
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm sm:text-base text-secondary-foreground/80 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>
                      
                      {/* Job Details */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-secondary/20">
                        {locationStr !== 'Location not specified' && (
                          <div className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                            <HugeiconsIcon icon={MapsLocation02Icon} className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{locationStr}</span>
                          </div>
                        )}
                        {dateStr !== 'Date flexible' && (
                          <div className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                            <HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4 text-primary shrink-0" />
                            <span>{dateStr}</span>
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
                          asChild 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-9 sm:h-10 font-medium transition-all duration-300"
                        >
                          <Link href={`/dashboard/jobs/${job.id}`} className="flex items-center justify-center gap-1.5">
                            View Details
                            <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          size="sm" 
                          className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-9 sm:h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Link href={`/dashboard/jobs/${job.id}/matches`} className="flex items-center justify-center gap-1.5">
                            Find Matches
                            <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
    </DashboardLayout>
  )
}

