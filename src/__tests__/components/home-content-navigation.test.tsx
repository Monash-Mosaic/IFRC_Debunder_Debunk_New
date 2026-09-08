/**
 * Tests for HomeContent navigation (handleNext / handlePrevious / toast dismiss).
 * These tests use a VerticalCarousel mock that injects a mock emblaApi, which is
 * required to exercise the carousel navigation code paths.
 */
import React from 'react';
import { render, screen, act } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import GameFeed from '@/components/game-feed';
import { useCredibilityStore } from '@/lib/use-credibility-store';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockSetOnboardingCompleted = jest.fn();
jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [true, mockSetOnboardingCompleted]),
}));

const mockGetAnswer = jest.fn(() => null);
const mockSetAnswer = jest.fn();
const mockIsAnswered = jest.fn(() => false);
const mockMoveToNextQuestion = jest.fn();
const mockIsPostDisabled = jest.fn(() => false);
const mockIsGameCompleted = jest.fn(() => false);
const mockGetCorrectAnswers = jest.fn(() => 0);
const mockIncrCorrectAnswers = jest.fn();
const mockGetNumQuestions = jest.fn(() => 2);
const mockResetGame = jest.fn();

const mockUseGameStore = jest.fn(() => ({
  getAnswer: mockGetAnswer,
  setAnswer: mockSetAnswer,
  isAnswered: mockIsAnswered,
  moveToNextQuestion: mockMoveToNextQuestion,
  isPostDisabled: mockIsPostDisabled,
  isGameCompleted: mockIsGameCompleted,
  getCorrectAnswers: mockGetCorrectAnswers,
  incrCorrectAnswers: mockIncrCorrectAnswers,
  getNumQuestions: mockGetNumQuestions,
  resetGame: mockResetGame,
}));

jest.mock('@/lib/use-game-store', () => ({
  createGameStore: jest.fn(() => mockUseGameStore),
}));

jest.mock('@/lib/use-credibility-store');

jest.mock('@/contents', () => ({
  __esModule: true,
  default: {
    en: {
      content: {
        '1': {
          id: '1',
          type: 'like_dislike',
          post: { id: '1', user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false }, content: <div>Post 1</div>, mediaUrl: '', mediaType: 'image' as const },
          correctAnswer: 'like' as const,
          whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
          whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
        },
        '2': {
          id: '2',
          type: 'like_dislike',
          post: { id: '2', user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false }, content: <div>Post 2</div>, mediaUrl: '', mediaType: 'image' as const },
          correctAnswer: 'dislike' as const,
          whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
          whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
        },
      },
      contentList: [
        { id: '1', type: 'like_dislike', post: { id: '1', user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false }, content: <div>Post 1</div>, mediaUrl: '', mediaType: 'image' as const }, correctAnswer: 'like' as const, whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> }, whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> } },
        { id: '2', type: 'like_dislike', post: { id: '2', user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false }, content: <div>Post 2</div>, mediaUrl: '', mediaType: 'image' as const }, correctAnswer: 'dislike' as const, whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> }, whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> } },
      ],
    },
  },
}));

jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({ postId, onLike, onDislike }: any) {
    return (
      <div data-testid={`post-${postId}`}>
        <button data-testid={`like-${postId}`} onClick={() => onLike?.(postId)}>Like</button>
        <button data-testid={`dislike-${postId}`} onClick={() => onDislike?.(postId)}>Dislike</button>
      </div>
    );
  };
});

jest.mock('@/components/newfeeds/prebunking-modal', () => {
  return function MockPrebunkingModal({ isOpen, onClose, onContinue, postId }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid={`modal-${postId}`}>
        <button data-testid={`close-modal-${postId}`} onClick={onClose}>Close</button>
        <button data-testid={`continue-modal-${postId}`} onClick={onContinue}>Continue</button>
      </div>
    );
  };
});

jest.mock('@/components/chat-content', () => () => <div data-testid="chat-content" />);
jest.mock('@/components/game-complete', () => () => <div data-testid="game-complete" />);

// Mock VerticalCarousel to expose a configurable emblaApi via onApi callback
const mockScrollNext = jest.fn();
const mockScrollPrev = jest.fn();
const mockCanScrollNext = jest.fn(() => true);
const mockCanScrollPrev = jest.fn(() => false);
const mockSelectedScrollSnap = jest.fn(() => 0);

const mockEmblaApi = {
  scrollNext: mockScrollNext,
  scrollPrev: mockScrollPrev,
  canScrollNext: mockCanScrollNext,
  canScrollPrev: mockCanScrollPrev,
  selectedScrollSnap: mockSelectedScrollSnap,
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('@/components/vertical-carousel', () => {
  return function MockVerticalCarousel({ onApi, children }: any) {
    React.useEffect(() => {
      onApi?.(mockEmblaApi);
      return () => onApi?.(null);
    }, [onApi]);
    return (
      <div data-testid="carousel">
        {children?.(mockEmblaApi)}
      </div>
    );
  };
});

describe('GameFeed navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAnswer.mockReturnValue(null);
    mockIsAnswered.mockReturnValue(false);
    mockIsPostDisabled.mockReturnValue(false);
    mockIsGameCompleted.mockReturnValue(false);
    mockCanScrollNext.mockReturnValue(true);
    mockCanScrollPrev.mockReturnValue(false);
    mockSelectedScrollSnap.mockReturnValue(0);

    (useCredibilityStore as unknown as jest.Mock).mockReturnValue({
      points: 0,
      credibility: 1,
      initialCredibility: 1,
      addPoints: jest.fn(),
      increaseCredibility: jest.fn(),
      decreaseCredibility: jest.fn(),
      initCredibility: jest.fn(),
      recordLinkClick: jest.fn(),
      resetCredibility: jest.fn(),
    });
  });

  it('shows a toast when next is clicked but the current post is not engaged', async () => {
    const user = userEvent.setup();
    render(<GameFeed />);

    // canScrollNext=true but isAnswered=false means next is locked
    const nextButton = screen.getByRole('button', { name: 'Next post' });
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Please engage with this post before moving to the next one')).toBeInTheDocument();
  });

  it('shows a toast when next is clicked on the last post', async () => {
    mockCanScrollNext.mockReturnValue(false);
    mockSelectedScrollSnap.mockReturnValue(1);

    const user = userEvent.setup();
    render(<GameFeed />);

    const nextButton = screen.getByRole('button', { name: 'Next post' });
    await user.click(nextButton);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText("You're already on the last post")).toBeInTheDocument();
  });

  it('scrolls to next post when next is clicked after engaging', async () => {
    mockIsAnswered.mockReturnValue(true);
    mockCanScrollNext.mockReturnValue(true);

    const user = userEvent.setup();
    render(<GameFeed />);

    const nextButton = screen.getByRole('button', { name: 'Next post' });
    await user.click(nextButton);

    expect(mockScrollNext).toHaveBeenCalled();
  });

  it('shows a toast when previous is clicked on the first post', async () => {
    mockCanScrollPrev.mockReturnValue(false);
    mockSelectedScrollSnap.mockReturnValue(0);

    const user = userEvent.setup();
    render(<GameFeed />);

    const prevButton = screen.getByRole('button', { name: 'Previous post' });
    await user.click(prevButton);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText("You're already on the first post")).toBeInTheDocument();
  });

  it('scrolls to previous post when previous is clicked on a non-first post', async () => {
    mockCanScrollPrev.mockReturnValue(true);
    mockSelectedScrollSnap.mockReturnValue(1);

    const user = userEvent.setup();
    render(<GameFeed />);

    const prevButton = screen.getByRole('button', { name: 'Previous post' });
    await user.click(prevButton);

    expect(mockScrollPrev).toHaveBeenCalled();
  });

  it('dismisses the toast when its close button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameFeed />);

    // Trigger a toast first
    await user.click(screen.getByRole('button', { name: 'Next post' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Dismiss it
    await user.click(screen.getByRole('button', { name: 'Close notification' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
