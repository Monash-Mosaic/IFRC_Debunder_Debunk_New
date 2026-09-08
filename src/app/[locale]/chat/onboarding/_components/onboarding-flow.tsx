'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { initialContextValue, useOnboardingMachine } from '../_machines/onboarding-machine';
import UserTextMessage from './user-text-message';
import BotTextMessage from './bot-text-message';
import OptionButton from './option-button';
import type {
  Message,
  OnboardingOptionEvent,
  OnboardingContext,
} from '../_machines/onboarding-machine';
import PostMessage from './post-message';
import POSTS from '../_posts';
import { STORAGE_KEYS, getStorage, storage as localStorage } from '@/lib/local-storage';
import TypingMessage from './typing-message';
import { CHAT_USERS } from '../../_constants/users';
import { useRouter } from '@/i18n/routing';
import CONTENTS from '@/contents';
import { ContentType, LikeDislikeContent, MCQContent } from '@/contents/en';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import GameFeed from '@/components/game-feed';
import {
  pushOnboardingHistoryState,
  readOnboardingHistoryState,
  replaceOnboardingHistoryState,
  type OnboardingHistoryPhase,
} from '@/lib/onboarding-browser-state';
import { setGameNavigationBlocked } from '@/lib/game-navigation-block';

interface StoredOnboardingState {
  context: OnboardingContext | undefined;
  state: string | undefined;
}

const VALID_ONBOARDING_STATES = ['initial', 'step2', 'step3', 'practice', 'completed'];

function getInitialOnboardingState() {
  const historyState = readOnboardingHistoryState();
  const storage = getStorage<StoredOnboardingState>(STORAGE_KEYS.CHAT_ONBOARDING_STATE);
  const persisted = storage.getItem({
    context: initialContextValue,
    state: 'initial',
  });
  const isPersistedStateValid = VALID_ONBOARDING_STATES.includes(persisted.state ?? '');

  return {
    context: isPersistedStateValid ? persisted.context : initialContextValue,
    machineState: isPersistedStateValid ? persisted.state : 'initial',
    historyContext: historyState?.context,
  };
}

interface OnboardingChatProps {
  onEnterGame: (context: OnboardingContext) => void;
}

function OnboardingChat({ onEnterGame }: OnboardingChatProps) {
  const locale = useLocale();
  const t = useTranslations('chat.onboarding');
  const storage = getStorage<StoredOnboardingState>(STORAGE_KEYS.CHAT_ONBOARDING_STATE);
  const { context, machineState } = getInitialOnboardingState();
  const [state, send, { currentOptions, isCompleted }] = useOnboardingMachine(
    context,
    machineState
  );
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const post = POSTS[locale];

  const { contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const practiceItem = contentList[0];
  const practiceCoachingKey =
    practiceItem.type === ContentType.MCQ
      ? 'practice.mcq'
      : practiceItem.type === ContentType.SHARE
        ? 'practice.share'
        : 'practice.likeDislike';

  const [exampleAnswer, setExampleAnswer] = useState<string | null>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const isPracticeState = state.value === 'practice';
  const hasEnteredGameRef = useRef(false);

  useEffect(() => {
    if (isCompleted) {
      if (hasEnteredGameRef.current) return;

      hasEnteredGameRef.current = true;
      storage.removeItem();
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      onEnterGame(state.context);
      return;
    }

    storage.setItem({
      context: state.context,
      state: state.value,
    });
    replaceOnboardingHistoryState({
      phase: 'onboarding',
      machineState: state.value,
      context: state.context,
    });
  }, [storage, state, isCompleted, onEnterGame]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.context.messages]);

  const handleOptionClick = (optionId: string, translationKey: string) => {
    send({
      type: optionId,
      optionText: translationKey,
    } as OnboardingOptionEvent);
  };

  const handleReturnHome = () => {
    storage.removeItem();
    router.replace('/');
  };

  const handlePracticeAnswer = (_postId: string, answer: string) => {
    if (exampleAnswer) return;
    setExampleAnswer(answer);
    setShowPracticeModal(true);
  };

  const handlePracticeModalDone = () => {
    setShowPracticeModal(false);
    send({ type: 'PRACTICE_ANSWERED' });
  };

  const canReturnHome =
    !state.context.typing &&
    (state.value === 'step2' || state.value === 'step3' || state.value === 'practice');

  return (
    <div className="flex h-full flex-col w-full">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {state.context.messages.map((message: Message) => {
          const sender = CHAT_USERS[message.sender as keyof typeof CHAT_USERS];
          switch (message.type) {
            case 'text':
              return message.sender === 'user' ? (
                <UserTextMessage
                  key={message.id}
                  displayText={t(message.text)}
                />
              ) : (
                <BotTextMessage
                  key={message.id}
                  senderName={sender.name}
                  senderAvatar={sender.avatar}
                  displayText={t(
                    message.text === 'practice.explanation'
                      ? practiceCoachingKey
                      : message.text
                  )}
                />
              );
            case 'post':
              return (
                <PostMessage
                  key={message.id}
                  user={CHAT_USERS[message.sender as keyof typeof CHAT_USERS]}
                  content={post[message.post.contentKey as keyof typeof post] as React.ReactNode}
                  mediaUrl={message.post.mediaUrl}
                  mediaType={message.post.mediaType}
                />
              );
            case 'typing':
              return (
                <TypingMessage
                  key={message.id}
                  senderName={sender.name}
                  senderAvatar={sender.avatar}
                />
              );
            default:
              return null;
          }
        })}

        {isPracticeState && !state.context.typing && (
          practiceItem.type === ContentType.MCQ ? (
            <MCQPostMessage
              postId={practiceItem.id}
              user={(practiceItem as MCQContent).post.user}
              content={(practiceItem as MCQContent).post.content}
              mediaUrl={(practiceItem as MCQContent).post.mediaUrl}
              mediaType={(practiceItem as MCQContent).post.mediaType}
              options={(practiceItem as MCQContent).options}
              correctOptionId={(practiceItem as MCQContent).correctOptionId}
              answer={exampleAnswer}
              onAnswer={handlePracticeAnswer}
            />
          ) : (
            <LikeDislikePostMessage
              postId={practiceItem.id}
              user={(practiceItem as LikeDislikeContent).post.user}
              content={(practiceItem as LikeDislikeContent).post.content}
              mediaUrl={(practiceItem as LikeDislikeContent).post.mediaUrl}
              mediaType={(practiceItem as LikeDislikeContent).post.mediaType}
              answer={exampleAnswer as 'like' | 'dislike' | null | undefined}
              correctAnswer={(practiceItem as LikeDislikeContent).correctAnswer}
              onLike={(postId) => handlePracticeAnswer(postId, 'like')}
              onDislike={(postId) => handlePracticeAnswer(postId, 'dislike')}
            />
          )
        )}

        <div ref={messagesEndRef} />
      </div>

      {!state.context.typing && (currentOptions.length > 0 || canReturnHome) && (
        <div className="border-t border-[#E8E9ED] bg-white px-4 py-4 md:pb-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {currentOptions.map((option) => (
              <OptionButton
                key={option.id}
                id={option.id}
                displayText={t(option.translationKey)}
                onClick={() => handleOptionClick(option.id, option.translationKey)}
              />
            ))}
            {canReturnHome && (
              <OptionButton
                id="return-home"
                displayText={t('returnHome')}
                onClick={handleReturnHome}
              />
            )}
          </div>
        </div>
      )}

      {showPracticeModal && (() => {
        const isCorrect = practiceItem.type === ContentType.MCQ
          ? exampleAnswer === (practiceItem as MCQContent).correctOptionId
          : exampleAnswer === (practiceItem as LikeDislikeContent).correctAnswer;
        const reasonContent = isCorrect
          ? practiceItem.whyCorrectAnswer.content
          : practiceItem.whyIncorrectAnswer.content;
        const reasonHeader = isCorrect
          ? practiceItem.whyCorrectAnswer.title
          : practiceItem.whyIncorrectAnswer.title;

        return (
          <PrebunkingModal
            isOpen={true}
            onClose={handlePracticeModalDone}
            onContinue={handlePracticeModalDone}
            postId={practiceItem.id}
            content={reasonContent}
            header={reasonHeader}
            isCorrect={isCorrect}
          />
        );
      })()}
    </div>
  );
}

export default function OnboardingFlow() {
  const searchParams = useSearchParams();
  const shouldStartGame = searchParams.get('start') === 'game';
  const initialHistoryState = readOnboardingHistoryState();
  const [viewPhase, setViewPhase] = useState<OnboardingHistoryPhase>(
    shouldStartGame || initialHistoryState?.phase === 'game' ? 'game' : 'onboarding'
  );
  const [chatKey, setChatKey] = useState(0);
  const hasInitializedGameStartRef = useRef(false);

  const handleEnterGame = useCallback((context: OnboardingContext) => {
    pushOnboardingHistoryState({
      phase: 'game',
      machineState: 'completed',
      context,
    });
    setViewPhase('game');
  }, []);

  useEffect(() => {
    if (!shouldStartGame || hasInitializedGameStartRef.current) return;

    hasInitializedGameStartRef.current = true;
    pushOnboardingHistoryState({
      phase: 'game',
      machineState: 'completed',
    });
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    setViewPhase('game');
  }, [shouldStartGame]);

  useEffect(() => {
    setGameNavigationBlocked(viewPhase === 'game');
    return () => setGameNavigationBlocked(false);
  }, [viewPhase]);

  useEffect(() => {
    const handlePopState = () => {
      const nextHistoryState = readOnboardingHistoryState();
      const nextPhase = nextHistoryState?.phase === 'game' ? 'game' : 'onboarding';
      setViewPhase(nextPhase);
      if (nextPhase === 'onboarding') {
        setChatKey((current) => current + 1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (viewPhase === 'game') {
    return <GameFeed />;
  }

  return <OnboardingChat key={chatKey} onEnterGame={handleEnterGame} />;
}
