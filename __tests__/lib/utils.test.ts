import { cn } from '@/lib/utils';

describe('utils', () => {
    describe('cn', () => {
        it('merges class names correctly', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2');
        });

        it('handles conditional classes', () => {
            expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
        });

        it('handles undefined and null values', () => {
            expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
        });

        it('handles empty strings', () => {
            expect(cn('class1', '', 'class2')).toBe('class1 class2');
        });

        it('merges conflicting Tailwind classes correctly', () => {
            expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
        });
    });
});
