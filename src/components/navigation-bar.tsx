'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, routing, usePathname } from '@/i18n/routing';
import { Home, MessageSquare, PieChart, Upload, User } from 'lucide-react';
import { STORAGE_KEYS, storage } from '@/lib/local-storage';
import Toast from '@/components/toast';

interface NavItem {
  href: keyof typeof routing.pathnames;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleNavItemClick = (href: NavItem['href']) => {
    if (href !== '/') return;

    const onboardingCompleted = storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
    if (!onboardingCompleted) return;

    setToastMessage('You cannot exit to home in between the quiz!');
    setShowToast(true);
  };

  const navItems: NavItem[] = [
    {
      href: '/',
      labelKey: 'home',
      icon: <Home size={24} strokeWidth={2} />,
      activeIcon: <Home size={24} stroke="currentColor" />,
    },
    {
      href: '/chat',
      labelKey: 'chat',
      icon: <MessageSquare size={24} strokeWidth={2} />,
      activeIcon: <MessageSquare size={24} stroke="currentColor" />,
    },
    {
      href: '/analytics',
      labelKey: 'analytics',
      icon: <PieChart size={24} strokeWidth={2} />,
      activeIcon: <PieChart size={24} stroke="currentColor" />,
    },
    {
      href: '/share',
      labelKey: 'share',
      icon: <Upload size={24} strokeWidth={2} />,
      activeIcon: <Upload size={24} stroke="currentColor" />,
    },
    {
      href: '/profile',
      labelKey: 'profile',
      icon: <User size={24} strokeWidth={2} />,
      activeIcon: <User size={24} stroke="currentColor" />,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-24 z-40 hidden h-[calc(100vh-6rem)] w-20 flex-col border-[#E8E9ED] bg-white md:flex ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l rtl:border-r-0">
        <nav className="flex flex-1 flex-col justify-center items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavItemClick(item.href)}
                className={`group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                  isActive ? 'text-(--color-ifrc-red)' : 'text-(--color-ifrc-blue) hover:text-(--color-ifrc-red)'
                }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8E9ED] bg-white md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavItemClick(item.href)}
                className={`group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                  isActive ? 'text-(--color-ifrc-red)' : 'text-(--color-ifrc-blue) hover:text-(--color-ifrc-red)'
                }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for devices with home indicator */}
        <div className="h-safe-area bg-white" />
      </nav>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => {
          setShowToast(false);
          setToastMessage('');
        }}
      />
    </>
  );
}
