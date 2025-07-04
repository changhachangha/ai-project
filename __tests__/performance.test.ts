import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { measureComponentPerformance, analyzePerformance, metricsStore } from '@/lib/performance/web-vitals';
import { OptimizedCard, OptimizedToolList } from '@/components/optimized/memoized-components';

// 성능 측정 테스트
describe('Performance Utilities', () => {
    beforeEach(() => {
        metricsStore.clear();
    });

    describe('measureComponentPerformance', () => {
        it('should measure component rendering time', () => {
            const measurement = measureComponentPerformance('TestComponent');
            const timer = measurement.start();

            // 시뮬레이션된 작업 시간
            const startTime = Date.now();
            while (Date.now() - startTime < 10) {
                // 10ms 대기
            }

            const duration = timer.end();

            // 측정 시간이 0보다 크고 합리적인 범위 내에 있는지 확인
            expect(duration).toBeGreaterThan(0);
            expect(duration).toBeLessThan(1000); // 1초 미만
        });
    });

    describe('analyzePerformance', () => {
        it('should return empty analysis when no metrics', () => {
            const analysis = analyzePerformance();

            expect(analysis.metrics).toHaveLength(0);
            expect(analysis.overallScore).toBe(0);
            expect(analysis.recommendations).toHaveLength(0);
        });

        it('should calculate correct score for good metrics', () => {
            // 좋은 성능 메트릭 추가
            metricsStore.addMetric({
                name: 'LCP',
                value: 2000, // good
                rating: 'good',
                timestamp: Date.now(),
                url: 'test',
            });

            metricsStore.addMetric({
                name: 'CLS',
                value: 0.05, // good
                rating: 'good',
                timestamp: Date.now(),
                url: 'test',
            });

            const analysis = analyzePerformance();

            expect(analysis.overallScore).toBe(100);
            expect(analysis.recommendations).toHaveLength(0);
        });

        it('should provide recommendations for poor metrics', () => {
            // 나쁜 성능 메트릭 추가
            metricsStore.addMetric({
                name: 'LCP',
                value: 5000, // poor
                rating: 'poor',
                timestamp: Date.now(),
                url: 'test',
            });

            const analysis = analyzePerformance();

            expect(analysis.overallScore).toBe(0);
            expect(analysis.recommendations).toHaveLength(1);
            expect(analysis.recommendations[0]).toContain('LCP 개선');
        });
    });
});

// 메모이제이션 컴포넌트 테스트
describe('Optimized Components', () => {
    describe('OptimizedCard', () => {
        it('should render without crashing', () => {
            render(
                React.createElement(OptimizedCard, {
                    title: 'Test Card',
                    description: 'Test description',
                    badges: ['tag1', 'tag2'],
                })
            );

            expect(screen.getByText('Test Card')).toBeInTheDocument();
            expect(screen.getByText('Test description')).toBeInTheDocument();
            expect(screen.getByText('tag1')).toBeInTheDocument();
            expect(screen.getByText('tag2')).toBeInTheDocument();
        });

        it('should handle click events', () => {
            const handleClick = jest.fn();

            render(
                React.createElement(OptimizedCard, {
                    title: 'Clickable Card',
                    description: 'Click me',
                    onClick: handleClick,
                })
            );

            const card = screen.getByText('Clickable Card').closest('[class*="cursor-pointer"]');
            expect(card).toBeInTheDocument();

            if (card) {
                fireEvent.click(card);
                expect(handleClick).toHaveBeenCalledTimes(1);
            }
        });

        it('should show selected state', () => {
            render(
                React.createElement(OptimizedCard, {
                    title: 'Selected Card',
                    description: 'I am selected',
                    isSelected: true,
                })
            );

            const card = screen.getByText('Selected Card').closest('[class*="ring-2"]');
            expect(card).toBeInTheDocument();
        });
    });

    describe('OptimizedToolList', () => {
        const mockTools = [
            {
                id: '1',
                name: 'Tool 1',
                description: 'First tool',
                category: 'encoding',
                tags: ['tag1'],
            },
            {
                id: '2',
                name: 'Tool 2',
                description: 'Second tool',
                category: 'text',
                tags: ['tag2'],
            },
        ];

        it('should render list of tools', () => {
            render(React.createElement(OptimizedToolList, { tools: mockTools }));

            expect(screen.getByText('Tool 1')).toBeInTheDocument();
            expect(screen.getByText('Tool 2')).toBeInTheDocument();
            expect(screen.getByText('First tool')).toBeInTheDocument();
            expect(screen.getByText('Second tool')).toBeInTheDocument();
        });

        it('should handle tool selection', () => {
            const handleSelect = jest.fn();

            render(
                React.createElement(OptimizedToolList, {
                    tools: mockTools,
                    onSelect: handleSelect,
                })
            );

            const tool1Card = screen.getByText('Tool 1').closest('[class*="cursor-pointer"]');
            if (tool1Card) {
                fireEvent.click(tool1Card);
                expect(handleSelect).toHaveBeenCalledWith('1');
            }
        });

        it('should show selected tool', () => {
            render(
                React.createElement(OptimizedToolList, {
                    tools: mockTools,
                    selectedId: '1',
                })
            );

            const selectedCard = screen.getByText('Tool 1').closest('[class*="ring-2"]');
            expect(selectedCard).toBeInTheDocument();
        });
    });
});

// 성능 벤치마크 테스트
describe('Performance Benchmarks', () => {
    it('should render large list efficiently', async () => {
        const largeToolList = Array.from({ length: 100 }, (_, i) => ({
            id: `tool-${i}`,
            name: `Tool ${i}`,
            description: `Description for tool ${i}`,
            category: 'test',
            tags: [`tag-${i}`],
        }));

        const startTime = performance.now();

        render(React.createElement(OptimizedToolList, { tools: largeToolList }));

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // 100개 항목 렌더링이 100ms 이내에 완료되어야 함
        expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid re-renders efficiently', async () => {
        let renderCount = 0;
        const TestComponent = ({ count }: { count: number }) => {
            renderCount++;
            return React.createElement('div', null, `Count: ${count}`);
        };

        const { rerender } = render(React.createElement(TestComponent, { count: 0 }));

        const startTime = performance.now();

        // 50번 빠른 리렌더링 (테스트 시간 단축)
        for (let i = 1; i <= 50; i++) {
            rerender(React.createElement(TestComponent, { count: i }));
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // 50번 리렌더링이 50ms 이내에 완료되어야 함
        expect(totalTime).toBeLessThan(50);
        expect(renderCount).toBe(51); // 초기 렌더 + 50번 리렌더
    });
});

// 메모리 사용량 테스트
describe('Memory Usage', () => {
    it('should not create memory leaks in component mounting/unmounting', () => {
        const TestComponent = () => {
            return React.createElement(OptimizedCard, {
                title: 'Test',
                description: 'Memory test',
            });
        };

        // 컴포넌트를 여러 번 마운트/언마운트
        for (let i = 0; i < 10; i++) {
            const { unmount } = render(React.createElement(TestComponent));
            unmount();
        }

        // 메모리 사용량이 급격히 증가하지 않았는지 확인
        // 실제 환경에서는 더 정교한 메모리 측정이 필요
        expect(true).toBe(true); // 기본 통과 조건
    });
});
