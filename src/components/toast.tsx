'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        // Keep mobile feed traversal visible while a boundary notification is open.
        'max-md:bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] max-md:mx-0 max-md:w-[calc(100%-2rem)]',
        'bg-white border-2 border-[#011E41] px-4 py-3 rounded-xl shadow-2xl',
        'flex items-center gap-3',
        'transition-all duration-300 ease-in-out',
        'max-w-sm w-full mx-4',
        'opacity-100 translate-y-0',
        'hover:shadow-[#2FE89F]/20'
      )}
      role="alert"
      aria-live="polite"
    >
      <p className="text-sm text-[#011E41] font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className={cn(
          'shrink-0 p-1 rounded-full',
          'text-[#6B7280] hover:text-[#011E41]',
          'hover:bg-[#E8E9ED] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#011E41] focus:ring-offset-2'
        )}
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
