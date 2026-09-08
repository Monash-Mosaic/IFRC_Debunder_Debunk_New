/**
 * Integration test using the REAL use-game-store (not mocked), to catch bugs
 * that only manifest from the actual store lifecycle across re-renders.
 */
import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import GameFeed from '@/components/game-feed';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockSetOnboardingCompleted = jest.fn();
jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [true, mockSetOnboardingCompleted]),
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
  return function MockPrebunkingModal({ isOpen, onContinue, postId }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid={`modal-${postId}`}>
        <button data-testid={`continue-modal-${postId}`} onClick={onContinue}>Continue</button>
      </div>
    );
  };
});

jest.mock('@/components/chat-content', () => () => <div data-testid="chat-content" />);
jest.mock('@/components/game-complete', () => {
  return function MockGameComplete({ correctAnswers, totalQuestions }: any) {
    return (
      <div data-testid="game-complete">
        <span data-testid="game-score">{correctAnswers}/{totalQuestions}</span>
      </div>
    );
  };
});

jest.mock('@/components/vertical-carousel', () => {
  return function MockVerticalCarousel({ children }: any) {
    return <div data-testid="carousel">{children?.(null)}</div>;
  };
});

describe('GameFeed game completion (real game store)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();

    (require('@/lib/use-credibility-store').useCredibilityStore as jest.Mock).mockReturnValue({
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

  it('shows the game complete screen after answering every question', async () => {
    const user = userEvent.setup();
    render(<GameFeed />);

    await user.click(screen.getByTestId('like-1'));
    await user.click(await screen.findByTestId('continue-modal-1'));

    await user.click(screen.getByTestId('dislike-2'));
    await user.click(await screen.findByTestId('continue-modal-2'));

    expect(await screen.findByTestId('game-complete')).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/2');
  });
});
