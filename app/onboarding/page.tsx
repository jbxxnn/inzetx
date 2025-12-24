import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getFreelancerProfile } from '@/app/actions/freelancer';
import { OnboardingContent } from '@/components/freelancer-wizard/OnboardingContent';
import type { WizardData } from '@/components/freelancer-wizard/FreelancerWizard';
// import Image from 'next/image';

async function FreelancerProfileContent() {
  // Auth and profile checks inside Suspense boundary
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

  // Type-safe access to profile fields
  type ProfileWithExtras = typeof profile & {
    full_name?: string;
    phone_number?: string;
    languages?: string[];
    profile_photo?: string;
  };

  type FreelancerProfileWithExtras = typeof freelancerProfile & {
    example_tasks?: string[];
    pricing_style?: 'hourly' | 'per_task';
    hourly_rate?: number;
    location?: {
      postcode?: string;
      travelRadius?: 'nearby' | 'city' | 'city_plus';
    };
  };

  const profileWithExtras = profile as ProfileWithExtras;
  const freelancerProfileWithExtras = freelancerProfile as FreelancerProfileWithExtras | null;

  // Convert existing data to wizard format
  const initialWizardData: Partial<WizardData> = {
    fullName: profileWithExtras.full_name,
    phoneNumber: profileWithExtras.phone_number,
    languages: profileWithExtras.languages || [],
    profilePhoto: profileWithExtras.profile_photo,
    description: freelancerProfile?.description,
    exampleTasks: freelancerProfileWithExtras?.example_tasks || [],
    postcode: freelancerProfileWithExtras?.location?.postcode,
    travelRadius: freelancerProfileWithExtras?.location?.travelRadius,
    availability: freelancerProfile?.availability as WizardData['availability'],
    pricingStyle: freelancerProfileWithExtras?.pricing_style,
    hourlyRate: freelancerProfileWithExtras?.hourly_rate,
    headline: freelancerProfile?.headline,
    skills: freelancerProfile?.skills || [],
  };

  return (
    <OnboardingContent
      profileId={profile.id}
      initialData={initialWizardData}
    />
  );
}

export default function FreelancerProfilePage() {
  return (
    <div className="min-h-screen w-full bg-secondary">
      <div className="grid min-h-screen">
        {/* Left Column - Content */}
        <div className="flex flex-colmn p-8 pt-4 lg:p-12 lg:pt-8 xl:p-16 xl:pt-12 relative z-10">
          <div className=" w-full space-y-8">
            {/* Header with Logo */}
            {/* <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-white font-semibold text-xl">Klusbaar</span>
            </div> */}

            {/* Wizard Content */}
            <div className="">
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-slate-300">Loading profile...</div>
                  </div>
                }
              >
                <FreelancerProfileContent />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Right Column - Visual Illustration */}
        {/* <div className="hidden lg:flex items-center justify-center p-8 lg:p-12 xl:p-16 relative overflow-hidden col-span-1">
          <div className="absolute inset-0">
            <Image 
              src="/on-boarding.png" 
              alt="Onboarding illustration" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}

