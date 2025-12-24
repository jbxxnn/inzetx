/**
 * Seed script to generate 20 freelancer profiles
 * Run with: npx tsx scripts/seed-freelancers.ts
 * 
 * This script:
 * 1. Creates test user accounts (or uses existing)
 * 2. Creates profiles with freelancer role
 * 3. Creates freelancer profiles with realistic descriptions
 * 4. Generates embeddings, headlines, and skills using AI
 */

// IMPORTANT: Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Verify required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error('\nPlease ensure .env.local exists and contains all required variables.');
  process.exit(1);
}

// Now import modules that use environment variables
import { createClient } from '@supabase/supabase-js';
import { embed, generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Create admin client directly (since admin.ts executes at import time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
  },
});

// AI setup
const embeddingModel = openai.textEmbeddingModel('text-embedding-3-small');
const textModel = openai('gpt-4o-mini');

const FREELANCER_ANALYSIS_SYSTEM_PROMPT = `You are an expert marketplace assistant that analyzes freelancer profiles.
Your role is to:
1. Extract key skills and expertise
2. Generate concise, compelling headlines (max 10 words)
3. Suggest relevant skill tags (1–5 tags)
Be precise and remove redundancy.`;

// Helper functions (inline to avoid import issues)
async function generateFreelancerHeadline(description: string): Promise<string> {
  const { text } = await generateText({
    model: textModel,
    system: FREELANCER_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Generate a short, punchy headline (max 10 words) for this freelancer profile:\n\n${description}`,
  });
  return text.trim();
}

const SkillsSchema = z.object({
  skills: z.array(z.string()).min(1).max(5),
});

async function generateSkillTags(description: string): Promise<string[]> {
  const { object } = await generateObject({
    model: textModel,
    system: FREELANCER_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Extract 1–5 concise skill tags (as an array of short strings) for this freelancer profile:\n\n${description}`,
    schema: SkillsSchema,
  });
  return object.skills.map((s: string) => s.trim());
}

// Realistic freelancer descriptions for Almere
const freelancerData = [
  {
    email: 'handyman.jan@example.com',
    password: 'Test123456!',
    description:
      'Experienced handyman with 15 years of experience in home repairs, furniture assembly, and general maintenance. I specialize in IKEA furniture assembly, fixing broken furniture, mounting TVs and shelves, and small electrical work. Available evenings and weekends.',
    location: { city: 'Almere', postcode: '1312 AB' },
    availability: { flexible: true, notes: 'Evenings and weekends' },
  },
  {
    email: 'carpenter.maria@example.com',
    password: 'Test123456!',
    description:
      'Professional carpenter with expertise in custom furniture, cabinet installation, and woodworking projects. I can build shelves, repair wooden structures, and create custom pieces. Available weekdays after 6 PM.',
    location: { city: 'Almere', postcode: '1315 XZ' },
    availability: { flexible: true, notes: 'Weekdays after 6 PM' },
  },
  {
    email: 'electrician.peter@example.com',
    password: 'Test123456!',
    description:
      'Licensed electrician available for small electrical jobs. I can install light fixtures, replace outlets, fix wiring issues, and help with smart home installations. Available flexible hours.',
    location: { city: 'Almere', postcode: '1324 KL' },
    availability: { flexible: true, notes: 'Flexible hours' },
  },
  {
    email: 'plumber.anna@example.com',
    password: 'Test123456!',
    description:
      'Experienced plumber for small plumbing jobs. I fix leaks, unclog drains, install faucets, and help with bathroom renovations. Quick response time, available most days.',
    location: { city: 'Almere', postcode: '1301 MN' },
    availability: { flexible: true, notes: 'Most days available' },
  },
  {
    email: 'painter.thomas@example.com',
    password: 'Test123456!',
    description:
      'Professional painter for interior and exterior painting projects. I paint walls, ceilings, doors, and furniture. Clean work, attention to detail. Available weekends.',
    location: { city: 'Almere', postcode: '1318 PQ' },
    availability: { flexible: true, notes: 'Weekends preferred' },
  },
  {
    email: 'gardener.sophie@example.com',
    password: 'Test123456!',
    description:
      'Garden maintenance and landscaping services. I can mow lawns, trim hedges, plant flowers, and help with garden design. Available mornings and afternoons.',
    location: { city: 'Almere', postcode: '1327 RS' },
    availability: { flexible: true, notes: 'Mornings and afternoons' },
  },
  {
    email: 'cleaner.mike@example.com',
    password: 'Test123456!',
    description:
      'Professional cleaning services for homes and offices. Deep cleaning, regular maintenance, window cleaning, and move-in/move-out cleaning. Available weekdays.',
    location: { city: 'Almere', postcode: '1305 TU' },
    availability: { flexible: true, notes: 'Weekdays' },
  },
  {
    email: 'tutor.lisa@example.com',
    password: 'Test123456!',
    description:
      'Experienced tutor for math, science, and English. I help students with homework, exam preparation, and learning support. Available afternoons and evenings.',
    location: { city: 'Almere', postcode: '1311 VW' },
    availability: { flexible: true, notes: 'Afternoons and evenings' },
  },
  {
    email: 'babysitter.emma@example.com',
    password: 'Test123456!',
    description:
      'Reliable babysitter with experience caring for children of all ages. I can help with homework, prepare meals, and provide safe childcare. Available evenings and weekends.',
    location: { city: 'Almere', postcode: '1322 XY' },
    availability: { flexible: true, notes: 'Evenings and weekends' },
  },
  {
    email: 'mover.david@example.com',
    password: 'Test123456!',
    description:
      'Moving and lifting services. I help with moving boxes, furniture, and heavy items. I have a van and can assist with local moves within Almere. Available flexible schedule.',
    location: { city: 'Almere', postcode: '1308 ZA' },
    availability: { flexible: true, notes: 'Flexible schedule' },
  },
  {
    email: 'photographer.sarah@example.com',
    password: 'Test123456!',
    description:
      'Professional photographer for events, portraits, and product photography. I can also help with photo editing and creating social media content. Available weekends.',
    location: { city: 'Almere', postcode: '1316 BC' },
    availability: { flexible: true, notes: 'Weekends' },
  },
  {
    email: 'cook.chef@example.com',
    password: 'Test123456!',
    description:
      'Home chef available for meal preparation, cooking classes, and catering for small events. I specialize in Dutch and international cuisine. Available flexible hours.',
    location: { city: 'Almere', postcode: '1325 DE' },
    availability: { flexible: true, notes: 'Flexible hours' },
  },
  {
    email: 'organizer.linda@example.com',
    password: 'Test123456!',
    description:
      'Professional organizer helping with decluttering, home organization, and space optimization. I help organize closets, offices, and storage spaces. Available weekdays.',
    location: { city: 'Almere', postcode: '1303 FG' },
    availability: { flexible: true, notes: 'Weekdays' },
  },
  {
    email: 'tech.support@example.com',
    password: 'Test123456!',
    description:
      'IT support and tech help. I can set up computers, install software, fix technical issues, help with smart home devices, and provide tech training. Available flexible schedule.',
    location: { city: 'Almere', postcode: '1319 HI' },
    availability: { flexible: true, notes: 'Flexible schedule' },
  },
  {
    email: 'petcare.jessica@example.com',
    password: 'Test123456!',
    description:
      'Pet care services including dog walking, pet sitting, and basic pet grooming. I love animals and have experience with dogs, cats, and small pets. Available mornings and evenings.',
    location: { city: 'Almere', postcode: '1321 JK' },
    availability: { flexible: true, notes: 'Mornings and evenings' },
  },
  {
    email: 'sewing.tailor@example.com',
    password: 'Test123456!',
    description:
      'Tailoring and sewing services. I can alter clothes, repair garments, create custom pieces, and help with sewing projects. Available afternoons.',
    location: { city: 'Almere', postcode: '1307 LM' },
    availability: { flexible: true, notes: 'Afternoons' },
  },
  {
    email: 'massage.therapist@example.com',
    password: 'Test123456!',
    description:
      'Licensed massage therapist offering relaxation and therapeutic massages. I provide home visits and help with stress relief and muscle tension. Available flexible hours.',
    location: { city: 'Almere', postcode: '1314 NO' },
    availability: { flexible: true, notes: 'Flexible hours' },
  },
  {
    email: 'language.teacher@example.com',
    password: 'Test123456!',
    description:
      'Language teacher offering Dutch, English, and Spanish lessons. I help with conversation practice, grammar, and exam preparation. Available evenings and weekends.',
    location: { city: 'Almere', postcode: '1328 PR' },
    availability: { flexible: true, notes: 'Evenings and weekends' },
  },
  {
    email: 'bike.repair@example.com',
    password: 'Test123456!',
    description:
      'Bicycle repair and maintenance services. I fix flat tires, adjust brakes, tune gears, and perform general bike maintenance. I can come to your location. Available flexible schedule.',
    location: { city: 'Almere', postcode: '1302 ST' },
    availability: { flexible: true, notes: 'Flexible schedule' },
  },
  {
    email: 'eldercare.helper@example.com',
    password: 'Test123456!',
    description:
      'Compassionate caregiver for elderly assistance. I help with daily tasks, companionship, light housekeeping, and errands. Available weekdays and some weekends.',
    location: { city: 'Almere', postcode: '1317 UV' },
    availability: { flexible: true, notes: 'Weekdays and some weekends' },
  },
];

async function seedFreelancers() {
  console.log('Starting to seed freelancers...\n');

  for (let i = 0; i < freelancerData.length; i++) {
    const data = freelancerData[i];
    console.log(`[${i + 1}/${freelancerData.length}] Processing: ${data.email}`);

    try {
      // Step 1: Create or get user
      let userId: string;
      
      // Try to create user first
      const { data: newUser, error: userError } =
        await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
        });

      if (userError) {
        // If user already exists, try to find them
        if (userError.message.includes('already registered') || userError.message.includes('already exists')) {
          // List users to find the existing one
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = users?.users.find((u) => u.email === data.email);
          
          if (existingUser) {
            userId = existingUser.id;
            console.log(`  ✓ User already exists: ${data.email}`);
          } else {
            throw new Error(`User exists but could not be found: ${data.email}`);
          }
        } else {
          throw userError;
        }
      } else {
        if (!newUser.user) throw new Error('Failed to create user');
        userId = newUser.user.id;
        console.log(`  ✓ Created user: ${data.email}`);
      }

      // Step 2: Create or get profile
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let profileId: string;
      if (existingProfile) {
        profileId = existingProfile.id;
        // Update role to freelancer
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'freelancer' })
          .eq('id', profileId);
        console.log(`  ✓ Profile exists, updated role`);
      } else {
        const { data: newProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: userId,
            role: 'freelancer',
          })
          .select()
          .single();

        if (profileError) throw profileError;
        if (!newProfile) throw new Error('Failed to create profile');
        profileId = newProfile.id;
        console.log(`  ✓ Created profile`);
      }

      // Step 3: Generate embedding, headline, and skills
      console.log(`  → Generating AI content...`);
      const { embedding } = await embed({
        model: embeddingModel,
        value: data.description,
      });

      const [headline, skills] = await Promise.all([
        generateFreelancerHeadline(data.description),
        generateSkillTags(data.description),
      ]);

      // Step 4: Create or update freelancer profile
      const { data: existingFreelancerProfile } = await supabaseAdmin
        .from('freelancer_profiles')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (existingFreelancerProfile) {
        await supabaseAdmin
          .from('freelancer_profiles')
          .update({
            description: data.description,
            availability: data.availability,
            location: data.location,
            embedding: Array.isArray(embedding) ? embedding : embedding,
            headline,
            skills,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingFreelancerProfile.id);
        console.log(`  ✓ Updated freelancer profile`);
      } else {
        const { error: freelancerError } = await supabaseAdmin
          .from('freelancer_profiles')
          .insert({
            profile_id: profileId,
            description: data.description,
            availability: data.availability,
            location: data.location,
            embedding: Array.isArray(embedding) ? embedding : embedding,
            headline,
            skills,
          });

        if (freelancerError) throw freelancerError;
        console.log(`  ✓ Created freelancer profile`);
      }

      console.log(`  ✅ Completed: ${data.email}\n`);
    } catch (error) {
      console.error(`  ❌ Error processing ${data.email}:`, error);
      console.log('');
    }
  }

  console.log('✅ Seeding completed!');
}

// Run the seed function
seedFreelancers()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

