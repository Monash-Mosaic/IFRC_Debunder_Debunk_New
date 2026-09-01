import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import ContentCarouselItems from '@/components/content-carousel-items';
import { Content, ContentType } from '@/contents/en';

jest.mock('@/components/ui/carousel', () => ({
  CarouselContent: ({ children }: any) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children }: any) => <div data-testid="carousel-item">{children}</div>,
}));

jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({ postId, answer, correctAnswer, onLike, onDislike }: any) {
    return (
      <div data-testid={`ld-post-${postId}`}>
        <span data-testid={`ld-answer-${postId}`}>{answer ?? 'null'}</span>
        <span data-testid={`ld-correct-${postId}`}>{correctAnswer}</span>
        <button data-testid={`ld-like-${postId}`} onClick={() => onLike?.(postId)}>Like</button>
        <button data-testid={`ld-dislike-${postId}`} onClick={() => onDislike?.(postId)}>Dislike</button>
      </div>
    );
  };
});

jest.mock('@/components/newfeeds/mcq-post-message', () => {
  return function MockMCQPostMessage({ postId, answer, correctOptionId, onAnswer }: any) {
    return (
      <div data-testid={`mcq-post-${postId}`}>
        <span data-testid={`mcq-answer-${postId}`}>{answer ?? 'null'}</span>
        <span data-testid={`mcq-correct-${postId}`}>{correctOptionId}</span>
        <button data-testid={`mcq-answer-btn-${postId}`} onClick={() => onAnswer?.(postId, 'opt-a')}>Answer</button>
      </div>
    );
  };
});

const mockUser = {
  id: 'echo',
  name: 'Echo',
  handle: '@echo',
  avatar: null,
  isUser: false,
};

const likeDislikeItem: Content = {
  id: 'ld-1',
  type: ContentType.LIKE_DISLIKE,
  post: { id: 'ld-1', user: mockUser, content: <div>Post content</div> },
  correctAnswer: 'like',
  whyCorrectAnswer: { title: <div>T</div>, content: <div>C</div> },
  whyIncorrectAnswer: { title: <div>T</div>, content: <div>C</div> },
};

const mcqItem: Content = {
  id: 'mcq-1',
  type: ContentType.MCQ,
  post: { id: 'mcq-1', user: mockUser, content: <div>MCQ content</div> },
  options: [{ id: 'opt-a', label: 'Option A' }],
  correctOptionId: 'opt-a',
  whyCorrectAnswer: { title: <div>T</div>, content: <div>C</div> },
  whyIncorrectAnswer: { title: <div>T</div>, content: <div>C</div> },
};

const shareItem: Content = {
  id: 'share-1',
  type: ContentType.SHARE,
  correctAnswer: 'share',
  whyCorrectAnswer: { title: <div>T</div>, content: <div>C</div> },
  whyIncorrectAnswer: { title: <div>T</div>, content: <div>C</div> },
};

const defaultProps = {
  getAnswer: jest.fn((_id: string): string | null => null),
  isPostDisabled: jest.fn(() => false),
  onAnswer: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('ContentCarouselItems', () => {
  it('renders LikeDislikePostMessage for like_dislike content', () => {
    render(<ContentCarouselItems {...defaultProps} contentList={[likeDislikeItem]} />);
    expect(screen.getByTestId('ld-post-ld-1')).toBeInTheDocument();
  });

  it('renders MCQPostMessage for mcq content', () => {
    render(<ContentCarouselItems {...defaultProps} contentList={[mcqItem]} />);
    expect(screen.getByTestId('mcq-post-mcq-1')).toBeInTheDocument();
  });

  it('renders both types when mixed content is provided', () => {
    render(<ContentCarouselItems {...defaultProps} contentList={[likeDislikeItem, mcqItem]} />);
    expect(screen.getByTestId('ld-post-ld-1')).toBeInTheDocument();
    expect(screen.getByTestId('mcq-post-mcq-1')).toBeInTheDocument();
  });

  it('does not route unsupported content to Like/Report or hide valid siblings', () => {
    render(
      <ContentCarouselItems
        {...defaultProps}
        contentList={[shareItem, mcqItem, likeDislikeItem]}
      />
    );

    expect(screen.queryByTestId('ld-post-share-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('mcq-post-mcq-1')).toBeInTheDocument();
    expect(screen.getByTestId('ld-post-ld-1')).toBeInTheDocument();
  });

  it('passes answer from getAnswer to like-dislike post', () => {
    defaultProps.getAnswer.mockImplementation((id: string) => id === 'ld-1' ? 'like' : null);
    render(<ContentCarouselItems {...defaultProps} contentList={[likeDislikeItem]} />);
    expect(screen.getByTestId('ld-answer-ld-1')).toHaveTextContent('like');
  });

  it('passes answer from getAnswer to mcq post', () => {
    defaultProps.getAnswer.mockImplementation((id: string) => id === 'mcq-1' ? 'opt-a' : null);
    render(<ContentCarouselItems {...defaultProps} contentList={[mcqItem]} />);
    expect(screen.getByTestId('mcq-answer-mcq-1')).toHaveTextContent('opt-a');
  });

  it('passes onAnswer through to like-dislike as onLike/onDislike', async () => {
    const mockOnAnswer = jest.fn();
    const { getByTestId } = render(
      <ContentCarouselItems {...defaultProps} contentList={[likeDislikeItem]} onAnswer={mockOnAnswer} />
    );
    getByTestId('ld-like-ld-1').click();
    expect(mockOnAnswer).toHaveBeenCalledWith('ld-1', 'like');
  });

  it('passes onAnswer to MCQ post', async () => {
    const mockOnAnswer = jest.fn();
    const { getByTestId } = render(
      <ContentCarouselItems {...defaultProps} contentList={[mcqItem]} onAnswer={mockOnAnswer} />
    );
    getByTestId('mcq-answer-btn-mcq-1').click();
    expect(mockOnAnswer).toHaveBeenCalledWith('mcq-1', 'opt-a');
  });

  it('renders nothing when contentList is empty', () => {
    render(<ContentCarouselItems {...defaultProps} contentList={[]} />);
    expect(screen.queryByTestId(/^ld-post/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/^mcq-post/)).not.toBeInTheDocument();
  });
});
