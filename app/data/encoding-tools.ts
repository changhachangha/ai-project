import {
  Binary,
  FileCode,
  FileText,
  Globe,
  Hash,
  Key,
  Type,
} from 'lucide-react';
// 수정된 부분: Integration 타입을 types.ts에서 가져옵니다.
import type { Integration } from './types';

export const encodingTools: Integration[] = [
  {
    id: 'base64',
    name: 'Base64 인코더/디코더',
    description: '텍스트와 바이너리 데이터를 Base64로 변환하고 디코딩합니다.',
    category: '베이스 인코딩',
    icon: FileCode,
    color: '#4CAF50',
  },
  {
    id: 'base32',
    name: 'Base32 인코더/디코더',
    description: '데이터를 Base32 형식으로 변환하고 디코딩합니다.',
    category: '베이스 인코딩',
    icon: Key,
    color: '#2196F3',
  },
  {
    id: 'hex',
    name: 'Hex(Base16) 변환기',
    description: '데이터를 16진수로 변환하고 디코딩합니다.',
    category: '베이스 인코딩',
    icon: Hash,
    color: '#9C27B0',
  },
  {
    id: 'url',
    name: 'URL 인코더/디코더',
    description: 'URL 안전한 형식으로 문자열을 변환합니다.',
    category: 'URL/텍스트 처리',
    icon: Globe,
    color: '#FF9800',
  },
  {
    id: 'html',
    name: 'HTML 인코더/디코더',
    description: 'HTML 엔티티로 특수문자를 변환합니다.',
    category: 'URL/텍스트 처리',
    icon: FileText,
    color: '#F44336',
  },
  {
    id: 'unicode',
    name: 'Unicode 변환기',
    description: '유니코드 문자와 코드포인트 간 변환을 수행합니다.',
    category: 'URL/텍스트 처리',
    icon: Type,
    color: '#3F51B5',
  },
  {
    id: 'binary',
    name: '진수 변환기',
    description: '2진수, 8진수, 10진수, 16진수 간 변환을 수행합니다.',
    category: '진수 변환',
    icon: Binary,
    color: '#607D8B',
  },
];
