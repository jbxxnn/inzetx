'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
} from './ui/card';
import { createJobRequest } from '@/app/actions/job';
import { Loader2 } from 'lucide-react';

interface JobRequestFormProps {
  clientProfileId: string;
}

export function JobRequestForm({ clientProfileId }: JobRequestFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Almere');
  const [postcode, setPostcode] = useState('');
  const [timeWindow, setTimeWindow] = useState({
    start: '',
    end: '',
    notes: '',
  });
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!description.trim()) {
      setError('Please provide a description of what you need help with');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createJobRequest({
        clientProfileId,
        description: description.trim(),
        location: {
          city: city.trim(),
          postcode: postcode.trim(),
        },
        timeWindow: {
          start: timeWindow.start || undefined,
          end: timeWindow.end || undefined,
          notes: timeWindow.notes || undefined,
        },
        budget: budget.trim() || undefined,
      });

      // Redirect to job detail page
      router.push(`/dashboard/jobs/${result.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create job request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-transparent shadow-none border-none">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive text-sm p-4 rounded-2xl">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-secondary-foreground text-xl font-heading font-bold">
              What do you need help with? <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task or service you need. For example: 'I need help assembling IKEA furniture this weekend. Have a bookshelf and a desk that need to be put together.'"
              className="flex min-h-[150px] w-full text-secondary-foreground rounded-md border border-accent bg-primary-foreground px-4 py-3 text-base shadow-sm placeholder:text-secondary-foreground/50 focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              required
              style={{
                borderRadius: '30px',
              }}
            />
            <p className="text-xs text-secondary-foreground/70 pl-2">
              Be specific about what you need. This helps us find the right freelancer for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city" className="text-secondary-foreground text-lg font-heading font-bold">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Almere"
                className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="postcode" className="text-secondary-foreground text-lg font-heading font-bold">
                Postcode
              </Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="1234 AB"
                className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="time-start" className="text-secondary-foreground text-lg font-heading font-bold">
                Preferred Start Time
              </Label>
              <Input
                id="time-start"
                type="datetime-local"
                value={timeWindow.start}
                onChange={(e) =>
                  setTimeWindow({ ...timeWindow, start: e.target.value })
                }
                className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="time-end" className="text-secondary-foreground text-lg font-heading font-bold">
                Preferred End Time
              </Label>
              <Input
                id="time-end"
                type="datetime-local"
                value={timeWindow.end}
                onChange={(e) =>
                  setTimeWindow({ ...timeWindow, end: e.target.value })
                }
                className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="time-notes" className="text-secondary-foreground text-lg font-heading font-bold">
                Time Notes (Optional)
              </Label>
              <textarea
                id="time-notes"
                value={timeWindow.notes}
                onChange={(e) =>
                  setTimeWindow({ ...timeWindow, notes: e.target.value })
                }
                placeholder="e.g., 'Flexible on timing', 'Weekends only', 'After 6 PM'"
                className="flex min-h-[100px] w-full text-secondary-foreground rounded-md border border-accent bg-primary-foreground px-4 py-3 text-base shadow-sm placeholder:text-secondary-foreground/50 focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderRadius: '30px',
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="budget" className="text-secondary-foreground text-lg font-heading font-bold">
              Budget (Optional)
            </Label>
            <Input
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g., '€50-100', 'Negotiable', '€25/hour'"
              className="bg-primary-foreground h-14 pl-6 text-lg border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating job request...
              </>
            ) : (
              'Create Job Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


