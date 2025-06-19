// app/data/security-tools.ts
import { Key } from 'lucide-react';
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
];
