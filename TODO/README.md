# TODO - Future Features & Enhancements

This folder contains documentation for planned features, improvements, and technical enhancements that we want to implement in the future.

## Structure

Each TODO item should be documented in its own markdown file with:
- **Description**: What needs to be done
- **Why**: The problem it solves or benefit it provides
- **Approach**: How we plan to implement it
- **Dependencies**: What needs to be in place first
- **Status**: Current state (planned, in-progress, blocked, etc.)

## Current TODO Items

### Phase 1: MVP Completion (High Priority)

1. [Enhanced RPC Function for Matching](./enhanced-rpc-matching.md) - Improve database-level matching with exact filters
2. [Reviews System](./reviews-system.md) - Client reviews and ratings integration with matching algorithm
3. [Messaging System](./messaging-system.md) - Direct communication between clients and freelancers
4. [Payment Integration](./payment-integration.md) - Complete payment processing with Stripe Connect
5. [Notification System](./notification-system.md) - In-app, email, and push notifications

### Phase 2: Growth Features (Medium-High Priority)

6. [Freelancer Discovery](./freelancer-discovery.md) - Browse and search freelancers directly
7. [Booking Lifecycle Management](./booking-lifecycle.md) - Complete booking workflow with rescheduling and cancellation
8. [Analytics Dashboard](./analytics-dashboard.md) - Insights for freelancers, clients, and platform
9. [Job Status Workflow](./job-status-workflow.md) - Proper job lifecycle management

### Phase 3: Scale & Enhancement (Medium Priority)

10. [Portfolio & Media Uploads](./portfolio-media.md) - Image uploads and portfolio showcase
11. [Advanced Search & Filters](./search-filters.md) - Enhanced search with filters and presets
12. [Mobile App](./mobile-app.md) - Native app or PWA for better mobile experience
13. [Admin Panel](./admin-panel.md) - Platform management and moderation tools
14. [Calendar Integration](./calendar-integration.md) - Visual calendar and Google Calendar sync
15. [Verification & Trust System](./verification-trust.md) - Identity verification and trust scores
16. [Dispute Resolution](./dispute-resolution.md) - Conflict resolution system
17. [Pricing Flexibility](./pricing-flexibility.md) - Custom quotes and price negotiation

### Ongoing Improvements

18. [Error Handling Improvements](./error-handling-improvements.md) - Better error messages and user feedback
19. [Performance Optimization](./performance-optimization.md) - Caching, optimization, and performance improvements

---

## Adding New TODOs

When adding a new TODO item:

1. Create a new markdown file in this folder
2. Use descriptive filename: `kebab-case-description.md`
3. Follow the template structure below
4. Add a link to it in this README
5. Update status as work progresses

## Template

```markdown
# [Feature Name]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Description
Brief description of what needs to be done.

## Why
The problem this solves or benefit it provides.

## Approach
How we plan to implement this.

## Dependencies
- What needs to be done first
- Any blockers

## Notes
Additional context, considerations, or links.
```

