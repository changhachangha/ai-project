// 파일: next.config.ts

import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    transpilePackages: ['lucide-react'],
};

// ANALYZE=true 일 때만 번들 분석 리포트(.next/analyze)를 생성한다.
export default withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})(nextConfig);
