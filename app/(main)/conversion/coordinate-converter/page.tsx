import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const CoordinateConverterClient = dynamic(() => import('./CoordinateConverterClient'));

export const metadata: Metadata = {
    title: '좌표 변환기 - AI 개발자 도구',
    description: 'GPS, UTM, 위경도 등 다양한 좌표계를 변환합니다.',
};

export default function CoordinateConverterPage() {
    return <CoordinateConverterClient />;
}
