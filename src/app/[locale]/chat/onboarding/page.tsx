'use client';

import { Suspense } from 'react';
import loadDynamicComponent from 'next/dynamic';
import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import ChatHeadline from './_components/chat-headline';
import { CHAT_USERS } from '../_constants/users';

export const dynamic = 'force-dynamic';

function OnboardingLoadingFallback() {
  const t = useTranslations('common');
  return <Loading displayText={t('loading')} />;
}

const OnboardingFlow = loadDynamicComponent(() => import('./_components/onboarding-flow'), {
  ssr: false,
  loading: OnboardingLoadingFallback,
});

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6">
      <ChatHeadline name={CHAT_USERS.paula.name} />
      <div className="mx-auto flex items-center justify-center h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        <Suspense fallback={<OnboardingLoadingFallback />}>
          <OnboardingFlow />
        </Suspense>
      </div>
    </div>
  );
}
