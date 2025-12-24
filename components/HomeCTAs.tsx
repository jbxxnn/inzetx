'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { HelpCircle, Briefcase } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function HomeCTAs() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
      {/* Client CTA */}
      <Card className="flex-1 hover:shadow-lg transition-shadow">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">I need help with something</h3>
          <p className="text-muted-foreground">
            Chat with our assistant to describe what you need, and we&apos;ll find the perfect person to help you.
          </p>
          <Button asChild size="lg" className="w-full mt-2">
            <Link href="/chat/job">Get Started</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Freelancer CTA */}
      <Card className="flex-1 hover:shadow-lg transition-shadow">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h3 className="text-2xl font-bold">I want to earn in my free time</h3>
          <p className="text-muted-foreground">
            Create your profile and start offering your services to people in Almere.
          </p>
          <Button asChild size="lg" variant="secondary" className="w-full mt-2">
            <Link href="/dashboard/freelancer/profile">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


