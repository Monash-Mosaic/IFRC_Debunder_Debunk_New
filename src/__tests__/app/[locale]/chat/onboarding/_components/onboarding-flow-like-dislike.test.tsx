import React from 'react';
import { act, fireEvent, render, screen } from '@/test-utils/test-utils';
import OnboardingFlow from '@/app/[locale]/chat/onboarding/_components/onboarding-flow';
import { useCredibilityStore } from '@/lib/use-credibility-store';

// NOTE: this file is a sibling of onboarding-flow.test.tsx, split out because jest.mock()
// factories for a given module path are fixed per test file (jest hoists mocks once per
// file, so a single file can't provide two different `@/contents` shapes). The MCQ branch
// of the practice question (`en`'s actual first question) is covered in
// onboarding-flow.test.tsx; this file covers the LikeDislikePostMessage branch, which is
// what several other locales (es/fr/ru/zh/ar) actually render as contentList[0] and which
// otherwise has zero test coverage.
//
// NOTE: deviation from the brief — same scrollIntoView polyfill as onboarding-flow.test.tsx;
// jsdom does not implement Element.scrollIntoView.
Element.prototype.scrollIntoView = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockGetAnswer = jest.fn();
const mockSetAnswer = jest.fn();
const mockIsAnswered = jest.fn();
const mockMoveToNextQuestion = jest.fn();
const mockIncrCorrectAnswers = jest.fn();

const mockPracticeGameStore = jest.fn(() => ({
  getAnswer: mockGetAnswer,
  setAnswer: mockSetAnswer,
  isAnswered: mockIsAnswered,
  moveToNextQuestion: mockMoveToNextQuestion,
  incrCorrectAnswers: mockIncrCorrectAnswers,
}));

jest.mock('@/lib/use-game-store', () => ({
  createGameStore: jest.fn(() => mockPracticeGameStore),
}));

jest.mock('@/lib/use-credibility-store');

// NOTE: deviation from the brief — same TDZ hazard as onboarding-flow.test.tsx: the content
// item literal must live fully inside the jest.mock('@/contents', ...) factory rather than
// as an outer `const` the factory references.
jest.mock('@/contents', () => {
  const mockPracticeContentItem = {
    id: 'practice-like-dislike',
    type: 'like_dislike',
    post: {
      id: 'practice-like-dislike',
      user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
      content: <div>Practice like/dislike question</div>,
      mediaUrl: undefined,
      mediaType: undefined,
    },
    correctAnswer: 'like',
    whyCorrectAnswer: {
      title: <div>Practice Correct Title</div>,
      content: <div>Practice Correct Content</div>,
    },
    whyIncorrectAnswer: {
      title: <div>Practice Incorrect Title</div>,
      content: <div>Practice Incorrect Content</div>,
    },
  };

  return {
    __esModule: true,
    default: {
      en: {
        content: {
          'practice-like-dislike': mockPracticeContentItem,
        },
        contentList: [mockPracticeContentItem],
      },
    },
  };
});

jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({ postId, answer, onLike, onDislike }: any) {
    return (
      <div data-testid={`practice-like-dislike-post-${postId}`}>
        <div data-testid={`practice-like-dislike-answer-${postId}`}>{answer || 'null'}</div>
        <button data-testid={`practice-like-dislike-like-${postId}`} onClick={() => onLike?.(postId)}>
          Like
        </button>
        <button data-testid={`practice-like-dislike-dislike-${postId}`} onClick={() => onDislike?.(postId)}>
          Dislike
        </button>
      </div>
    );
  };
});

jest.mock('@/components/newfeeds/prebunking-modal', () => {
  return function MockPrebunkingModal({ isOpen, onClose, onContinue, postId, header, content }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid={`practice-modal-${postId}`}>
        <div data-testid={`practice-modal-header-${postId}`}>{header}</div>
        <div data-testid={`practice-modal-content-${postId}`}>{content}</div>
        <button data-testid={`practice-modal-close-${postId}`} onClick={onClose}>Close</button>
        <button data-testid={`practice-modal-continue-${postId}`} onClick={onContinue}>Continue</button>
      </div>
    );
  };
});

const mockAddPoints = jest.fn();
const mockIncreaseCredibility = jest.fn();
const mockDecreaseCredibility = jest.fn();
const mockInitCredibility = jest.fn();

describe('OnboardingFlow practice question (like/dislike)', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-08-20T00:12:00.000Z'));
    window.localStorage.clear();

    mockGetAnswer.mockReturnValue(null);
    mockIsAnswered.mockReturnValue(false);
    // Wire setAnswer -> getAnswer like the real game store: without this, mockGetAnswer
    // keeps returning whatever beforeEach hardcoded (null) even after mockSetAnswer is
    // called, since they're otherwise-independent jest.fn()s. Same pattern used in
    // src/__tests__/components/home-content.test.tsx.
    mockSetAnswer.mockImplementation((postId: string, answer: string) => {
      mockGetAnswer.mockImplementation((id: string) => (id === postId ? answer : null));
    });

    (global as any).mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: mockReplace,
      prefetch: jest.fn(),
    });

    jest.mocked(useCredibilityStore).mockReturnValue({
      addPoints: mockAddPoints,
      increaseCredibility: mockIncreaseCredibility,
      decreaseCredibility: mockDecreaseCredibility,
      initCredibility: mockInitCredibility,
      resetCredibility: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const advanceToPractice = () => {
    render(<OnboardingFlow />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      fireEvent.click(screen.getByText('step1.option3'));
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  it('renders the practice explanation message and the real first question via LikeDislikePostMessage', () => {
    advanceToPractice();

    expect(screen.getByText('practice.likeDislike')).toBeInTheDocument();
    expect(screen.getByTestId('practice-like-dislike-post-practice-like-dislike')).toBeInTheDocument();
  });

  it('keeps the example answer off the scored game and still shows the feedback modal', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-like-dislike-like-practice-like-dislike'));
    });

    expect(mockSetAnswer).not.toHaveBeenCalled();
    expect(mockInitCredibility).not.toHaveBeenCalled();
    expect(mockIncreaseCredibility).not.toHaveBeenCalled();
    expect(mockAddPoints).not.toHaveBeenCalled();
    expect(mockIncrCorrectAnswers).not.toHaveBeenCalled();
    expect(mockDecreaseCredibility).not.toHaveBeenCalled();

    expect(screen.getByTestId('practice-modal-practice-like-dislike')).toBeInTheDocument();
    expect(screen.getByTestId('practice-modal-header-practice-like-dislike')).toHaveTextContent('Practice Correct Title');
  });

  it('shows the incorrect explanation without scoring the example', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-like-dislike-dislike-practice-like-dislike'));
    });

    expect(mockSetAnswer).not.toHaveBeenCalled();
    expect(mockDecreaseCredibility).not.toHaveBeenCalled();
    expect(mockAddPoints).not.toHaveBeenCalled();
    expect(screen.getByTestId('practice-modal-header-practice-like-dislike')).toHaveTextContent('Practice Incorrect Title');
  });

  it('advances to the main feed after the practice modal is dismissed', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-like-dislike-like-practice-like-dislike'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('practice-modal-continue-practice-like-dislike'));
    });

    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
