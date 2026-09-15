// app/data/developer-tools.ts
import { FileCheck, Dices, Calendar } from 'lucide-react';
import type { Integration } from './types';

export const developerTools: Integration[] = [
    {
        id: 'file-hash-calculator',
        name: '파일 해시 계산기',
        description: '업로드된 파일의 MD5, SHA1, SHA256 해시값을 계산합니다.',
        category: '개발자 도구',
        section: 'developer',
        icon: FileCheck,
        color: '#E74C3C',
        tags: ['해시', '파일', '무결성', '체크섬'],
        related: ['hash-tool', 'image-converter'],
    },
    {
        id: 'random-data-generator',
        name: '랜덤 데이터 생성기',
        description: '테스트용 랜덤 데이터(이름, 이메일, 주소 등)를 생성합니다.',
        category: '개발자 도구',
        section: 'developer',
        icon: Dices,
        color: '#3498DB',
        tags: ['랜덤', '더미', '데이터', '생성'],
        related: ['uuid-generator', 'lorem-ipsum', 'password-generator'],
    },
    {
        id: 'cron-generator',
        name: 'Cron 표현식 생성기',
        description: 'Cron 작업 스케줄 표현식을 시각적으로 생성하고 검증합니다.',
        category: '개발자 도구',
        section: 'developer',
        icon: Calendar,
        color: '#F39C12',
        tags: ['Cron', '스케줄', '표현식', '시간'],
        related: ['timestamp-converter'],
    },
];
