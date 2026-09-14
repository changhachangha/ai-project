# PWA 라이브러리 검토

> 상태: **검토 완료 / 교체 미적용** — 실제 PWA 활성화 여부를 먼저 확정해야 한다.

---

## 1. 현재 상태 (조사 결과)

| 항목 | 상태 |
| --- | --- |
| `next-pwa` 의존성 | ✅ `package.json` 에 존재 (`^5.6.0`) |
| `next.config.ts` 의 `withPWA` 래핑 | ❌ **없음** — 플러그인이 전혀 연결되지 않음 |
| `public/manifest.json` | ❌ 없음 |
| 서비스워커 등록 코드 | ❌ 없음 |
| `public/sw.js`, `public/workbox-4754cb34.js` | ⚠️ 저장소에 커밋됨 (과거 빌드 산출물) |

**결론: 현재 PWA 는 실제로 동작하지 않는다.** README 의 `[x] PWA 지원` 표기는 부정확하며, 남아 있는 `public/sw.js` 는 과거 시도의 잔재다.

→ 조치: 생성 산출물(`public/sw.js`, `public/workbox-*.js`)을 `.gitignore` 로 추적 해제했다.

## 2. `next-pwa@5.6.0` 문제점

- 마지막 릴리스가 오래되어 **사실상 유지보수 중단** 상태.
- Next.js **App Router(RSC)** 및 `output: 'standalone'` 조합에서 동작 이슈 보고가 있음 (이 프로젝트는 둘 다 사용).
- Webpack 기반이라 Next 15 의 Turbopack 전환과 충돌 가능.

## 3. 대안 비교

| 대안 | 특징 | 판단 |
| --- | --- | --- |
| **@ducanh2912/next-pwa** | `next-pwa` 의 유지보수 포크. App Router 대응, `withPWA` API 거의 동일 → 마이그레이션 비용 최소 | ✅ 1순위 |
| **Serwist** (`@serwist/next`) | Workbox 후속 세대. App Router/Turbopack 지원 활발, 타입 안전 | ✅ 2순위 (장기) |
| 직접 Workbox 구성 | 완전한 제어 | 유지비용 큼 |

## 4. 권장 조치

1. **PWA 를 실제로 쓸 것인지 결정** — 개발자 도구 특성상 오프라인 사용 가치는 있음(인코딩/해시 등 클라이언트 연산 도구).
2. 쓴다면 `@ducanh2912/next-pwa` 로 교체:
   - `next.config.ts` 를 `withPWA({ dest: 'public', disable: process.env.NODE_ENV === 'development' })` 로 래핑
   - `public/manifest.json` 추가 (name, short_name, icons, theme_color)
   - `app/layout.tsx` 의 `viewport.themeColor` 와 색상 일치시키기
   - `public/sw.js` / `workbox-*.js` 는 **커밋하지 않는다** (이미 `.gitignore` 처리됨)
3. 안 쓴다면 `next-pwa`, `@types/next-pwa` 의존성을 제거하고 README 의 PWA 항목을 내린다.

## 5. 결정 필요 사항

- PWA 를 유지할지, 제거할지 (README 표기 정정 포함)
- 유지한다면 위 1순위(@ducanh2912/next-pwa) 로 진행할지
