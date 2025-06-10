# AI-Project - 인코딩/디코딩 도구 플랫폼

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
</div>

## 📌 프로젝트 소개

AI-Project는 다양한 인코딩/디코딩 도구를 제공하는 웹 플랫폼입니다. Base64, URL 인코딩, 진수 변환 등 개발자와 일반 사용자 모두에게 유용한 텍스트 변환 도구들을 직관적인 UI로 제공합니다.

### ✨ 주요 기능

- **🔤 다양한 인코딩 도구**: Base64, Base32, Hex, URL, HTML, Unicode 인코더/디코더
- **🔢 진수 변환기**: 2진수, 8진수, 10진수, 16진수 간 변환
- **📁 파일 업로드**: Base64 인코딩을 위한 파일 업로드 지원
- **🔍 검색 및 필터링**: 도구 검색 및 카테고리별 필터링
- **⭐ 즐겨찾기**: 자주 사용하는 도구 즐겨찾기 저장
- **📱 반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn 패키지 매니저

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/ai-project.git
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
├── app/                      # Next.js App Router
│   ├── (main)/              # 라우트 그룹
│   │   ├── encoding/        # 인코딩 도구 페이지들
│   │   │   ├── base64/      # Base64 인코더/디코더
│   │   │   ├── base32/      # Base32 인코더/디코더
│   │   │   ├── hex/         # Hex 변환기
│   │   │   ├── url/         # URL 인코더/디코더
│   │   │   ├── html/        # HTML 인코더/디코더
│   │   │   ├── unicode/     # Unicode 변환기
│   │   │   └── binary/      # 진수 변환기
│   │   └── integrations/    # 통합 컴포넌트
│   ├── data/                # 데이터 정의 파일
│   │   ├── encoding-tools.ts
│   │   ├── integrations.ts
│   │   └── types.ts
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx            # 홈페이지
│   └── globals.css         # 전역 스타일
├── components/              # 재사용 가능한 컴포넌트
│   └── ui/                 # shadcn/ui 컴포넌트
├── hooks/                   # 커스텀 React 훅
│   └── useEncoding.ts      # 인코딩/디코딩 로직 훅
├── lib/                     # 유틸리티 함수
├── public/                  # 정적 파일
└── package.json            # 프로젝트 설정
```

## 🛠 기술 스택

### 프론트엔드
- **[Next.js](https://nextjs.org/)** (v15.3.3) - React 프레임워크
- **[React](https://react.dev/)** (v19.0.0) - UI 라이브러리
- **[TypeScript](https://www.typescriptlang.org/)** (v5) - 타입 안정성
- **[Tailwind CSS](https://tailwindcss.com/)** (v4) - 유틸리티 우선 CSS

### UI 컴포넌트
- **[Radix UI](https://www.radix-ui.com/)** - 접근성 높은 UI 컴포넌트
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트
- **[Framer Motion](https://www.framer.com/motion/)** - 애니메이션 라이브러리
- **[Lucide React](https://lucide.dev/)** - 아이콘 라이브러리

## 🎨 주요 컴포넌트

### 페이지 컴포넌트
- `page.tsx` - 메인 홈페이지
- `encoding/[tool]/page.tsx` - 각 인코딩 도구 페이지

### UI 컴포넌트
- `IntegrationGrid` - 도구 그리드 레이아웃
- `IntegrationCard` - 개별 도구 카드
- `SearchBar` - 검색 바
- `CategoryFilter` - 카테고리 필터
- `Pagination` - 페이지네이션

### 커스텀 훅
- `useEncoding` - 인코딩/디코딩 로직을 관리하는 재사용 가능한 훅

## 📝 사용 예시

### Base64 인코딩
```typescript
import { useEncoding } from '@/hooks/useEncoding';

const { input, output, handleEncode } = useEncoding({
  encodeFn: (text) => btoa(text),
  decodeFn: (base64) => atob(base64)
});
```

### 새로운 인코딩 도구 추가
1. `app/data/encoding-tools.ts`에 도구 정의 추가
2. `app/(main)/encoding/[tool-name]/page.tsx` 페이지 생성
3. `useEncoding` 훅을 사용하여 인코딩/디코딩 로직 구현

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

- [ ] 다크 모드 지원
- [ ] 국제화(i18n) 지원
- [ ] API 엔드포인트 추가
- [ ] PWA(Progressive Web App) 지원
- [ ] 더 많은 인코딩 도구 추가
- [ ] 단위 테스트 및 E2E 테스트 추가

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

<div align="center">
  Made with ❤️ using Next.js and TypeScript
</div>