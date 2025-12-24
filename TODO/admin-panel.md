# Admin Panel

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**LOW-MEDIUM** - Phase 3 (Scale)

## Description
Create an admin dashboard for platform management:
- User management
- Content moderation
- Dispute resolution
- Analytics and reporting
- System configuration

## Why
As the platform grows, manual management becomes impossible. An admin panel enables:
- Efficient user support
- Content moderation
- Dispute handling
- Platform insights
- Configuration management

## Approach

### Database Schema
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK (role IN ('admin', 'moderator', 'support')) DEFAULT 'moderator',
  permissions JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  target_type TEXT NOT NULL, -- 'profile', 'job', 'message', 'review'
  target_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'suspend', 'delete'
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Features
1. **User Management**
   - View all users
   - User search and filters
   - User details and activity
   - Suspend/ban users
   - Verify users
   - View user reports

2. **Content Moderation**
   - Review flagged content
   - Approve/reject profiles
   - Moderate job posts
   - Review messages (if needed)
   - Handle inappropriate content

3. **Dispute Resolution**
   - View all disputes
   - Dispute details and evidence
   - Resolution actions
   - Communication with parties
   - Resolution tracking

4. **Analytics Dashboard**
   - Platform-wide metrics
   - User growth
   - Job and booking stats
   - Revenue metrics
   - Popular searches/skills

5. **System Configuration**
   - Platform settings
   - Fee configuration
   - Feature flags
   - Email templates
   - Notification settings

6. **Reports & Logs**
   - User reports
   - System logs
   - Error tracking
   - Audit trail

## Dependencies
- Authentication system (already exists)
- All core features (to manage)
- Analytics system (for dashboard)
- Logging system

## Implementation Steps
1. Create admin user system
2. Build admin authentication/authorization
3. Create admin dashboard layout
4. Build user management interface
5. Create content moderation tools
6. Build dispute resolution interface
7. Create analytics dashboard
8. Add system configuration UI
9. Implement audit logging
10. Add admin notifications
11. Test all admin functions

## Notes
- Should have role-based access control (RBAC)
- All admin actions should be logged
- Consider using a framework like Retool for quick admin panels
- Should have approval workflows for sensitive actions
- May want to add automated moderation (AI-based)
- Should respect user privacy while moderating

