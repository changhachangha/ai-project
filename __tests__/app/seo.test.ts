import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { allTools } from '@/app/data/integrations';
import { SITE_URL } from '@/lib/site';

describe('SEO 라우트 (sitemap / robots)', () => {
    describe('sitemap', () => {
        const entries = sitemap();

        it('홈페이지가 첫 엔트리로 포함된다', () => {
            expect(entries[0].url).toBe(`${SITE_URL}/`);
            expect(entries[0].priority).toBe(1);
        });

        it('모든 도구 페이지가 포함된다', () => {
            // 정적 라우트(/, /encoding, /integrations, /settings) + 도구 전체
            expect(entries).toHaveLength(4 + allTools.length);
        });

        it('모든 URL 은 절대 경로이고 중복이 없다', () => {
            const urls = entries.map((entry) => entry.url);
            expect(new Set(urls).size).toBe(urls.length);
            urls.forEach((url) => expect(url.startsWith(`${SITE_URL}/`)).toBe(true));
        });

        it('도구 URL 은 카테고리 경로 규칙을 따른다', () => {
            const urls = entries.map((entry) => entry.url);
            expect(urls).toContain(`${SITE_URL}/text/case-converter`);
            expect(urls).toContain(`${SITE_URL}/security/jwt-decoder`);
            expect(urls).toContain(`${SITE_URL}/encoding/base64`);
        });
    });

    describe('robots', () => {
        const result = robots();

        it('sitemap 위치를 알려준다', () => {
            expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
        });

        it('전체 허용 + /api/ 차단 규칙을 갖는다', () => {
            const rules = (Array.isArray(result.rules) ? result.rules : [result.rules]) as Array<{
                userAgent?: string;
                allow?: string;
                disallow?: string[];
            }>;
            const rule = rules.find((r) => r.userAgent === '*');
            expect(rule?.allow).toBe('/');
            expect(rule?.disallow).toEqual(['/api/']);
        });
    });
});
