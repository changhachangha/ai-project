// 파일: next.config.ts

// import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    output: 'standalone' as const,
    images: {
        remotePatterns: [
            {
                protocol: 'https' as const,
                hostname: 'raw.githubusercontent.com',
                port: '',
                pathname: '/walkxcode/devtool-ui/main/public/assets/**', // githubusercontent.com에 있는 이미지를 허용하도록 패턴을 추가
            },
        ],
    },
    transpilePackages: ['lucide-react', 'vaul'], // 예시: 특정 패키지 트랜스파일링
    // async redirects() { // 삭제 시작
    //   return [
    //     {
    //       source: '/',
    //       destination: '/integrations',
    //       permanent: true,
    //     },
    //   ];
    // }, // 삭제 끝
    /* config options here */
};

export default withPWAConfig(nextConfig);
