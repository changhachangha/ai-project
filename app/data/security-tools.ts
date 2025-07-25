// app/data/security-tools.ts
import { Key, KeyRound, Hash, Shield, Lock, FileKey, Award, Smartphone } from 'lucide-react';
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
    {
        id: 'jwt-decoder',
        name: 'JWT 토큰 디코더',
        description: 'JWT 토큰을 디코딩하고 헤더, 페이로드, 서명을 검증합니다.',
        category: '보안/암호화',
        icon: Shield,
        color: '#E74C3C',
    },
    {
        id: 'password-generator',
        name: '패스워드 생성기',
        description: '안전한 패스워드를 생성하고 강도를 평가합니다.',
        category: '보안/암호화',
        icon: Lock,
        color: '#27AE60',
    },
    {
        id: 'aes-encryptor',
        name: 'AES 암호화/복호화',
        description: 'AES 알고리즘을 사용하여 텍스트를 암호화하고 복호화합니다.',
        category: '보안/암호화',
        icon: FileKey,
        color: '#D35400',
    },
    {
        id: 'certificate-analyzer',
        name: '인증서 정보 분석기',
        description: 'SSL/TLS 인증서 정보를 분석하고 유효성을 검사합니다.',
        category: '보안/암호화',
        icon: Award,
        color: '#7F8C8D',
    },
    {
        id: 'totp-generator',
        name: '2FA QR 코드 생성기',
        description: 'TOTP 기반 2단계 인증용 QR 코드를 생성합니다.',
        category: '보안/암호화',
        icon: Smartphone,
        color: '#9B59B6',
    },
];
