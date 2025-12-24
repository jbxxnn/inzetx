# Portfolio & Media Uploads

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM** - Phase 3 (Scale)

## Description
Allow freelancers to upload and showcase:
- Portfolio images (before/after photos)
- Work samples
- Certifications/documents
- Job photos (with client permission)

## Why
Currently, freelancers can only upload a profile photo. This limits:
- Ability to showcase work quality
- Proof of skills and experience
- Trust building with clients
- Competitive advantage

A portfolio helps:
- Freelancers stand out
- Clients make better decisions
- Build trust and credibility
- Showcase expertise

## Approach

### Database Schema
```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL, -- Supabase Storage path
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  caption TEXT,
  client_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

### Features
1. **Portfolio Management**
   - Upload multiple images
   - Add titles and descriptions
   - Reorder images
   - Set featured image
   - Delete images

2. **Image Upload**
   - Drag and drop interface
   - Image compression/optimization
   - Format validation (JPG, PNG, WebP)
   - Size limits (e.g., 5MB max)
   - Image cropping/resizing

3. **Display**
   - Portfolio gallery on profile
   - Lightbox for full-size viewing
   - Before/after comparison view
   - Featured image on profile card

4. **Job Photos**
   - Upload photos after job completion
   - Client approval required
   - Can be added to portfolio
   - Privacy controls

5. **Storage**
   - Use Supabase Storage
   - Organized buckets (portfolio, job-photos)
   - CDN delivery
   - Image optimization

## Dependencies
- Supabase Storage setup
- Image processing library (e.g., sharp)
- Freelancer profiles (already exists)
- Booking system (for job photos)

## Implementation Steps
1. Set up Supabase Storage buckets
2. Create database schema
3. Build image upload component
4. Implement image compression
5. Create portfolio management UI
6. Add portfolio display to profile
7. Build job photo upload flow
8. Add client approval for job photos
9. Add image optimization
10. Test upload limits and validation
11. Add mobile responsiveness

## Notes
- Consider using a service like Cloudinary for advanced image processing
- Should respect privacy (client approval for job photos)
- May want to add video support in future
- Consider adding image alt text for accessibility
- Should implement proper image CDN caching
- Consider adding image metadata (location, date, etc.)

