import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface NoImageProps {
    className?: string;
}

export function NoImage({ className }: NoImageProps) {
    return (
        <div
            className={cn(
                'flex aspect-square items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800',
                className
            )}
        >
            <ImageOff className="size-4 text-zinc-400 dark:text-zinc-500" />
        </div>
    );
}
