import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const NetworkToolsClient = dynamic(() => import('./NetworkToolsClient'));

export const metadata: Metadata = {
    title: '네트워크 도구 - AI 개발자 도구',
    description: 'IP 정보 조회, 포트 확인, DNS 조회 등 네트워크 관련 도구입니다.',
};

export default function NetworkToolsPage() {
    return <NetworkToolsClient />;
}
