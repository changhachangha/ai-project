import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const AESEncryptorClient = dynamic(() => import('./AESEncryptorClient'));

export const metadata: Metadata = {
    title: 'AES 암호화/복호화 도구 - AI 개발자 도구',
    description: 'AES 알고리즘을 사용하여 텍스트를 안전하게 암호화하고 복호화합니다.',
};

export default function AESEncryptorPage() {
    return <AESEncryptorClient />;
}
