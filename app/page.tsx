// import { HomeCTAs } from "@/components/HomeCTAs";
// import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/hero/header";
import { Hero } from "@/components/hero/hero";
// import ImpactSection from "@/components/hero/impact-section";
// import StartupsSection from "@/components/hero/startup-section";
// import PartnersSection from "@/components/hero/partners-section";
// import MentorsSection from "@/components/hero/mentors-section";
// import GallerySection from "@/components/hero/gallery-section";
// import TestimonialsSection from "@/components/hero/testimonial-section";
// import CTASection from "@/components/hero/cta-section";
// import FAQSection from "@/components/hero/faq-section";
import Footer from "@/components/hero/footer";

export default async function Home() {

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }
  
  return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Header className="fixed top-0 left-0 right-0 z-50"/>


        <Hero />
        {/* <ImpactSection /> */}
        {/* <StartupsSection /> */}
        {/* <PartnersSection /> */}
        {/* <MentorsSection /> */}
        {/* <GallerySection /> */}
        {/* <TestimonialsSection /> */}
        {/* <CTASection /> */}
        {/* <FAQSection /> */}
        <Footer />
        
      </div>
    </main>
        </Suspense>
  );
}
