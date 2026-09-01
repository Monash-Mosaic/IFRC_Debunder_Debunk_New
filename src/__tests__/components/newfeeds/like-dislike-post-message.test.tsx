import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';

// Mock PostMessage component
jest.mock('@/app/[locale]/chat/onboarding/_components/post-message', () => {
  return function MockPostMessage({
    content,
    onLike,
    onDislike,
    likeDisabled,
    dislikeDisabled,
    likeClassName,
    dislikeClassName,
    interactionMode,
  }: any) {
    return (
      <div data-testid="post-message" data-interaction-mode={interactionMode}>
        <div data-testid="post-content">{content}</div>
        <button
          data-testid="like-button"
          onClick={onLike}
          disabled={likeDisabled}
          className={likeClassName}
          aria-label="Like"
        >
          Like
        </button>
        <button
          data-testid="report-button"
          onClick={onDislike}
          disabled={dislikeDisabled}
          className={dislikeClassName}
          aria-label="Report"
        >
          Report
        </button>
      </div>
    );
  };
});


describe('LikeDislikePostMessage', () => {
  const defaultProps = {
    postId: 'post-123',
    user: {
      id: 'echo',
      name: 'Echo',
      handle: '@echo',
      avatar: null,
      isUser: false,
    },
    content: <div>Test post content</div>,
    correctAnswer: 'like' as const,
    answer: null as 'like' | 'dislike' | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders PostMessage with correct props', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    expect(screen.getByTestId('post-message')).toBeInTheDocument();
    expect(screen.getByTestId('post-message')).toHaveAttribute('data-interaction-mode', 'like-report');
  });

  it('passes likeDisabled and dislikeDisabled as false when not answered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    const likeButton = screen.getByTestId('like-button');
    const reportButton = screen.getByTestId('report-button');

    expect(likeButton).not.toBeDisabled();
    expect(reportButton).not.toBeDisabled();
  });

  it('passes likeDisabled and dislikeDisabled as true when answered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer="like" />);

    const likeButton = screen.getByTestId('like-button');
    const reportButton = screen.getByTestId('report-button');

    expect(likeButton).toBeDisabled();
    expect(reportButton).toBeDisabled();
  });

  it('does not expose legacy Comment or Share actions', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    expect(screen.queryByRole('button', { name: 'Comment' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });

  it('calls onLike when like button is clicked and not answered', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer={null} onLike={mockOnLike} />);

    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledTimes(1);
    expect(mockOnLike).toHaveBeenCalledWith('post-123');
  });

  it('maps Report to onDislike when clicked and not answered', async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer={null} onDislike={mockOnDislike} />);

    const reportButton = screen.getByTestId('report-button');
    await user.click(reportButton);

    expect(mockOnDislike).toHaveBeenCalledTimes(1);
    expect(mockOnDislike).toHaveBeenCalledWith('post-123');
  });

  it('does not call onLike if post is already answered', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer="like" onLike={mockOnLike} />);

    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(mockOnLike).not.toHaveBeenCalled();
  });


  it('applies correct color class to like button when answer is correct', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="like" />);

    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toHaveClass('fill-(--color-dunder-green)');
  });

  it('applies incorrect color class to like button when answer is incorrect', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="dislike" answer="like" />);

    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toHaveClass('fill-(--color-dunder-red)');
  });

  it('applies correct color class to Report when the internal dislike answer is correct', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="dislike" answer="dislike" />);

    const reportButton = screen.getByTestId('report-button');
    expect(reportButton).toHaveClass('fill-(--color-dunder-green)');
  });

  it('applies incorrect color class to Report when the internal dislike answer is incorrect', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="dislike" />);

    const reportButton = screen.getByTestId('report-button');
    expect(reportButton).toHaveClass('fill-(--color-dunder-red)');
  });

  it('does not apply color class to non-clicked button', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="like" />);

    const reportButton = screen.getByTestId('report-button');
    expect(reportButton).not.toHaveClass('fill-(--color-dunder-green)');
    expect(reportButton).not.toHaveClass('fill-(--color-dunder-red)');
  });


  it('works with null answer (not answered yet)', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    const likeButton = screen.getByTestId('like-button');
    const reportButton = screen.getByTestId('report-button');

    expect(likeButton).not.toBeDisabled();
    expect(reportButton).not.toBeDisabled();
    expect(likeButton).not.toHaveClass('fill-(--color-dunder-green)');
    expect(reportButton).not.toHaveClass('fill-(--color-dunder-red)');
  });

  it('does not call onDislike through Report if the post is already answered', async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(
      <LikeDislikePostMessage
        {...defaultProps}
        answer="dislike"
        onDislike={mockOnDislike}
      />,
    );

    await user.click(screen.getByTestId('report-button'));
    expect(mockOnDislike).not.toHaveBeenCalled();
  });

  it('safely handles missing callbacks when unanswered', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    await expect(user.click(screen.getByTestId('like-button'))).resolves.not.toThrow();
    await expect(user.click(screen.getByTestId('report-button'))).resolves.not.toThrow();
  });

  it('treats undefined answer the same as unanswered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={undefined} />);

    expect(screen.getByTestId('like-button')).not.toBeDisabled();
    expect(screen.getByTestId('report-button')).not.toBeDisabled();
  });

});
