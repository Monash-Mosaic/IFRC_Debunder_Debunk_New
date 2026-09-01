'use client';
import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';

const defaultProps = {
  postId: 'mcq-1',
  user: {
    id: 'echo',
    name: 'Echo',
    handle: '@echo',
    avatar: null,
    isUser: false,
  },
  content: <div>What is 2+2?</div>,
  options: [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
    { id: 'c', label: 'Option C' },
  ],
  correctOptionId: 'a',
  answer: null as string | null,
  onAnswer: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MCQPostMessage', () => {
  describe('rendering', () => {
    it('renders user name and handle', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByText('Echo')).toBeInTheDocument();
      expect(screen.getByText('@echo')).toBeInTheDocument();
    });

    it('renders question content', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    it('renders all option buttons', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Option A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Option B' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Option C' })).toBeInTheDocument();
    });

    it('does not render unrelated social actions', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.queryByRole('button', { name: 'Like' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Dislike' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Report' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Comment' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
    });
  });

  describe('option interaction', () => {
    it('options are enabled when not answered', () => {
      render(<MCQPostMessage {...defaultProps} answer={null} />);
      expect(screen.getByRole('button', { name: 'Option A' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option B' })).not.toBeDisabled();
    });

    it('options are disabled when answered', () => {
      render(<MCQPostMessage {...defaultProps} answer="a" />);
      expect(screen.getByRole('button', { name: 'Option A' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option B' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option C' })).toBeDisabled();
    });

    it('options are disabled when isDisabled is true', () => {
      render(<MCQPostMessage {...defaultProps} answer={null} isDisabled={true} />);
      expect(screen.getByRole('button', { name: 'Option A' })).toBeDisabled();
    });

    it('calls onAnswer with postId and optionId when option is clicked', async () => {
      const mockOnAnswer = jest.fn();
      const user = userEvent.setup();
      render(<MCQPostMessage {...defaultProps} answer={null} onAnswer={mockOnAnswer} />);

      await user.click(screen.getByRole('button', { name: 'Option B' }));

      expect(mockOnAnswer).toHaveBeenCalledWith('mcq-1', 'b');
    });

    it('does not call onAnswer when already answered', async () => {
      const mockOnAnswer = jest.fn();
      const user = userEvent.setup();
      render(<MCQPostMessage {...defaultProps} answer="a" onAnswer={mockOnAnswer} />);

      await user.click(screen.getByRole('button', { name: 'Option A' }));

      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });
});
