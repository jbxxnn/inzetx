'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { createJobInvite } from '@/app/actions/invite';
import { CheckCircle2, Loader2, Star } from 'lucide-react';
import type { MatchResult } from '@/app/actions/matching';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location04Icon, StarCircleIcon } from '@hugeicons/core-free-icons';
import { toggleSaveFreelancer, isFreelancerSaved } from '@/app/actions/saved-pros';

interface MatchResultsProps {
  matches: MatchResult[];
  jobRequestId: string;
  invitedFreelancerIds: Set<string>;
  clientProfileId?: string;
  onInviteSent?: (freelancerProfileId: string) => void;
}

export function MatchResults({
  matches,
  jobRequestId,
  invitedFreelancerIds,
  clientProfileId,
  onInviteSent,
}: MatchResultsProps) {
  const router = useRouter();
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(invitedFreelancerIds);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [savedFreelancerIds, setSavedFreelancerIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Load saved status for all freelancers
  useEffect(() => {
    if (!clientProfileId) return;
    
    const loadSavedStatus = async () => {
      const savedIds = new Set<string>();
      for (const match of matches) {
        try {
          const saved = await isFreelancerSaved(clientProfileId, match.freelancerProfileId);
          if (saved) {
            savedIds.add(match.freelancerProfileId);
          }
        } catch (err) {
          console.error('Failed to check saved status:', err);
        }
      }
      setSavedFreelancerIds(savedIds);
    };

    loadSavedStatus();
  }, [matches, clientProfileId]);

  const handleToggleSave = async (e: React.MouseEvent, freelancerProfileId: string) => {
    e.stopPropagation();
    if (!clientProfileId) return;

    setSavingIds(prev => new Set([...prev, freelancerProfileId]));
    try {
      const isNowSaved = await toggleSaveFreelancer(clientProfileId, freelancerProfileId);
      setSavedFreelancerIds(prev => {
        const next = new Set(prev);
        if (isNowSaved) {
          next.add(freelancerProfileId);
        } else {
          next.delete(freelancerProfileId);
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(freelancerProfileId);
        return next;
      });
    }
  };

  const handleInvite = async (freelancerProfileId: string) => {
    setInvitingId(freelancerProfileId);
    setError(null);

    try {
      await createJobInvite(jobRequestId, freelancerProfileId);
      setInvitedIds((prev) => new Set([...prev, freelancerProfileId]));
      onInviteSent?.(freelancerProfileId);
      // Only refresh if we're in a page context (not chat)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/chat')) {
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send invite. Please try again.'
      );
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => {
          // const isInvited = invitedIds.has(match.freelancerProfileId);
          // const isInviting = invitingId === match.freelancerProfileId;

          // Generate a consistent random color based on freelancerProfileId
          // const getRandomColor = (id: string) => {
          //   // Use the ID to generate a consistent color
          //   let hash = 0;
          //   for (let i = 0; i < id.length; i++) {
          //     hash = id.charCodeAt(i) + ((hash << 5) - hash);
          //   }
          //   // Generate hue (0-360) for vibrant colors
          //   const hue = Math.abs(hash) % 360;
          //   return `hsl(${hue}, 70%, 50%)`;
          // };

          // const fallbackColor = getRandomColor(match.freelancerProfileId);

          return (
            <Card 
              key={match.freelancerProfileId} 
              className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-primary"
              onClick={() => setSelectedMatch(match)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {clientProfileId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleToggleSave(e, match.freelancerProfileId)}
                          disabled={savingIds.has(match.freelancerProfileId)}
                          className="h-8 w-8 rounded-full hover:bg-primary/20 shrink-0"
                        >
                          {savingIds.has(match.freelancerProfileId) ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : savedFreelancerIds.has(match.freelancerProfileId) ? (
                            <HugeiconsIcon icon={StarCircleIcon} className="h-5 w-5 text-primary fill-primary" />
                          ) : (
                            <Star className="h-5 w-5 text-secondary-foreground/50" />
                          )}
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-white flex items-center gap-2">
                      {match.profilePhoto ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={match.profilePhoto}
                            alt={match.fullName || match.headline || 'Freelancer'}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex-shrink-0 bg-secondary-foreground border-2 border-primary"
                          // style={{ backgroundColor: "hsl(240, 30%, 25%)" }}
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-lg text-secondary-foreground">{match.fullName || 'Freelancer Profile'}</span>
                        <div className="flex items-center gap-2 text-xs text-secondary-foreground font-light">
                          {match.similarity && (
                            <span className="text-xs font-bold bg-accent text-secondary-foreground rounded-full px-2 py-1">
                              Match: {Math.round(match.similarity * 100)}%
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={Location04Icon} size={14} />
                            <span>
                              {match.location 
                                ? `${(match.location.city as string) || 'Almere'}${(match.location.postcode as string) ? `, ${match.location.postcode as string}` : ''}`
                                : 'Almere'
                              }
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col gap-4">


              <span className="text-md text-secondary-foreground font-bold">
                  {match.headline}
                </span>

                

                {match.explanation && (
                  <div>
                    {/* <p className="text-sm font-medium mb-1">Why this match:</p> */}
                    <p className="text-sm text-secondary-foreground">
                      {match.explanation}
                    </p>
                  </div>
                )}

                {/* <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInvite(match.freelancerProfileId);
                  }}
                  disabled={isInvited || isInviting}
                  className="w-full"
                  variant={isInvited ? 'outline' : 'default'}
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : isInvited ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Invited
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </Button> */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Freelancer Details Modal */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        {selectedMatch && (
          <DialogContent className="max-w-2xl bg-primary-foreground" style={{ borderRadius: '10px' }}>
            <div className="flex items-start gap-4 mb-4">
              {selectedMatch.profilePhoto ? (
                <div className="relative w-40 h-40 rounded-full overflow-hidden flex-shrink-0 border-2 border-accent" style={{ minWidth: '160px', minHeight: '160px', width: '160px', height: '160px' }}>
                  <Image
                    src={selectedMatch.profilePhoto}
                    alt={selectedMatch.fullName || selectedMatch.headline || 'Freelancer'}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="rounded-full flex-shrink-0 border-2 border-primary bg-secondary-foreground"
                  style={{
                    width: '60px',
                    height: '60px',
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <DialogHeader className="text-left gap-0 flex-1">
                    <DialogTitle className="text-2xl text-secondary-foreground break-words">
                      {selectedMatch.fullName || 'Freelancer Profile'}
                    </DialogTitle>
                    <DialogDescription className="text-base text-secondary-foreground break-words">
                      {selectedMatch.headline}
                    </DialogDescription>
                  </DialogHeader>
                  {clientProfileId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(e, selectedMatch.freelancerProfileId);
                      }}
                      disabled={savingIds.has(selectedMatch.freelancerProfileId)}
                      className="h-10 w-10 rounded-full hover:bg-primary/20 shrink-0"
                    >
                      {savingIds.has(selectedMatch.freelancerProfileId) ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : savedFreelancerIds.has(selectedMatch.freelancerProfileId) ? (
                        <HugeiconsIcon icon={StarCircleIcon} className="h-6 w-6 text-primary fill-primary" />
                      ) : (
                        <Star className="h-6 w-6 text-secondary-foreground/50" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-4">
              {/* Match Score and Location */}
              <div className="flex items-center gap-4 flex-wrap">
                {selectedMatch.similarity && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-secondary-foreground">Match Score:</span>
                    <Badge className="bg-accent text-secondary-foreground rounded-full px-3 py-1">
                      {Math.round(selectedMatch.similarity * 100)}%
                    </Badge>
                  </div>
                )}
                {selectedMatch.location && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Location04Icon} size={18} className="text-secondary-foreground" />
                    <span className="text-sm text-secondary-foreground">
                      {(selectedMatch.location.city as string) || 'Almere'}
                      {(selectedMatch.location.postcode as string) && `, ${selectedMatch.location.postcode as string}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {selectedMatch.skills && selectedMatch.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-secondary-foreground mb-2 mt-8">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs font-light capitalize bg-accent text-secondary-foreground rounded-full px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Explanation */}
              {selectedMatch.explanation && (
                <div>
                  <h3 className="text-sm font-semibold text-secondary-foreground mb-2 mt-8">Why this match?</h3>
                  <p className="text-sm text-secondary-foreground leading-relaxed">
                    {selectedMatch.explanation}
                  </p>
                </div>
              )}

              {/* Match Indicators */}
              <div className="flex items-center gap-4 flex-wrap mt-8">
                {selectedMatch.hasExactAvailabilityMatch && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-secondary-foreground">Available for your time window</span>
                  </div>
                )}
                {selectedMatch.hasLocationMatch && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-secondary-foreground">Serves your location</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedMatch(null)}
                className="flex-1 sm:flex-none rounded-full"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const isInvited = invitedIds.has(selectedMatch.freelancerProfileId);
                  if (!isInvited && !invitingId) {
                    handleInvite(selectedMatch.freelancerProfileId);
                  }
                }}
                disabled={invitedIds.has(selectedMatch.freelancerProfileId) || invitingId === selectedMatch.freelancerProfileId}
                className="flex-1 sm:flex-none rounded-full"
                variant={invitedIds.has(selectedMatch.freelancerProfileId) ? 'outline' : 'default'}
              >
                {invitingId === selectedMatch.freelancerProfileId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : invitedIds.has(selectedMatch.freelancerProfileId) ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Invited
                  </>
                ) : (
                  'Send Invite'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

