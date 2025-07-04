// app/data/developer-tools.ts
import { Network, FileCheck, Dices, Send, Calendar } from 'lucide-react';
import type { Integration } from './types';

export const developerTools: Integration[] = [
    {
        id: 'network-tools',
        name: '네트워크 도구',
        description: 'IP 정보 조회, 포트 확인, DNS 조회 등 네트워크 관련 도구입니다.',
        category: '개발자 도구',
        icon: Network,
        color: '#34495E',
    },
    {
        id: 'file-hash-calculator',
        name: '파일 해시 계산기',
        description: '업로드된 파일의 MD5, SHA1, SHA256 해시값을 계산합니다.',
        category: '개발자 도구',
        icon: FileCheck,
        color: '#E74C3C',
    },
    {
        id: 'random-data-generator',
        name: '랜덤 데이터 생성기',
        description: '테스트용 랜덤 데이터(이름, 이메일, 주소 등)를 생성합니다.',
        category: '개발자 도구',
        icon: Dices,
        color: '#3498DB',
    },
    {
        id: 'api-tester',
        name: 'API 테스터',
        description: 'RESTful API 요청을 테스트하고 응답을 확인합니다.',
        category: '개발자 도구',
        icon: Send,
        color: '#27AE60',
    },
    {
        id: 'cron-generator',
        name: 'Cron 표현식 생성기',
        description: 'Cron 작업 스케줄 표현식을 시각적으로 생성하고 검증합니다.',
        category: '개발자 도구',
        icon: Calendar,
        color: '#F39C12',
    },
];
