'use client';

// import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React, { useState, useCallback } from 'react';
import './globals.css';
import CommandPalette from '@/components/command-palette/CommandPalette';
import { SidebarProvider } from '@/lib/context/SidebarContext';

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

    // Add global keyboard shortcut listener
    React.useEffect(() => {
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
        <html lang='en'>
            <body className={inter.className}>
                <SidebarProvider>
                    {children}
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                        togglePalette={toggleCommandPalette}
                    />
                </SidebarProvider>
            </body>
        </html>
    );
}
