// app/data/security-tools.ts
import { Key, KeyRound, Hash } from 'lucide-react';
import type { Integration } from './types';

export const securityTools: Integration[] = [
    {
        id: 'rsa-key-generator',
        name: 'RSA 키 생성기',
        description: '공개키/비공개키 쌍을 생성합니다.',
        category: '보안/암호화',
        icon: Key,
        color: '#34495E',
    },
    {
        id: 'public-key-extractor',
        name: '공개키 추출기',
        description: '개인키에서 공개키를 추출하고 다양한 형식으로 변환합니다.',
        category: '보안/암호화',
        icon: KeyRound,
        color: '#2C3E50',
    },
    {
        id: 'hash-tool',
        name: '해시 생성기',
        description: 'SHA-512, SHA-256 등 다양한 해시 알고리즘으로 텍스트를 변환하고 검증합니다.',
        category: '보안/암호화',
        icon: Hash,
        color: '#8E44AD',
    },
];
