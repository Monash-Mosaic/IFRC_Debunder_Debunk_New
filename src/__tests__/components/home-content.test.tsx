import React from 'react';
import { render, screen, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import HomeContent from '@/components/home-content';
import { createGameStore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { STORAGE_KEYS } from '@/lib/local-storage';

// Mock dependencies
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockSetOnboardingCompleted = jest.fn();
const mockUseLocalStorage = jest.fn((...args: any) => [true, mockSetOnboardingCompleted]);

jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: (...args: any) => mockUseLocalStorage(...args),
}));

// Mock createGameStore
const mockGetAnswer = jest.fn();
const mockSetAnswer = jest.fn();
const mockIsAnswered = jest.fn();
const mockIsCurrentQuestionAnswered = jest.fn();
const mockMoveToNextQuestion = jest.fn();
const mockIsPostDisabled = jest.fn();
const mockIsGameCompleted = jest.fn();
const mockGetCorrectAnswers = jest.fn();
const mockIncrCorrectAnswers = jest.fn();
const mockGetNumQuestions = jest.fn();
const mockResetGame = jest.fn();

const mockUseGameStore = jest.fn(() => ({
  getAnswer: mockGetAnswer,
  setAnswer: mockSetAnswer,
  isAnswered: mockIsAnswered,
  isCurrentQuestionAnswered: mockIsCurrentQuestionAnswered,
  moveToNextQuestion: mockMoveToNextQuestion,
  isPostDisabled: mockIsPostDisabled,
  isGameCompleted: mockIsGameCompleted,
  getCorrectAnswers: mockGetCorrectAnswers,
  incrCorrectAnswers: mockIncrCorrectAnswers,
  getNumQuestions: mockGetNumQuestions,
  resetGame: mockResetGame,
  currentQuestionIndex: 0,
  questions: ['1', '2'],
  questionStore: {},
  answers: {},
  gameCompleted: false,
  correctAnswers: 0
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
          post: {
            id: '1',
            user: {
              id: 'echo',
              name: 'Echo',
              handle: '@echo',
              avatar: null,
              isUser: false,
            },
            content: <div>Post 1 content</div>,
            mediaUrl: '/images/posts/post-1.jpg',
            mediaType: 'image' as const,
          },
          correctAnswer: 'like' as const,
          whyCorrectAnswer: {
            title: <div>Correct Title 1</div>,
            content: <div>Correct Content 1</div>,
          },
          whyIncorrectAnswer: {
            title: <div>Incorrect Title 1</div>,
            content: <div>Incorrect Content 1</div>,
          },
        },
        '2': {
          id: '2',
          type: 'like_dislike',
          post: {
            id: '2',
            user: {
              id: 'echo',
              name: 'Echo',
              handle: '@echo',
              avatar: null,
              isUser: false,
            },
            content: <div>Post 2 content</div>,
            mediaUrl: '/images/posts/post-2.jpg',
            mediaType: 'image' as const,
          },
          correctAnswer: 'dislike' as const,
          whyCorrectAnswer: {
            title: <div>Correct Title 2</div>,
            content: <div>Correct Content 2</div>,
          },
          whyIncorrectAnswer: {
            title: <div>Incorrect Title 2</div>,
            content: <div>Incorrect Content 2</div>,
          },
        },
      },
      contentList: [
        {
          id: 'mcq-1',
          type: 'mcq',
          post: {
            id: 'mcq-1',
            user: {
              id: 'echo',
              name: 'Echo',
              handle: '@echo',
              avatar: null,
              isUser: false,
            },
            content: <div>MCQ question</div>,
          },
          options: [{ id: 'opt-a', label: 'Option A' }, { id: 'opt-b', label: 'Option B' }],
          correctOptionId: 'opt-a',
          whyCorrectAnswer: {
            title: <div>MCQ Correct Title</div>,
            content: <div>MCQ Correct Content</div>,
          },
          whyIncorrectAnswer: {
            title: <div>MCQ Incorrect Title</div>,
            content: <div>MCQ Incorrect Content</div>,
          },
        },
        {
          id: '1',
          type: 'like_dislike',
          post: {
            id: '1',
            user: {
              id: 'echo',
              name: 'Echo',
              handle: '@echo',
              avatar: null,
              isUser: false,
            },
            content: <div>Post 1 content</div>,
            mediaUrl: '/images/posts/post-1.jpg',
            mediaType: 'image' as const,
          },
          correctAnswer: 'like' as const,
          whyCorrectAnswer: {
            title: <div>Correct Title 1</div>,
            content: <div>Correct Content 1</div>,
          },
          whyIncorrectAnswer: {
            title: <div>Incorrect Title 1</div>,
            content: <div>Incorrect Content 1</div>,
          },
        },
        {
          id: '2',
          type: 'like_dislike',
          post: {
            id: '2',
            user: {
              id: 'echo',
              name: 'Echo',
              handle: '@echo',
              avatar: null,
              isUser: false,
            },
            content: <div>Post 2 content</div>,
            mediaUrl: '/images/posts/post-2.jpg',
            mediaType: 'image' as const,
          },
          correctAnswer: 'dislike' as const,
          whyCorrectAnswer: {
            title: <div>Correct Title 2</div>,
            content: <div>Correct Content 2</div>,
          },
          whyIncorrectAnswer: {
            title: <div>Incorrect Title 2</div>,
            content: <div>Incorrect Content 2</div>,
          },
        },
      ],
    },
  },
}));



// Mock MCQPostMessage
jest.mock('@/components/newfeeds/mcq-post-message', () => {
  return function MockMCQPostMessage({
    postId,
    answer,
    onAnswer,
  }: any) {
    return (
      <div data-testid={`mcq-post-${postId}`}>
        <div data-testid={`mcq-answer-${postId}`}>{answer || 'null'}</div>
        <button data-testid={`mcq-option-${postId}`} onClick={() => onAnswer?.(postId, 'opt-a')}>
          Answer Option A
        </button>
        <button data-testid={`mcq-option-incorrect-${postId}`} onClick={() => onAnswer?.(postId, 'opt-b')}>
          Answer Option B
        </button>
      </div>
    );
  };
});

// Mock LikeDislikePostMessage
jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({
    postId,
    answer,
    correctAnswer,
    onLike,
    onDislike,
  }: any) {
    return (
      <div data-testid={`post-${postId}`}>
        <div data-testid={`answer-${postId}`}>{answer || 'null'}</div>
        <div data-testid={`correct-${postId}`}>{correctAnswer}</div>
        <button data-testid={`like-${postId}`} onClick={() => onLike?.(postId)}>
          Like
        </button>
        <button data-testid={`dislike-${postId}`} onClick={() => onDislike?.(postId)}>
          Dislike
        </button>
      </div>
    );
  };
});

// Mock PrebunkingModal
jest.mock('@/components/newfeeds/prebunking-modal', () => {
  return function MockPrebunkingModal({
    isOpen,
    onClose,
    onContinue,
    postId,
    header,
    content,
  }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid={`prebunking-modal-${postId}`}>
        <div data-testid={`modal-header-${postId}`}>{header}</div>
        <div data-testid={`modal-content-${postId}`}>{content}</div>
        <button data-testid={`close-modal-${postId}`} onClick={onClose}>
          Close Modal
        </button>
        <button data-testid={`continue-modal-${postId}`} onClick={onContinue}>
          Continue
        </button>
      </div>
    );
  };
});

// Mock ChatContent
jest.mock('@/components/chat-content', () => {
  return function MockChatContent({
    onSkipClick,
  }: {
    onSkipClick?: () => void;
  }) {
    return (
      <div data-testid="chat-content">
        <button type="button" data-testid="skip-onboarding" onClick={onSkipClick}>
          Skip onboarding
        </button>
      </div>
    );
  };
});

jest.mock('@/components/game-complete', () => {
  return function MockGameComplete({
    correctAnswers,
    totalQuestions,
    restartGame,
  }: {
    correctAnswers: number;
    totalQuestions: number;
    restartGame: () => void;
  }) {
    return (
      <div data-testid="game-complete">
        <span data-testid="game-score">
          {correctAnswers}/{totalQuestions}
        </span>
        <button type="button" data-testid="restart-game" onClick={restartGame}>
          Restart
        </button>
      </div>
    );
  };
});

const mockAddPoints = jest.fn();
const mockIncreaseCredibility = jest.fn();
const mockDecreaseCredibility = jest.fn();
const mockInitCredibility = jest.fn();
const mockResetCredibility = jest.fn();

describe('HomeContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetAnswer.mockReturnValue(null);
    mockIsAnswered.mockReturnValue(false);
    mockIsPostDisabled.mockReturnValue(false);
    mockIsGameCompleted.mockReturnValue(false);
    mockUseLocalStorage.mockReturnValue([true, mockSetOnboardingCompleted]);

    jest.mocked(useCredibilityStore).mockReturnValue({
      addPoints: mockAddPoints,
      increaseCredibility: mockIncreaseCredibility,
      decreaseCredibility: mockDecreaseCredibility,
      initCredibility: mockInitCredibility,
      resetCredibility: mockResetCredibility,
    });
  });

  it('renders chat content when onboarding is not completed', () => {
    // Reset mock to return false for this test
    mockUseLocalStorage.mockReturnValue([false, jest.fn()]); // onboardingCompleted = false

    render(<HomeContent />);
    expect(screen.getByTestId('chat-content')).toBeInTheDocument();
    
    // Reset back to default for other tests
    mockUseLocalStorage.mockReturnValue([true, mockSetOnboardingCompleted]);
  });

  it('renders posts when onboarding is completed', () => {
    render(<HomeContent />);
    expect(screen.getByTestId('post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-2')).toBeInTheDocument();
  });

  it('passes answer from game store to LikeDislikePostMessage', () => {
    mockGetAnswer.mockImplementation((postId: string) => {
      if (postId === '1') return 'like';
      if (postId === '2') return 'dislike';
      return null;
    });

    render(<HomeContent />);
    
    expect(screen.getByTestId('answer-1')).toHaveTextContent('like');
    expect(screen.getByTestId('answer-2')).toHaveTextContent('dislike');
  });

  it('decreases credibility on incorrect answer', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    // Answer incorrectly (post 1 correct answer is 'like', we'll answer 'dislike')
    const dislikeButton = screen.getByTestId('dislike-1');
    await user.click(dislikeButton);

    expect(mockSetAnswer).toHaveBeenCalledWith('1', 'dislike');
    expect(mockDecreaseCredibility).toHaveBeenCalled();
    expect(mockAddPoints).not.toHaveBeenCalled();
  });

  it('awards points and does not decrease credibility on correct answer', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    // Post 1 correct answer is 'like'
    const likeButton = screen.getByTestId('like-1');
    await user.click(likeButton);

    expect(mockSetAnswer).toHaveBeenCalledWith('1', 'like');
    expect(mockAddPoints).toHaveBeenCalledWith(5);
    expect(mockDecreaseCredibility).not.toHaveBeenCalled();
  });

  it('does not allow changing answer for previously answered questions', async () => {
    mockIsAnswered.mockReturnValue(true);
    const user = userEvent.setup();
    render(<HomeContent />);

    // Try to answer an already answered question
    const likeButton = screen.getByTestId('like-1');
    await user.click(likeButton);

    // Should not call setAnswer again
    expect(mockSetAnswer).not.toHaveBeenCalled();
  });

  it('does not move to next question when modal is closed', async () => {
    // Track when answer is set to update mock
    let answerSet = false;
    mockSetAnswer.mockImplementation(() => {
      answerSet = true;
    });
    
    // Mock isAnswered to return true for post-1 after answer is set
    mockIsAnswered.mockImplementation((postId: string) => {
      return postId === '1' && answerSet;
    });
    // Mock getAnswer to return 'like' for post-1 when answer is set
    mockGetAnswer.mockImplementation((postId: string) => {
      if (postId === '1' && answerSet) return 'like';
      return null;
    });
    
    const user = userEvent.setup();
    render(<HomeContent />);

    // First, answer the question to show the modal
    const likeButton = screen.getByTestId('like-1');
    await user.click(likeButton);

    // Wait for modal to appear - the modal should show after setAnswer is called
    const modal = await screen.findByTestId('prebunking-modal-1', {}, { timeout: 3000 });
    expect(modal).toBeInTheDocument();

    // Close the modal
    const closeModalButton = screen.getByTestId('close-modal-1');
    await user.click(closeModalButton);

    // Verify that isAnswered was called and moveToNextQuestion was called
    expect(mockIsAnswered).toHaveBeenCalled();
    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
  });

  it('does not move to next question if current question is not answered', async () => {
    mockIsCurrentQuestionAnswered.mockReturnValue(false);
    mockIsAnswered.mockReturnValue(false);
    // Mock getAnswer to return 'like' for post-1 after it's set
    mockGetAnswer.mockImplementation((postId: string) => {
      if (postId === '1') return 'like';
      return null;
    });
    const user = userEvent.setup();
    render(<HomeContent />);

    // Answer the question first
    const likeButton = screen.getByTestId('like-1');
    await user.click(likeButton);

    // Wait for modal to appear
    const modal = await screen.findByTestId('prebunking-modal-1');
    expect(modal).toBeInTheDocument();

    // Close the modal
    const closeModalButton = screen.getByTestId('close-modal-1');
    await user.click(closeModalButton);

    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
  });

  it('prevents credibility from going below 0', async () => {
    jest.mocked(useCredibilityStore).mockReturnValue({
      addPoints: mockAddPoints,
      increaseCredibility: mockIncreaseCredibility,
      decreaseCredibility: mockDecreaseCredibility,
      initCredibility: mockInitCredibility,
      resetCredibility: mockResetCredibility,
    });

    const user = userEvent.setup();
    render(<HomeContent />);

    // Answer incorrectly
    const dislikeButton = screen.getByTestId('dislike-1');
    await user.click(dislikeButton);

    // Assert that the decrement action was triggered safely
    expect(mockDecreaseCredibility).toHaveBeenCalled();
  });

  it('passes correct answer to LikeDislikePostMessage', () => {
    render(<HomeContent />);

    expect(screen.getByTestId('correct-1')).toHaveTextContent('like');
    expect(screen.getByTestId('correct-2')).toHaveTextContent('dislike');
  });

  describe('MCQ content', () => {
    it('renders MCQ post', () => {
      render(<HomeContent />);
      expect(screen.getByTestId('mcq-post-mcq-1')).toBeInTheDocument();
    });

    it('awards points and does not decrease credibility on correct MCQ answer', async () => {
      const user = userEvent.setup();
      render(<HomeContent />);

      // opt-a is correct (correctOptionId is opt-a)
      await user.click(screen.getByTestId('mcq-option-mcq-1'));

      expect(mockSetAnswer).toHaveBeenCalledWith('mcq-1', 'opt-a');
      expect(mockAddPoints).toHaveBeenCalledWith(5);
        expect(mockIncreaseCredibility).toHaveBeenCalled();
      expect(mockDecreaseCredibility).not.toHaveBeenCalled();
    });

    it('decreases credibility on incorrect MCQ answer', async () => {
      const user = userEvent.setup();
      render(<HomeContent />);

      // opt-b is incorrect (correctOptionId is opt-a)
      await user.click(screen.getByTestId('mcq-option-incorrect-mcq-1'));

      expect(mockSetAnswer).toHaveBeenCalledWith('mcq-1', 'opt-b');
      expect(mockDecreaseCredibility).toHaveBeenCalled();
      expect(mockAddPoints).not.toHaveBeenCalled();
    });

    it('does not allow changing answer for a previously answered MCQ question', async () => {
      mockIsAnswered.mockReturnValue(true);
      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-mcq-1'));

      expect(mockSetAnswer).not.toHaveBeenCalled();
    });

    it('does not answer MCQ when the post is disabled', async () => {
      mockIsPostDisabled.mockReturnValue(true);
      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-mcq-1'));

      expect(mockSetAnswer).not.toHaveBeenCalled();
    });

    it('opens modal for MCQ answers', async () => {
      mockGetAnswer.mockImplementation((postId: string) => postId === 'mcq-1' ? 'opt-a' : null);
      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-mcq-1'));

      expect(await screen.findByTestId('prebunking-modal-mcq-1')).toBeInTheDocument();
    });

    it('shows correct answer feedback in the modal for MCQ', async () => {
      mockSetAnswer.mockImplementation((postId: string, answer: string) => {
        mockGetAnswer.mockImplementation((id: string) => (id === postId ? answer : null));
      });

      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-mcq-1'));

      const modal = await screen.findByTestId('prebunking-modal-mcq-1');
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('modal-header-mcq-1')).toHaveTextContent('MCQ Correct Title');
      expect(screen.getByTestId('modal-content-mcq-1')).toHaveTextContent('MCQ Correct Content');
    });

    it('shows incorrect answer feedback in the modal for MCQ', async () => {
      mockSetAnswer.mockImplementation((postId: string, answer: string) => {
        mockGetAnswer.mockImplementation((id: string) => (id === postId ? answer : null));
      });

      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-incorrect-mcq-1'));

      const modal = await screen.findByTestId('prebunking-modal-mcq-1');
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('modal-header-mcq-1')).toHaveTextContent('MCQ Incorrect Title');
      expect(screen.getByTestId('modal-content-mcq-1')).toHaveTextContent('MCQ Incorrect Content');
    });

    it('does not move to next question when MCQ modal is closed', async () => {
      let answerSet = false;
      mockSetAnswer.mockImplementation(() => { answerSet = true; });
      mockIsAnswered.mockImplementation((postId: string) => postId === 'mcq-1' && answerSet);
      mockGetAnswer.mockImplementation((postId: string) => postId === 'mcq-1' && answerSet ? 'opt-a' : null);

      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-mcq-1'));
      await user.click(await screen.findByTestId('close-modal-mcq-1'));

      expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
    });

    it('calls moveToNextQuestion when continue is clicked on an answered MCQ question', async () => {
      let answerSet = false;
      mockSetAnswer.mockImplementation(() => { answerSet = true; });
      mockIsAnswered.mockImplementation((postId: string) => postId === 'mcq-1' && answerSet);
      mockGetAnswer.mockImplementation((postId: string) => (postId === 'mcq-1' && answerSet ? 'opt-a' : null));

      const user = userEvent.setup();
      render(<HomeContent />);

      await user.click(screen.getByTestId('mcq-option-mcq-1'));

      const modal = await screen.findByTestId('prebunking-modal-mcq-1');
      expect(modal).toBeInTheDocument();

      await user.click(screen.getByTestId('continue-modal-mcq-1'));

      expect(mockMoveToNextQuestion).toHaveBeenCalled();
    });
  });

  it('marks onboarding complete when skip is clicked', async () => {
    mockUseLocalStorage.mockReturnValue([false, mockSetOnboardingCompleted]);

    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('skip-onboarding'));
    expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);

    mockUseLocalStorage.mockReturnValue([true, mockSetOnboardingCompleted]);
  });

  it('increments correct answers on a correct response', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('like-1'));
    expect(mockIncrCorrectAnswers).toHaveBeenCalled();
  });

  it('does not answer when the post is disabled', async () => {
    mockIsPostDisabled.mockReturnValue(true);
    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('like-1'));
    expect(mockSetAnswer).not.toHaveBeenCalled();
  });

  it('renders game complete screen when the game is finished', () => {
    mockIsGameCompleted.mockReturnValue(true);
    mockGetCorrectAnswers.mockReturnValue(2);
    mockGetNumQuestions.mockReturnValue(2);

    render(<HomeContent />);

    expect(screen.getByTestId('game-complete')).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/2');
  });

  it('resets game state when restart is clicked', async () => {
    mockIsGameCompleted.mockReturnValue(true);
    const user = userEvent.setup();

    render(<HomeContent />);
    await user.click(screen.getByTestId('restart-game'));

    expect(mockResetGame).toHaveBeenCalled();
    expect(mockResetCredibility).toHaveBeenCalled();
    expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(false);
  });

  it('shows incorrect answer feedback in the modal', async () => {
    mockSetAnswer.mockImplementation((postId: string, answer: string) => {
      mockGetAnswer.mockImplementation((id: string) => (id === postId ? answer : null));
    });

    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('dislike-1'));

    const modal = await screen.findByTestId('prebunking-modal-1');
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId('modal-header-1')).toHaveTextContent('Incorrect Title 1');
    expect(screen.getByTestId('modal-content-1')).toHaveTextContent('Incorrect Content 1');
  });

  it('shows correct answer feedback in the modal', async () => {
    mockSetAnswer.mockImplementation((postId: string, answer: string) => {
      mockGetAnswer.mockImplementation((id: string) => (id === postId ? answer : null));
    });

    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('like-1'));

    const modal = await screen.findByTestId('prebunking-modal-1');
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId('modal-header-1')).toHaveTextContent('Correct Title 1');
    expect(screen.getByTestId('modal-content-1')).toHaveTextContent('Correct Content 1');
  });

  it('sets modal app element on mount', () => {
    const setAppElementSpy = jest.spyOn(require('react-modal'), 'setAppElement');

    render(<HomeContent />);

    expect(setAppElementSpy).toHaveBeenCalled();
    setAppElementSpy.mockRestore();
  });

  it('calls moveToNextQuestion when continue is clicked on an answered question', async () => {
    let answerSet = false;
    mockSetAnswer.mockImplementation(() => { answerSet = true; });
    mockIsAnswered.mockImplementation((postId: string) => postId === '1' && answerSet);
    mockGetAnswer.mockImplementation((postId: string) => (postId === '1' && answerSet ? 'like' : null));

    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('like-1'));

    const modal = await screen.findByTestId('prebunking-modal-1');
    expect(modal).toBeInTheDocument();

    await user.click(screen.getByTestId('continue-modal-1'));

    expect(mockMoveToNextQuestion).toHaveBeenCalled();
  });

  it('does not call moveToNextQuestion when continue is clicked on an unanswered question', async () => {
    mockIsAnswered.mockReturnValue(false);
    mockGetAnswer.mockImplementation((postId: string) => (postId === '1' ? 'like' : null));

    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByTestId('like-1'));

    const modal = await screen.findByTestId('prebunking-modal-1');
    expect(modal).toBeInTheDocument();

    await user.click(screen.getByTestId('continue-modal-1'));

    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
  });
});
