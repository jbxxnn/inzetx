# Payment Integration

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**HIGH** - Phase 1 (MVP Completion)

## Description
Implement a complete payment processing system that handles:
- Client payments for bookings
- Freelancer payouts
- Platform commission/fees
- Payment security and escrow (optional)
- Refund handling

## Why
Currently, the platform has no way to process payments. Users must handle payments offline, which:
- Prevents the platform from monetizing
- Creates trust issues (payment disputes)
- Makes it harder to track transactions
- Limits scalability
- No protection for either party

Payment processing is essential for a marketplace to function as a business.

## Approach

### Payment Provider Options
1. **Stripe Connect** (Recommended)
   - Marketplace model with connected accounts
   - Handles escrow, payouts, and fees automatically
   - Strong fraud protection
   - Good documentation

2. **Mollie** (Alternative for Netherlands)
   - Dutch payment provider
   - Good local payment methods (iDEAL, etc.)
   - May need custom marketplace implementation

### Database Schema
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES profiles(id),
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  freelancer_payout DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  stripe_payout_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);
```

### Features
1. **Payment Flow**
   - Client pays when booking is confirmed
   - Funds held in escrow (optional but recommended)
   - Automatic payout to freelancer after job completion
   - Platform fee deducted automatically

2. **Payment Methods**
   - Credit/debit cards
   - iDEAL (for Netherlands)
   - Bank transfers (optional)

3. **Payout Management**
   - Freelancer can set payout schedule (daily, weekly, monthly)
   - Minimum payout threshold
   - Payout history and tracking

4. **Refund Handling**
   - Client-initiated refunds (with rules)
   - Dispute-based refunds
   - Partial refunds support

5. **UI Components**
   - Payment form (Stripe Elements)
   - Payment status display
   - Payout dashboard for freelancers
   - Transaction history

## Dependencies
- Stripe account setup
- Stripe Connect onboarding for freelancers
- Booking system (already exists)
- Notification system (for payment confirmations)

## Implementation Steps
1. Set up Stripe account and get API keys
2. Install Stripe SDK
3. Create database schema for payments
4. Implement payment creation server action
5. Build payment form component (Stripe Elements)
6. Implement webhook handler for payment events
7. Create payout system for freelancers
8. Add payment status tracking to bookings
9. Build payment history UI
10. Add refund handling
11. Test with Stripe test mode

## Notes
- Must comply with PCI DSS requirements (use Stripe Elements, never store card data)
- Consider escrow period (e.g., 24-48 hours after job completion before payout)
- Platform fee should be configurable (e.g., 10-15%)
- May need to handle tax/VAT depending on jurisdiction
- Consider adding payment disputes integration with Stripe Disputes API
- For Netherlands, consider adding iDEAL support via Stripe

