# Phase 3 Testing Guide - Chat Interface

## Prerequisites

Before testing, ensure:
- [ ] Development server is running (`npm run dev`)
- [ ] You have a user account (sign up if needed)
- [ ] Your user has `role = 'client'` in the `profiles` table
- [ ] Environment variables are set:
  - `OPENAI_API_KEY` is configured
  - `NEXT_PUBLIC_SUPABASE_URL` is set
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - `SUPABASE_SERVICE_ROLE_KEY` is set

---

## Test 1: Access Chat Interface

### Steps:
1. [ ] Navigate to homepage (`http://localhost:3000`)
2. [ ] If not logged in, click "Sign in" and log in
3. [ ] If logged in, you should be redirected to `/protected`
4. [ ] Click "I need help with something" button (or navigate to `/chat/job`)

### Expected Results:
- [ ] Chat interface loads
- [ ] Header shows "Talk to your helper"
- [ ] Initial greeting message appears: "Hi! What do you need help with?..."
- [ ] Input field is visible at the bottom
- [ ] Job Summary Panel is visible (on desktop, right side; on mobile, below chat)

---

## Test 2: Send First Message

### Steps:
1. [ ] Type a message in the input field (e.g., "I need help fixing my wardrobe door")
2. [ ] Press Enter or click "Send" button

### Expected Results:
- [ ] Your message appears in the chat (right-aligned, user styling)
- [ ] Input field clears
- [ ] Send button shows loading state ("Sending...")
- [ ] AI response starts streaming (left-aligned, assistant styling)
- [ ] Response appears word-by-word (streaming effect)
- [ ] After response completes, loading state disappears

### Check Browser Console:
- [ ] No JavaScript errors
- [ ] Network request to `/api/chat/job` returns 200 status
- [ ] Response is streaming (check Network tab → Response preview)

---

## Test 3: Conversation Flow

### Steps:
1. [ ] Send initial message: "I need help fixing my wardrobe door"
2. [ ] Wait for AI response
3. [ ] Respond to AI's questions (e.g., "The door fell off the hinges")
4. [ ] Continue conversation for 3-4 exchanges

### Expected Results:
- [ ] AI asks follow-up questions about the task
- [ ] Questions feel natural and conversational
- [ ] Each message streams in smoothly
- [ ] Conversation history is maintained
- [ ] Auto-scroll works (chat scrolls to latest message)

### Check AI Behavior:
- [ ] AI asks about task details (what exactly is wrong)
- [ ] AI asks about duration (how long it might take)
- [ ] AI asks about tools/requirements if relevant
- [ ] Questions are short and friendly (not overwhelming)

---

## Test 4: Job Summary Panel Updates

### Steps:
1. [ ] Start a conversation about a job
2. [ ] Provide information about:
   - Task description
   - Location (mention "Almere" and postcode)
   - Time preference (e.g., "this weekend", "Saturday afternoon")
   - Budget (e.g., "around €40")

### Expected Results:
- [ ] Job Summary Panel updates after each AI response
- [ ] Task appears in summary when mentioned
- [ ] Location appears when mentioned (city, postcode)
- [ ] Time window appears when mentioned
- [ ] Budget appears when mentioned
- [ ] Summary shows icons for each section

### Check Panel Content:
- [ ] Task section shows description
- [ ] Location section shows "Almere" + postcode
- [ ] Preferred Time section shows date/time
- [ ] Budget section shows amount

---

## Test 5: Streaming Response Format

### Steps:
1. [ ] Open browser DevTools → Network tab
2. [ ] Send a message
3. [ ] Check the response from `/api/chat/job`

### Expected Results:
- [ ] Response type is "text/event-stream" or "stream"
- [ ] Response streams in chunks (not all at once)
- [ ] Data format includes `0:` prefix for text deltas
- [ ] Each chunk contains `text-delta` updates

### Check Response Format:
- [ ] Response should look like: `0:{"type":"text-delta","textDelta":"Hello"}`
- [ ] Multiple chunks arrive over time
- [ ] Final chunk indicates completion

---

## Test 6: Job Data Extraction

### Steps:
1. [ ] Have a conversation that includes:
   - Task: "Fix wardrobe door"
   - Details: "Door fell off hinges, needs reattaching"
   - Location: "Almere Buiten, 1356AB"
   - Time: "Saturday afternoon"
   - Budget: "Around €40"
2. [ ] Wait for AI to respond after each piece of information
3. [ ] Check browser console for extraction API calls

### Expected Results:
- [ ] After each AI response, a request is made to `/api/chat/job/extract`
- [ ] Extraction API returns structured job data
- [ ] Job summary panel updates with extracted data
- [ ] Data is accurate (matches what you said)

### Check Network Tab:
- [ ] POST request to `/api/chat/job/extract` after each message
- [ ] Response contains `jobData` object
- [ ] `jobData` has structure:
  ```json
  {
    "description": "...",
    "location": { "city": "Almere", "postcode": "..." },
    "timeWindow": { "date": "...", "time": "..." },
    "budget": "..."
  }
  ```

---

## Test 7: Error Handling

### Test Network Error:
1. [ ] Open DevTools → Network tab
2. [ ] Block requests to `/api/chat/job` (right-click → Block request URL)
3. [ ] Try to send a message

### Expected Results:
- [ ] Error message appears in chat: "Sorry, I encountered an error. Please try again."
- [ ] Error is user-friendly (not technical)
- [ ] Chat interface remains functional
- [ ] You can try sending again

### Test Invalid Response:
1. [ ] Temporarily break the API route (comment out some code)
2. [ ] Send a message

### Expected Results:
- [ ] Error is caught gracefully
- [ ] User sees error message
- [ ] No app crash

---

## Test 8: Mobile Responsiveness

### Steps:
1. [ ] Open chat interface on mobile (or resize browser to mobile width)
2. [ ] Test sending messages
3. [ ] Check layout

### Expected Results:
- [ ] Chat interface is usable on mobile
- [ ] Job Summary Panel appears below chat (not on side)
- [ ] Input field is accessible
- [ ] Messages are readable
- [ ] Touch interactions work

---

## Test 9: Phase Detection

### Understanding Phase:
1. [ ] Start a new conversation
2. [ ] Send initial message about a task

### Expected Results:
- [ ] AI uses "understanding" phase prompt
- [ ] AI asks about task details
- [ ] Questions focus on understanding the job

### Logistics Phase:
1. [ ] After providing task details, mention location and time
2. [ ] Continue conversation

### Expected Results:
- [ ] AI transitions to "logistics" phase
- [ ] AI asks about location, date, time, budget
- [ ] Questions are logistics-focused

---

## Test 10: Multiple Conversations

### Steps:
1. [ ] Complete a conversation (provide all job details)
2. [ ] Refresh the page
3. [ ] Start a new conversation

### Expected Results:
- [ ] New conversation starts fresh (no previous messages)
- [ ] Job summary panel is empty initially
- [ ] Initial greeting appears again

---

## Common Issues & Solutions

### Issue: "Unauthorized" error
- **Check**: Are you logged in?
- **Check**: Does your user have a profile with `role = 'client'`?
- **Solution**: Log out and log back in, or create/update your profile

### Issue: No streaming response
- **Check**: Is `OPENAI_API_KEY` set correctly?
- **Check**: Do you have OpenAI API credits?
- **Check**: Browser console for API errors
- **Solution**: Verify environment variables

### Issue: Job summary not updating
- **Check**: Browser console for errors from `/api/chat/job/extract`
- **Check**: Network tab shows extraction requests
- **Solution**: Check extraction API route is working

### Issue: Messages not appearing
- **Check**: Browser console for JavaScript errors
- **Check**: Network requests are successful
- **Solution**: Refresh page and try again

### Issue: Streaming stops mid-response
- **Check**: Network connection is stable
- **Check**: OpenAI API is responding
- **Solution**: Check API rate limits or connection issues

---

## Success Criteria

Phase 3 is successful if:
- ✅ Chat interface loads and displays correctly
- ✅ Messages can be sent and received
- ✅ Streaming responses work smoothly
- ✅ Job summary panel updates in real-time
- ✅ Conversation feels natural and helpful
- ✅ Error handling works gracefully
- ✅ Mobile experience is functional

---

## Next Steps

Once Phase 3 testing passes:
1. Note any issues or improvements needed
2. Move to Phase 4: Understanding Phase refinement
3. Or continue with Phase 5: Logistics Phase

---

## Debugging Tips

### Check API Route:
```bash
# Test API route directly
curl -X POST http://localhost:3000/api/chat/job \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

### Check Extraction API:
```bash
curl -X POST http://localhost:3000/api/chat/job/extract \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"conversation":"User: test\nAssistant: response","currentJobData":{}}'
```

### Check Browser Console:
- Look for errors in Console tab
- Check Network tab for failed requests
- Verify response formats match expected structure

---

**Ready to test?** Start with Test 1 and work through each test systematically!


