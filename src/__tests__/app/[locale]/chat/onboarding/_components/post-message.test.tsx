import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import PostMessage from '@/app/[locale]/chat/onboarding/_components/post-message';
import { InteractionMode } from '@/contents/en';

// Mock EchoAvatar
jest.mock('@/app/[locale]/chat/onboarding/_icons/echo-avatar', () => {
  return function MockEchoAvatar() {
    return <div data-testid="echo-avatar">Echo Avatar</div>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('PostMessage', () => {
  const defaultContent = (
    <div>
      <p>So much for 'global warming'! Record freezing temperatures in rural Victoria today.</p>
      <p>#ClimateHoax #GlobalWarming</p>
    </div>
  );

  const defaultUser = {
    id: 'echo',
    name: 'Echo',
    handle: '@climate_truth_warrior',
    avatar: <div data-testid="echo-avatar">Echo Avatar</div>,
    isUser: false,
  };

  const defaultProps = {
    user: defaultUser,
    content: defaultContent,
  };

  beforeEach(() => {
    jest.mocked(useTranslations).mockReturnValue(((key: string) => ({
      like: 'Like',
      report: 'Report',
    })[key] ?? key) as ReturnType<typeof useTranslations>);
  });

  it('renders the post with default props', () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByText('Echo')).toBeInTheDocument();
    expect(screen.getByText('@climate_truth_warrior')).toBeInTheDocument();
    expect(screen.getByText(/So much for 'global warming'/)).toBeInTheDocument();
  });

  it('renders custom name and handle', () => {
    const customUser = {
      ...defaultUser,
      name: 'Custom Name',
      handle: '@custom_handle',
    };
    render(<PostMessage {...defaultProps} user={customUser} />);

    expect(screen.getByText('Custom Name')).toBeInTheDocument();
    expect(screen.getByText('@custom_handle')).toBeInTheDocument();
  });

  it('renders custom content', () => {
    const customContent = <div>Custom post content</div>;
    render(<PostMessage user={defaultUser} content={customContent} />);

    expect(screen.getByText('Custom post content')).toBeInTheDocument();
  });

  it('renders image when mediaUrl and mediaType image are provided', () => {
    render(<PostMessage {...defaultProps} mediaUrl="/test-image.jpg" mediaType="image" />);

    const image = screen.getByAltText('Echo post');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('renders video icon when mediaType is video', () => {
    const { container } = render(
      <PostMessage {...defaultProps} mediaUrl="/test-video.mp4" mediaType="video" />
    );

    const videoIcon = container.querySelector('.lucide-video');
    expect(videoIcon).toBeInTheDocument();
  });

  it('does not render media when mediaUrl is not provided', () => {
    const { container } = render(<PostMessage {...defaultProps} />);

    const mediaContainer = container.querySelector('.aspect-video');
    expect(mediaContainer).not.toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} onLike={mockOnLike} />);

    const likeButton = screen.getByLabelText('Like');
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledTimes(1);
  });

  it('calls onDislike when Report is clicked', async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} onDislike={mockOnDislike} />);

    const dislikeButton = screen.getByLabelText('Report');
    await user.click(dislikeButton);

    expect(mockOnDislike).toHaveBeenCalledTimes(1);
  });

  it('renders no actions for an informational post by default', () => {
    render(<PostMessage {...defaultProps} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([InteractionMode.None, InteractionMode.LikeReport])('keeps Comment and Share hidden in %s mode even with callbacks', (interactionMode) => {
    render(<PostMessage {...defaultProps} interactionMode={interactionMode} onComment={jest.fn()} onShare={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /Comment|Share|Send/ })).not.toBeInTheDocument();
  });

  it('requires an explicit interaction mode even when answer callbacks exist', () => {
    render(<PostMessage {...defaultProps} onLike={jest.fn()} onDislike={jest.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders prominent Like and Report actions in like-report mode', () => {
    const { container } = render(
      <PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} />
    );

    const likeButton = screen.getByRole('button', { name: 'Like' });
    const reportButton = screen.getByRole('button', { name: 'Report' });

    expect(likeButton).toHaveTextContent('Like');
    expect(reportButton).toHaveTextContent('Report');
    expect(likeButton).toHaveClass('min-h-12', 'w-full');
    expect(reportButton).toHaveClass('min-h-12', 'w-full');
    expect(container.querySelector('.lucide-thumbs-up')).toBeInTheDocument();
    expect(container.querySelector('.lucide-circle-alert')).toBeInTheDocument();
    expect(container.querySelector('.lucide-thumbs-down')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Dislike')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Comment')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Share')).not.toBeInTheDocument();
  });

  it('maps the Report action to the existing onDislike callback', async () => {
    const onDislike = jest.fn();
    const user = userEvent.setup();
    render(
      <PostMessage
        {...defaultProps}
        interactionMode={InteractionMode.LikeReport}
        onDislike={onDislike}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Report' }));

    expect(onDislike).toHaveBeenCalledTimes(1);
  });

  it('disables both actions when the entire post is disabled', async () => {
    const onLike = jest.fn();
    const onDislike = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} isDisabled onLike={onLike} onDislike={onDislike} />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(onLike).not.toHaveBeenCalled();
    expect(onDislike).not.toHaveBeenCalled();
  });

  it('honours per-action disabling independently', () => {
    const { rerender } = render(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} likeDisabled onLike={jest.fn()} onDislike={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Like' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Report' })).toBeEnabled();
    rerender(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} dislikeDisabled onLike={jest.fn()} onDislike={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Like' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Report' })).toBeDisabled();
  });

  it('disables actions without callbacks', () => {
    render(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} />);
    expect(screen.getByRole('button', { name: 'Like' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Report' })).toBeDisabled();
  });

  it('supports keyboard activation for both actions', async () => {
    const onLike = jest.fn();
    const onDislike = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} interactionMode={InteractionMode.LikeReport} onLike={onLike} onDislike={onDislike} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Like' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Report' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onDislike).toHaveBeenCalledTimes(1);
  });

  it('renders Echo avatar', () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByTestId('echo-avatar')).toBeInTheDocument();
  });

  it('handles empty content', () => {
    render(<PostMessage user={defaultUser} content={<div />} />);

    expect(screen.getByText('Echo')).toBeInTheDocument();
    expect(screen.getByText('@climate_truth_warrior')).toBeInTheDocument();
  });
});
