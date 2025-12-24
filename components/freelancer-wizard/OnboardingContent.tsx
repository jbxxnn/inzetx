'use client';

import { useState } from 'react';
import { FreelancerWizard } from './FreelancerWizard';
import { OnboardingHeader } from './OnboardingHeader';
import type { WizardData } from './FreelancerWizard';

interface OnboardingContentProps {
  profileId: string;
  initialData?: Partial<WizardData>;
}

export function OnboardingContent({ profileId, initialData }: OnboardingContentProps) {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <>
      <OnboardingHeader currentStep={currentStep} className="fixed top-0 left-0 right-0 z-10 bg-secondary/95 backdrop-blur-sm pb-2 pt-4 px-8"/>
      <div className="pt-20">
        <FreelancerWizard
          profileId={profileId}
          initialData={initialData}
          onStepChange={setCurrentStep}
        />
      </div>
    </>
  );
}

