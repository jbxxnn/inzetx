"use client"

import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MatchResults } from "@/components/MatchResults"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"
import type { MatchResult } from "@/app/actions/matching"

interface JobMatchesContentProps {
  matches: MatchResult[];
  jobRequestId: string;
  invitedFreelancerIds: Set<string>;
  clientProfileId: string;
}

export function JobMatchesContent({ 
  matches, 
  jobRequestId, 
  invitedFreelancerIds,
  clientProfileId,
}: JobMatchesContentProps) {
  return (
    <DashboardLayout role="client" activePath="/dashboard/jobs">
      {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-secondary-foreground/10"
              >
                <Link href={`/dashboard/jobs/${jobRequestId}`}>
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Job
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
                  Find Freelancers
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
                  AI-matched freelancers for your job
                </p>
              </div>
            </div>
          </div>

          {/* Matches Content */}
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-16 sm:py-20 bg-primary-foreground rounded-2xl border-2 border-secondary/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center">
                <Search size={32} className="text-secondary-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground mb-2">
                  No matching freelancers found
                </p>
                <p className="text-sm sm:text-base text-secondary-foreground/70 max-w-md mx-auto">
                  Try adjusting your job description or check back later.
                </p>
              </div>
            </div>
          ) : (
            <MatchResults
              matches={matches}
              jobRequestId={jobRequestId}
              invitedFreelancerIds={invitedFreelancerIds}
              clientProfileId={clientProfileId}
            />
          )}
    </DashboardLayout>
  )
}

