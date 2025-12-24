'use client';

import { cn } from '@/lib/utils';
// import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 group items-center',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-transparent flex items-center justify-center">
          <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" />
        </div>
      )} */}

      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] transition-all duration-300',
          isUser
            ? 'bg-primary text-secondary-foreground py-2 px-4 rounded-xl'
            : 'bg-primary-foreground text-secondary-foreground rounded-xl border-2 border-secondary hover:border-primary px-4 py-2'
        )}
      >
        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-0 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-heading font-semibold">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="ml-2">{children}</li>,
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1.5 bg-primary rounded-sm animate-pulse" />
          )}
        </div>
      </div>

      {/* {isUser && (
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-transparent flex items-center justify-center">
          <HugeiconsIcon icon={User02Icon} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      )} */}
    </div>
  );
}


