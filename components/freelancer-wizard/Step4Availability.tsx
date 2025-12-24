'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import type { WizardData } from './FreelancerWizard';

interface Step4AvailabilityProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;

const DAY_LABELS: Record<typeof DAYS[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const TIME_LABELS: Record<typeof TIME_SLOTS[number], string> = {
  morning: 'Morning (8-12)',
  afternoon: 'Afternoon (12-17)',
  evening: 'Evening (17-21)',
};

export function Step4Availability({ data, onUpdate, onNext, onPrevious }: Step4AvailabilityProps) {
  // Ensure availability always has the correct structure
  const initialAvailability = {
    days: data.availability?.days || {},
    shortNotice: data.availability?.shortNotice || false,
  };
  
  const [availability, setAvailability] = useState<{
    days: { [key: string]: ('morning' | 'afternoon' | 'evening')[] };
    shortNotice?: boolean;
  }>(initialAvailability);
  const [shortNotice, setShortNotice] = useState(initialAvailability.shortNotice || false);

  const toggleTimeSlot = (day: typeof DAYS[number], timeSlot: typeof TIME_SLOTS[number]) => {
    setAvailability((prev) => {
      // Ensure days object exists
      const prevDays = prev.days || {};
      const daySlots = prevDays[day] || [];
      const newSlots = daySlots.includes(timeSlot)
        ? daySlots.filter((slot) => slot !== timeSlot)
        : [...daySlots, timeSlot];

      const newDays = { ...prevDays };
      
      if (newSlots.length > 0) {
        newDays[day] = newSlots;
      } else {
        // Remove the key if no slots selected
        delete newDays[day];
      }

      return {
        ...prev,
        days: newDays,
      };
    });
  };

  const isTimeSlotSelected = (day: typeof DAYS[number], timeSlot: typeof TIME_SLOTS[number]) => {
    return availability.days?.[day]?.includes(timeSlot) || false;
  };

  const handleNext = () => {
    onUpdate({
      availability: {
        ...availability,
        shortNotice,
      },
    });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6  lg:overflow-y-auto lg:px-4 w-full">
      {/* <div>
        <h2 className="text-2xl font-bold mb-2">When are you usually free?</h2>
        <p className="text-muted-foreground">
          Select the time blocks when you&apos;re typically available to help.
        </p>
      </div> */}

      <div className="flex flex-col gap-4">
        {/* Weekly grid */}
        <div className="border border-primary rounded-lg overflow-hidden" style={{ borderRadius: '10px' }}>
          <div className="grid grid-cols-4 bg-secondary-foreground p-2 text-sm font-medium bg-primary">
            <div></div>
            <div className="text-center">Morning</div>
            <div className="text-center">Afternoon</div>
            <div className="text-center">Evening</div>
          </div>
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-4 border-t border-primary p-2 hover:bg-secondary-foreground/50">
              <div className="font-medium text-sm flex items-center text-secondary-foreground">{DAY_LABELS[day]}</div>
              {TIME_SLOTS.map((timeSlot) => (
                <div key={timeSlot} className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => toggleTimeSlot(day, timeSlot)}
                    className={`w-8 h-8 rounded border-2 transition-colors ${
                      isTimeSlotSelected(day, timeSlot)
                        ? 'bg-primary border-primary text-secondary-foreground'
                        : 'bg-background border-input hover:border-primary'
                    }`}
                    aria-label={`${DAY_LABELS[day]} ${TIME_LABELS[timeSlot]}`}
                  >
                    {isTimeSlotSelected(day, timeSlot) && '✓'}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Short notice toggle */}
        <div className="flex items-center space-x-2 p-4 border border-primary bg-secondary-foreground rounded-lg" style={{ borderRadius: '10px' }}>
          <Checkbox
            id="shortNotice"
            checked={shortNotice}
            onCheckedChange={(checked) => setShortNotice(checked === true)}
          />
          <Label htmlFor="shortNotice" className="font-normal cursor-pointer text-secondary">
            Available on short notice?
          </Label>
          <p className="text-xs text-primary ml-auto">
            You may appear in &quot;urgent&quot; requests
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Previous
        </Button>
        <Button onClick={handleNext} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Next: Pricing Style
        </Button>
      </div>
    </div>
  );
}

