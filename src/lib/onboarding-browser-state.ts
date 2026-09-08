import type { OnboardingContext } from '@/app/[locale]/chat/onboarding/_machines/onboarding-machine';

export const ONBOARDING_HISTORY_STATE_KEY = 'onboarding';

export type OnboardingHistoryPhase = 'onboarding' | 'game';

export interface OnboardingHistoryState {
  [ONBOARDING_HISTORY_STATE_KEY]: {
    phase: OnboardingHistoryPhase;
    machineState?: string;
    context?: OnboardingContext;
  };
}

export function readOnboardingHistoryState(): OnboardingHistoryState[typeof ONBOARDING_HISTORY_STATE_KEY] | null {
  if (typeof window === 'undefined') return null;

  const state = window.history.state as OnboardingHistoryState | null;
  return state?.[ONBOARDING_HISTORY_STATE_KEY] ?? null;
}

export function pushOnboardingHistoryState(
  nextState: OnboardingHistoryState[typeof ONBOARDING_HISTORY_STATE_KEY]
) {
  if (typeof window === 'undefined') return;

  const currentState = (window.history.state ?? {}) as OnboardingHistoryState;
  window.history.pushState(
    {
      ...currentState,
      [ONBOARDING_HISTORY_STATE_KEY]: nextState,
    },
    '',
    window.location.href
  );
}

export function replaceOnboardingHistoryState(
  nextState: OnboardingHistoryState[typeof ONBOARDING_HISTORY_STATE_KEY]
) {
  if (typeof window === 'undefined') return;

  const currentState = (window.history.state ?? {}) as OnboardingHistoryState;
  window.history.replaceState(
    {
      ...currentState,
      [ONBOARDING_HISTORY_STATE_KEY]: nextState,
    },
    '',
    window.location.href
  );
}
