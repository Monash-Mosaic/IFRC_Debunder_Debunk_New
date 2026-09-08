import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ChatContent from '@/components/chat-content';

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    className?: string;
  }) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  };
});

describe('ChatContent', () => {
  it('renders onboarding link and skip button', () => {
    render(<ChatContent startOnboardingText="Start chat" skipText="Skip for now" />);

    expect(screen.getByRole('link', { name: 'Start chat' })).toHaveAttribute(
      'href',
      '/chat/onboarding',
    );
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBeInTheDocument();
  });

  it('renders the onboarding illustration', () => {
    const { container } = render(
      <ChatContent startOnboardingText="Start" skipText="Skip" />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onSkipClick when skip button is clicked', async () => {
    const onSkipClick = jest.fn();
    const user = userEvent.setup();

    render(
      <ChatContent
        startOnboardingText="Start"
        skipText="Skip"
        onSkipClick={onSkipClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onSkipClick).toHaveBeenCalledTimes(1);
  });

  it('uses a no-op default onSkipClick', async () => {
    const user = userEvent.setup();

    render(<ChatContent startOnboardingText="Start" skipText="Skip" />);

    await expect(user.click(screen.getByRole('button', { name: 'Skip' }))).resolves.not.toThrow();
  });
});
