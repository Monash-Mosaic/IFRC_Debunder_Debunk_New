import Image from 'next/image';

type ChatHeadlineProps = {
  name: string;
};

export default function ChatHeadline({ name }: ChatHeadlineProps) {
  return (
    //ml-20 to offset the left nav bar
    <div className="hidden md:block px-4 ml-20">
      <div className="flex items-center gap-3 mb-2">
        <Image src="/images/chat-avatar-icon.png" alt={name} width={32} height={32} />
        <h2 className="font-bold text-black text-lg">{name}</h2>
      </div>
      <div className="border-t border-black" />
    </div>
  );
}
