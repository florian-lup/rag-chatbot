// Test setup file for Vitest
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock environment variables if needed
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');

// Browser-specific mocks (only apply when window is defined)
if (typeof window !== 'undefined') {
  // Global test utilities
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn() as () => void, // deprecated
      removeListener: vi.fn() as () => void, // deprecated
      addEventListener: vi.fn() as () => void,
      removeEventListener: vi.fn() as () => void,
      dispatchEvent: vi.fn() as () => boolean,
    })),
  });
}
