# Messaging System

## Status
- [ ] Planned
- [ ] In Progress
- [ ] Blocked
- [ ] Completed

## Priority
**HIGH** - Phase 1 (MVP Completion)

## Description
Implement a direct messaging system that allows clients and freelancers to communicate with each other. This includes real-time chat, message history, and notifications for new messages.

## Why
Currently, clients and freelancers have no way to communicate directly. They can only send invites and create bookings, but cannot:
- Discuss job details before committing
- Negotiate pricing or terms
- Coordinate schedules
- Ask questions about skills or experience
- Build trust through conversation

This is critical for a marketplace platform where trust and communication are essential.

## Approach

### Database Schema
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(participant_1_profile_id, participant_2_profile_id, job_request_id)
);
```

### Features
1. **Conversation Management**
   - Auto-create conversation when client invites freelancer
   - Support multiple conversations per job
   - Conversation list with unread indicators

2. **Real-time Messaging**
   - Use Supabase Realtime for live message updates
   - Typing indicators
   - Message read receipts
   - Online/offline status

3. **UI Components**
   - Message thread view
   - Conversation list sidebar
   - Message input with file upload support
   - Mobile-responsive chat interface

4. **Notifications**
   - In-app notifications for new messages
   - Email notifications (if user opts in)
   - Push notifications (future)

## Dependencies
- Supabase Realtime setup
- Notification system (can be basic initially)
- Authentication and profile system (already exists)

## Implementation Steps
1. Create database schema (messages, conversations tables)
2. Set up RLS policies for message access
3. Create server actions for sending/receiving messages
4. Build conversation list component
5. Build message thread component
6. Integrate Supabase Realtime subscriptions
7. Add message notifications
8. Add mobile responsiveness

## Notes
- Consider using a third-party service like Pusher or Ably if Supabase Realtime has limitations
- May want to add message attachments (images, documents) in future
- Consider adding message search functionality
- Should integrate with booking flow (messages can reference bookings)

