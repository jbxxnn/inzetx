'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { upsertFreelancerProfile } from '@/app/actions/freelancer';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface FreelancerProfileFormProps {
  profileId: string;
  initialData?: {
    description?: string;
    availability?: Record<string, string>;
    location?: Record<string, string>;
    headline?: string;
    skills?: string[];
  };
}

export function FreelancerProfileForm({
  profileId,
  initialData,
}: FreelancerProfileFormProps) {
  // Check if description is the placeholder
  const isPlaceholder = initialData?.description?.includes('Please complete your profile');
  const [description, setDescription] = useState(
    isPlaceholder ? '' : (initialData?.description || '')
  );
  const [city, setCity] = useState(
    initialData?.location?.city || 'Almere'
  );
  const [postcode, setPostcode] = useState(
    initialData?.location?.postcode || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    headline?: string;
    skills?: string[];
  } | null>(initialData ? { headline: initialData.headline, skills: initialData.skills } : null);

  // Simple availability structure - can be enhanced later
  const [availability, setAvailability] = useState<Record<string, string>>(
    initialData?.availability || {
      flexible: 'true',
      notes: 'flexible',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!description.trim()) {
      setError('Please provide a description of your skills and services');
      setIsLoading(false);
      return;
    }

    try {
      const result = await upsertFreelancerProfile({
        profileId,
        description: description.trim(),
        availability,
        location: {
          city: city.trim(),
          postcode: postcode.trim(),
        },
      });

      setGeneratedData({
        headline: result.headline || undefined,
        skills: result.skills || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center">
      <Card className="card-bg max-w-lg">
      <CardHeader>
          <CardTitle className="text-white">Freelancer Profile</CardTitle>
          <CardDescription className="text-white">
            Tell us about your skills and availability. Our AI will help create
            an engaging profile for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-6 rounded-lg">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-md flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Profile saved successfully!
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your skills, experience, and what services you can offer. For example: 'Experienced handyman with 10 years of experience in home repairs, furniture assembly, and general maintenance. Available evenings and weekends.'"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what you can do. This helps clients find you
                and our AI create a better profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Almere"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="1234 AB"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="availability-notes">Availability Notes</Label>
              <textarea
                id="availability-notes"
                value={availability.notes || ''}
                onChange={(e) =>
                  setAvailability({ ...availability, notes: e.target.value })
                }
                placeholder="e.g., 'Available evenings and weekends', 'Flexible schedule', 'Monday to Friday after 6 PM'"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving profile...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedData && (generatedData.headline || generatedData.skills) && (
        <Card className="card-bg max-w-lg">
          <CardHeader>
            <CardTitle className="text-white">AI-Generated Profile</CardTitle>
            <CardDescription>
              Your profile has been enhanced with AI-generated content
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {generatedData.headline && (
              <div className="flex flex-col gap-2">
                <Label>Headline</Label>
                <p className="text-lg font-semibold">{generatedData.headline}</p>
              </div>
            )}

            {generatedData.skills && generatedData.skills.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {generatedData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

