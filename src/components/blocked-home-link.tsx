'use client';

import { Link } from '@/i18n/routing';
import { useGameNavigationBlocked } from '@/lib/game-navigation-block';

interface BlockedHomeLinkProps {
  href: '/';
  className?: string;
  children: React.ReactNode;
}

export default function BlockedHomeLink({ href, className, children }: BlockedHomeLinkProps) {
  const isBlocked = useGameNavigationBlocked();

  if (isBlocked) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
