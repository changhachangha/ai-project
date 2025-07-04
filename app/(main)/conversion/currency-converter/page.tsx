import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const CurrencyConverterClient = dynamic(() => import('./CurrencyConverterClient'));

export const metadata: Metadata = {
    title: '통화 변환기 - AI 개발자 도구',
    description: '실시간 환율을 사용하여 통화를 변환합니다.',
};

export default function CurrencyConverterPage() {
    return <CurrencyConverterClient />;
}
