'use client';

import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface QuickReplyButtonsProps {
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

export function QuickReplyButtons({ onConfirm, onEdit, isLoading }: QuickReplyButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6 pb-4 max-w-2xl mx-auto">
      <Button
        onClick={onEdit}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="flex-1 rounded-full bg-primary-foreground border-2 border-primary text-secondary-foreground hover:bg-secondary-foreground hover:border-primary h-12 font-medium transition-all duration-300"
      >
        No, I want to change something
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isLoading}
        size="lg"
        className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Yes, looks good'
        )}
      </Button>
    </div>
  );
}


