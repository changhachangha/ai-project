import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div className={cn('flex items-center justify-center gap-2', className)}>
            <Loader2 className={cn('animate-spin', sizeClasses[size])} />
            {text && <span className='text-sm text-muted-foreground'>{text}</span>}
        </div>
    );
}

interface PageLoadingProps {
    text?: string;
}

export function PageLoading({ text = '로딩 중...' }: PageLoadingProps) {
    return (
        <div className='min-h-[400px] flex items-center justify-center'>
            <LoadingSpinner size='lg' text={text} />
        </div>
    );
}

interface ButtonLoadingProps {
    isLoading: boolean;
    children: React.ReactNode;
    loadingText?: string;
}

export function ButtonLoading({ isLoading, children, loadingText }: ButtonLoadingProps) {
    if (isLoading) {
        return (
            <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                {loadingText || children}
            </>
        );
    }

    return <>{children}</>;
}
