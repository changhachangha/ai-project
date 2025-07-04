import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const FileHashCalculatorClient = dynamic(() => import('./FileHashCalculatorClient'));

export const metadata: Metadata = {
    title: '파일 해시 계산기 - AI 개발자 도구',
    description: '업로드된 파일의 MD5, SHA1, SHA256 해시값을 계산합니다.',
};

export default function FileHashCalculatorPage() {
    return <FileHashCalculatorClient />;
}
