import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { NoImage } from '@/components/ui/no-image';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Author } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    authors: PaginatedData<Author>;
    filters: {
        search: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Authors', href: '/dashboard/authors' },
];

export default function AuthorsIndex({ authors, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/authors',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    // Open Delete Dialog
    const openDelete = (author: Author) => {
        setSelectedAuthor(author);
        setOpenDeleteDialog(true);
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedAuthor) return;

        setIsDeleting(true);
        router.delete(`/dashboard/authors/${selectedAuthor.slug}`, {
            onSuccess: () => {
                toast.success('Author deleted successfully');
                setOpenDeleteDialog(false);
                setSelectedAuthor(null);
            },
            onError: () => {
                toast.error('Failed to delete author');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Table columns
    const columns: ColumnDef<Author>[] = [
        {
            accessorKey: 'avatar_url',
            header: 'Photo',
            cell: ({ row }) =>
                row.original.avatar_url ? (
                    <img
                        src={row.original.avatar_url}
                        alt={row.original.name_bn}
                        className="size-14 rounded-full object-cover"
                    />
                ) : (
                    <NoImage className="size-14 rounded-full" />
                ),
        },
        {
            accessorKey: 'name_bn',
            header: 'Name (Bengali)',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name_bn}</div>
            ),
        },
        {
            accessorKey: 'name_en',
            header: 'Name (English)',
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {row.original.name_en}
                </div>
            ),
        },
        {
            accessorKey: 'nationality',
            header: 'Nationality',
            cell: ({ row }) =>
                row.original.nationality ? (
                    <span className="text-muted-foreground">
                        {row.original.nationality}
                    </span>
                ) : null,
        },
        {
            accessorKey: 'posts_count',
            header: 'Posts',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.posts_count || 0}
                </Badge>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/dashboard/authors/${row.original.slug}/edit`}
                            >
                                <Pencil />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(row.original)}
                        >
                            <Trash />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Authors" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Authors</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage famous writers and authors
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/authors/create">
                            <Plus />
                            Add Author
                        </Link>
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Search */}
                        <div className="mb-6 flex items-center gap-4">
                            <Input
                                placeholder="Search authors..."
                                value={search}
                                type="search"
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="max-w-sm"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={authors.data} />

                        {/* Pagination */}
                        <Pagination
                            links={authors.links}
                            from={authors.from}
                            to={authors.to}
                            total={authors.total}
                            perPage={authors.per_page}
                            currentPath="/dashboard/authors"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Author</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedAuthor?.name_bn}"? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            variant="destructive"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
