# AI-Project - 개발 도구 허브

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://github.com/changhachangha/ai-project/actions/workflows/ci.yml/badge.svg" alt="CI">
</div>

## 📌 프로젝트 소개

AI-Project는 개발자와 일반 사용자 모두에게 유용한 다양한 개발 도구들을 한곳에 모아 제공하는 웹 플랫폼입니다. 인코딩/디코딩, 텍스트 처리, 보안 관련 도구 등 개발 과정에서 자주 사용되는 기능들을 직관적인 UI로 제공하며, PC와 모바일 환경 모두에서 최적화된 사용 경험을 제공합니다.

### ✨ 주요 기능

-   **🔧 다양한 개발 도구**: 인코딩/디코딩, 텍스트 변환, 보안/암호화 등 다양한 카테고리의 도구 제공
-   **🔤 인코딩/디코딩**: Base64, Base32, Hex, URL, HTML, Unicode 등 다채로운 형식의 변환 지원
-   **🔢 진수 변환기**: 2진수, 8진수, 10진수, 16진수 간 편리한 변환
-   **📁 파일 처리**: 특정 도구에서 파일 업로드/다운로드 지원
-   **🔍 검색 및 필터링**: 필요한 도구를 빠르게 찾을 수 있는 검색 및 카테고리별 필터링 기능
-   **⭐ 즐겨찾기**: 자주 사용하는 도구를 즐겨찾기에 추가하여 손쉽게 접근
-   **📱 반응형 디자인**: PC, 태블릿, 모바일 등 모든 기기에서 최적화된 레이아웃과 사용자 경험 제공

## 🚀 시작하기

### 필수 요구사항

-   Node.js 18.18.0 이상 (개발/CI 기준: Node 20·22)
-   npm 또는 yarn 패키지 매니저

### 설치 및 실행

1. **저장소 클론**

```bash
git clone https://github.com/changhachangha/ai-project.git
cd ai-project
```

2. **의존성 설치**

```bash
npm install
# 또는
yarn install
```

3. **개발 서버 실행**

```bash
npm run dev
# 또는
yarn dev
```

4. **브라우저에서 확인**

```
http://localhost:3000
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 📁 프로젝트 구조

```
ai-project/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 라우트 그룹 (도구 페이지)
│   │   ├── encoding/             # 인코딩/디코딩 (10개)
│   │   ├── conversion/           # 형식/단위 변환 (9개)
│   │   ├── text/                 # 텍스트 처리 (14개)
│   │   ├── security/             # 보안/암호화 (8개)
│   │   ├── developer/            # 개발자 도구 (5개)
│   │   ├── integrations/         # 통합 컴포넌트
│   │   └── settings/             # 설정 (테마 등)
│   ├── api/diff/route.ts         # 서버 API 엔드포인트
│   ├── data/                     # 도구 정의 데이터 (카테고리별)
│   ├── HomePageClient.tsx        # 홈페이지 클라이언트 컴포넌트
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지
│   └── globals.css               # 전역 스타일
├── components/                   # 재사용 가능한 컴포넌트
│   ├── tools/                    # 도구별 UI 컴포넌트
│   └── ui/                       # shadcn/ui 컴포넌트
├── hooks/                        # 커스텀 React 훅
├── lib/                          # 유틸리티
│   ├── tools/                    # 도구 순수 로직 (encode/hash/crypto/color/...)
│   ├── utils/routing.ts          # 카테고리 ↔ 경로 매핑
│   └── ...
├── __tests__/                    # Jest 테스트
├── docs/                         # 문서 (도구 추가 체크리스트)
├── scripts/validate-routing.js   # 라우팅 매핑 검증 스크립트
└── package.json                  # 프로젝트 설정
```

### 🧰 제공 도구 목록 (총 47개)

| 카테고리 | 개수 | 도구 |
| --- | --- | --- |
| 인코딩 | 10 | base64, base32, hex, url, html, unicode, binary, morse-code, caesar-cipher, punycode |
| 변환 | 9 | number, color, unit, coordinate, currency, timestamp, image, qr-code, uuid |
| 텍스트 | 15 | json-formatter, xml-formatter, yaml-json, csv-json, sql-formatter, code-formatter, markdown-editor, markdown-table, diff-checker, regex-tester, text-analyzer, text-encryptor, line-break, lorem-ipsum, case-converter |
| 보안 | 8 | aes-encryptor, hash-tool, jwt-decoder, totp-generator, password-generator, rsa-key-generator, public-key-extractor, certificate-analyzer |
| 개발자 | 5 | api-tester, cron-generator, file-hash-calculator, network-tools, random-data-generator |

> 도구 목록은 `GET /api/tools` 로도 조회할 수 있습니다. 자세한 내용은 [docs/API.md](docs/API.md).

## 🛠 기술 스택

### 프론트엔드

-   **[Next.js](https://nextjs.org/)** (v15.3.3) - React 프레임워크
-   **[React](https://react.dev/)** (v19.0.0) - UI 라이브러리
-   **[TypeScript](https://www.typescriptlang.org/)** (v5) - 타입 안정성
-   **[Tailwind CSS](https://tailwindcss.com/)** (v4) - 유틸리티 우선 CSS

### UI 컴포넌트

-   **[Radix UI](https://www.radix-ui.com/)** - 접근성 높은 UI 컴포넌트
-   **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트
-   **[Framer Motion](https://www.framer.com/motion/)** - 애니메이션 라이브러리
-   **[Lucide React](https://lucide.dev/)** - 아이콘 라이브러리

## 🎨 주요 컴포넌트

### 페이지 컴포넌트

-   `page.tsx` - 메인 홈페이지
-   `encoding/[tool]/page.tsx` - 각 인코딩 도구 페이지

### UI 컴포넌트

-   `IntegrationGrid` - 도구 그리드 레이아웃
-   `IntegrationCard` - 개별 도구 카드
-   `SearchBar` - 검색 바
-   `CategoryFilter` - 카테고리 필터
-   `Pagination` - 페이지네이션

### 커스텀 훅

-   `useEncoding` - 인코딩/디코딩 로직을 관리하는 재사용 가능한 훅

## 📝 사용 예시

### Base64 인코딩

```typescript
import { useEncoding } from '@/hooks/useEncoding';

const { input, output, handleEncode } = useEncoding({
    encodeFn: (text) => btoa(text),
    decodeFn: (base64) => atob(base64),
});
```

### 새로운 도구 추가

1. `app/data/` 디렉토리에 해당 도구의 데이터 정의 파일 추가 (예: `text-tools.ts`, `security-tools.ts`)
2. `app/(main)/` 디렉토리에 해당 도구 카테고리 폴더 생성 (예: `text/`, `security/`)
3. 생성된 카테고리 폴더 안에 `[tool-name]/page.tsx` 페이지 생성 및 도구 로직 구현
4. `app/data/integrations.ts` 파일에 새로 추가된 도구를 포함하여 통합

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 이 저장소를 Fork 하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push 하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔮 향후 계획

-   [x] 다크 모드 지원 (`next-themes`, 설정 페이지에서 전환)
-   [x] 단위 테스트 추가 (Jest + Testing Library)
-   [x] API 엔드포인트 확장 (`/api/diff`, `/api/tools`)
-   [ ] PWA 지원 — **현재 미동작**. `next-pwa` 가 `next.config.ts` 에 연결되어 있지 않음 ([docs/PWA-검토.md](docs/PWA-검토.md))
-   [ ] 국제화(i18n) 지원 — 설계 완료, 구현 미착수 ([docs/i18n-설계.md](docs/i18n-설계.md))
-   [ ] 더 많은 도구 추가
-   [ ] E2E 테스트 추가 (Playwright 등)

## 📚 문서

-   [API 엔드포인트](docs/API.md)
-   [새로운 도구 추가 체크리스트](docs/새로운-도구-추가-체크리스트.md)
-   [i18n 설계](docs/i18n-설계.md)
-   [PWA 라이브러리 검토](docs/PWA-검토.md)

## ✅ 검증 명령어

```bash
npm run type-check        # TypeScript 타입 검사
npm run lint              # ESLint
npm run validate-routing  # 도구 데이터 ↔ 라우트 경로 매핑 검증
npm test                  # Jest 단위 테스트
npm run test:coverage     # 커버리지 포함
npm run build             # 프로덕션 빌드
npm run validate-all      # type-check + lint + validate-routing 일괄
```

CI에서는 위 항목이 모두 통과해야 `main` 병합이 가능합니다 (`.github/workflows/ci.yml`).

## 📢 최근 업데이트

### 🔧 저장소 정비 · CI 구축 · 도구 추가 (2026년 9월)

-   **CI 파이프라인 도입**: PR/`main` push 시 type-check · lint · 라우팅 검증 · 테스트 · 빌드를 자동 수행 (`.github/workflows/ci.yml`). Vercel 배포는 CI 성공 이후에만 실행
-   **의존성 자동 갱신**: Dependabot 주간 스캔 (`.github/dependabot.yml`)
-   **리포 위생**: 재생성 가능한 산출물(`repomix-output.xml`, `.vooster/`, `public/sw.js`, `public/workbox-*.js`) 추적 해제 및 `.gitignore` 정리
-   **문서 정합화**: README 구조도·도구 목록·로드맵을 실제 코드 기준으로 갱신, `LICENSE`(MIT) 추가, `docs/API.md` 신규
-   **SEO 기반 추가**: `robots.txt` · `sitemap.xml` · 사이트 메타데이터(OG/Twitter) 적용
-   **테스트 보강**: `lib/tools` 순수 로직 단위 테스트 8종 추가
-   **버그 수정**: `text-encryptor` 도구의 `page.tsx` 누락(404) 수정, `validate-routing` 스크립트가 매핑을 중복 정의해 실제 매핑과 어긋나던 문제 수정
-   **🆕 새 도구**: **텍스트 케이스 변환기** (`/text/case-converter`) — camelCase·snake_case·kebab-case 등 9가지 표기법 변환

### 🆕 새로운 도구 추가: Lorem Ipsum 생성기 (2024년 12월)

텍스트 처리 카테고리에 **Lorem Ipsum 생성기**가 추가되었습니다! 이 도구는 다음과 같은 기능을 제공합니다:

-   **다양한 텍스트 유형**: 클래식 Lorem Ipsum, 한국어 더미 텍스트, 기술 관련 텍스트
-   **유연한 출력 형태**: 문단, 문장, 단어 단위로 생성 가능
-   **실시간 통계**: 생성된 텍스트의 문자 수, 단어 수, 문장 수 표시
-   **편리한 기능**: 클립보드 복사, 파일 다운로드, 실시간 편집 지원

### 🔧 기술적 개선사항

이 프로젝트는 Next.js SSR(서버 사이드 렌더링) 환경에서 클라이언트 전용 API (예: `navigator.clipboard`, `TextEncoder`, `TextDecoder`) 및 `framer-motion` 라이브러리 사용으로 인해 빌드 시 다양한 오류와 경고가 발생했습니다. 이러한 문제들을 해결하기 위해 다음과 같은 개선 사항을 적용했습니다:

-   **클라이언트 전용 로직 분리**: 빌드 프로세스 중 서버 환경에서 실행될 수 없는 코드를 `"use client"` 지시자와 `next/dynamic`의 `ssr: false` 옵션을 사용하여 클라이언트 컴포넌트로 분리했습니다. 이를 통해 브라우저 전용 API 호출이 클라이언트 측에서만 이루어지도록 보장했습니다.
-   **Next.js 설정 최적화**: `next.config.ts` 파일에서 `protocol` 및 `output` 속성의 타입 오류를 명시적인 `as const` 타입 지정을 통해 해결했습니다. 또한, 더 이상 필요하지 않거나 인식되지 않는 `serverComponentsExternalPackages` 옵션을 제거하여 빌드 경고를 해소했습니다.
-   **종속성 관리**: `framer-motion`의 누락된 종속성인 `@emotion/is-prop-valid`를 설치하여 빌드 경고를 해결했습니다.
-   **사이드바 메뉴 정돈**: 실제 페이지와 연결되지 않은 사이드바 메뉴 항목들을 제거하여 사용자 경험을 개선했습니다.

이러한 노력으로 현재 프로젝트는 모든 빌드 오류와 경고 없이 성공적으로 빌드됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

<div align="center">
  Made with ❤️ using Next.js and TypeScript
</div>
