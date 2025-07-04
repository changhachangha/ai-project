import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const APITesterClient = dynamic(() => import('./APITesterClient'));

export const metadata: Metadata = {
    title: 'API 테스터 - AI 개발자 도구',
    description: 'RESTful API 요청을 테스트하고 응답을 확인합니다.',
};

export default function APITesterPage() {
    return <APITesterClient />;
}
