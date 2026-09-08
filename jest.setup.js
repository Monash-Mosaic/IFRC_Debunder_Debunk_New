// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom does not implement ResizeObserver (used by carousel vertical layout)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Embla uses matchMedia for breakpoints; jsdom may omit it or return incomplete objects
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Embla uses IntersectionObserver for slides-in-view; not in jsdom by default
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    queueMicrotask(() => {
      this.callback(
        [
          {
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: {},
            intersectionRect: {},
            rootBounds: null,
            time: Date.now(),
          },
        ],
        this,
      );
    });
  }
  unobserve() {}
  disconnect() {}
};

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key) => key),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(() => Promise.resolve((key) => key)),
  getMessages: jest.fn(() => Promise.resolve({})),
  setRequestLocale: jest.fn(),
  getLocale: jest.fn(() => Promise.resolve('en')),
}));

// Mock next/navigation
const mockUsePathname = jest.fn(() => '/');
const mockUseRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}));
const mockUseSearchParams = jest.fn(() => new URLSearchParams());

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock next-intl routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  redirect: jest.fn(),
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
  getPathname: jest.fn(),
}));

// Make mocks available globally for tests
global.mockUsePathname = mockUsePathname;
global.mockUseRouter = mockUseRouter;
global.mockUseSearchParams = mockUseSearchParams;
