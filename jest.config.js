const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        'hooks/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'lcov', 'json-summary'],
    // 커버리지 하한선은 "순수 로직" 계층(lib/**)에만 건다.
    // app/** · components/** 는 UI 컴포넌트 비중이 커서 전역 하한선을 걸면
    // 노이즈만 커지므로, 전역 수치는 CI 아티팩트로 추적한다.
    coverageThreshold: {
        './lib/tools/': {
            statements: 80,
            branches: 60,
            functions: 90,
            lines: 80,
        },
        './lib/utils/': {
            statements: 85,
            branches: 70,
            functions: 95,
            lines: 85,
        },
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
