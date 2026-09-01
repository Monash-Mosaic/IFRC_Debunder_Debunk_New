'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MCQOption, User } from '@/contents/en';

export interface MCQPostMessageProps {
  postId: string;
  user: User;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  options: MCQOption[];
  correctOptionId: string;
  answer: string | null | undefined;
  isDisabled?: boolean;
  onAnswer: (postId: string, optionId: string) => void;
}

export default function MCQPostMessage({
  postId,
  user,
  content,
  mediaUrl,
  mediaType,
  options,
  correctOptionId,
  answer,
  isDisabled = false,
  onAnswer,
}: MCQPostMessageProps) {
  const hasAnswered = answer != null;
  const isCorrect = hasAnswered && answer === correctOptionId;

  const getOptionClass = (optionId: string) => {
    if (!hasAnswered) {
      return 'bg-white border-[#011E41] text-[#011E41] hover:bg-[#E4EAF3] cursor-pointer';
    }
    const isSelected = answer === optionId;
    const isThisCorrect = optionId === correctOptionId;

    if (isSelected && isCorrect) {
      return 'bg-[#00FF9C] border-[#011E41] text-[#011E41] cursor-not-allowed';
    }
    if (isSelected && !isCorrect) {
      return 'bg-[#FF1E56] border-[#FF1E56] text-white cursor-not-allowed';
    }
    if (isThisCorrect) {
      return 'bg-[#00FF9C] border-[#011E41] text-[#011E41] cursor-not-allowed';
    }
    return 'bg-white border-[#E4EAF3] text-[#6B7280] cursor-not-allowed';
  };

  return (
    <article
      className={cn(
        'w-full rounded-lg border border-[#E8E9ED] bg-white p-4 shadow-sm',
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      )}
    >
      {/* Header */}
      <header className="mb-3 flex items-start gap-3">
        <div className="shrink-0 w-[40px] h-[40px] flex items-center justify-center" aria-hidden="true">
          {user.avatar}
        </div>
        <div className="flex flex-col items-start justify-between">
          {user.name && <h3 className="text-sm font-semibold text-[#0D1B3E]">{user.name}</h3>}
          {user.handle && <p className="text-xs text-[#6B7280]">{user.handle}</p>}
        </div>
      </header>

      {/* Question content */}
      <div className="mb-4 text-sm text-[#0D1B3E]">
        {content}
      </div>

      {/* Media attachment */}
      {mediaUrl && mediaType === 'image' && (
        <div className="relative mb-4 w-full overflow-hidden rounded-lg bg-[#E8E9ED]">
          <div className="aspect-video w-full">
            <Image
              src={mediaUrl}
              alt="Question post"
              width={500}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Answer options */}
      <div className="space-y-2 mb-4">
        {options.map((option) => (
          <button
            key={option.id}
            disabled={hasAnswered || isDisabled}
            onClick={() => onAnswer(postId, option.id)}
            className={cn(
              'w-full text-left rounded-lg px-4 py-3 text-sm font-medium border transition-colors',
              getOptionClass(option.id)
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

    </article>
  );
}
