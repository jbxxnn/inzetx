"use client"

import { JobRequestForm } from "@/components/JobRequestForm"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"

interface NewJobContentProps {
  clientProfileId: string;
}

export function NewJobContent({ clientProfileId }: NewJobContentProps) {
  return (
    <DashboardLayout role="client" activePath="/dashboard/jobs">
      {/* Header Section */}
          <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8 lg:mb-10">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
                Post a Job
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
                Describe what you need help with and we&apos;ll find the perfect freelancer
              </p>
            </div>
          </div>

      {/* Form Content */}
      <div className="flex justify-center">
        <JobRequestForm clientProfileId={clientProfileId} />
      </div>
    </DashboardLayout>
  )
}

