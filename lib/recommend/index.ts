/**
 * 추천 모듈의 공개 interface.
 *
 * 안쪽 파일(rules/content/tokenize/weights 의 상수 등)은 구현 상세다.
 * 새 소비자는 여기서만 가져간다. 테스트는 내부를 직접 임포트해도 된다 —
 * interface 가 곧 테스트 표면이므로 공개 경로를 같이 검증하는 편이 낫다.
 */

export { recommend, recommendFeatured } from './rank';
export type { RankContext } from './rank';

export { searchTools } from './search';
export type { SearchHit, SearchContext } from './search';

export { readUsage, writeUsage, recordUsage, clearUsage, getRecentToolIds } from './usage';
export type { UsageMap, UsageRecord } from './usage';

export { readMetrics, recordImpressions, recordClick, getImpressedToolIds, clearMetrics } from './metrics';
export type { MetricsMap, MetricRecord } from './metrics';

export type { Recommendation, RecommendReason } from './types';
export { REASON_LABELS } from './types';

export { DEFAULT_RELATED_LIMIT, DEFAULT_FEATURED_LIMIT } from './weights';
