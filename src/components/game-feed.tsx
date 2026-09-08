'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import CONTENTS from '@/contents';
import { Content, ContentType, LikeDislikeContent, MCQContent } from '@/contents/en';
import { createGameStore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import GameComplete from '@/components/game-complete';
import Modal from 'react-modal';
import type { EmblaCarouselType } from 'embla-carousel';
import { ChevronDown, ChevronUp } from 'lucide-react';
import VerticalCarousel from '@/components/vertical-carousel';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';
import { cn } from '@/lib/utils';
import Toast from '@/components/toast';

interface GameFeedProps {
  onRestartSimulation?: () => void;
}

export default function GameFeed({ onRestartSimulation }: GameFeedProps) {
  const locale = useLocale();
  const { content, contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [useGameStore] = useState(() => createGameStore({
    answers: {},
    currentQuestionIndex: 0,
    questions: contentList.map(item => item.id),
    questionStore: content,
    gameCompleted: false,
    correctAnswers: 0
  }));

  const {
    getAnswer,
    moveToNextQuestion,
    setAnswer,
    isAnswered,
    isPostDisabled,
    isGameCompleted,
    getCorrectAnswers,
    incrCorrectAnswers,
    getNumQuestions,
    resetGame
  } = useGameStore();
  const { addPoints, increaseCredibility, decreaseCredibility, initCredibility, resetCredibility } = useCredibilityStore();

  useEffect(() => {
    initCredibility(contentList.length);
  }, [contentList.length, initCredibility]);

  const handleEmblaApi = useCallback((api: EmblaCarouselType | null) => {
    setEmblaApi(api);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const selectedPostId = contentList[selectedIndex]?.id;
  const hasEngagedCurrent = selectedPostId ? isAnswered(selectedPostId) : false;
  const canGoNext = !!emblaApi?.canScrollNext();
  const canGoPrev = !!emblaApi?.canScrollPrev();
  const nextEnabled = hasEngagedCurrent && canGoNext;
  const prevEnabled = canGoPrev;

  const handleOnCloseModal = () => {
    setModalPostId(null);
  };

  const handleOnContinueModal = (postId: string) => {
    if (isAnswered(postId)) {
      moveToNextQuestion();
      emblaApi?.scrollNext();
    }
  };

  const handleOnAnswer = (postId: string, answer: string) => {
    if (!isAnswered(postId) && !isPostDisabled(postId)) {
      setAnswer(postId, answer);

      const contentItem = contentList.find(item => item.id === postId) as Content | undefined;
      if (!contentItem) return;

      const isCorrect = contentItem.type === ContentType.MCQ
        ? answer === (contentItem as MCQContent).correctOptionId
        : answer === (contentItem as LikeDislikeContent).correctAnswer;

      if (isCorrect) {
        increaseCredibility();
        addPoints(5);
        incrCorrectAnswers();
      } else {
        decreaseCredibility();
      }

      setModalPostId(postId);
    }
  };

  const handleRestartSimulation = () => {
    resetGame();
    resetCredibility(contentList.length);
    onRestartSimulation?.();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rootElement = document.getElementById('root') || document.body;
      Modal.setAppElement(rootElement);
    }
  }, []);

  const handleNext = () => {
    if (!emblaApi) return;

    const isLastPost = selectedIndex === contentList.length - 1;
    if (isLastPost || !canGoNext) {
      setToastMessage('You\'re already on the last post');
      setShowToast(true);
      return;
    }

    if (!nextEnabled) {
      setToastMessage('Please engage with this post before moving to the next one');
      setShowToast(true);
      return;
    }

    emblaApi.scrollNext();
  };

  const handlePrevious = () => {
    if (!emblaApi) return;

    const isFirstPost = selectedIndex === 0;
    if (isFirstPost || !canGoPrev) {
      setToastMessage('You\'re already on the first post');
      setShowToast(true);
      return;
    }

    emblaApi.scrollPrev();
  };

  if (isGameCompleted()) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] flex-col py-4 items-center justify-center">
        <GameComplete
          correctAnswers={getCorrectAnswers()}
          totalQuestions={getNumQuestions()}
          restartGame={handleRestartSimulation}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-md flex-col overflow-hidden overscroll-y-contain md:max-w-none md:overflow-visible md:px-4',
        'max-md:h-[calc(100dvh-10rem-env(safe-area-inset-bottom,0px))] max-md:min-h-0 max-md:touch-pan-y',
        'md:h-screen',
      )}
    >
      <div
        className={cn(
          'relative mx-auto flex w-full max-w-md flex-col overflow-visible md:px-1',
          'h-full min-h-0 max-md:justify-start max-md:items-stretch',
          'md:h-screen md:items-center md:justify-center',
        )}
      >
        <div
          className={cn(
            'flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:items-center md:justify-center md:gap-4 md:pr-1',
            'max-md:items-stretch',
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch justify-stretch max-md:h-full md:h-[70vh] md:items-center md:justify-center">
            <VerticalCarousel
              options={{
                axis: 'y',
                dragFree: false,
                skipSnaps: false,
                align: 'start',
                slidesToScroll: 1,
                containScroll: 'trimSnaps',
                watchDrag: true,
              }}
              lockNext={!hasEngagedCurrent && canGoNext}
              onApi={handleEmblaApi}
            >
              {(api) => {
                return contentList.map((contentItem, index) => {
                  const isActive = api?.selectedScrollSnap() === index;
                  const answer = getAnswer(contentItem.id);
                  const isDisabled = isPostDisabled(contentItem.id);

                  return (
                    <div
                      className={cn(
                        'w-full shrink-0 transform-gpu',
                        isActive ? 'opacity-100' : 'opacity-70',
                      )}
                      style={{
                        height: '100%',
                        minHeight: '100%',
                      }}
                      key={contentItem.id}
                    >
                      <div className="flex h-full items-center justify-center overflow-y-auto">
                        {contentItem.type === ContentType.MCQ ? (
                          <MCQPostMessage
                            postId={contentItem.id}
                            user={(contentItem as MCQContent).post.user}
                            content={(contentItem as MCQContent).post.content}
                            mediaUrl={(contentItem as MCQContent).post.mediaUrl}
                            mediaType={(contentItem as MCQContent).post.mediaType}
                            options={(contentItem as MCQContent).options}
                            correctOptionId={(contentItem as MCQContent).correctOptionId}
                            answer={answer}
                            isDisabled={isDisabled}
                            onAnswer={handleOnAnswer}
                          />
                        ) : (
                          <LikeDislikePostMessage
                            postId={contentItem.id}
                            user={(contentItem as LikeDislikeContent).post.user}
                            content={(contentItem as LikeDislikeContent).post.content}
                            mediaUrl={(contentItem as LikeDislikeContent).post.mediaUrl}
                            mediaType={(contentItem as LikeDislikeContent).post.mediaType}
                            answer={answer as 'like' | 'dislike' | null | undefined}
                            correctAnswer={(contentItem as LikeDislikeContent).correctAnswer}
                            onLike={(postId) => handleOnAnswer(postId, 'like')}
                            onDislike={(postId) => handleOnAnswer(postId, 'dislike')}
                            isDisabled={isDisabled}
                          />
                        )}
                      </div>
                    </div>
                  );
                });
              }}
            </VerticalCarousel>
          </div>

          <div className="relative z-10 hidden h-[70vh] shrink-0 flex-col items-center justify-center gap-4 md:flex md:py-2 md:pl-1">
            <button
              type="button"
              onClick={handlePrevious}
              className={cn(
                'rounded-full w-12 h-12 flex items-center justify-center',
                'transition-all shadow-lg',
                !prevEnabled
                  ? 'opacity-30 cursor-not-allowed bg-[#6B7280] hover:bg-[#6B7280]'
                  : 'hover:scale-110 active:scale-95 bg-[#011E41] hover:bg-[#002A5A] active:bg-[#001A3F] cursor-pointer'
              )}
              aria-label="Previous post"
              aria-disabled={!prevEnabled}
            >
              <ChevronUp size={24} className="text-white" strokeWidth={2.5} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className={cn(
                'rounded-full w-12 h-12 flex items-center justify-center',
                'transition-all shadow-lg',
                nextEnabled
                  ? 'bg-[#2FE89F] hover:bg-[#00FF9C] active:bg-[#26D68F] cursor-pointer opacity-100 hover:scale-110 active:scale-95'
                  : 'bg-[#6B7280] opacity-50 cursor-not-allowed hover:bg-[#6B7280]'
              )}
              aria-label="Next post"
              aria-disabled={!nextEnabled}
            >
              <ChevronDown size={24} className="text-[#011E41]" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {modalPostId && (() => {
        const contentItem = contentList.find(item => item.id === modalPostId) as Content | undefined;
        if (!contentItem) return null;

        const modalAnswer = getAnswer(modalPostId);
        if (!modalAnswer) return null;

        const isCorrect = contentItem.type === ContentType.MCQ
          ? modalAnswer === (contentItem as MCQContent).correctOptionId
          : modalAnswer === (contentItem as LikeDislikeContent).correctAnswer;
        const reasonContent = isCorrect
          ? contentItem.whyCorrectAnswer.content
          : contentItem.whyIncorrectAnswer.content;
        const reasonHeader = isCorrect
          ? contentItem.whyCorrectAnswer.title
          : contentItem.whyIncorrectAnswer.title;

        return (
          <PrebunkingModal
            isOpen={true}
            onClose={handleOnCloseModal}
            onContinue={() => handleOnContinueModal(modalPostId)}
            postId={modalPostId}
            content={reasonContent}
            header={reasonHeader}
            isCorrect={isCorrect}
          />
        );
      })()}

      <Toast
        message={toastMessage || ''}
        isVisible={showToast}
        onClose={() => {
          setShowToast(false);
          setToastMessage(null);
        }}
      />
    </div>
  );
}
