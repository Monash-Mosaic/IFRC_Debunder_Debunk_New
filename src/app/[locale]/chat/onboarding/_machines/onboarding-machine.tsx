import useStateMachine, { t } from '@cassiozen/usestatemachine';

export type MessageSender = 'paula' | 'echo' | 'user';

export interface BaseMessage {
  id: string;
  sender: MessageSender;
  type: string;
  timestamp: number;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  text: string;
}

export interface PostMessage extends BaseMessage {
  type: 'post';
  post: {
    name: string;
    handle: string;
    contentKey: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  };
}

export interface TypingMessage extends BaseMessage {
  type: 'typing';
  typing: boolean;
};

export type Message = TextMessage | PostMessage | TypingMessage;

export interface OnboardingContext {
  messages: Message[];
  selectedOptions: string[];
  typing: boolean;
}

export type OnboardingOptionEvent = {
  type:
    | 'option1-step1'
    | 'option2-step1'
    | 'option3-step1'
    | 'option1-step2'
    | 'option2-step2'
    | 'option3-step2'
    | 'option1-step3'
    | 'option2-step3';
  optionText: string;
};

export type OnboardingEvent =
  | { type: '$$initial' }
  | OnboardingOptionEvent
  | { type: 'PRACTICE_ANSWERED' };

export interface OnboardingOption {
  id: string;
  translationKey: string;
}

const generateMessageId = () => `msg-${crypto.randomUUID()}`;

const createTypingMessage = (sender: MessageSender): TypingMessage => ({
  id: generateMessageId(),
  sender,
  type: 'typing',
  typing: true,
  timestamp: Date.now(),
});

const createMessage = (sender: MessageSender, text: string): TextMessage => ({
  id: generateMessageId(),
  sender,
  type: 'text',
  text,
  timestamp: Date.now(),
});

export const createPostMessage = (
  sender: MessageSender,
  post: PostMessage['post']
): PostMessage => ({
  id: generateMessageId(),
  sender,
  type: 'post',
  post,
  timestamp: Date.now(),
});

type EffectArgs = {
  context: OnboardingContext;
  event?: OnboardingEvent;
  setContext: (updater: (context: OnboardingContext) => OnboardingContext) => void;
  send: (event: OnboardingEvent) => void;
};

const appendUserSelection = (
  context: OnboardingContext,
  event: OnboardingOptionEvent
): OnboardingContext => ({
  ...context,
  messages: [...context.messages, createMessage('user', event.optionText)],
  selectedOptions: [...context.selectedOptions, event.type],
});

const getCurrentOptions = (state: string): OnboardingOption[] => {
  switch (state) {
    case 'initial':
      return [
        {
          id: 'option1-step1',
          translationKey: 'step1.option1',
        },
        {
          id: 'option2-step1',
          translationKey: 'step1.option2',
        },
        {
          id: 'option3-step1',
          translationKey: 'step1.option3',
        },
      ];
    case 'step2':
      return [
        {
          id: 'option1-step2',
          translationKey: 'step2.option1',
        },
        {
          id: 'option2-step2',
          translationKey: 'step2.option2',
        },
        {
          id: 'option3-step2',
          translationKey: 'step2.option3',
        },
      ];
    case 'step3':
      return [
        {
          id: 'option1-step3',
          translationKey: 'step3.option1',
        },
        {
          id: 'option2-step3',
          translationKey: 'step3.option2',
        },
      ];
    default:
      return [];
  }
};

export const initialContextValue: OnboardingContext = {
  messages: [createTypingMessage('paula')],
  selectedOptions: [],
  typing: true,
};
export const useOnboardingMachine = (
  initialContext: OnboardingContext = initialContextValue,
  initialState: string = 'initial'
) => {
  const ONBOARDING_TYPING_TIMEOUT = 1000;
  const [state, send] = useStateMachine({
    id: 'onboarding',
    schema: {
      context: t<OnboardingContext>(),
    },
    context: initialContext,
    initial: initialState,
    states: {
      initial: {
        on: {
          'option1-step1': 'step3',
          'option2-step1': 'step2',
          'option3-step1': 'step3',
        },
        effect({ setContext, event }: EffectArgs) {
          if (!event) return;
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [...context.messages.slice(0, -1), createMessage('paula', 'step1.greeting')],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
      },
      step2: {
        on: {
          'option1-step2': 'step3',
          'option2-step2': 'step3',
          'option3-step2': 'step3',
        },
        effect({ setContext, event }: EffectArgs) {
          if (!event || event.type === '$$initial') return;

          setContext((context: OnboardingContext) => {
            const withSelection = appendUserSelection(context, event as OnboardingOptionEvent);

            return {
              ...withSelection,
              messages: [...withSelection.messages, createTypingMessage('paula')],
              typing: true,
            };
          });
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [
                  ...context.messages.slice(0, -1),
                  createMessage('paula', 'step2.explanation'),
                  createPostMessage('echo', {
                    name: 'Echo',
                    handle: '@climate_truth_warrior',
                    contentKey: 'echoPost',
                    mediaUrl: '/images/example/echo-post-img.jpg',
                    mediaType: 'image',
                  }),
                ],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
      },
      step3: {
        effect({ setContext, event }: EffectArgs) {
          if (!event || event.type === '$$initial') return;

          setContext((context: OnboardingContext) => {
            const withSelection = appendUserSelection(context, event as OnboardingOptionEvent);

            return {
              ...withSelection,
              messages: [...withSelection.messages, createTypingMessage('paula')],
              typing: true,
            };
          });
          const timeout = setTimeout(() => {
            const tipKey =
              event.type === 'option2-step2'
                ? 'step3.tipsAgree'
                : event.type === 'option3-step1'
                  ? 'step3.tipsShowMe'
                  : 'step3.tips';
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [...context.messages.slice(0, -1), createMessage('paula', tipKey)],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
        on: {
          'option1-step3': 'practice',
          'option2-step3': 'completed',
        },
      },
      practice: {
        effect({ setContext, event }: EffectArgs) {
          if (!event || event.type === '$$initial') return;

          setContext((context: OnboardingContext) => {
            const updated = appendUserSelection(context, event as OnboardingOptionEvent);
            return {
              ...updated,
              messages: [
                ...updated.messages,
                createTypingMessage('paula'),
              ],
              typing: true,
            };
          });
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [...context.messages.slice(0, -1),
                  createMessage('paula', 'practice.explanation'),
                ],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
        on: {
          PRACTICE_ANSWERED: 'completed',
        },
      },
      completed: {
        type: 'final',
      },
    },
  });

  const currentState = state.value as string;
  const currentOptions = getCurrentOptions(currentState);
  const isCompleted = currentState === 'completed';

  return [
    state,
    send,
    {
      currentOptions,
      isCompleted,
    },
  ] as const;
};
