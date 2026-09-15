import { allTools } from '@/app/data/integrations';
import { recommend, recommendFeatured } from '@/lib/recommend/rank';
import { REASON_LABELS, type RecommendReason } from '@/lib/recommend/types';

/**
 * Phase 5 검증: 추천 카드에 사유 라벨이 반드시 붙는다.
 *
 * 랭커가 새 사유 코드를 만들고 라벨 표에 추가하지 않으면 화면에
 * `undefined` 가 찍힌다. 코드 변경 없이 데이터만 바뀌어도 잡히도록
 * 실제 카탈로그를 전부 순회해 확인한다.
 */
describe('추천 사유 라벨', () => {
    it('모든 사유 코드에 비어 있지 않은 라벨이 있다', () => {
        for (const label of Object.values(REASON_LABELS)) {
            expect(label.trim()).not.toBe('');
        }
    });

    it('사유 코드 6종이 모두 라벨을 갖는다', () => {
        const expected: RecommendReason[] = [
            'related',
            'same-category',
            'tag-overlap',
            'similar-content',
            'recently-used',
            'favorite',
        ];

        expect(Object.keys(REASON_LABELS).sort()).toEqual([...expected].sort());
    });

    it('47개 도구의 관련 도구 추천이 쓰는 사유에 전부 라벨이 있다', () => {
        const used = new Set<RecommendReason>();

        for (const tool of allTools) {
            for (const item of recommend(tool.id, allTools, 10)) {
                for (const reason of item.reasons) used.add(reason);
            }
        }

        expect(used.size).toBeGreaterThan(0);
        for (const reason of used) {
            expect(REASON_LABELS[reason]).toBeTruthy();
        }
    });

    it('홈 추천이 쓰는 사유에 전부 라벨이 있다', () => {
        const result = recommendFeatured(allTools, 10, { favorites: [allTools[0].id] });

        for (const item of result) {
            for (const reason of item.reasons) {
                expect(REASON_LABELS[reason]).toBeTruthy();
            }
        }
    });
});
