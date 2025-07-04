import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { useState, useEffect } from 'react';

// 성능 메트릭 타입
interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
    url: string;
}

// 성능 분석 결과
interface PerformanceAnalysis {
    metrics: PerformanceMetric[];
    overallScore: number;
    recommendations: string[];
}

// 메트릭 임계값 (Core Web Vitals 기준)
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
};

// 메트릭 평가 함수
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

// 메트릭 데이터 저장소
class MetricsStore {
    private metrics: PerformanceMetric[] = [];
    private listeners: ((metrics: PerformanceMetric[]) => void)[] = [];

    addMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);
        this.notifyListeners();
    }

    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    getLatestMetrics(): PerformanceMetric[] {
        const latest = new Map<string, PerformanceMetric>();

        this.metrics.forEach((metric) => {
            const existing = latest.get(metric.name);
            if (!existing || metric.timestamp > existing.timestamp) {
                latest.set(metric.name, metric);
            }
        });

        return Array.from(latest.values());
    }

    subscribe(listener: (metrics: PerformanceMetric[]) => void) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners() {
        this.listeners.forEach((listener) => listener(this.getMetrics()));
    }

    clear() {
        this.metrics = [];
        this.notifyListeners();
    }
}

// 전역 메트릭 스토어
export const metricsStore = new MetricsStore();

// 메트릭 핸들러
function handleMetric(metric: Metric) {
    const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        timestamp: Date.now(),
        url: window.location.href,
    };

    metricsStore.addMetric(performanceMetric);

    // 개발 환경에서 콘솔 로그
    if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metric:', performanceMetric);
    }

    // 프로덕션에서는 분석 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(performanceMetric);
    }
}

// 분석 서비스로 메트릭 전송
function sendToAnalytics(metric: PerformanceMetric) {
    // 실제 분석 서비스 구현 시 여기에 추가
    // 예: Google Analytics, Sentry, 자체 분석 서버 등
    console.log('Sending to analytics:', metric);
}

// 웹 바이탈 초기화
export function initWebVitals() {
    if (typeof window === 'undefined') return;

    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
}

// 성능 분석 함수
export function analyzePerformance(): PerformanceAnalysis {
    const metrics = metricsStore.getLatestMetrics();
    const recommendations: string[] = [];

    let totalScore = 0;
    let scoreCount = 0;

    metrics.forEach((metric) => {
        // 점수 계산 (good: 100, needs-improvement: 50, poor: 0)
        const score = metric.rating === 'good' ? 100 : metric.rating === 'needs-improvement' ? 50 : 0;
        totalScore += score;
        scoreCount++;

        // 개선 권장사항 생성
        if (metric.rating !== 'good') {
            recommendations.push(getRecommendation(metric));
        }
    });

    const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
        metrics,
        overallScore,
        recommendations,
    };
}

// 개선 권장사항 생성
function getRecommendation(metric: PerformanceMetric): string {
    switch (metric.name) {
        case 'LCP':
            return 'LCP 개선: 이미지 최적화, 서버 응답 시간 단축, 중요 리소스 우선 로드를 고려하세요.';
        case 'FID':
            return 'FID 개선: JavaScript 실행 시간 단축, 코드 스플리팅, 메인 스레드 블로킹 최소화를 고려하세요.';
        case 'CLS':
            return 'CLS 개선: 이미지와 요소의 크기 사전 정의, 동적 콘텐츠 삽입 최소화를 고려하세요.';
        case 'FCP':
            return 'FCP 개선: 중요 CSS 인라인화, 폰트 최적화, 서버 사이드 렌더링을 고려하세요.';
        case 'TTFB':
            return 'TTFB 개선: 서버 성능 최적화, CDN 사용, 캐싱 전략 개선을 고려하세요.';
        default:
            return '성능 최적화가 필요합니다.';
    }
}

// 성능 모니터링 훅
export function usePerformanceMonitoring() {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);

    useEffect(() => {
        const unsubscribe = metricsStore.subscribe((newMetrics) => {
            setMetrics(newMetrics);
            setAnalysis(analyzePerformance());
        });

        // 초기 데이터 로드
        setMetrics(metricsStore.getMetrics());
        setAnalysis(analyzePerformance());

        return unsubscribe;
    }, []);

    return {
        metrics,
        analysis,
        clearMetrics: () => metricsStore.clear(),
    };
}

// 컴포넌트 렌더링 성능 측정
export function measureComponentPerformance(componentName: string) {
    return {
        start: () => {
            const startTime = performance.now();

            return {
                end: () => {
                    const endTime = performance.now();
                    const duration = endTime - startTime;

                    if (process.env.NODE_ENV === 'development') {
                        console.log(`${componentName} 렌더링 시간: ${duration.toFixed(2)}ms`);
                    }

                    return duration;
                },
            };
        },
    };
}

// 메모리 사용량 모니터링
export function monitorMemoryUsage() {
    if (typeof window === 'undefined' || !('memory' in performance)) {
        return null;
    }

    const memory = (
        performance as unknown as {
            memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
    ).memory;
    return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
    };
}
