'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CommandPalette from '@/components/command-palette/CommandPalette';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { initWebVitals } from '@/lib/performance/web-vitals';

/**
 * 클라이언트 전용 프로바이더 묶음.
 *
 * `app/layout.tsx` 를 서버 컴포넌트로 유지하기 위해(→ `metadata` export 가능)
 * 훅/컨텍스트/브라우저 API 를 사용하는 부분만 이 컴포넌트로 분리했다.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const toggleCommandPalette = useCallback(() => {
        setIsCommandPaletteOpen((prev) => !prev);
    }, []);

    // 웹 바이탈 초기화
    useEffect(() => {
        initWebVitals();
    }, []);

    // 전역 커맨드 팔레트 단축키 (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                toggleCommandPalette();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleCommandPalette]);

    return (
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
            <ErrorBoundary>
                <SidebarProvider>
                    {children}
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                        togglePalette={toggleCommandPalette}
                    />
                </SidebarProvider>
                <Toaster />
            </ErrorBoundary>
        </ThemeProvider>
    );
}
