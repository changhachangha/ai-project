import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/app-providers';
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/site';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} - 개발 도구 허브`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: SITE_KEYWORDS,
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        title: `${SITE_NAME} - 개발 도구 허브`,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        locale: 'ko_KR',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_NAME} - 개발 도구 허브`,
        description: SITE_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
        },
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='ko' suppressHydrationWarning>
            <body className={inter.className}>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
