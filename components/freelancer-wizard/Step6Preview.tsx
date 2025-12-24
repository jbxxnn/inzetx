'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
// import { Label } from '../ui/label';
import { Loader2, User, MapPin, Clock, Euro, Edit } from 'lucide-react';
import { upsertFreelancerProfile } from '@/app/actions/freelancer';
import { updateProfile } from '@/app/actions/profile';
import type { WizardData } from './FreelancerWizard';

interface Step6PreviewProps {
  profileId: string;
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onPrevious: () => void;
  onComplete?: () => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const TIME_LABELS: Record<string, string> = {
  morning: 'M',
  afternoon: 'A',
  evening: 'E',
};

export function Step6Preview({ profileId, data, onUpdate, onPrevious, onComplete }: Step6PreviewProps) {
  const [headline, setHeadline] = useState(data.headline || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const handleGoLive = async () => {
    if (!data.description) {
      setError('Description is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Update profile with basic info
      if (data.fullName || data.phoneNumber || data.languages || data.profilePhoto) {
        await updateProfile({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          languages: data.languages,
          profilePhoto: data.profilePhoto,
        });
      }

      // Create/update freelancer profile (this will generate headline and skills via AI)
      const result = await upsertFreelancerProfile({
        profileId,
        description: data.description,
        availability: data.availability || {},
        location: {
          city: 'Almere',
          postcode: data.postcode,
          travelRadius: data.travelRadius,
        },
        exampleTasks: data.exampleTasks,
        pricingStyle: data.pricingStyle,
        hourlyRate: data.hourlyRate,
        isActive: true, // Mark as active when going live
        shortNotice: data.availability?.shortNotice || false,
        skills: data.skills, // Use user-selected skills if available
      });

      // Update headline if AI generated one
      if (result.headline) {
        setHeadline(result.headline);
        onUpdate({ headline: result.headline, skills: result.skills || [] });
      }

      setIsActive(true);
      
      // Call onComplete after a short delay to show success state
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setIsSaving(false);
    }
  };

  const formatAvailability = () => {
    if (!data.availability?.days) return 'Not set';
    
    const days = Object.entries(data.availability.days)
      .filter(([, slots]) => slots && slots.length > 0)
      .map(([day, slots]) => {
        const dayLabel = DAY_LABELS[day] || day;
        const timeLabels = (slots as string[]).map((slot) => TIME_LABELS[slot] || slot).join('');
        return `${dayLabel}(${timeLabels})`;
      });
    
    return days.length > 0 ? days.join(', ') : 'Not set';
  };

  return (
    <div className="flex flex-col gap-6  lg:overflow-y-auto lg:px-4 w-full">
      {/* <div>
        <h2 className="text-2xl font-bold mb-2">Profile Preview & Confirm</h2>
        <p className="text-muted-foreground">
          Here&apos;s how clients will see your profile. Review everything and make any final edits.
        </p>
      </div> */}

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Profile Preview Card */}
      <Card className="border border-primary bg-secondary-foreground" style={{ borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-4">
            {data.profilePhoto ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent">
                <Image
                  src={data.profilePhoto}
                  alt={data.fullName || 'Profile photo'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-primary-foreground text-3xl md:text-3xl">{data.fullName || 'Your Name'}</CardTitle>
              {headline && (
                <div className="">
                  {/* <Label htmlFor="headline" className="text-xs text-primary-foreground">
                    Headline (editable)
                  </Label> */}
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      onUpdate({ headline: e.target.value });
                    }}
                    className="mt-1 bg-primary-foreground h-7 pl-4 text-sm md:text-sm border border-primary focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-primary"
                    placeholder="AI-generated headline will appear here"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-primary-foreground">What I can help with</h3>
            <p className="text-xs text-primary-foreground whitespace-pre-wrap">
              {data.description || 'No description provided'}
            </p>
          </div>

          {data.exampleTasks && data.exampleTasks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-primary-foreground">Example tasks</h3>
              <div className="flex flex-wrap gap-2">
                {data.exampleTasks.map((task, index) => (
                  <Badge key={index} variant="secondary" className="border border-primary rounded-full bg-primary text-secondary-foreground">
                    {task}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary-foreground">Location</p>
                <p className="text-xs text-primary-foreground">
                  Almere, {data.postcode || 'your postcode'}
                  {data.travelRadius && (
                    <span className="ml-1">
                      ({data.travelRadius === 'nearby' ? 'Nearby' : data.travelRadius === 'city' ? 'Whole city' : 'City + surroundings'})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary-foreground">Typical Availability</p>
                <p className="text-xs text-primary-foreground">{formatAvailability()}</p>
                {data.availability?.shortNotice && (
                  <Badge variant="outline" className="mt-1 text-xs bg-primary text-secondary-foreground rounded-full border-primary">
                    Available on short notice
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Euro className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary-foreground">Pricing</p>
                <p className="text-xs text-primary-foreground">
                  {data.pricingStyle === 'hourly' && data.hourlyRate
                    ? `€${data.hourlyRate}/hour`
                    : data.pricingStyle === 'per_task'
                    ? 'Per task (discussed with client)'
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isSaving} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          <Edit className="mr-2 h-4 w-4" />
          Edit something
        </Button>
        <Button onClick={handleGoLive} disabled={isSaving || isActive} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="">Saving...</span>
            </>
          ) : isActive ? (
            <span className="">Profile is Live!</span>
          ) : (
            <span className="">Looks good, go live</span>
          )}
        </Button>
      </div>
    </div>
  );
}

