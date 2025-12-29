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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
} from '@/components/ui/field';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import { NoImage } from '@/components/ui/no-image';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    instructions: string | null;
    icon: string | null;
    icon_url: string | null;
    is_active: boolean;
    is_cod: boolean;
    sort_order: number;
    created_at: string;
}

interface Props {
    paymentMethods: PaginatedData<PaymentMethod>;
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payment Methods', href: '/dashboard/payment-methods' },
];

const typeLabels: Record<string, string> = {
    mobile_banking: 'Mobile Banking',
    bank: 'Bank Transfer',
    cod: 'Cash on Delivery',
};

export default function PaymentMethodsIndex({
    paymentMethods,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [removeIcon, setRemoveIcon] = useState(false);

    // Create form
    const createForm = useForm<{
        name: string;
        type: string;
        description: string;
        instructions: string;
        icon: File | null;
        is_active: boolean;
        is_cod: boolean;
        sort_order: string;
    }>({
        name: '',
        type: 'mobile_banking',
        description: '',
        instructions: '',
        icon: null,
        is_active: true,
        is_cod: false,
        sort_order: '0',
    });

    // Edit form
    const editForm = useForm<{
        name: string;
        type: string;
        description: string;
        instructions: string;
        icon: File | null;
        remove_icon: boolean;
        is_active: boolean;
        is_cod: boolean;
        sort_order: string;
        _method: string;
    }>({
        name: '',
        type: 'mobile_banking',
        description: '',
        instructions: '',
        icon: null,
        remove_icon: false,
        is_active: true,
        is_cod: false,
        sort_order: '0',
        _method: 'PUT',
    });

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/payment-methods',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    // Open Edit Dialog
    const openEdit = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setRemoveIcon(false);
        editForm.setData({
            name: method.name,
            type: method.type,
            description: method.description || '',
            instructions: method.instructions || '',
            icon: null,
            remove_icon: false,
            is_active: method.is_active,
            is_cod: method.is_cod,
            sort_order: method.sort_order.toString(),
            _method: 'PUT',
        });
        setOpenEditDialog(true);
    };

    // Open Delete Dialog
    const openDelete = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setOpenDeleteDialog(true);
    };

    // Handle Create
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dashboard/payment-methods', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Payment method created successfully');
                setOpenCreateDialog(false);
                createForm.reset();
            },
            onError: () => {
                toast.error('Failed to create payment method');
            },
        });
    };

    // Handle Edit
    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethod) return;

        editForm.post(`/dashboard/payment-methods/${selectedMethod.id}`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Payment method updated successfully');
                setOpenEditDialog(false);
                setSelectedMethod(null);
            },
            onError: () => {
                toast.error('Failed to update payment method');
            },
        });
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedMethod) return;

        setIsDeleting(true);
        router.delete(`/dashboard/payment-methods/${selectedMethod.id}`, {
            onSuccess: () => {
                toast.success('Payment method deleted successfully');
                setOpenDeleteDialog(false);
                setSelectedMethod(null);
            },
            onError: (errors) => {
                const message =
                    errors.delete || 'Failed to delete payment method';
                toast.error(message);
                setOpenDeleteDialog(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Table columns
    const columns: ColumnDef<PaymentMethod>[] = [
        {
            accessorKey: 'icon_url',
            header: 'Icon',
            cell: ({ row }) =>
                row.original.icon_url ? (
                    <img
                        src={row.original.icon_url}
                        alt={row.original.name}
                        className="size-10 rounded-md object-contain"
                    />
                ) : (
                    <NoImage className="size-10" />
                ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.slug}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {typeLabels[row.original.type] || row.original.type}
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
            accessorKey: 'is_cod',
            header: 'COD',
            cell: ({ row }) =>
                row.original.is_cod ? (
                    <Badge variant="outline">COD</Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'sort_order',
            header: 'Order',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.sort_order}
                </span>
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
            <Head title="Payment Methods" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <a href="/dashboard">
                            <ArrowLeft />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            Payment Methods
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage payment methods for orders
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreateDialog(true)}>
                        <Plus />
                        Add Payment Method
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6">
                            <Input
                                placeholder="Search payment methods..."
                                value={search}
                                type="search"
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="max-w-sm"
                            />
                        </div>

                        {/* Table */}
                        <DataTable
                            columns={columns}
                            data={paymentMethods.data}
                        />

                        {/* Pagination */}
                        <Pagination
                            links={paymentMethods.links}
                            from={paymentMethods.from}
                            to={paymentMethods.to}
                            total={paymentMethods.total}
                            perPage={paymentMethods.per_page}
                            currentPath="/dashboard/payment-methods"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Create a new payment method for orders.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <FieldGroup>
                            <Field data-invalid={!!createForm.errors.name}>
                                <FieldLabel>
                                    Name{' '}
                                    <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., bKash"
                                />
                                {createForm.errors.name && (
                                    <FieldError>
                                        {createForm.errors.name}
                                    </FieldError>
                                )}
                            </Field>

                            <Field data-invalid={!!createForm.errors.type}>
                                <FieldLabel>
                                    Type{' '}
                                    <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select
                                    value={createForm.data.type}
                                    onValueChange={(value) =>
                                        createForm.setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mobile_banking">
                                            Mobile Banking
                                        </SelectItem>
                                        <SelectItem value="bank">
                                            Bank Transfer
                                        </SelectItem>
                                        <SelectItem value="cod">
                                            Cash on Delivery
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {createForm.errors.type && (
                                    <FieldError>
                                        {createForm.errors.type}
                                    </FieldError>
                                )}
                            </Field>

                            <Field
                                data-invalid={!!createForm.errors.description}
                            >
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    value={createForm.data.description}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Brief description..."
                                    rows={2}
                                />
                            </Field>

                            <Field
                                data-invalid={!!createForm.errors.instructions}
                            >
                                <FieldLabel>Instructions</FieldLabel>
                                <Textarea
                                    value={createForm.data.instructions}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'instructions',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Payment instructions for buyers..."
                                    rows={2}
                                />
                            </Field>

                            <Field data-invalid={!!createForm.errors.icon}>
                                <FieldLabel>Icon (Optional)</FieldLabel>
                                <ImageUploader
                                    value={createForm.data.icon}
                                    onChange={(file) =>
                                        createForm.setData('icon', file)
                                    }
                                    error={createForm.errors.icon}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field
                                    data-invalid={
                                        !!createForm.errors.sort_order
                                    }
                                >
                                    <FieldLabel>Sort Order</FieldLabel>
                                    <Input
                                        type="number"
                                        value={createForm.data.sort_order}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'sort_order',
                                                e.target.value,
                                            )
                                        }
                                        min="0"
                                    />
                                </Field>

                                <div className="space-y-4 pt-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={createForm.data.is_active}
                                            onCheckedChange={(checked) =>
                                                createForm.setData(
                                                    'is_active',
                                                    checked,
                                                )
                                            }
                                        />
                                        <span className="text-sm">Active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={createForm.data.is_cod}
                                            onCheckedChange={(checked) =>
                                                createForm.setData(
                                                    'is_cod',
                                                    checked,
                                                )
                                            }
                                        />
                                        <span className="text-sm">
                                            Cash on Delivery
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </FieldGroup>

                        <DialogFooter className="mt-6">
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
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Payment Method</DialogTitle>
                        <DialogDescription>
                            Update payment method details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <FieldGroup>
                            <Field data-invalid={!!editForm.errors.name}>
                                <FieldLabel>
                                    Name{' '}
                                    <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    placeholder="e.g., bKash"
                                />
                                {editForm.errors.name && (
                                    <FieldError>
                                        {editForm.errors.name}
                                    </FieldError>
                                )}
                            </Field>

                            <Field data-invalid={!!editForm.errors.type}>
                                <FieldLabel>
                                    Type{' '}
                                    <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select
                                    value={editForm.data.type}
                                    onValueChange={(value) =>
                                        editForm.setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mobile_banking">
                                            Mobile Banking
                                        </SelectItem>
                                        <SelectItem value="bank">
                                            Bank Transfer
                                        </SelectItem>
                                        <SelectItem value="cod">
                                            Cash on Delivery
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field data-invalid={!!editForm.errors.description}>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    value={editForm.data.description}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Brief description..."
                                    rows={2}
                                />
                            </Field>

                            <Field
                                data-invalid={!!editForm.errors.instructions}
                            >
                                <FieldLabel>Instructions</FieldLabel>
                                <Textarea
                                    value={editForm.data.instructions}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'instructions',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Payment instructions for buyers..."
                                    rows={2}
                                />
                            </Field>

                            <Field data-invalid={!!editForm.errors.icon}>
                                <FieldLabel>Icon (Optional)</FieldLabel>
                                <ImageUploader
                                    value={
                                        editForm.data.icon ||
                                        (!removeIcon && selectedMethod?.icon_url
                                            ? selectedMethod.icon_url
                                            : null)
                                    }
                                    onChange={(file) => {
                                        editForm.setData('icon', file);
                                        if (file) {
                                            setRemoveIcon(false);
                                            editForm.setData(
                                                'remove_icon',
                                                false,
                                            );
                                        } else {
                                            setRemoveIcon(true);
                                            editForm.setData(
                                                'remove_icon',
                                                true,
                                            );
                                        }
                                    }}
                                    error={editForm.errors.icon}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field
                                    data-invalid={!!editForm.errors.sort_order}
                                >
                                    <FieldLabel>Sort Order</FieldLabel>
                                    <Input
                                        type="number"
                                        value={editForm.data.sort_order}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'sort_order',
                                                e.target.value,
                                            )
                                        }
                                        min="0"
                                    />
                                </Field>

                                <div className="space-y-4 pt-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={editForm.data.is_active}
                                            onCheckedChange={(checked) =>
                                                editForm.setData(
                                                    'is_active',
                                                    checked,
                                                )
                                            }
                                        />
                                        <span className="text-sm">Active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={editForm.data.is_cod}
                                            onCheckedChange={(checked) =>
                                                editForm.setData(
                                                    'is_cod',
                                                    checked,
                                                )
                                            }
                                        />
                                        <span className="text-sm">
                                            Cash on Delivery
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </FieldGroup>

                        <DialogFooter className="mt-6">
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
                                Update
                            </Button>
                        </DialogFooter>
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
                        <AlertDialogTitle>
                            Delete Payment Method
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedMethod?.name}"? This action cannot be
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
