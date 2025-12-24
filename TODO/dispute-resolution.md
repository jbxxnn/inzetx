# Dispute Resolution System

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM** - Phase 3 (Scale)

## Description
Create a system for handling disputes between clients and freelancers:
- Dispute filing
- Evidence submission
- Admin review
- Resolution tracking
- Refund handling

## Why
Conflicts will happen. A dispute system provides:
- Fair resolution process
- Protection for both parties
- Platform credibility
- Reduced support burden
- Clear conflict resolution

## Approach

### Database Schema
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  filed_by UUID REFERENCES profiles(id) NOT NULL,
  filed_against UUID REFERENCES profiles(id) NOT NULL,
  dispute_type TEXT CHECK (dispute_type IN ('payment', 'quality', 'behavior', 'cancellation', 'other')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'under_review', 'resolved', 'closed')) DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES profiles(id),
  evidence_type TEXT CHECK (evidence_type IN ('message', 'photo', 'document', 'other')),
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### Features
1. **Dispute Filing**
   - File dispute form
   - Select dispute type
   - Describe issue
   - Upload evidence
   - Submit for review

2. **Evidence Management**
   - Upload photos/documents
   - Link to messages
   - Add notes
   - View all evidence

3. **Admin Review**
   - View dispute details
   - Review evidence
   - Communicate with parties
   - Make resolution decision
   - Issue refunds (if applicable)

4. **Resolution Actions**
   - Full refund to client
   - Partial refund
   - Payment to freelancer
   - No action
   - Account suspension (if needed)

5. **Communication**
   - Dispute messaging thread
   - Admin can participate
   - Notifications to both parties
   - Resolution notifications

## Dependencies
- Booking system (already exists)
- Payment system (for refunds)
- Admin panel (for review)
- Notification system (for updates)
- Messaging system (for communication)

## Implementation Steps
1. Create database schema
2. Build dispute filing form
3. Create evidence upload system
4. Build dispute detail page
5. Create admin review interface
6. Implement resolution actions
7. Add dispute messaging
8. Integrate with payment system (refunds)
9. Add notifications
10. Test dispute workflows

## Notes
- Should have clear dispute policies
- Consider adding automated resolution for simple cases
- May want to add dispute mediation (third-party)
- Should track dispute resolution time
- Consider adding dispute prevention (clear terms, communication tools)
- May want to add dispute fees (to discourage frivolous disputes)

