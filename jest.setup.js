import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom 환경에는 TextEncoder/TextDecoder 가 없으므로 Node 구현으로 폴리필한다.
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// 아래 목(mock)들은 DOM 전역에 의존하므로 DOM 환경에서만 설정한다.
// (`@jest-environment node` 를 쓰는 API 테스트에서 window 참조로 실패하지 않도록)
if (typeof window !== 'undefined') {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
        constructor() {}
        disconnect() {}
        observe() {}
        unobserve() {}
    };

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
        constructor() {}
        disconnect() {}
        observe() {}
        unobserve() {}
    };

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    // Mock navigator.clipboard
    if (!navigator.clipboard) {
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn(() => Promise.resolve()),
                readText: jest.fn(() => Promise.resolve('')),
            },
        });
    }

    // Mock crypto.subtle
    Object.defineProperty(window, 'crypto', {
        value: {
            subtle: {
                generateKey: jest.fn(),
                exportKey: jest.fn(),
                importKey: jest.fn(),
                sign: jest.fn(),
                verify: jest.fn(),
            },
            getRandomValues: jest.fn(),
        },
    });
}
