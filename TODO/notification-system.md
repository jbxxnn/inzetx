# Notification System

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**HIGH** - Phase 1 (MVP Completion)

## Description
Implement a comprehensive notification system that alerts users about important events via:
- In-app notifications
- Email notifications
- SMS notifications (optional)
- Push notifications (future)

## Why
Currently, users must manually check the platform to see:
- New job invites
- Booking confirmations
- Messages
- Review requests
- Payment updates

This leads to:
- Poor user engagement
- Delayed responses
- Missed opportunities
- Poor user experience

Notifications are essential for keeping users engaged and informed.

## Approach

### Notification Types
1. **Job-Related**
   - New job invite
   - Job invite accepted/declined
   - New match found for job
   - Job status changed

2. **Booking-Related**
   - Booking confirmed
   - Booking cancelled
   - Booking reminder (24h before)
   - Booking completed

3. **Communication**
   - New message received
   - Message read receipt

4. **Reviews**
   - Review request (after job completion)
   - New review received
   - Review reminder

5. **Payment**
   - Payment received
   - Payout processed
   - Payment failed

6. **System**
   - Profile verification status
   - Account updates

### Database Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_job_invites BOOLEAN DEFAULT true,
  email_messages BOOLEAN DEFAULT true,
  email_bookings BOOLEAN DEFAULT true,
  email_reviews BOOLEAN DEFAULT true,
  email_payments BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT now()
);
```

### Implementation Options

1. **Email Service**
   - **Resend** (Recommended) - Modern, developer-friendly
   - **SendGrid** - Established, feature-rich
   - **Postmark** - Great deliverability
   - **Supabase Email** - Built-in but limited

2. **SMS Service** (Optional)
   - **Twilio** - Industry standard
   - **Vonage** - Good European coverage

3. **Push Notifications** (Future)
   - **OneSignal** - Free tier available
   - **Firebase Cloud Messaging** - Google ecosystem

### Features
1. **In-App Notifications**
   - Notification bell icon with badge count
   - Notification dropdown/list
   - Mark as read/unread
   - Real-time updates (Supabase Realtime)

2. **Email Notifications**
   - HTML email templates
   - User preference controls
   - Unsubscribe option
   - Email verification

3. **Notification Preferences**
   - User settings page
   - Granular control per notification type
   - Opt-in/opt-out for each channel

4. **Notification Queue**
   - Background job processing
   - Retry logic for failed sends
   - Rate limiting

## Dependencies
- Email service account (Resend recommended)
- User authentication (already exists)
- Database schema setup
- Supabase Realtime (for in-app notifications)

## Implementation Steps
1. Create database schema (notifications, preferences tables)
2. Set up email service (Resend)
3. Create email templates
4. Build notification server actions
5. Create notification service/utility
6. Build in-app notification UI component
7. Add notification preferences page
8. Integrate notifications into existing flows:
   - Job invites
   - Bookings
   - Messages (when implemented)
   - Reviews (when implemented)
   - Payments (when implemented)
9. Add real-time updates for in-app notifications
10. Test email delivery
11. Add notification analytics

## Notes
- Start with email and in-app notifications
- SMS can be added later if needed
- Push notifications require mobile app or PWA
- Consider using a queue system (e.g., BullMQ) for high volume
- Email templates should be branded and responsive
- Respect user preferences and unsubscribe requests
- Consider notification batching (daily digest option)

