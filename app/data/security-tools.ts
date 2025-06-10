// app/data/security-tools.ts
import {
  Shield,
  KeyRound,
  Lock,
  Fingerprint,
  ShieldCheck,
  Key,
} from 'lucide-react';
import type { Integration } from './types';

export const securityTools: Integration[] = [
  {
    id: 'hash-generator',
    name: '해시 생성기',
    description: 'MD5, SHA-1, SHA-256, SHA-512 등의 해시를 생성합니다.',
    category: '보안/암호화',
    icon: Shield,
    color: '#E74C3C',
  },
  {
    id: 'password-generator',
    name: '비밀번호 생성기',
    description: '안전하고 강력한 무작위 비밀번호를 생성합니다.',
    category: '보안/암호화',
    icon: KeyRound,
    color: '#8E44AD',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT 디코더/검증기',
    description: 'JWT 토큰을 디코딩하고 페이로드를 확인합니다.',
    category: '보안/암호화',
    icon: Lock,
    color: '#3498DB',
  },
  {
    id: 'uuid-generator',
    name: 'UUID 생성기',
    description: 'v1, v4, v5 형식의 UUID를 생성합니다.',
    category: '보안/암호화',
    icon: Fingerprint,
    color: '#1ABC9C',
  },
  {
    id: 'bcrypt-generator',
    name: 'Bcrypt 해시 생성기',
    description: '비밀번호를 bcrypt로 해시하고 검증합니다.',
    category: '보안/암호화',
    icon: ShieldCheck,
    color: '#E67E22',
  },
  {
    id: 'rsa-key-generator',
    name: 'RSA 키 생성기',
    description: '공개키/비공개키 쌍을 생성합니다.',
    category: '보안/암호화',
    icon: Key,
    color: '#34495E',
  },
];