'use client';

import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { JobSummaryPanel, JobSummaryData } from './JobSummaryPanel';
import { QuickReplyButtons } from './QuickReplyButtons';
import { MatchResults } from './MatchResults';
import { Loader } from 'lucide-react';
import { createJobRequest } from '@/app/actions/job';
import { findMatchesForJobRequest } from '@/app/actions/matching';
import type { MatchResult } from '@/app/actions/matching';

import { ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";





interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  showQuickReplies?: boolean;
}

interface JobCreationChatProps {
  clientProfileId: string;
}

export function JobCreationChat({ clientProfileId }: JobCreationChatProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });
  const [jobSummary, setJobSummary] = useState<JobSummaryData>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! What do you need help with?\n\nYou can write something like: 'fix my wardrobe door', 'help moving boxes', '2 hours of babysitting', etc.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [invitedFreelancerIds, setInvitedFreelancerIds] = useState<Set<string>>(new Set());
  const [isWelcomeScreenVisible, setIsWelcomeScreenVisible] = useState(true);
  const [isWelcomeScreenAnimatingOut, setIsWelcomeScreenAnimatingOut] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input, value]);

  // Fetch random freelancers on mount
  useEffect(() => {
    const fetchRandomFreelancers = async () => {
      try {
        // const freelancers = await getRandomFreelancers(3);
        // setRandomFreelancers(freelancers);
      } catch (error) {
        console.error('Failed to fetch random freelancers:', error);
      }
    };
    fetchRandomFreelancers();
  }, []);

  // Handle welcome screen fade out animation
  useEffect(() => {
    const shouldShowWelcome = messages.length === 1 && messages[0].role === 'assistant';
    
    if (!shouldShowWelcome && isWelcomeScreenVisible) {
      // Start fade out animation
      setIsWelcomeScreenAnimatingOut(true);
      // Hide after animation completes (400ms)
      const timer = setTimeout(() => {
        setIsWelcomeScreenVisible(false);
        setIsWelcomeScreenAnimatingOut(false);
      }, 400);
      return () => clearTimeout(timer);
    } else if (shouldShowWelcome && !isWelcomeScreenVisible) {
      // Reset if welcome screen should be shown again
      setIsWelcomeScreenVisible(true);
      setIsWelcomeScreenAnimatingOut(false);
    }
  }, [messages, isWelcomeScreenVisible]);

  // Extract job data from conversation
  const extractJobData = async () => {
    try {
      // Build conversation history
      const conversationText = messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Call extraction endpoint
      const response = await fetch('/api/chat/job/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: conversationText,
          currentJobData: jobSummary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.jobData) {
          setJobSummary(data.jobData);
        }
      }
    } catch (error) {
      console.error('Failed to extract job data:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = input.trim() || value.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setValue(''); // Clear the value state too
    adjustHeight(true); // Reset textarea height
    setIsLoading(true);

    try {
      // Call our streaming API
      const response = await fetch('/api/chat/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          jobData: jobSummary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // Handle plain text stream from toTextStreamResponse()
          // Each chunk contains text that we append directly
          if (chunk) {
            assistantContent += chunk;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: assistantContent,
              };
              return updated;
            });
          }
        }
      }

      // After streaming completes, extract job data
      await extractJobData();

      // Check if the last message is asking for confirmation
      const lastMessage = assistantContent.toLowerCase();
      const isConfirmationRequest = 
        lastMessage.includes('is this correct') ||
        lastMessage.includes('does this look good') ||
        lastMessage.includes('confirm') ||
        lastMessage.includes('everything correct');

      if (isConfirmationRequest) {
        // Mark the last message to show quick reply buttons
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            showQuickReplies: true,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmJob = async () => {
    if (!jobSummary.description) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I need at least a description of what you need help with. Please provide more details.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setIsCreatingJob(true);

    // Add user confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Yes, looks good',
    };
    setMessages((prev) => [...prev, confirmMessage]);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Great! I\'ll look for the best people for this now...',
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Create the job request
      const job = await createJobRequest({
        clientProfileId,
        description: jobSummary.description || '',
        location: jobSummary.location || { city: 'Almere' },
        timeWindow: jobSummary.timeWindow || {},
        budget: jobSummary.budget,
      });

      setJobId(job.id);

      // Find matches
      const jobMatches = await findMatchesForJobRequest(job.id);

      // Update loading message with results
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (jobMatches.length > 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: `I found ${jobMatches.length} ${jobMatches.length === 1 ? 'person' : 'people'} who fit what you described. You can tap 'Request this person' on anyone you like, or open their profile to see more.`,
          };
        } else {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: 'I couldn\'t find any matches right now. Try adjusting your job description or check back later.',
          };
        }
        return updated;
      });

      setMatches(jobMatches);
    } catch (error) {
      console.error('Job creation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error creating your job. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleEditJob = () => {
    // Add user message
    const editMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'No, I want to change something',
    };
    setMessages((prev) => [...prev, editMessage]);

    // Remove quick reply buttons from previous message
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (updated[lastIndex]?.showQuickReplies) {
        updated[lastIndex] = {
          ...updated[lastIndex],
          showQuickReplies: false,
        };
      }
      return updated;
    });

    // AI will respond in next message
    setInput('What would you like to change?');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Submit the form - handleFormSubmit will read from value state
      if (value.trim() && !isLoading) {
        const form = e.currentTarget.closest('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
          handleFormSubmit(submitEvent);
        }
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden overscroll-none" style={{ overscrollBehavior: 'none' }}>
      {/* Main Content Area - Centered Chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area - Centered */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="min-h-full flex flex-col">
              {/* Welcome message or empty state */}

              
                {isWelcomeScreenVisible && (
                <div 
                  className={`py-12 md:py-16 lg:py-20 ${isWelcomeScreenAnimatingOut ? 'fade-out-up' : ''}`}
                  style={{ minHeight: 'calc(100vh - 96px)' }}
                >
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                      {/* <p className="text-primary text-xs sm:text-sm font-heading font-semibold uppercase tracking-wider mb-4">AI-POWERED MATCHING</p> */}
                      <h1 className="text-3xl font-heading font-bold text-secondary-foreground leading-tight mb-6">
                        Tell us what you need, <span className="font-serif italic text-primary bg-secondary-foreground rounded-lg text-transparent p-0">we&apos;ll find</span> the perfect pro.
                      </h1>
                      <p className="text-base sm:text-lg text-secondary-foreground max-w-lg mx-auto">
                        Describe your project and our AI will instantly match you with verified, skilled freelancers ready to help.
                      </p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                      <form onSubmit={handleFormSubmit} className="relative">
                        <div className="relative">
                          <div className="bg-background rounded-2xl border border-secondary-foreground transition-all duration-300 shadow-xl p-0">
                            <div className="bg-secondary-foreground rounded-t-2xl flex items-center gap-3 px-4 py-3 border-b border-secondary/20">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-secondary-foreground" />
                              </div>
                              <span className="text-sm font-medium text-secondary">AI Assistant</span>
                            </div>
                            <div className="p-4">
                              <Textarea
                                className={cn(
                                  "w-full resize-none rounded-xl border-2 border-secondary bg-primary-foreground px-4 py-4 placeholder:text-secondary-foreground text-secondary-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary transition-all duration-300",
                                  "min-h-[100px]"
                                )}
                                style={{
                                  fontSize: '20px',
                                  lineHeight: '1.5',
                                }}
                                onChange={(e) => {
                                  setValue(e.target.value);
                                  setInput(e.target.value);
                                  adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="What can I help you with? For example: 'I need help assembling IKEA furniture this weekend' or 'Looking for a plumber to fix a leak'"
                                ref={textareaRef}
                                value={value}
                              />
                              <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-secondary-foreground/50">
                                  Press Enter to send, Shift+Enter for new line
                                </p>
                                <button
                                  aria-label="Send message"
                                  className={cn(
                                    "rounded-full bg-primary text-secondary-foreground p-3 shadow-lg hover:shadow-xl transition-all duration-300",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    value.trim() && !isLoading ? "hover:scale-105" : ""
                                  )}
                                  disabled={!value.trim() || isLoading}
                                  type="submit"
                                >
                                  {isLoading ? (
                                    <Loader className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <ArrowRight className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}


              {/* Messages */}
              {!isWelcomeScreenVisible && (
                <div className="flex-1 py-6 fade-in-from-bottom">
                  {(!jobId || matches.length === 0) &&(
                      messages.map((message, index) => (
                        <div key={message.id}>
                          <ChatMessage
                            role={message.role}
                            content={message.content}
                            isStreaming={index === messages.length - 1 && isLoading && message.role === 'assistant'}
                          />
                          {message.showQuickReplies && (
                            <div className="px-6 pb-4 mt-4">
                              <QuickReplyButtons
                                onConfirm={handleConfirmJob}
                                onEdit={handleEditJob}
                                isLoading={isCreatingJob}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}

                  {/* Show matches if job is created */}
                  {jobId && matches.length > 0 && (
                    <div className="mt-6 px-6">
                      <MatchResults
                        matches={matches}
                        jobRequestId={jobId}
                        invitedFreelancerIds={invitedFreelancerIds}
                        onInviteSent={(freelancerProfileId) => {
                          setInvitedFreelancerIds((prev) => new Set([...prev, freelancerProfileId]));
                          // Add a confirmation message
                          const confirmMessage: Message = {
                            id: Date.now().toString(),
                            role: 'assistant',
                            content: `I've sent your request to the freelancer. You'll get a confirmation once they accept.`,
                          };
                          setMessages((prev) => [...prev, confirmMessage]);
                        }}
                      />
                    </div>
                  )}

                  {jobId && matches.length === 0 && (
                    <div className="mt-6 px-4 sm:px-6">
                      <div className="bg-primary-foreground p-6 sm:p-8 rounded-2xl text-center border-2 border-secondary/50 max-w-2xl mx-auto">
                        <p className="text-sm sm:text-base text-secondary-foreground/70">
                          No matches found at this time. Try adjusting your job description or check back later.
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area - Modern Design */}
          {(!jobId || matches.length === 0) && !isWelcomeScreenVisible && (
            <div className="bg-secondary/95 backdrop-blur-sm border-t border-primary fade-in-from-bottom">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <form onSubmit={handleFormSubmit} className="relative">
                  <div className="relative flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setValue(e.target.value);
                          adjustHeight();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                          }
                        }}
                        placeholder="Continue the conversation..."
                        disabled={isLoading || isCreatingJob}
                        rows={1}
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-14 rounded-2xl border-2 border-primary bg-primary-foreground text-secondary-foreground placeholder:text-secondary-foreground/50 focus:outline-none focus:ring-0 focus:border-primary disabled:opacity-50 resize-none max-h-32 overflow-y-auto transition-all duration-300 text-2xl"
                        style={{
                          minHeight: '56px',
                        }}
                      />
                      <div className="absolute right-3 sm:right-4 bottom-3.5 sm:bottom-4">
                        {isLoading || isCreatingJob ? (
                          <Loader className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <button
                            type="submit"
                            disabled={!input.trim() || isLoading || isCreatingJob}
                            className="w-10 h-10 rounded-full bg-primary text-secondary-foreground flex items-center justify-center hover:bg-primary/90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isCreatingJob && (
                    <div className="mt-3 text-xs sm:text-sm text-secondary-foreground/60 text-center">
                      Creating your job request...
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Job Summary Panel - Desktop: Right side */}
        {!isWelcomeScreenVisible && (
          <div className="hidden lg:block bg-secondary p-6 overflow-y-auto fade-in-from-bottom border-l border-primary" style={{ width: '30rem' }}>
            <JobSummaryPanel jobData={jobSummary} />
          </div>
        )}
      </div>
    </div>
  );
}

