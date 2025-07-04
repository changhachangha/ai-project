import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const TOTPGeneratorClient = dynamic(() => import('./TOTPGeneratorClient'));

export const metadata: Metadata = {
    title: '2FA QR 코드 생성기 - AI 개발자 도구',
    description: 'TOTP 기반 2단계 인증용 QR 코드를 생성합니다.',
};

export default function TOTPGeneratorPage() {
    return <TOTPGeneratorClient />;
}
