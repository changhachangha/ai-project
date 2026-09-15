import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// 성능 메트릭 타입
interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
    url: string;
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

    addMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);
    }

    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
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
