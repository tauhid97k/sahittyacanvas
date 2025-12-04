import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaginationLink } from '@/types/pagination';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
    // Don't render if only prev/next links (no pages)
    if (links.length <= 3) return null;

    return (
        <div className={cn('flex items-center justify-center gap-1.5 pt-6 border-t', className)}>
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={cn(
                            buttonVariants({
                                variant: link.active ? 'default' : 'outline',
                                size: 'icon-lg',
                            }),
                            "px-3"
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'icon-lg' }),
                            "pointer-events-none opacity-50 px-3"
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
}

export default Pagination;
