import { AdvancedSelect } from '@/components/ui/advanced-select';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Category } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface CategoryOption {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    parent_id: number | null;
}

interface Props {
    categories: PaginatedData<Category>;
    allCategories: CategoryOption[];
    filters: {
        search: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/dashboard/categories' },
];

export default function CategoriesIndex({
    categories,
    allCategories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );

    // Create form
    const createForm = useForm({
        name_bn: '',
        name_en: '',
        slug: '',
        description: '',
        parent_id: '' as string | number,
        is_active: true,
        position: 0,
    });

    // Edit form
    const editForm = useForm({
        name_bn: '',
        name_en: '',
        slug: '',
        description: '',
        parent_id: '' as string | number,
        is_active: true,
        position: 0,
    });

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/categories',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    // Handle Create Submit
    const onCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dashboard/categories', {
            onSuccess: () => {
                setOpenCreateDialog(false);
                createForm.reset();
                toast.success('Category created successfully');
            },
            onError: () => {
                toast.error('Failed to create category');
            },
        });
    };

    // Handle Edit Submit
    const onEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        editForm.put(`/dashboard/categories/${selectedCategory.slug}`, {
            onSuccess: () => {
                setOpenEditDialog(false);
                setSelectedCategory(null);
                toast.success('Category updated successfully');
            },
            onError: () => {
                toast.error('Failed to update category');
            },
        });
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedCategory) return;
        router.delete(`/dashboard/categories/${selectedCategory.slug}`, {
            onSuccess: () => {
                setOpenDeleteDialog(false);
                setSelectedCategory(null);
                toast.success('Category deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete category');
            },
        });
    };

    // Open Edit Dialog
    const openEdit = (category: Category) => {
        setSelectedCategory(category);
        editForm.setData({
            name_bn: category.name_bn,
            name_en: category.name_en || '',
            slug: category.slug,
            description: category.description || '',
            parent_id: category.parent_id || '',
            is_active: category.is_active,
            position: category.position,
        });
        setOpenEditDialog(true);
    };

    // Parent options for select (exclude self and descendants for edit)
    const getParentOptions = (excludeId?: number) => {
        return allCategories
            .filter((cat) => cat.id !== excludeId)
            .map((cat) => ({
                value: cat.id.toString(),
                label: cat.name_bn,
                description: cat.name_en || undefined,
            }));
    };

    // Table columns
    const columns: ColumnDef<Category>[] = [
        {
            header: 'Name',
            accessorKey: 'name_bn',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name_bn}</span>
            ),
        },
        {
            header: 'Slug',
            accessorKey: 'slug',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.slug}</Badge>
            ),
        },
        {
            header: 'Parent',
            accessorKey: 'parent',
            cell: ({ row }) => {
                if (!row.original.parent) {
                    return <span className="text-muted-foreground">—</span>;
                }
                return (
                    <Badge variant="secondary">
                        {row.original.parent.name_bn}
                    </Badge>
                );
            },
        },
        {
            header: 'Posts',
            accessorKey: 'posts_count',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.posts_count ?? 0}
                </Badge>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'outline'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            header: 'Position',
            accessorKey: 'position',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.position}</Badge>
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
                        <DropdownMenuItem
                            onClick={() => openEdit(row.original)}
                        >
                            <Pencil />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                                setSelectedCategory(row.original);
                                setOpenDeleteDialog(true);
                            }}
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
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <Button onClick={() => setOpenCreateDialog(true)}>
                        <Plus />
                        Add Category
                    </Button>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border bg-card p-6">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                        <Input
                            type="search"
                            placeholder="Search categories..."
                            className="max-w-xs"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    <DataTable data={categories.data} columns={columns} />

                    {/* Pagination */}
                    <Pagination
                        links={categories.links}
                        from={categories.from}
                        to={categories.to}
                        total={categories.total}
                        perPage={categories.per_page}
                        currentPath={categories.path}
                    />
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>
                            Fill the form to add a new category
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onCreateSubmit} autoComplete="off">
                        <FieldSet disabled={createForm.processing}>
                            <FieldGroup>
                                <Field
                                    data-invalid={!!createForm.errors.name_bn}
                                >
                                    <FieldLabel htmlFor="name_bn">
                                        Name (Bengali){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FieldLabel>
                                    <Input
                                        id="name_bn"
                                        value={createForm.data.name_bn}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name_bn',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {createForm.errors.name_bn}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={!!createForm.errors.name_en}
                                >
                                    <FieldLabel htmlFor="name_en">
                                        Name (English)
                                    </FieldLabel>
                                    <Input
                                        id="name_en"
                                        value={createForm.data.name_en}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name_en',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {createForm.errors.name_en}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={!!createForm.errors.parent_id}
                                >
                                    <FieldLabel>Parent Category</FieldLabel>
                                    <AdvancedSelect
                                        options={getParentOptions()}
                                        value={createForm.data.parent_id?.toString()}
                                        onChange={(value) =>
                                            createForm.setData(
                                                'parent_id',
                                                value ? parseInt(value) : '',
                                            )
                                        }
                                        placeholder="Select parent category"
                                        emptyMessage="No categories found"
                                    />
                                    <FieldError>
                                        {createForm.errors.parent_id}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={
                                        !!createForm.errors.description
                                    }
                                >
                                    <FieldLabel htmlFor="description">
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        value={createForm.data.description}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {createForm.errors.description}
                                    </FieldError>
                                </Field>
                            </FieldGroup>
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={createForm.processing}
                                >
                                    Add Category
                                </Button>
                            </div>
                        </FieldSet>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category details below
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onEditSubmit} autoComplete="off">
                        <FieldSet disabled={editForm.processing}>
                            <FieldGroup>
                                <Field data-invalid={!!editForm.errors.name_bn}>
                                    <FieldLabel htmlFor="edit-name_bn">
                                        Name (Bengali){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FieldLabel>
                                    <Input
                                        id="edit-name_bn"
                                        value={editForm.data.name_bn}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'name_bn',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {editForm.errors.name_bn}
                                    </FieldError>
                                </Field>
                                <Field data-invalid={!!editForm.errors.name_en}>
                                    <FieldLabel htmlFor="edit-name_en">
                                        Name (English)
                                    </FieldLabel>
                                    <Input
                                        id="edit-name_en"
                                        value={editForm.data.name_en}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'name_en',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {editForm.errors.name_en}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={!!editForm.errors.parent_id}
                                >
                                    <FieldLabel>Parent Category</FieldLabel>
                                    <AdvancedSelect
                                        options={getParentOptions(
                                            selectedCategory?.id,
                                        )}
                                        value={editForm.data.parent_id?.toString()}
                                        onChange={(value) =>
                                            editForm.setData(
                                                'parent_id',
                                                value ? parseInt(value) : '',
                                            )
                                        }
                                        placeholder="Select parent category"
                                        emptyMessage="No categories found"
                                    />
                                    <FieldError>
                                        {editForm.errors.parent_id}
                                    </FieldError>
                                </Field>
                                <Field
                                    data-invalid={!!editForm.errors.description}
                                >
                                    <FieldLabel htmlFor="edit-description">
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {editForm.errors.description}
                                    </FieldError>
                                </Field>
                            </FieldGroup>
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpenEditDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={editForm.processing}
                                >
                                    Update Category
                                </Button>
                            </div>
                        </FieldSet>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedCategory?.name_bn}"? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={cn(
                                buttonVariants({ variant: 'destructive' }),
                            )}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
