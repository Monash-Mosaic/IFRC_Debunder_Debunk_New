import { render, screen } from '@/test-utils/test-utils';
import BlockedHomeLink from '@/components/blocked-home-link';
import { setGameNavigationBlocked } from '@/lib/game-navigation-block';

describe('BlockedHomeLink', () => {
  afterEach(() => {
    setGameNavigationBlocked(false);
  });

  it('renders a home link when navigation is not blocked', () => {
    render(
      <BlockedHomeLink href="/" className="home-link">
        Home
      </BlockedHomeLink>
    );

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveClass('home-link');
  });

  it('renders a non-link element when navigation is blocked', () => {
    setGameNavigationBlocked(true);

    render(
      <BlockedHomeLink href="/" className="home-link">
        Home
      </BlockedHomeLink>
    );

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    const blockedElement = screen.getByText('Home');
    expect(blockedElement.tagName).toBe('SPAN');
    expect(blockedElement).toHaveAttribute('aria-disabled', 'true');
  });
});
