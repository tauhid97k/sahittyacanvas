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
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Edit, Key, MoreVertical, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Role {
    id: number;
    name: string;
    permissions_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: PaginatedData<Role>;
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/dashboard/roles' },
];

const SYSTEM_ROLES = ['SUPER', 'USER', 'AUTHOR', 'SELLER'];

export default function RolesIndex({ roles, filters }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/roles',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const openDeleteDialog = (role: Role) => {
        setSelectedRole(role);
        setDeleteDialog(true);
    };

    const handleDelete = () => {
        if (!selectedRole) return;
        setIsProcessing(true);
        router.delete(`/dashboard/roles/${selectedRole.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role deleted successfully');
                setDeleteDialog(false);
                setSelectedRole(null);
            },
            onError: () => {
                toast.error('Failed to delete role');
            },
            onFinish: () => {
                setIsProcessing(false);
            },
        });
    };

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            header: 'Role Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                    {SYSTEM_ROLES.includes(row.original.name) && (
                        <Badge variant="secondary">System</Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'permissions_count',
            header: 'Permissions',
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.original.permissions_count} permissions
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
                                href={`/dashboard/roles/${row.original.id}/permissions`}
                            >
                                <Key />
                                Permissions
                            </Link>
                        </DropdownMenuItem>
                        {row.original.name !== 'SUPER' && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/dashboard/roles/${row.original.id}/edit`}
                                >
                                    <Edit />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {!SYSTEM_ROLES.includes(row.original.name) && (
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => openDeleteDialog(row.original)}
                            >
                                <Trash />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Roles</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage roles and permissions
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/roles/create">
                            <Plus />
                            Add Role
                        </Link>
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                            <Input
                                placeholder="Search roles..."
                                defaultValue={filters.search || ''}
                                onChange={(e) =>
                                    debouncedSearch(e.target.value)
                                }
                                className="w-full sm:max-w-sm"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={roles.data} />

                        {/* Pagination */}
                        <Pagination
                            links={roles.links}
                            from={roles.from}
                            to={roles.to}
                            total={roles.total}
                            perPage={roles.per_page}
                            currentPath="/dashboard/roles"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the role "
                            {selectedRole?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isProcessing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
