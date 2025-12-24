# Pricing Flexibility & Negotiation

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**LOW-MEDIUM** - Phase 3 (Scale)

## Description
Enhance pricing system to support:
- Custom quotes
- Price negotiation
- Package deals
- Discounts
- Price history

## Why
Currently, pricing is fixed (hourly or per-task). More flexibility helps:
- Accommodate different job types
- Enable negotiation
- Attract more clients
- Better match market rates
- Support complex projects

## Approach

### Database Schema
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  freelancer_profile_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  valid_until TIMESTAMP,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP
);

CREATE TABLE price_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  proposed_by UUID REFERENCES profiles(id),
  proposed_amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
```

### Features
1. **Custom Quotes**
   - Freelancer can send custom quote
   - Quote details and breakdown
   - Quote validity period
   - Accept/reject quotes

2. **Price Negotiation**
   - Counter-offers
   - Negotiation thread
   - Message with offer
   - Accept/reject negotiation

3. **Package Deals**
   - Multiple services bundled
   - Discount for packages
   - Recurring service discounts

4. **Discounts**
   - Promo codes
   - First-time client discount
   - Loyalty discounts
   - Seasonal promotions

5. **Price History**
   - Track price changes
   - Show price trends
   - Historical quotes

## Dependencies
- Job requests (already exists)
- Freelancer profiles (already exists)
- Messaging system (for negotiation)
- Payment system (for custom amounts)

## Implementation Steps
1. Create database schema
2. Build quote creation UI
3. Create quote display component
4. Implement quote acceptance
5. Build negotiation interface
6. Add package deal support
7. Create discount system
8. Add price history tracking
9. Integrate with payment system
10. Test all pricing flows

## Notes
- Should have minimum/maximum price limits
- Consider adding price suggestions based on market rates
- May want to add escrow for custom quotes
- Should track negotiation success rate
- Consider adding price transparency (show average rates)

