import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = jest.fn();

        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes correctly', () => {
        const { rerender } = render(<Button variant='destructive'>Delete</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-destructive');

        rerender(<Button variant='outline'>Outline</Button>);
        expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('applies size classes correctly', () => {
        const { rerender } = render(<Button size='sm'>Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-8');

        rerender(<Button size='lg'>Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-10');
    });

    it('applies default classes', () => {
        render(<Button>Default</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-primary');
        expect(button).toHaveClass('h-9');
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders as child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href='/test'>Link Button</a>
            </Button>
        );
        expect(screen.getByRole('link')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });
});
