import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getFreelancerProfile } from '@/app/actions/freelancer';
import { getFreelancerReviews, getFreelancerReviewStats } from '@/app/actions/review';
import FreelancerProfileView from '@/components/freelancer-profile/freelancer-profile-view';
import { Suspense } from 'react';

async function FreelancerProfileContainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'freelancer') {
    redirect('/dashboard');
  }

  // Fetch freelancer profile data
  const freelancerProfile = await getFreelancerProfile(profile.id);

  if (!freelancerProfile) {
    redirect('/onboarding');
  }

  // Get profile with extended fields
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, profile_photo, phone_number, languages')
    .eq('id', profile.id)
    .single();

  // Fetch reviews and review stats
  const [reviews, reviewStats] = await Promise.all([
    getFreelancerReviews(freelancerProfile.id, 10),
    getFreelancerReviewStats(freelancerProfile.id),
  ]);

  return (
    <FreelancerProfileView
      freelancerProfile={freelancerProfile}
      profile={{
        id: profile.id,
        full_name: profileData?.full_name,
        profile_photo: profileData?.profile_photo,
        phone_number: profileData?.phone_number,
        languages: profileData?.languages,
      }}
      role={profile.role}
      reviews={reviews}
      reviewStats={reviewStats}
      currentUserProfileId={profile.id}
      currentUserRole={profile.role}
      freelancerProfileId={freelancerProfile.id}
    />
  );
}

export default function FreelancerProfilePage() {
  return (
    <Suspense fallback={<div className="flex-1 w-full flex flex-col gap-12">Loading..</div>}>
      <FreelancerProfileContainer />
    </Suspense>
  );
}

