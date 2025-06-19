import { Clock, Palette } from 'lucide-react';
import type { Integration } from './types';

export const conversionTools: Integration[] = [
    {
        id: 'timestamp-converter',
        name: '타임스탬프 변환기',
        description: 'UTC 타임스탬프를 읽기 쉬운 날짜와 시간으로 변환합니다.',
        category: '시간/날짜',
        icon: Clock,
        color: '#607D8B',
    },
    {
        id: 'color-converter',
        name: '색상 변환기',
        description: 'RGB, HEX, HSL 등 다양한 색상 형식 간 변환을 수행합니다.',
        category: '색상',
        icon: Palette,
        color: '#FF5722',
    },
];
