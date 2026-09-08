'use client';

import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function HomeContent() {
  const t = useTranslations('chat');
  const router = useRouter();

  const handleSkipClick = () => {
    router.push({
      pathname: '/chat/onboarding',
      query: { start: 'game' },
    });
  };

  return (
    <ChatContent
      startOnboardingText={t('startOnboarding')}
      skipText={t('skip')}
      onSkipClick={handleSkipClick}
    />
  );
}
