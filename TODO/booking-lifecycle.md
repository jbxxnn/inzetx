# Booking Lifecycle Management

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM-HIGH** - Phase 2 (Growth)

## Description
Enhance the booking system to handle the complete lifecycle of a booking, including:
- Booking confirmation flow
- Rescheduling with rules and notifications
- Cancellation policies and handling
- Completion workflow
- Dispute resolution process

## Why
Currently, bookings have basic status management but lack:
- Proper confirmation workflow
- Rescheduling capabilities
- Cancellation policies
- Clear completion process
- Dispute handling

This leads to:
- Confusion about booking status
- No protection for cancellations
- Difficulty managing changes
- No way to resolve conflicts

## Approach

### Database Schema
```sql
-- Enhance existing bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES bookings(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_status TEXT CHECK (dispute_status IN ('none', 'pending', 'resolved', 'escalated'));

CREATE TABLE booking_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  change_type TEXT CHECK (change_type IN ('reschedule', 'cancel', 'complete', 'dispute')) NOT NULL,
  requested_by UUID REFERENCES profiles(id),
  old_value JSONB,
  new_value JSONB,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP
);
```

### Features
1. **Booking Confirmation**
   - Client confirms booking after freelancer accepts invite
   - Both parties must confirm
   - Confirmation deadline (e.g., 24 hours)
   - Auto-confirm if both parties agree

2. **Rescheduling**
   - Either party can request reschedule
   - Other party must approve
   - New time slot selection
   - Notification to both parties
   - History of reschedule requests

3. **Cancellation**
   - Cancellation policies (e.g., free if 24h+ notice, fee if <24h)
   - Cancellation reasons
   - Automatic refund handling (if payment integrated)
   - Impact on ratings/reviews

4. **Completion**
   - Mark job as completed
   - Both parties confirm completion
   - Trigger review request
   - Release payment (if escrow used)
   - Archive booking

5. **Dispute Resolution**
   - Either party can open dispute
   - Dispute form with details
   - Admin review process
   - Resolution tracking
   - Escalation path

6. **UI Components**
   - Booking detail page with actions
   - Reschedule request modal
   - Cancellation form
   - Completion confirmation
   - Dispute form

## Dependencies
- Booking system (already exists)
- Payment system (for refunds)
- Notification system (for status updates)
- Reviews system (triggered on completion)
- Admin panel (for dispute resolution)

## Implementation Steps
1. Update database schema
2. Create booking change tracking
3. Build confirmation flow
4. Implement rescheduling functionality
5. Add cancellation policies and handling
6. Create completion workflow
7. Build dispute resolution system
8. Add booking status UI components
9. Integrate with notifications
10. Add cancellation policy documentation
11. Test all workflows

## Notes
- Cancellation policies should be configurable
- Consider adding "no-show" tracking
- May want to add booking reminders (24h, 1h before)
- Dispute resolution may need manual admin intervention initially
- Consider adding booking templates for common scenarios
- Should integrate with calendar (when implemented)

