'use client';

import { useEffect, useRef, useState } from 'react';
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
import { createGameStore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';

interface StoredOnboardingState {
  context: OnboardingContext | undefined;
  state: string | undefined;
}

const VALID_ONBOARDING_STATES = ['initial', 'step2', 'step3', 'practice', 'completed'];

export default function OnboardingFlow() {
  const locale = useLocale();
  const t = useTranslations('chat.onboarding');
  const storage = getStorage<StoredOnboardingState>(STORAGE_KEYS.CHAT_ONBOARDING_STATE);
  const persisted = storage.getItem({
    context: initialContextValue,
    state: 'initial',
  });
  // Guard against stale persisted state referencing a state that no longer exists in the
  // machine (e.g. the removed `example` state) — fall back to a fresh initial state instead
  // of crashing when the machine library looks up an unknown state name.
  const isPersistedStateValid = VALID_ONBOARDING_STATES.includes(persisted.state ?? '');
  const context = isPersistedStateValid ? persisted.context : initialContextValue;
  const initialState = isPersistedStateValid ? persisted.state : 'initial';
  const [state, send, { currentOptions, isCompleted }] = useOnboardingMachine(
    context,
    initialState
  );
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const post = POSTS[locale];

  const { content, contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const practiceItem = contentList[0];
  const practiceCoachingKey =
    practiceItem.type === ContentType.MCQ
      ? 'practice.mcq'
      : practiceItem.type === ContentType.SHARE
        ? 'practice.share'
        : 'practice.likeDislike';

  // Same createGameStore/useCredibilityStore machinery home-content.tsx uses, persisted to
  // the same localStorage key — the real feed picks up this answer automatically.
  const [usePracticeGameStore] = useState(() => createGameStore({
    answers: {},
    currentQuestionIndex: 0,
    questions: contentList.map((item) => item.id),
    questionStore: content,
    gameCompleted: false,
    correctAnswers: 0,
  }));
  const {
    getAnswer: getPracticeAnswer,
    setAnswer: setPracticeAnswer,
    isAnswered: isPracticeAnswered,
    moveToNextQuestion: movePracticeToNextQuestion,
    incrCorrectAnswers: incrPracticeCorrectAnswers,
  } = usePracticeGameStore();
  const { increaseCredibility, decreaseCredibility, addPoints, initCredibility } = useCredibilityStore();

  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const practiceAnswer = getPracticeAnswer(practiceItem.id);
  const practiceAlreadyAnswered = isPracticeAnswered(practiceItem.id);
  const isPracticeState = state.value === 'practice';

  useEffect(() => {
    if (isCompleted) {
      storage.removeItem();
    } else {
      storage.setItem({
        context: state.context,
        state: state.value,
      });
    }
  }, [storage, state, isCompleted]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.context.messages]);

  const handleOptionClick = (optionId: string, translationKey: string) => {
    send({
      type: optionId,
      optionText: translationKey,
    } as OnboardingOptionEvent);
  };

  // Move navigation and localStorage set to useEffect
  useEffect(() => {
    if (isCompleted) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      router.replace('/');
    }
  }, [isCompleted, router]);

  // Resume mid-practice after a reload where the question was already answered: skip
  // straight to completion instead of re-showing (and re-scoring) it.
  useEffect(() => {
    if (!isPracticeState || state.context.typing) return;
    initCredibility(contentList.length);
    if (practiceAlreadyAnswered && !showPracticeModal) {
      movePracticeToNextQuestion();
      send({ type: 'PRACTICE_ANSWERED' });
    }
  }, [isPracticeState, state.context.typing, practiceAlreadyAnswered, showPracticeModal, contentList.length, initCredibility, movePracticeToNextQuestion, send]);

  const handlePracticeAnswer = (postId: string, answer: string) => {
    if (isPracticeAnswered(postId)) return;
    setPracticeAnswer(postId, answer);

    const isCorrect = practiceItem.type === ContentType.MCQ
      ? answer === (practiceItem as MCQContent).correctOptionId
      : answer === (practiceItem as LikeDislikeContent).correctAnswer;

    if (isCorrect) {
      increaseCredibility();
      addPoints(5);
      incrPracticeCorrectAnswers();
    } else {
      decreaseCredibility();
    }

    setShowPracticeModal(true);
  };

  const handlePracticeModalDone = () => {
    setShowPracticeModal(false);
    movePracticeToNextQuestion();
    send({ type: 'PRACTICE_ANSWERED' });
  };

  if (isCompleted) {
    return null;
  }

  return (
    <div className="flex h-full flex-col w-full">
      {/* Messages Container */}
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

        {/* Interactive practice question: the real first game question, answerable in chat */}
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
              answer={practiceAnswer}
              onAnswer={handlePracticeAnswer}
            />
          ) : (
            <LikeDislikePostMessage
              postId={practiceItem.id}
              user={(practiceItem as LikeDislikeContent).post.user}
              content={(practiceItem as LikeDislikeContent).post.content}
              mediaUrl={(practiceItem as LikeDislikeContent).post.mediaUrl}
              mediaType={(practiceItem as LikeDislikeContent).post.mediaType}
              answer={practiceAnswer as 'like' | 'dislike' | null | undefined}
              correctAnswer={(practiceItem as LikeDislikeContent).correctAnswer}
              onLike={(postId) => handlePracticeAnswer(postId, 'like')}
              onDislike={(postId) => handlePracticeAnswer(postId, 'dislike')}
            />
          )
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Options Container */}
      {!state.context.typing && currentOptions.length > 0 && (
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
          </div>
        </div>
      )}

      {/* Practice question feedback modal — same component the real feed uses */}
      {showPracticeModal && (() => {
        const isCorrect = practiceItem.type === ContentType.MCQ
          ? practiceAnswer === (practiceItem as MCQContent).correctOptionId
          : practiceAnswer === (practiceItem as LikeDislikeContent).correctAnswer;
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
