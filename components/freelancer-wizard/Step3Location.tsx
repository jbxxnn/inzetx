'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { WizardData } from './FreelancerWizard';

interface Step3LocationProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const TRAVEL_OPTIONS = [
  { value: 'nearby', label: 'Nearby only (within 2 km)' },
  { value: 'city', label: 'Whole city (Almere)' },
  { value: 'city_plus', label: 'City + surroundings (future)' },
] as const;

export function Step3Location({ data, onUpdate, onNext, onPrevious }: Step3LocationProps) {
  const [postcode, setPostcode] = useState(data.postcode || '');
  const [travelRadius, setTravelRadius] = useState<'nearby' | 'city' | 'city_plus'>(
    data.travelRadius || 'city'
  );

  const handleNext = () => {
    onUpdate({
      postcode: postcode.trim(),
      travelRadius,
    });
    onNext();
  };

  const isValid = postcode.trim().length > 0;

  return (
    <div className="flex flex-col gap-6  lg:overflow-y-auto lg:px-4 w-full">
      {/* <div>
        <h2 className="text-2xl font-bold mb-2">Where can you work?</h2>
        <p className="text-muted-foreground">
          Tell us your location and how far you&apos;re willing to travel.
        </p>
      </div> */}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="postcode" className="text-secondary-foreground text-2xl md:text-2xl text-center lg:text-left font-bold">
            Postcode or District in Almere <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="1356 AB or Almere Buiten"
            required
            className="bg-primary-foreground h-15 pl-8 text-5xl md:text-5xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
          />
          <p className="text-xs text-secondary-foreground">
            This helps us match you with nearby clients.
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Label className="text-secondary-foreground text-2xl md:text-2xl text-center lg:text-left font-bold">How far are you willing to travel?</Label>
          <RadioGroup value={travelRadius} onValueChange={(value) => setTravelRadius(value as typeof travelRadius)}>
            {TRAVEL_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 mt-4">
                <RadioGroupItem value={option.value} className="border border-secondary-foreground rounded-full text-secondary-foreground " id={option.value} />
                <Label htmlFor={option.value} className="font-normal cursor-pointer text-secondary-foreground">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Map preview */}
        {/* <div className="border border-accent rounded-lg bg-primary-foreground/50 mt-8" style={{ borderRadius: '10px' }}>
          <p className="text-sm text-primary mb-2">Service Area Preview</p>
          <div className="h-64 rounded-lg overflow-hidden border border-accent relative" style={{ borderRadius: '10px' }}>
            {postcode ? (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(postcode + ', Almere, Netherlands')}&output=embed&zoom=14`}
                title={`Service Area Map - ${postcode}`}
              />
            ) : (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Almere,+Netherlands&output=embed&zoom=12"
                title="Almere Map"
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {postcode 
              ? `Showing service area for ${postcode}, Almere`
              : 'Enter your postcode to see your service area on the map'}
          </p>
        </div> */}
      </div>

      <div className="flex flex-row justify-between gap-4 mt-8">
        <Button variant="outline" onClick={onPrevious} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!isValid} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Next: Availability
        </Button>
      </div>
    </div>
  );
}

