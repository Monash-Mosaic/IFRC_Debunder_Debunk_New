import { act, renderHook } from '@testing-library/react';
import { useOnboardingMachine, type OnboardingEvent, type OnboardingOptionEvent } from '@/app/[locale]/chat/onboarding/_machines/onboarding-machine';

const FIXED_DATE = new Date('2020-08-20T00:12:00.000Z').getTime();

// Helper to normalize state for snapshots by replacing dynamic fields with expect.any() matchers
// Jest serializes expect.any() to "Any<String>" and "Any<Number>" in snapshots
const normalizeForSnapshot = (state: any) => {
  const normalized = JSON.parse(JSON.stringify(state));
  if (normalized.context?.messages) {
    normalized.context.messages = normalized.context.messages.map((msg: any) => {
      const { id, timestamp, ...rest } = msg;
      return {
        ...rest,
        id: expect.any(String),
        timestamp: expect.any(Number),
      };
    });
  }
  return normalized;
};

describe('onboardingMachine', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(FIXED_DATE);
  });

  it('matches snapshot after typing timeout shows greeting message', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const normalized = normalizeForSnapshot(result.current[0]);
    expect(normalized).toMatchSnapshot();
  });

  it('routes option1-step1 into completed so the game begins directly', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option1-step1',
        optionText: "Let's do this",
      } as OnboardingOptionEvent)
    );

    expect(result.current[0].value).toBe('completed');
  });

  it('matches snapshot following step1 -> step2 -> step3 path', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized1 = normalizeForSnapshot(result.current[0]);
    expect(normalized1).toMatchSnapshot('after step1 -> step2');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const normalized2 = normalizeForSnapshot(result.current[0]);
    expect(normalized2).toMatchSnapshot('after step2 typing timeout');

    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized3 = normalizeForSnapshot(result.current[0]);
    expect(normalized3).toMatchSnapshot('after step2 -> step3');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const normalized4 = normalizeForSnapshot(result.current[0]);
    expect(normalized4).toMatchSnapshot('after step3 typing timeout');
  });

  it('matches snapshot going through practice and completing when the question is answered', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step3',
        optionText: 'Show me an example first?',
      } as OnboardingOptionEvent)
    );

    const normalized1 = normalizeForSnapshot(result.current[0]);
    expect(normalized1).toMatchSnapshot('after selecting option2-step3 (practice state)');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const normalized2 = normalizeForSnapshot(result.current[0]);
    expect(normalized2).toMatchSnapshot('after practice typing timeout');

    act(() =>
      result.current[1]({
        type: 'PRACTICE_ANSWERED',
      })
    );
    const normalized3 = normalizeForSnapshot(result.current[0]);
    expect(normalized3).toMatchSnapshot('after practice answered (completed state)');
  });

  it('routes option3-step1 into practice for the example path', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option3-step1',
        optionText: 'Option 3',
      } as OnboardingOptionEvent)
    );

    expect(result.current[0].value).toBe('practice');
  });

  it('routes entering the feed from step3 to completed', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option1-step3',
        optionText: 'Okay, entering the feed now!',
      } as OnboardingOptionEvent)
    );

    expect(result.current[0].value).toBe('completed');
  });

  it('routes I can spot fake news from step2 into completed', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option1-step2',
        optionText: 'Option 1',
      } as OnboardingOptionEvent)
    );

    expect(result.current[0].value).toBe('completed');
  });

  it('routes wait how do I know from step2 into practice', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option3-step2',
        optionText: 'Option 3',
      } as OnboardingOptionEvent)
    );

    expect(result.current[0].value).toBe('practice');
  });

  it('matches snapshot accumulating user messages when selecting options', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized1 = normalizeForSnapshot(result.current[0]);
    expect(normalized1).toMatchSnapshot('after first option selection');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized2 = normalizeForSnapshot(result.current[0]);
    expect(normalized2).toMatchSnapshot('after second option selection');
  });
});
