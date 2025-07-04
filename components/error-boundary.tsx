'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    reset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} reset={this.reset} />;
            }

            return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
        }

        return this.props.children;
    }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
    return (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='flex justify-center mb-4'>
                        <AlertTriangle className='h-12 w-12 text-destructive' />
                    </div>
                    <CardTitle>문제가 발생했습니다</CardTitle>
                    <CardDescription>예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {error && process.env.NODE_ENV === 'development' && (
                        <details className='text-sm text-muted-foreground'>
                            <summary className='cursor-pointer font-medium mb-2'>오류 세부 정보 (개발 모드)</summary>
                            <pre className='whitespace-pre-wrap break-words bg-muted p-2 rounded text-xs'>
                                {error.message}
                                {error.stack && `\n\n${error.stack}`}
                            </pre>
                        </details>
                    )}
                    <div className='flex gap-2'>
                        <Button onClick={reset} className='flex-1'>
                            <RefreshCw className='h-4 w-4 mr-2' />
                            다시 시도
                        </Button>
                        <Button variant='outline' onClick={() => window.location.reload()} className='flex-1'>
                            페이지 새로고침
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export { ErrorBoundary, DefaultErrorFallback };
