'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitoring, monitorMemoryUsage } from '@/lib/performance/web-vitals';
import { cn } from '@/lib/utils';

// 성능 메트릭 카드 컴포넌트
interface MetricCardProps {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    unit?: string;
}

const MetricCard = memo<MetricCardProps>(({ name, value, rating, unit = 'ms' }) => {
    const getRatingColor = (rating: string) => {
        if (rating === 'poor') return 'text-destructive bg-destructive/10 border-destructive/20';
        if (rating === 'needs-improvement')
            return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800';
        if (rating === 'good')
            return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
        return 'text-muted-foreground bg-muted border-border';
    };

    const formatValue = (value: number, unit: string) => {
        if (unit === 'ms') {
            return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`;
        }
        if (unit === 'score') {
            return value.toFixed(3);
        }
        return `${Math.round(value)}${unit}`;
    };

    return (
        <Card className={cn('border-2', getRatingColor(rating))}>
            <CardContent className='p-4'>
                <div className='text-sm font-medium text-muted-foreground'>{name}</div>
                <div className='text-2xl font-bold'>{formatValue(value, unit)}</div>
                <div className='text-xs capitalize'>{rating.replace('-', ' ')}</div>
            </CardContent>
        </Card>
    );
});

MetricCard.displayName = 'MetricCard';

// 메모리 사용량 카드
const MemoryCard = memo(() => {
    const memoryInfo = monitorMemoryUsage();

    if (!memoryInfo) {
        return (
            <Card>
                <CardContent className='p-4'>
                    <div className='text-sm font-medium text-muted-foreground'>메모리 정보</div>
                    <div className='text-sm text-muted-foreground'>사용 불가</div>
                </CardContent>
            </Card>
        );
    }

    const { usedJSHeapSize, totalJSHeapSize, usagePercentage } = memoryInfo;

    const getRatingByUsage = (percentage: number) => {
        if (percentage < 50) return 'good';
        if (percentage < 80) return 'needs-improvement';
        return 'poor';
    };

    const rating = getRatingByUsage(usagePercentage);

    return (
        <Card
            className={cn(
                'border-2',
                rating === 'good'
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : rating === 'needs-improvement'
                    ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                    : 'text-red-600 bg-red-50 border-red-200'
            )}
        >
            <CardContent className='p-4'>
                <div className='text-sm font-medium text-muted-foreground'>메모리 사용량</div>
                <div className='text-2xl font-bold'>{usagePercentage}%</div>
                <div className='text-xs text-muted-foreground'>
                    {Math.round(usedJSHeapSize / 1024 / 1024)}MB / {Math.round(totalJSHeapSize / 1024 / 1024)}MB
                </div>
            </CardContent>
        </Card>
    );
});

MemoryCard.displayName = 'MemoryCard';

// 성능 점수 카드
interface ScoreCardProps {
    score: number;
    recommendations: string[];
}

const ScoreCard = memo<ScoreCardProps>(({ score, recommendations }) => {
    const getScoreRating = (score: number) => {
        if (score >= 90) return 'good';
        if (score >= 50) return 'needs-improvement';
        return 'poor';
    };

    const rating = getScoreRating(score);

    return (
        <Card
            className={cn(
                'border-2',
                rating === 'good'
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : rating === 'needs-improvement'
                    ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                    : 'text-red-600 bg-red-50 border-red-200'
            )}
        >
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg'>전체 성능 점수</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='text-3xl font-bold mb-2'>{score}/100</div>
                {recommendations.length > 0 && (
                    <div className='space-y-1'>
                        <div className='text-sm font-medium'>개선 권장사항:</div>
                        <ul className='text-xs space-y-1'>
                            {recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index} className='text-muted-foreground'>
                                    • {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

ScoreCard.displayName = 'ScoreCard';

// 메인 성능 대시보드
export const PerformanceDashboard = memo(() => {
    const { metrics, analysis, clearMetrics } = usePerformanceMonitoring();

    if (!analysis) {
        return (
            <Card>
                <CardContent className='p-6'>
                    <div className='text-center text-muted-foreground'>성능 데이터를 수집 중입니다...</div>
                </CardContent>
            </Card>
        );
    }

    const { overallScore, recommendations } = analysis;

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>성능 모니터링</h2>
                <Button onClick={clearMetrics} variant='outline' size='sm'>
                    데이터 초기화
                </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <ScoreCard score={overallScore} recommendations={recommendations} />
                <MemoryCard />

                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.name}
                        name={metric.name}
                        value={metric.value}
                        rating={metric.rating}
                        unit={metric.name === 'CLS' ? 'score' : 'ms'}
                    />
                ))}
            </div>

            {recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>상세 개선 권장사항</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className='space-y-2'>
                            {recommendations.map((rec, index) => (
                                <li key={index} className='flex items-start gap-2'>
                                    <span className='text-primary font-bold'>•</span>
                                    <span className='text-sm'>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';
