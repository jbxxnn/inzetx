'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { updateJobInviteStatus } from '@/app/actions/invite';
import { createBooking } from '@/app/actions/booking';
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin, Euro } from 'lucide-react';
import Link from 'next/link';

interface JobRequest {
  id: string;
  description: string;
  client_profile_id: string;
  location?: {
    city?: string;
    postcode?: string;
  } | null;
  time_window?: {
    start?: string;
    end?: string;
    notes?: string;
  } | null;
  budget?: string | null;
}

interface Invite {
  id: string;
  job_request_id: string;
  freelancer_profile_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  job_requests?: JobRequest | null;
}

interface InviteListProps {
  invites: Invite[];
}

export function InviteList({ invites }: InviteListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, string>>(
    Object.fromEntries(invites.map((inv) => [inv.id, inv.status]))
  );

  const handleAccept = async (invite: Invite) => {
    setProcessingId(invite.id);
    setError(null);

    try {
      // Update invite status to accepted
      await updateJobInviteStatus(invite.id, 'accepted');

      // Create a booking when invite is accepted
      if (invite.job_requests && invite.job_requests.client_profile_id) {
        const job = invite.job_requests;
        await createBooking({
          jobRequestId: job.id,
          freelancerProfileId: invite.freelancer_profile_id,
          clientProfileId: job.client_profile_id,
          scheduledTime: (job.time_window as Record<string, unknown>) || {},
        });
      }

      setInviteStatuses((prev) => ({ ...prev, [invite.id]: 'accepted' }));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to accept invite. Please try again.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    setError(null);

    try {
      await updateJobInviteStatus(inviteId, 'declined');
      setInviteStatuses((prev) => ({ ...prev, [inviteId]: 'declined' }));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to decline invite. Please try again.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-500">
            Accepted
          </Badge>
        );
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Group invites by status
  const pendingInvites = invites.filter(
    (inv) => inviteStatuses[inv.id] === 'pending'
  );
  const acceptedInvites = invites.filter(
    (inv) => inviteStatuses[inv.id] === 'accepted'
  );
  const declinedInvites = invites.filter(
    (inv) => inviteStatuses[inv.id] === 'declined'
  );

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingInvites.map((invite) => {
              const job = invite.job_requests;
              const isProcessing = processingId === invite.id;

              return (
                <Card key={invite.id} className="card-bg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-white">
                        {job?.description
                          ? job.description.substring(0, 50) +
                            (job.description.length > 50 ? '...' : '')
                          : 'Job Invitation'}
                      </CardTitle>
                      {getStatusBadge(inviteStatuses[invite.id])}
                    </div>
                    <CardDescription className="text-white/80">
                      Invited {new Date(invite.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white p-6 rounded-lg flex flex-col gap-4">
                    {job && (
                      <>
                        <div className="flex flex-col gap-2 text-sm">
                          <p className="text-muted-foreground line-clamp-3">
                            {job.description}
                          </p>

                          {job.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {job.location.city || 'Location not specified'}
                                {job.location.postcode &&
                                  `, ${job.location.postcode}`}
                              </span>
                            </div>
                          )}

                          {job.time_window && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {job.time_window.notes ||
                                  'Time window specified'}
                              </span>
                            </div>
                          )}

                          {job.budget && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Euro className="h-4 w-4" />
                              <span>{job.budget}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAccept(invite)}
                            disabled={isProcessing}
                            className="flex-1"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDecline(invite.id)}
                            disabled={isProcessing}
                            variant="destructive"
                            className="flex-1"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Decline
                              </>
                            )}
                          </Button>
                        </div>

                        {job && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/jobs/${job.id}`}>
                              View Full Job Details
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Accepted Invites */}
      {acceptedInvites.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Accepted</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acceptedInvites.map((invite) => {
              const job = invite.job_requests;
              return (
                <Card key={invite.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>
                        {job?.description
                          ? job.description.substring(0, 50) + '...'
                          : 'Job Invitation'}
                      </CardTitle>
                      {getStatusBadge(inviteStatuses[invite.id])}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      You accepted this invitation. Check your bookings to see
                      the confirmed booking.
                    </p>
                    {job && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/bookings">View Booking</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Declined Invites */}
      {declinedInvites.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Declined</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {declinedInvites.map((invite) => {
              const job = invite.job_requests;
              return (
                <Card key={invite.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>
                        {job?.description
                          ? job.description.substring(0, 50) + '...'
                          : 'Job Invitation'}
                      </CardTitle>
                      {getStatusBadge(inviteStatuses[invite.id])}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      You declined this invitation.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

