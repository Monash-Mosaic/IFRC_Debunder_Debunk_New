'use client';

import { useTranslations } from 'next-intl';
import PaulaAvatar from './onboarding/_icons/paula-avatar';
import AlexAvatar from './onboarding/_icons/alex-avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChatListItemProps {
  name: string;
  avatar: React.ReactNode;
  subText: string;
  hasSubText?: boolean;
  isDisabled?: boolean;
}

function ChatListItem({
  name,
  avatar,
  subText,
  hasSubText = false,
  isDisabled = false,
}: ChatListItemProps) {
  return (
    <Link
      className={cn(
        'flex items-center justify-between w-full rounded-3xl border border-dashed border-[#011E41] bg-[#E4EAF3] px-6 py-4 min-h-[60px]',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      href="/chat/onboarding"
      onClick={(e) => {
        if (isDisabled) e.preventDefault();
      }}
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 flex items-center justify-center">{avatar}</span>
        <span className="text-lg font-bold text-[#011E41]">{name}</span>
      </div>
      {hasSubText && (
        <div className="right-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <span className="text-sm font-medium text-red-600">{subText}</span>
        </div>
      )}
    </Link>
  );
}

export default function ChatPage() {
  const t = useTranslations('chat.list');

  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6 px-4">
      <div className="flex justify-center items-center text-2xl font-bold text-[#011E41] pt-4">
        {t('title')}
      </div>
      <div className="mx-auto flex items-start h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        <div className="w-full space-y-4 pt-4">
          <ChatListItem
            name={t('paula')}
            avatar={<PaulaAvatar />}
            subText={t('newMessage')}
            hasSubText={true}
          />
          <ChatListItem
            name={t('alex')}
            avatar={<AlexAvatar />}
            subText={t('comingSoon')}
            hasSubText={true}
            isDisabled={true}
          />
        </div>
      </div>
    </div>
  );
}
