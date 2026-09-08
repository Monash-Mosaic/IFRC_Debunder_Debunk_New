import { jest } from '@jest/globals';

declare global {
  var mockUsePathname: jest.MockedFunction<() => string>;
  var mockUseRouter: jest.MockedFunction<
    () => {
      push: jest.MockedFunction<(url: string) => void>;
      replace: jest.MockedFunction<(url: string) => void>;
      prefetch: jest.MockedFunction<(url: string) => void>;
    }
  >;
  var mockUseSearchParams: jest.MockedFunction<() => URLSearchParams>;
}

export {};
