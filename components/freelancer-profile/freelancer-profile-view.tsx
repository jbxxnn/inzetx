"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  User02Icon,
  Location04Icon,
  Calendar02Icon,
  Task02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"
import Link from "next/link"
import { ReviewList } from "../review/review-list"
import { StarRating } from "../review/star-rating"
import type { Review, ReviewStats } from "@/app/actions/review"

interface FreelancerProfile {
  id: string;
  headline?: string;
  description?: string;
  skills?: string[];
  availability?: {
    [key: string]: string[];
  };
  location?: {
    city?: string;
    postcode?: string;
    address?: string;
  };
}

interface Profile {
  id: string;
  full_name?: string;
  profile_photo?: string;
  phone_number?: string;
  languages?: string[];
}

interface FreelancerProfileViewProps {
  freelancerProfile: FreelancerProfile | null;
  profile: Profile;
  role: string;
  reviews?: Review[];
  reviewStats?: ReviewStats;
  currentUserProfileId?: string;
  currentUserRole?: 'client' | 'freelancer';
  freelancerProfileId?: string;
}

export default function FreelancerProfileView({
  freelancerProfile,
  profile,
  role,
  reviews = [],
  reviewStats,
  currentUserProfileId,
  currentUserRole,
  freelancerProfileId,
}: FreelancerProfileViewProps) {
  if (!freelancerProfile) {
    return (
      <DashboardLayout role={role as 'client' | 'freelancer'} activePath="/dashboard/settings">
        <Card className="bg-primary-foreground border-2 border-secondary/50">
          <CardContent className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <HugeiconsIcon icon={User02Icon} className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-secondary-foreground mb-2">
                No profile found
              </h3>
              <p className="text-sm text-secondary-foreground/70 mb-6">
                Complete your onboarding to create your profile
              </p>
              <Button asChild className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full">
                <Link href="/onboarding">
                  Complete Onboarding
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Format availability
  const formatAvailability = () => {
    if (!freelancerProfile.availability) return 'Not specified';

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const availabilityList: string[] = [];

    Object.entries(freelancerProfile.availability).forEach(([day, times]) => {
      if (times && times.length > 0) {
        const dayName = days[parseInt(day)] || day;
        availabilityList.push(`${dayName}: ${times.join(', ')}`);
      }
    });

    return availabilityList.length > 0 ? availabilityList.join(' • ') : 'Not specified';
  };

  // Format location
  const formatLocation = () => {
    if (!freelancerProfile.location) return 'Not specified';

    const parts: string[] = [];
    if (freelancerProfile.location.city) parts.push(freelancerProfile.location.city);
    if (freelancerProfile.location.postcode) parts.push(freelancerProfile.location.postcode);
    if (freelancerProfile.location.address) parts.push(freelancerProfile.location.address);

    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  return (
    <DashboardLayout role={role as 'client' | 'freelancer'} activePath="/dashboard/freelancer/profile">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
            My Profile
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
            View your freelancer profile
          </p>
        </div>
        <Button asChild className="bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full gap-2">
          <Link href="/onboarding">
            <HugeiconsIcon icon={Edit02Icon} className="w-5 h-5" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Profile Header Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {profile.profile_photo ? (
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-secondary-foreground shadow-sm shrink-0">
                    <Image
                      src={profile.profile_photo}
                      alt={profile.full_name || 'Profile'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary flex items-center justify-center shrink-0 border-2 border-secondary-foreground shadow-sm">
                    <HugeiconsIcon icon={User02Icon} className="w-12 h-12 sm:w-16 sm:h-16 text-secondary-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-heading font-bold text-secondary-foreground">
                    {profile.full_name || 'Freelancer'}
                  </h2>
                  {profile.phone_number && (
                    <p className="text-xl font-semibold text-secondary-foreground mb-4">
                      {profile.phone_number}
                    </p>
                  )}
                  {freelancerProfile.headline && (
                    <p className="text-sm text-secondary-foreground font-semibold mb-3">
                      {freelancerProfile.headline}
                    </p>
                  )}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-3 mt-3">
                      <StarRating rating={reviewStats.averageRating} size={20} />
                      <span className="text-sm text-secondary-foreground">
                        ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.languages.map((lang, index) => (
                        <Badge key={index} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          {freelancerProfile.description && (
            <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <HugeiconsIcon icon={Task02Icon} className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-secondary-foreground whitespace-pre-wrap leading-relaxed">
                  {freelancerProfile.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills Card */}
          {freelancerProfile.skills && freelancerProfile.skills.length > 0 && (
            <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-primary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground">
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewList
                reviews={reviews}
                averageRating={reviewStats?.averageRating}
                totalReviews={reviewStats?.totalReviews}
                showStats={true}
                currentUserProfileId={currentUserProfileId}
                currentUserRole={currentUserRole}
                freelancerProfileId={freelancerProfileId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Location Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-heading font-bold text-secondary-foreground">
                <HugeiconsIcon icon={Location04Icon} className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-secondary-foreground/80">
                {formatLocation()}
              </p>
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-heading font-bold text-secondary-foreground">
                <HugeiconsIcon icon={Calendar02Icon} className="w-5 h-5 text-primary" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-secondary-foreground/80 whitespace-pre-line">
                {formatAvailability()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

