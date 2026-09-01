'use client';

import Image from 'next/image';
import { CircleAlert, ThumbsUp, ThumbsDown, MessageCircle, Send, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { User } from '@/contents/en';

export type PostInteractionMode = 'social' | 'like-report';

export interface PostMessageProps {
  user: User;
  content: React.ReactNode;
  isDisabled?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  className?: string;
  likeClassName?: string;
  dislikeClassName?: string;
  commentClassName?: string;
  shareClassName?: string;  
  likeDisabled?: boolean;
  dislikeDisabled?: boolean;
  commentDisabled?: boolean;
  shareDisabled?: boolean;
  onLike?: () => void;
  onDislike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  interactionMode?: PostInteractionMode;
}

export default function PostMessage({
  user,
  content,
  mediaUrl,
  isDisabled = false,
  mediaType = 'image',
  className = '',
  likeClassName = '',
  dislikeClassName = '',
  commentClassName = '',
  shareClassName = '',
  likeDisabled = false,
  dislikeDisabled = false,
  commentDisabled = false,
  shareDisabled = false,
  onLike,
  onDislike,
  onComment,
  onShare,
  interactionMode = 'social',
}: PostMessageProps) {
  const postActions = useTranslations('postActions');

  return (
    <article className={cn("w-full rounded-lg border border-[#E8E9ED] bg-white p-4 shadow-sm", isDisabled ? 'opacity-50 cursor-not-allowed' : '', className)}>
      {/* Header with avatar, name, handle, and dropdown */}
      <header className="mb-3 flex items-start gap-3">
        <div className="shrink-0 w-[40px] h-[40px] flex items-center justify-center" aria-hidden="true">
          {user.avatar}
        </div>
        <div className="flex flex-col items-start justify-between">
          {user.name && <h3 className="text-sm font-semibold text-[#0D1B3E]">{user.name}</h3>}
          {user.handle && <p className="text-xs text-[#6B7280]">{user.handle}</p>}
        </div>
      </header>

      {/* Post content */}
      <div className="mb-3">
        {content}

        {/* Media attachment */}
        {mediaUrl && (
          <div className="relative mb-3 w-full overflow-hidden rounded-lg bg-[#E8E9ED]">
            <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-200">
              {/* Placeholder for media - in real app this would be an Image or video component */}
              <div className="flex h-full items-center justify-center">
                {mediaType === 'video' && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-md">
                    <div className="ml-1 h-0 w-0 border-l-[12px] border-l-[#2FE89F] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent">
                      <Video size={20} strokeWidth={2} />
                    </div>
                  </div>
                )}
                {mediaType === 'image' && (
                  <Image
                    src={mediaUrl}
                    alt="Echo post"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interaction buttons */}
      {interactionMode === 'like-report' ? (
        <div className="grid grid-cols-2 gap-3 border-t border-[#E8E9ED] pt-3">
          <button
            onClick={onLike}
            disabled={likeDisabled}
            className={cn(
              'flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-(--color-ifrc-blue)/80 transition-colors',
              'hover:bg-[#E4EAF3] hover:text-(--color-ifrc-blue) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41] focus-visible:ring-offset-2',
              likeDisabled ? 'cursor-not-allowed opacity-50' : '',
            )}
            aria-label={postActions('like')}
            type="button"
          >
            <ThumbsUp className={likeClassName} size={22} strokeWidth={2} aria-hidden="true" />
            <span>{postActions('like')}</span>
          </button>
          <button
            disabled={dislikeDisabled}
            onClick={onDislike}
            className={cn(
              'flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-(--color-ifrc-blue)/80 transition-colors',
              'hover:bg-[#E4EAF3] hover:text-(--color-ifrc-blue) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41] focus-visible:ring-offset-2',
              dislikeDisabled ? 'cursor-not-allowed opacity-50' : '',
            )}
            aria-label={postActions('report')}
            type="button"
          >
            <CircleAlert className={dislikeClassName} size={22} strokeWidth={2} aria-hidden="true" />
            <span>{postActions('report')}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-[#E8E9ED] pt-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              disabled={likeDisabled}
              className={cn("flex items-center gap-1 text-(--color-ifrc-blue)/70 transition-colors hover:text-(--color-ifrc-blue)", likeDisabled ? 'opacity-50 cursor-not-allowed' : '')}
              aria-label="Like"
              type="button"
            >
              <ThumbsUp className={likeClassName} size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              disabled={dislikeDisabled}
              onClick={onDislike}
              className={cn("flex items-center gap-1 text-(--color-ifrc-blue)/70 transition-colors hover:text-(--color-ifrc-blue)", dislikeDisabled ? 'opacity-50 cursor-not-allowed' : '')}
              aria-label="Dislike"
              type="button"
            >
              <ThumbsDown className={dislikeClassName} size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              disabled={commentDisabled}
              onClick={onComment}
              className={cn("flex items-center gap-1 text-(--color-ifrc-blue)/70 transition-colors hover:text-(--color-ifrc-blue)", commentDisabled ? 'opacity-50 cursor-not-allowed' : '')}
              aria-label="Comment"
              type="button"
            >
              <MessageCircle className={commentClassName} size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              disabled={shareDisabled}
              onClick={onShare}
              className={cn("flex items-center gap-1 text-(--color-ifrc-blue)/70 transition-colors hover:text-(--color-ifrc-blue)", shareDisabled ? 'opacity-50 cursor-not-allowed' : '')}
              aria-label="Share"
              type="button"
            >
              <Send className={shareClassName} size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
