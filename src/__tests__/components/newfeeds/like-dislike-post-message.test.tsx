import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';

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
    onLike: jest.fn(),
    onDislike: jest.fn(),
    correctAnswer: 'like' as const,
    answer: null as 'like' | 'dislike' | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTranslations).mockReturnValue(((key: string) => ({ like: 'Like', report: 'Report' })[key] ?? key) as ReturnType<typeof useTranslations>);
  });

  it('renders PostMessage with correct props', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    expect(screen.getByRole('article')).toHaveTextContent('Test post content');
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Like' }).querySelector('.lucide-thumbs-up')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Report' }).querySelector('.lucide-circle-alert')).toBeInTheDocument();
  });

  it('passes likeDisabled and dislikeDisabled as false when not answered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    const likeButton = screen.getByRole('button', { name: 'Like' });
    const reportButton = screen.getByRole('button', { name: 'Report' });

    expect(likeButton).not.toBeDisabled();
    expect(reportButton).not.toBeDisabled();
  });

  it('passes likeDisabled and dislikeDisabled as true when answered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer="like" />);

    const likeButton = screen.getByRole('button', { name: 'Like' });
    const reportButton = screen.getByRole('button', { name: 'Report' });

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

    const likeButton = screen.getByRole('button', { name: 'Like' });
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledTimes(1);
    expect(mockOnLike).toHaveBeenCalledWith('post-123');
  });

  it('maps Report to onDislike when clicked and not answered', async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer={null} onDislike={mockOnDislike} />);

    const reportButton = screen.getByRole('button', { name: 'Report' });
    await user.click(reportButton);

    expect(mockOnDislike).toHaveBeenCalledTimes(1);
    expect(mockOnDislike).toHaveBeenCalledWith('post-123');
  });

  it('does not call onLike if post is already answered', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer="like" onLike={mockOnLike} />);

    const likeButton = screen.getByRole('button', { name: 'Like' });
    await user.click(likeButton);

    expect(mockOnLike).not.toHaveBeenCalled();
  });


  it('applies correct color class to like button when answer is correct', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="like" />);

    const likeButton = screen.getByRole('button', { name: 'Like' });
    expect(likeButton.querySelector('svg')).toHaveClass('fill-(--color-dunder-green)');
  });

  it('applies incorrect color class to like button when answer is incorrect', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="dislike" answer="like" />);

    const likeButton = screen.getByRole('button', { name: 'Like' });
    expect(likeButton.querySelector('svg')).toHaveClass('fill-(--color-dunder-red)');
  });

  it('applies correct color class to Report when the internal dislike answer is correct', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="dislike" answer="dislike" />);

    const reportButton = screen.getByRole('button', { name: 'Report' });
    expect(reportButton.querySelector('svg')).toHaveClass('fill-(--color-dunder-green)');
  });

  it('applies incorrect color class to Report when the internal dislike answer is incorrect', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="dislike" />);

    const reportButton = screen.getByRole('button', { name: 'Report' });
    expect(reportButton.querySelector('svg')).toHaveClass('fill-(--color-dunder-red)');
  });

  it('does not apply color class to non-clicked button', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="like" />);

    const reportButton = screen.getByRole('button', { name: 'Report' });
    expect(reportButton.querySelector('svg')).not.toHaveClass('fill-(--color-dunder-green)');
    expect(reportButton.querySelector('svg')).not.toHaveClass('fill-(--color-dunder-red)');
  });


  it('works with null answer (not answered yet)', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    const likeButton = screen.getByRole('button', { name: 'Like' });
    const reportButton = screen.getByRole('button', { name: 'Report' });

    expect(likeButton).not.toBeDisabled();
    expect(reportButton).not.toBeDisabled();
    expect(likeButton.querySelector('svg')).not.toHaveClass('fill-(--color-dunder-green)');
    expect(reportButton.querySelector('svg')).not.toHaveClass('fill-(--color-dunder-red)');
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

    await user.click(screen.getByRole('button', { name: 'Report' }));
    expect(mockOnDislike).not.toHaveBeenCalled();
  });

  it('disables actions with missing callbacks when unanswered', () => {
    render(<LikeDislikePostMessage {...defaultProps} onLike={undefined} onDislike={undefined} />);
    expect(screen.getByRole('button', { name: 'Like' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Report' })).toBeDisabled();
  });

  it('forwards the disabled state to the real post and prevents both callbacks', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} isDisabled />);
    expect(screen.getByRole('article')).toHaveClass('opacity-50');
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(defaultProps.onLike).not.toHaveBeenCalled();
    expect(defaultProps.onDislike).not.toHaveBeenCalled();
  });

  it.each(['like', 'dislike'] as const)('exposes only the selected %s action as pressed', (answer) => {
    render(<LikeDislikePostMessage {...defaultProps} answer={answer} />);
    expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', String(answer === 'like'));
    expect(screen.getByRole('button', { name: 'Report' })).toHaveAttribute('aria-pressed', String(answer === 'dislike'));
    expect(screen.getByRole('button', { pressed: true })).not.toHaveClass('opacity-50');
  });

  it('treats undefined answer the same as unanswered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={undefined} />);

    expect(screen.getByRole('button', { name: 'Like' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Report' })).not.toBeDisabled();
  });

});
