'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Description } from './Step2Description';
import { Step3Location } from './Step3Location';
import { Step4Availability } from './Step4Availability';
import { Step5Pricing } from './Step5Pricing';
import { Step6Preview } from './Step6Preview';

export interface WizardData {
  // Step 1
  fullName?: string;
  phoneNumber?: string;
  languages?: string[];
  profilePhoto?: string; // URL or base64
  
  // Step 2
  description?: string;
  exampleTasks?: string[];
  
  // Step 3
  postcode?: string;
  travelRadius?: 'nearby' | 'city' | 'city_plus';
  
  // Step 4
  availability?: {
    days: {
      [key: string]: ('morning' | 'afternoon' | 'evening')[];
    };
    shortNotice?: boolean;
  };
  
  // Step 5
  pricingStyle?: 'hourly' | 'per_task';
  hourlyRate?: number;
  
  // Step 6 (generated)
  headline?: string;
  skills?: string[];
}

interface FreelancerWizardProps {
  profileId: string;
  initialData?: Partial<WizardData>;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
}

const TOTAL_STEPS = 6;

export function FreelancerWizard({ profileId, initialData, onComplete, onStepChange }: FreelancerWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialData || {});
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayStep, setDisplayStep] = useState(1);

  // Notify parent of step changes
  React.useEffect(() => {
    onStepChange?.(displayStep);
  }, [displayStep, onStepChange]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Default: redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    }
  };

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && !isAnimating) {
      setIsAnimating(true);
      // Fade out current step
      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setDisplayStep(nextStep);
        // Fade in new step
        setTimeout(() => {
          setIsAnimating(false);
        }, 50); // Small delay to ensure DOM update
      }, 400); // Match animation duration
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1 && !isAnimating) {
      setIsAnimating(true);
      // Fade out current step
      setTimeout(() => {
        const prevStep = currentStep - 1;
        setCurrentStep(prevStep);
        setDisplayStep(prevStep);
        // Fade in new step
        setTimeout(() => {
          setIsAnimating(false);
        }, 50); // Small delay to ensure DOM update
      }, 400); // Match animation duration
    }
  };

  // const handleStepChange = (step: number) => {
  //   if (step >= 1 && step <= TOTAL_STEPS) {
  //     setCurrentStep(step);
  //   }
  // };

  const renderStep = () => {
    switch (displayStep) {
      case 1:
        return (
          <Step1BasicInfo
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2Description
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <Step3Location
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <Step4Availability
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <Step5Pricing
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <Step6Preview
            profileId={profileId}
            data={wizardData}
            onUpdate={updateWizardData}
            onPrevious={handlePrevious}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 max-w-md">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`h-1.5 w-6 rounded-full transition-all ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-primary via-primary to-primary border border-primary'
                  : 'bg-secondary-foreground'
              }`}
            />
            {step < TOTAL_STEPS && <div className="w-2" />}
          </div>
        ))}
      </div>
      <div className="text-md text-secondary-foreground mb-0">
        {currentStep} of {TOTAL_STEPS}
      </div>

      {/* Step content */}
      <Card className='w-full bg-transparent shadow-none border-none'> 
        <CardContent className={`text-white max-w-2xl mx-auto ${isAnimating ? 'fade-out-up' : 'fade-in-from-bottom'}`}>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}

