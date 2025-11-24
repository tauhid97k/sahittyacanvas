import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: LinkProps) {
    return (
        <Link
            className={cn(
                'text-foreground decoration-zinc-300 underline-offset-4 transition-colors duration-300 ease-out hover:underline hover:decoration-current! focus-visible:underline focus-visible:outline-hidden dark:decoration-zinc-500',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
