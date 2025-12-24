'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Euro } from 'lucide-react';
import type { WizardData } from './FreelancerWizard';

interface Step5PricingProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step5Pricing({ data, onUpdate, onNext, onPrevious }: Step5PricingProps) {
  const [pricingStyle, setPricingStyle] = useState<'hourly' | 'per_task'>(
    data.pricingStyle || 'hourly'
  );
  const [hourlyRate, setHourlyRate] = useState<string>(
    data.hourlyRate?.toString() || ''
  );

  const handleNext = () => {
    onUpdate({
      pricingStyle,
      hourlyRate: pricingStyle === 'hourly' && hourlyRate ? parseFloat(hourlyRate) : undefined,
    });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6  lg:overflow-y-auto lg:px-4 w-full">
      {/* <div>
        <h2 className="text-2xl font-bold mb-2">How do you prefer to be paid?</h2>
        <p className="text-muted-foreground">
          Choose your preferred pricing model. You can adjust this per job if needed.
        </p>
      </div> */}

      <div className="flex flex-col gap-4">
        <RadioGroup value={pricingStyle} onValueChange={(value) => setPricingStyle(value as 'hourly' | 'per_task')}>
          <div className="flex flex-col gap-4">
            <div className="border border-primary rounded-lg p-4 bg-secondary-foreground" style={{ borderRadius: '10px' }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hourly" id="hourly" className="border border-secondary rounded-full text-primary " />
                <Label htmlFor="hourly" className="font-semibold cursor-pointer text-secondary">
                  Hourly rate
                </Label>
              </div>
              {pricingStyle === 'hourly' && (
                <div className="ml-6 flex flex-col gap-2">
                  <Label htmlFor="hourlyRate" className="text-xs text-secondary">
                    Typical hourly rate (can be adjusted case by case)
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-foreground" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.50"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="25.00"
                      className="pl-8 bg-primary-foreground h-12 pl-8 text-2xl md:text-2xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground"
                    />
                  </div>
                  <p className="text-xs text-secondary">
                    This is just a guideline. You can discuss the final rate with each client.
                  </p>
                </div>
              )}
            </div>

            <div className="border border-primary rounded-lg p-4 bg-secondary-foreground" style={{ borderRadius: '10px' }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="per_task" id="per_task" className="border border-secondary rounded-full text-primary " />
                <Label htmlFor="per_task" className="font-semibold cursor-pointer text-secondary">
                  Per task, discussed with client
                </Label>
              </div>
              {pricingStyle === 'per_task' && (
                <p className="ml-6 mt-2 text-xs text-secondary">
                  You and the client will agree on a price in chat.
                </p>
              )}
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Previous
        </Button>
        <Button onClick={handleNext} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Next: Preview & Confirm
        </Button>
      </div>
    </div>
  );
}

