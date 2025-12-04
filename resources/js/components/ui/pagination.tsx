import { buttonVariants } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PaginationLink } from '@/types/pagination';
import { Link, router } from '@inertiajs/react';

interface PaginationProps {
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
    perPage: number;
    currentPath: string;
    perPageOptions?: number[];
    className?: string;
}

export function Pagination({
    links,
    from,
    to,
    total,
    perPage,
    currentPath,
    perPageOptions = [10, 25, 50, 100],
    className,
}: PaginationProps) {
    // Don't render if no data
    if (total === 0) return null;

    const handlePerPageChange = (value: string) => {
        router.get(
            currentPath,
            { per_page: value, page: 1 },
            { preserveScroll: true, preserveState: true, replace: true }
        );
    };

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row',
                className
            )}
        >
            {/* Info */}
            <div className="text-sm text-muted-foreground">
                {from && to ? (
                    <span>
                        Showing {from} - {to} of {total}
                    </span>
                ) : (
                    <span>No results</span>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                {/* Per page selector */}
                <Select
                    value={perPage.toString()}
                    onValueChange={handlePerPageChange}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                                {option} / page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Page links */}
                {links.length > 3 && (
                    <div className="flex items-center gap-1.5">
                        {links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                    className={cn(
                                        buttonVariants({
                                            variant: link.active
                                                ? 'default'
                                                : 'outline',
                                            size: 'icon-lg',
                                        }),
                                        'px-3'
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className={cn(
                                        buttonVariants({
                                            variant: 'outline',
                                            size: 'icon-lg',
                                        }),
                                        'pointer-events-none opacity-50 px-3'
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Pagination;
