# Seed Scripts

## Seed Freelancers

This script generates 20 realistic freelancer profiles with AI-generated content.

### Prerequisites

- Environment variables must be set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`

### Usage

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the seed script
npx tsx scripts/seed-freelancers.ts
```

### What it does

1. Creates 20 test user accounts (or uses existing ones)
2. Creates profiles with `role = 'freelancer'`
3. Creates freelancer profiles with:
   - Realistic descriptions
   - AI-generated headlines
   - AI-generated skill tags
   - Embeddings for vector search
   - Location (Almere with various postcodes)
   - Availability information

### Generated Freelancers

The script creates freelancers in various categories:
- Handyman
- Carpenter
- Electrician
- Plumber
- Painter
- Gardener
- Cleaner
- Tutor
- Babysitter
- Mover
- Photographer
- Chef
- Organizer
- Tech Support
- Pet Care
- Tailor
- Massage Therapist
- Language Teacher
- Bike Repair
- Elder Care

### Notes

- If a user with the same email already exists, it will update the profile
- All users have password: `Test123456!`
- All users are in Almere with different postcodes
- Embeddings are generated using OpenAI API (costs apply)

### Troubleshooting

- **Error: "Not authenticated"** - Check `SUPABASE_SERVICE_ROLE_KEY` is set
- **Error: "OpenAI API error"** - Check `OPENAI_API_KEY` is set and has credits
- **Error: "User already exists"** - This is fine, the script will update existing users


