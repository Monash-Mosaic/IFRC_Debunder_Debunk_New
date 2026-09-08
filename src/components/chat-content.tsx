'use client';

import Illustration from './icons/onboarding-illustration';
import Link from 'next/link';

interface ChatContentProps {
  startOnboardingText: string;
  skipText: string;
  onSkipClick?: () => void;
}

export default function ChatContent({ startOnboardingText, skipText, onSkipClick = () => {} }: ChatContentProps) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Illustration */}
        <div className="space-y-4 overflow-y-auto">
          <Illustration width={'100%'} />
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-4">
          {/* Primary Button - Start onboarding chat */}
          <Link
            href="/chat/onboarding"
            className="flex items-center justify-center rounded-3xl border-1 border-dashed border-[#011E41] bg-[#00FF9C] px-6 py-4 text-center font-bold text-semibold text-[#011E41] transition-all hover:bg-[#27d089]"
          >
            {startOnboardingText}
          </Link>

          {/* Secondary Button - Skip */}
          <Link
            href="#"
            className="rounded-3xl border-1 border-dashed border-[#011E41] bg-[#E4EAF3] px-6 py-4 text-center font-medium text-black transition-all hover:bg-[#E8E9ED]"
            onClick={onSkipClick}
          >
            {skipText}
          </Link>
        </div>
      </div>
    </div>
  );
}
