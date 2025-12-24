'use client';

import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import BreathingText from './fancy/text/breathing-text';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, MapsLocation02Icon, CoinsEuroIcon, Time04Icon } from '@hugeicons/core-free-icons';

export interface JobSummaryData {
  description?: string;
  details?: string;
  location?: {
    city?: string;
    postcode?: string;
    address?: string;
  };
  timeWindow?: {
    date?: string;
    time?: string;
    notes?: string;
  };
  budget?: string;
  estimatedDuration?: string;
}

interface JobSummaryPanelProps {
  jobData: JobSummaryData;
  className?: string;
}

export function JobSummaryPanel({ jobData, className }: JobSummaryPanelProps) {
    const hasAnyData = 
      jobData.description ||
      jobData.details ||
      jobData.location?.city ||
      jobData.timeWindow?.date ||
      jobData.budget ||
      jobData.estimatedDuration;

  if (!hasAnyData) {
    return (
      <div className={cn('h-fit sticky top-6 bg-primary-foreground rounded-2xl border-2 border-primary p-6 shadow-lg', className)}>
        <h3 className="text-xl sm:text-2xl text-secondary-foreground font-heading font-bold mb-6">
          <BreathingText
            staggerDuration={0.08}
            fromFontVariationSettings="'wght' 100, 'slnt' 0"
            toFontVariationSettings="'wght' 800, 'slnt' -10"
          >
            Job Summary
          </BreathingText>
        </h3>
        <p className="text-sm sm:text-base text-secondary-foreground/70">
          As you chat, your job details will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('h-fit sticky top-6 bg-primary-foreground rounded-2xl border-2 border-primary transition-all duration-300 p-6 shadow-lg', className)}>
      <h3 className="text-xl sm:text-2xl text-secondary-foreground font-heading font-bold mb-6">
        <BreathingText
          staggerDuration={0.08}
          fromFontVariationSettings="'wght' 100, 'slnt' 0"
          toFontVariationSettings="'wght' 800, 'slnt' -10"
        >
          Job Summary
        </BreathingText>
      </h3>
      <div className="space-y-6">
        {(jobData.description || jobData.details) && (
          <div className="p-4 bg-secondary rounded-sm border border-primary">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-secondary-foreground uppercase tracking-wide mb-3">
              <FileText className="w-4 h-4" />
              <span>Task</span>
            </div>
            <p className="text-sm sm:text-base text-secondary-foreground leading-relaxed ml-8"> -&nbsp;
              {jobData.description || jobData.details}
            </p>
            {jobData.details && jobData.description && (
              <p className="text-sm sm:text-base text-secondary-foreground/80 leading-relaxed mt-2 ml-8"> -&nbsp;
                {jobData.details}
              </p>
            )}
          </div>
        )}

        {jobData.estimatedDuration && (
          <div className="p-2 bg-secondary rounded-sm border border-primary">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-secondary-foreground uppercase tracking-wide mb-2">
              <HugeiconsIcon icon={Time04Icon} className="w-4 h-4" />
              <span>Duration</span>
            </div>
            <p className="text-sm sm:text-base text-secondary-foreground font-medium ml-8"> -&nbsp;
              {jobData.estimatedDuration}
            </p>
          </div>
        )}

        {(jobData.location?.city || jobData.location?.postcode) && (
          <div className="p-2 bg-secondary rounded-sm border border-primary">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-secondary-foreground uppercase tracking-wide mb-2">
              <HugeiconsIcon icon={MapsLocation02Icon} className="w-4 h-4" />
              <span>Location</span>
            </div>
            <p className="text-sm sm:text-base text-secondary-foreground font-medium ml-8"> -&nbsp;
              {[
                jobData.location.city,
                jobData.location.postcode,
                jobData.location.address,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}

        {(jobData.timeWindow?.date || jobData.timeWindow?.time) && (
          <div className="p-2 bg-secondary rounded-sm border border-primary">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-secondary-foreground uppercase tracking-wide mb-2">
              <HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4" />
              <span>Preferred Time</span>
            </div>
            <p className="text-sm sm:text-base text-secondary-foreground font-medium ml-8"> -&nbsp;
              {[
                jobData.timeWindow.date,
                jobData.timeWindow.time,
                jobData.timeWindow.notes,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>
        )}

        {jobData.budget && (
          <div className="p-2 bg-primary rounded-sm border border-primary">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-secondary-foreground uppercase tracking-wide mb-2">
              <HugeiconsIcon icon={CoinsEuroIcon} className="w-4 h-4 text-primary" />
              <span>Budget</span>
            </div>
            <p className="text-lg sm:text-xl text-primary font-heading font-bold ml-8"> -&nbsp;
              {jobData.budget}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


