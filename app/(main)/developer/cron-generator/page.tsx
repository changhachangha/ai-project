import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const CronGeneratorClient = dynamic(() => import('./CronGeneratorClient'));

export const metadata: Metadata = {
    title: 'Cron 표현식 생성기 - AI 개발자 도구',
    description: 'Cron 작업 스케줄 표현식을 시각적으로 생성하고 검증합니다.',
};

export default function CronGeneratorPage() {
    return <CronGeneratorClient />;
}
