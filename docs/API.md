# API 엔드포인트

현재 서버 API 는 `app/api/**/route.ts` (Next.js Route Handlers) 로 제공된다.

---

## `POST /api/diff`

두 텍스트를 비교해 diff 결과(HTML 조각)를 반환한다.

### 요청

```json
{
    "originalText": "a\nb\n",
    "newText": "a\nc\n",
    "diffType": "lines"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `originalText` | string | ✅ | 원본 텍스트 |
| `newText` | string | ✅ | 비교 대상 텍스트 |
| `diffType` | `"chars" \| "words" \| "lines"` | ✅ | 비교 단위 |

### 응답

```json
{
    "diffResult": "<span style=\"color:grey;\">a\n</span><span style=\"color:red;\">b\n</span><span style=\"color:green;\">c\n</span>"
}
```

### 오류

| 상태 | 조건 |
| --- | --- |
| 400 | `originalText` / `newText` 가 문자열이 아님 |
| 400 | `diffType` 이 허용값이 아님 |
| 500 | 처리 중 예외 |

---

## `GET /api/tools`

전체 도구 카탈로그를 반환한다. 정적 데이터이므로 빌드 시점에 정적화된다(`force-static`).

### 응답

```json
{
    "total": 47,
    "categories": [{ "category": "텍스트 처리", "path": "text", "count": 15 }],
    "tools": [
        {
            "id": "case-converter",
            "name": "텍스트 케이스 변환기",
            "description": "camelCase, snake_case, kebab-case 등 9가지 표기법으로 변환합니다.",
            "category": "텍스트 처리",
            "path": "/text/case-converter"
        }
    ]
}
```

### 사용 예

```bash
curl -s http://localhost:3000/api/tools | jq '.total'
```

---

## 참고

- 도구 대부분은 **클라이언트에서만** 동작한다(브라우저 API·암호화 연산). 서버 API 는 위 2개뿐이다.
- 서버 API 를 추가할 때는 `app/api/{name}/route.ts` 를 만들고, `lib/tools/*` 의 순수 로직을 재사용한다.
- 인증이 필요한 API 는 현재 없다.
