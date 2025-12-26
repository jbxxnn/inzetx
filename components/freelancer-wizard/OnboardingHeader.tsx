'use client';

// import { useState } from 'react';

interface StepContent {
  heading: string;
  description: string;
}

const STEP_CONTENT: Record<number, StepContent> = {
  1: {
    heading: 'Tell us who you are',
    description: "We'll use this information to help clients connect with you.",
  },
  2: {
    heading: 'What can you help people with?',
    description: "Start by selecting your skills, then we'll help you create a great description!",
  },
  3: {
    heading: 'Where can you work?',
    description: "Tell us your location and how far you're willing to travel.",
  },
  4: {
    heading: 'When are you usually free?',
    description: 'Select the time blocks when you\'re typically available to help.',
  },
  5: {
    heading: 'How do you prefer to be paid?',
    description: 'Choose your preferred pricing model. You can adjust this per job if needed.',
  },
  6: {
    heading: 'Profile Preview & Confirm',
    description: 'Here\'s how clients will see your profile. Review everything and make any final edits.',
  },
};

interface OnboardingHeaderProps {
  currentStep: number;
  className?: string;
}

export function OnboardingHeader({ currentStep, className }: OnboardingHeaderProps) {
  const content = STEP_CONTENT[currentStep] || STEP_CONTENT[1];

  return (
    <div className={`flex flex-col ${className}`}>
      {/* <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-0">
        {content.heading}
      </h1>
      <p className="text-lg text-slate-300 leading-relaxed mt-0">
        {content.description}
      </p> */}

      <span className="text-lg lg:text-5xl font-bold text-secondary-foreground leading-tight">{content.heading}</span>
      <span className="text-sm text-secondary-foreground leading-relaxed">{content.description}</span>
    </div>
  );
}

