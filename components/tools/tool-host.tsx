'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * 도구 id → 렌더링 컴포넌트 레지스트리.
 *
 * 47개 도구 페이지가 전부 "dynamic import 한 줄" 셸이었던 것을 한 곳으로 모은다.
 * ssr: false 는 브라우저 전용 API(crypto, canvas, clipboard 등)를 초기 렌더에서
 * 쓰는 도구에만 유지한다 — 이전 각 page.tsx 의 동작을 그대로 옮긴 것이다.
 */
const TOOL_COMPONENTS: Record<string, ComponentType> = {
    // conversion
    'color-converter': dynamic(() => import('@/app/(main)/conversion/color-converter/ColorConverterTool')),
    'coordinate-converter': dynamic(() => import('@/app/(main)/conversion/coordinate-converter/CoordinateConverterClient')),
    'currency-converter': dynamic(() => import('@/app/(main)/conversion/currency-converter/CurrencyConverterClient')),
    'image-converter': dynamic(() => import('@/app/(main)/conversion/image-converter/ImageConverterClient'), { ssr: false }),
    'number-converter': dynamic(() => import('@/app/(main)/conversion/number-converter/NumberConverterClient'), { ssr: false }),
    'qr-code-generator': dynamic(() => import('@/app/(main)/conversion/qr-code-generator/QrCodeGeneratorClient'), { ssr: false }),
    'timestamp-converter': dynamic(() => import('@/app/(main)/conversion/timestamp-converter/TimestampConverterTool')),
    'unit-converter': dynamic(() => import('@/app/(main)/conversion/unit-converter/UnitConverterClient'), { ssr: false }),
    'uuid-generator': dynamic(() => import('@/app/(main)/conversion/uuid-generator/UuidGeneratorClient'), { ssr: false }),
    // developer
    'cron-generator': dynamic(() => import('@/app/(main)/developer/cron-generator/CronGeneratorClient')),
    'file-hash-calculator': dynamic(() => import('@/app/(main)/developer/file-hash-calculator/FileHashCalculatorClient')),
    'random-data-generator': dynamic(() => import('@/app/(main)/developer/random-data-generator/RandomDataGeneratorClient'), { ssr: false }),
    // encoding
    base32: dynamic(() => import('@/app/(main)/encoding/base32/ClientBase32Tool'), { ssr: false }),
    base64: dynamic(() => import('@/app/(main)/encoding/base64/ClientBase64Tool'), { ssr: false }),
    binary: dynamic(() => import('@/app/(main)/encoding/binary/ClientBinaryTool'), { ssr: false }),
    'caesar-cipher': dynamic(() => import('@/app/(main)/encoding/caesar-cipher/CaesarCipherClient'), { ssr: false }),
    hex: dynamic(() => import('@/app/(main)/encoding/hex/ClientHexTool'), { ssr: false }),
    html: dynamic(() => import('@/app/(main)/encoding/html/HtmlTool')),
    'morse-code': dynamic(() => import('@/app/(main)/encoding/morse-code/MorseCodeClient'), { ssr: false }),
    punycode: dynamic(() => import('@/app/(main)/encoding/punycode/PunycodeClient'), { ssr: false }),
    unicode: dynamic(() => import('@/app/(main)/encoding/unicode/ClientUnicodeTool'), { ssr: false }),
    url: dynamic(() => import('@/app/(main)/encoding/url/ClientUrlTool'), { ssr: false }),
    // security
    'aes-encryptor': dynamic(() => import('@/app/(main)/security/aes-encryptor/AESEncryptorClient')),
    'hash-tool': dynamic(() => import('@/components/tools/HashTool')),
    'jwt-decoder': dynamic(() => import('@/app/(main)/security/jwt-decoder/JwtDecoderClient'), { ssr: false }),
    'password-generator': dynamic(() => import('@/app/(main)/security/password-generator/PasswordGeneratorClient'), { ssr: false }),
    'public-key-extractor': dynamic(() => import('@/components/tools/CryptoTool')),
    'rsa-key-generator': dynamic(() => import('@/app/(main)/security/rsa-key-generator/RsaKeyGeneratorClient'), { ssr: false }),
    'totp-generator': dynamic(() => import('@/app/(main)/security/totp-generator/TOTPGeneratorClient')),
    // text
    'case-converter': dynamic(() => import('@/app/(main)/text/case-converter/CaseConverterClient'), { ssr: false }),
    'code-formatter': dynamic(() => import('@/app/(main)/text/code-formatter/CodeFormatterClient'), { ssr: false }),
    'csv-json-converter': dynamic(() => import('@/app/(main)/text/csv-json-converter/ClientCsvJsonConverterTool'), { ssr: false }),
    'diff-checker': dynamic(() => import('@/app/(main)/text/diff-checker/DiffCheckerTool')),
    'json-formatter': dynamic(() => import('@/app/(main)/text/json-formatter/JsonFormatterTool')),
    'line-break-converter': dynamic(() => import('@/app/(main)/text/line-break-converter/LineBreakConverterClient'), { ssr: false }),
    'lorem-ipsum': dynamic(() => import('@/app/(main)/text/lorem-ipsum/LoremIpsumClient'), { ssr: false }),
    'markdown-editor': dynamic(() => import('@/app/(main)/text/markdown-editor/ClientMarkdownEditor'), { ssr: false }),
    'markdown-table-generator': dynamic(() => import('@/app/(main)/text/markdown-table-generator/MarkdownTableGeneratorClient'), { ssr: false }),
    'regex-tester': dynamic(() => import('@/app/(main)/text/regex-tester/RegexTesterTool')),
    'sql-formatter': dynamic(() => import('@/app/(main)/text/sql-formatter/SqlFormatterClient'), { ssr: false }),
    'text-analyzer': dynamic(() => import('@/app/(main)/text/text-analyzer/TextAnalyzerClient'), { ssr: false }),
    'text-encryptor': dynamic(() => import('@/app/(main)/text/text-encryptor/TextEncryptorClient'), { ssr: false }),
    'xml-formatter': dynamic(() => import('@/app/(main)/text/xml-formatter/XmlFormatterClient'), { ssr: false }),
    'yaml-json-converter': dynamic(() => import('@/app/(main)/text/yaml-json-converter/YamlJsonConverterClient'), { ssr: false }),
};

export const getToolComponent = (toolId: string): ComponentType | undefined => TOOL_COMPONENTS[toolId];

export default function ToolHost({ toolId }: { toolId: string }) {
    const Component = getToolComponent(toolId);
    // page.tsx 가 notFound() 로 먼저 걸러주므로 여기 오면 항상 존재한다.
    // 방어적으로 null 을 둔다 — 레지스트리 누락은 테스트에서 잡는다.
    if (!Component) return null;
    return <Component />;
}
