/**
 * 사이트 전역 메타데이터 상수.
 *
 * 배포 도메인이 바뀌면 환경변수 `NEXT_PUBLIC_SITE_URL` 만 설정하면 된다.
 * (Vercel 프로젝트 설정 → Environment Variables)
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-project.vercel.app').replace(
    /\/$/,
    ''
);

export const SITE_NAME = 'AI-Project';

export const SITE_DESCRIPTION =
    '인코딩/디코딩, 텍스트 처리, 보안/암호화, 형식 변환 등 개발에 필요한 46가지 도구를 한곳에서 제공하는 웹 플랫폼입니다.';

export const SITE_KEYWORDS = [
    '개발자 도구',
    'devtools',
    '인코딩',
    '디코딩',
    'base64',
    'json formatter',
    'jwt decoder',
    'hash',
    '정규식 테스트',
    'QR 코드 생성',
];
