# Job Status Workflow

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**MEDIUM** - Phase 2 (Growth)

## Description
Implement a proper job lifecycle with status management:
- Draft → Published → In Progress → Completed → Archived
- Status transitions with rules
- UI updates based on status
- Status-based filtering

## Why
Currently, jobs are created and matched but have no clear lifecycle. This leads to:
- Confusion about job status
- No way to manage active vs completed jobs
- Difficulty tracking job progress
- No draft functionality

A proper workflow helps:
- Organize jobs better
- Track progress
- Improve user experience
- Enable better analytics

## Approach

### Database Schema
```sql
-- Update existing job_requests table
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS status TEXT 
  CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled', 'archived')) 
  DEFAULT 'draft';

ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
```

### Status Flow
```
draft → published → in_progress → completed → archived
  ↓         ↓
cancelled  cancelled
```

### Features
1. **Draft Status**
   - Save job without publishing
   - Edit before publishing
   - Preview before going live

2. **Published Status**
   - Job is live and visible for matching
   - Can receive invites
   - Can be edited (with restrictions)

3. **In Progress**
   - Automatically set when booking is confirmed
   - Or manually set by client
   - No longer accepts new invites

4. **Completed**
   - Set when booking is completed
   - Triggers review request
   - Can be archived

5. **Cancelled**
   - Client can cancel before booking
   - Notify invited freelancers
   - Archive cancelled jobs

6. **Archived**
   - Hide from active jobs
   - Keep for history
   - Can be restored if needed

7. **UI Updates**
   - Status badges
   - Filter by status
   - Status-based actions
   - Status change history

## Dependencies
- Job requests system (already exists)
- Booking system (triggers status changes)
- Notification system (for status updates)

## Implementation Steps
1. Update database schema
2. Add status field to job creation
3. Create status transition logic
4. Update job list to filter by status
5. Add status badges to UI
6. Create status change actions
7. Add status-based permissions
8. Update job detail page with status
9. Add status change notifications
10. Add archive/restore functionality

## Notes
- Status transitions should be validated (e.g., can't go from completed to in_progress)
- Consider adding status change reasons/notes
- May want to auto-archive old completed jobs
- Should integrate with booking status
- Consider adding job templates for common statuses

