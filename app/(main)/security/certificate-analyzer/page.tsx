import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const CertificateAnalyzerClient = dynamic(() => import('./CertificateAnalyzerClient'));

export const metadata: Metadata = {
    title: '인증서 분석기 - AI 개발자 도구',
    description: 'SSL/TLS 인증서 정보를 분석하고 유효성을 검사합니다.',
};

export default function CertificateAnalyzerPage() {
    return <CertificateAnalyzerClient />;
}
