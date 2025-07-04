// app/data/text-tools.ts
import { FileJson, GitCompare, Regex, FileText, Table, Database, FileType } from 'lucide-react';
import type { Integration } from './types';

export const textTools: Integration[] = [
    {
        id: 'json-formatter',
        name: 'JSON 포매터/검증기',
        description: 'JSON 데이터를 정리하고 유효성을 검사합니다.',
        category: '텍스트 처리',
        icon: FileJson,
        color: '#FF6B6B',
    },
    {
        id: 'diff-checker',
        name: 'Diff 도구',
        description: '두 텍스트의 차이점을 비교하고 시각화합니다.',
        category: '텍스트 처리',
        icon: GitCompare,
        color: '#45B7D1',
    },
    {
        id: 'regex-tester',
        name: '정규표현식 테스터',
        description: '정규표현식을 실시간으로 테스트하고 매치 결과를 확인합니다.',
        category: '텍스트 처리',
        icon: Regex,
        color: '#96CEB4',
    },
    {
        id: 'markdown-editor',
        name: 'Markdown 에디터',
        description: '실시간 미리보기가 있는 마크다운 편집기입니다.',
        category: '텍스트 처리',
        icon: FileText,
        color: '#DDA0DD',
    },
    {
        id: 'csv-json-converter',
        name: 'CSV ↔️ JSON 변환기',
        description: 'CSV와 JSON 형식 간 데이터를 변환합니다.',
        category: '텍스트 처리',
        icon: Table,
        color: '#FFB6C1',
    },
    {
        id: 'sql-formatter',
        name: 'SQL 포매터',
        description: 'SQL 쿼리를 정리하고 가독성을 개선합니다.',
        category: '텍스트 처리',
        icon: Database,
        color: '#4ECDC4',
    },
    {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum 생성기',
        description: '다양한 형태의 더미 텍스트를 생성합니다.',
        category: '텍스트 처리',
        icon: FileType,
        color: '#FFA07A',
    },
];
