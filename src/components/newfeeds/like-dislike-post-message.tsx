'use client';

import PostMessage, { PostMessageProps } from '@/app/[locale]/chat/onboarding/_components/post-message';
import { InteractionMode, type User } from '@/contents/en';

export interface LikeDislikePostMessageProps extends Omit<PostMessageProps, 'likeDisabled' | 'dislikeDisabled' | 'commentDisabled' | 'shareDisabled' | 'onLike' | 'onDislike' | 'interactionMode' | 'selectedAction'> {
  postId: string;
  answer: 'like' | 'dislike' | null | undefined;
  correctAnswer: 'like' | 'dislike';
  user: User;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  isDisabled?: boolean;
}

const colors = {
  correctClass: "fill-(--color-dunder-green)",
  incorrectClass: "fill-(--color-dunder-red)",
}

export default function LikeDislikePostMessage({
  postId,
  user,
  onLike,
  onDislike,
  answer,
  correctAnswer,
  mediaUrl,
  mediaType,
  content,
  isDisabled,
  ...postMessageProps
}: LikeDislikePostMessageProps) {
  // Use answer from props (passed from parent)
  const currentAnswer = answer ?? null;
  const hasAnswered = currentAnswer !== null && currentAnswer !== undefined;
  const isCorrect = currentAnswer === correctAnswer;

  const handleLike = () => {
    if (!hasAnswered && !isDisabled) {
      onLike?.(postId);
    }
  };

  const handleDislike = () => {
    if (!hasAnswered && !isDisabled) {
      onDislike?.(postId);
    }
  };

  // Apply background fill only to the button that was clicked
  const likeClassName = hasAnswered && currentAnswer === 'like'
    ? (isCorrect ? colors.correctClass : colors.incorrectClass)
    : '';
  const dislikeClassName = hasAnswered && currentAnswer === 'dislike'
    ? (isCorrect ? colors.correctClass : colors.incorrectClass)
    : '';

  return (
    <PostMessage
      {...postMessageProps}
      user={user}
      content={content}
      onLike={onLike ? handleLike : undefined}
      onDislike={onDislike ? handleDislike : undefined}
      isDisabled={isDisabled}
      likeClassName={likeClassName}
      dislikeClassName={dislikeClassName}
      likeDisabled={hasAnswered || isDisabled}
      dislikeDisabled={hasAnswered || isDisabled}
      mediaUrl={mediaUrl}
      mediaType={mediaType}
      interactionMode={InteractionMode.LikeReport}
      selectedAction={currentAnswer}
    />
  );
}
