import React from 'react';
import { act, fireEvent, render, screen } from '@/test-utils/test-utils';
import OnboardingFlow from '@/app/[locale]/chat/onboarding/_components/onboarding-flow';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { STORAGE_KEYS } from '@/lib/local-storage';

// NOTE: deviation from the brief — jsdom does not implement Element.scrollIntoView,
// and OnboardingFlow calls messagesEndRef.current?.scrollIntoView(...) in a useEffect
// on every render. Without this polyfill every test in this file fails with
// "scrollIntoView is not a function" as soon as the component mounts, unrelated to
// anything this task changes.
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

// NOTE: deviation from the brief — the content item literal is defined *inside* the
// jest.mock('@/contents', ...) factory (rather than as an outer `const` referenced by
// the factory) because this repo's jest config (next/jest, SWC-based hoisting) hoists
// jest.mock() factory evaluation to run as part of the OnboardingFlow import chain,
// before any outer top-level `const` in this file has initialized. Referencing an
// outer-scope object from the factory — even one named with a `mock` prefix — throws
// "Cannot access '...' before initialization". Keeping the object fully local to the
// factory avoids the TDZ hazard while producing the exact same mocked module shape.
jest.mock('@/contents', () => {
  const mockPracticeContentItem = {
    id: 'practice-mcq',
    type: 'mcq',
    post: {
      id: 'practice-mcq',
      user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
      content: <div>Practice MCQ question</div>,
    },
    options: [
      { id: 'opt-a', label: 'Correct option' },
      { id: 'opt-b', label: 'Incorrect option' },
    ],
    correctOptionId: 'opt-a',
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
          'practice-mcq': mockPracticeContentItem,
        },
        contentList: [mockPracticeContentItem],
      },
    },
  };
});

jest.mock('@/components/newfeeds/mcq-post-message', () => {
  return function MockMCQPostMessage({ postId, answer, onAnswer }: any) {
    return (
      <div data-testid={`practice-mcq-post-${postId}`}>
        <div data-testid={`practice-mcq-answer-${postId}`}>{answer || 'null'}</div>
        <button data-testid={`practice-mcq-correct-${postId}`} onClick={() => onAnswer?.(postId, 'opt-a')}>
          Answer correctly
        </button>
        <button data-testid={`practice-mcq-incorrect-${postId}`} onClick={() => onAnswer?.(postId, 'opt-b')}>
          Answer incorrectly
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

describe('OnboardingFlow practice question', () => {
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
    act(() => {
      fireEvent.click(screen.getByText('step3.option1'));
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  it('renders the practice explanation message and the real first question', () => {
    advanceToPractice();

    expect(screen.getByText('practice.explanation')).toBeInTheDocument();
    expect(screen.getByTestId('practice-mcq-post-practice-mcq')).toBeInTheDocument();
  });

  it('awards points and credibility on a correct practice answer, then shows the modal', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-mcq-correct-practice-mcq'));
    });

    expect(mockSetAnswer).toHaveBeenCalledWith('practice-mcq', 'opt-a');
    expect(mockInitCredibility).toHaveBeenCalledWith(1);
    expect(mockIncreaseCredibility).toHaveBeenCalled();
    expect(mockAddPoints).toHaveBeenCalledWith(5);
    expect(mockIncrCorrectAnswers).toHaveBeenCalled();
    expect(mockDecreaseCredibility).not.toHaveBeenCalled();

    expect(screen.getByTestId('practice-modal-practice-mcq')).toBeInTheDocument();
    expect(screen.getByTestId('practice-modal-header-practice-mcq')).toHaveTextContent('Practice Correct Title');
  });

  it('decreases credibility on an incorrect practice answer and shows the incorrect explanation', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-mcq-incorrect-practice-mcq'));
    });

    expect(mockSetAnswer).toHaveBeenCalledWith('practice-mcq', 'opt-b');
    expect(mockDecreaseCredibility).toHaveBeenCalled();
    expect(mockAddPoints).not.toHaveBeenCalled();
    expect(screen.getByTestId('practice-modal-header-practice-mcq')).toHaveTextContent('Practice Incorrect Title');
  });

  it('advances to the main feed after the practice modal is dismissed', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-mcq-correct-practice-mcq'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('practice-modal-continue-practice-mcq'));
    });

    expect(mockMoveToNextQuestion).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
  });

  it('skips straight to completion on mount if the practice question was already answered', () => {
    mockIsAnswered.mockReturnValue(true);
    mockGetAnswer.mockReturnValue('opt-a');

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
    act(() => {
      fireEvent.click(screen.getByText('step3.option1'));
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
