'use client';

// import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React, { useState, useCallback, useEffect } from 'react';
import './globals.css';
import CommandPalette from '@/components/command-palette/CommandPalette';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { initWebVitals } from '@/lib/performance/web-vitals';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//     title: 'DevTools Hub',
//     description: 'A collection of developer tools.',
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const toggleCommandPalette = useCallback(() => {
        setIsCommandPaletteOpen((prev) => !prev);
    }, []);

    // 웹 바이탈 초기화
    useEffect(() => {
        initWebVitals();
    }, []);

    // Add global keyboard shortcut listener
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
        <html lang='en' suppressHydrationWarning>
            <body className={inter.className}>
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
            </body>
        </html>
    );
}
