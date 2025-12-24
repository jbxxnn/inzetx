'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ensureProfile } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';
import { Briefcase, User } from 'lucide-react';

export function RoleSelector({
  currentRole,
  userEmail,
}: {
  currentRole: 'client' | 'freelancer' | null;
  userEmail: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleSelect = async (role: 'client' | 'freelancer') => {
    setIsLoading(true);
    setError(null);

    try {
      await ensureProfile(role);
      // Refresh the page to show updated role
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to set role. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (currentRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Role</CardTitle>
          <CardDescription>
            You are registered as a{' '}
            <span className="font-semibold capitalize">{currentRole}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {currentRole === 'freelancer' && (
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard/freelancer/profile">
                  Manage Your Profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/invites">View Invitations</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/bookings">View Bookings</Link>
              </Button>
            </div>
          )}
          {currentRole === 'client' && (
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard/jobs/new">Post a Job</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/jobs">My Jobs</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/bookings">View Bookings</Link>
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Want to switch roles? Contact support or create a new account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Klusbaar!</CardTitle>
        <CardDescription>
          Choose how you want to use the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <button
              onClick={() => handleRoleSelect('client')}
              disabled={isLoading}
              className="w-full text-left"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>I need help</CardTitle>
                </div>
                <CardDescription>
                  Post jobs and find freelancers to help with your tasks
                </CardDescription>
              </CardHeader>
            </button>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <button
              onClick={() => handleRoleSelect('freelancer')}
              disabled={isLoading}
              className="w-full text-left"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <CardTitle>I want to offer services</CardTitle>
                </div>
                <CardDescription>
                  Create a profile and start earning by offering your skills
                </CardDescription>
              </CardHeader>
            </button>
          </Card>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center">
            Setting up your account...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

