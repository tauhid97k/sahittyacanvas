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
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    Ban,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    ShieldOff,
    Trash,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface UserRole {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    username: string | null;
    avatar: string | null;
    is_verified: boolean;
    banned_at: string | null;
    ban_reason: string | null;
    created_at: string;
    roles: UserRole[];
    posts_count: number;
    followers_count: number;
}

interface SpatieRole {
    id: number;
    name: string;
}

interface Props {
    users: PaginatedData<User>;
    roles: SpatieRole[];
    filters: {
        search: string;
        status: string;
        role: string;
    };
    can: {
        view_user: boolean;
        create_user: boolean;
        edit_user: boolean;
        ban_user: boolean;
        delete_user: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/dashboard/users' },
];

export default function UsersIndex({ users, roles, filters, can }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [banDialog, setBanDialog] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [banReason, setBanReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBanning, setIsBanning] = useState(false);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
    });

    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/users',
            { ...filters, search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleStatusFilter = (value: string) => {
        router.get(
            '/dashboard/users',
            {
                ...filters,
                status: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setDeleteDialog(true);
    };

    const openBanDialog = (user: User) => {
        setSelectedUser(user);
        setBanReason('');
        setBanDialog(true);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            roles: user.roles.map((r) => r.name),
        });
        editForm.clearErrors();
        setEditDialog(true);
    };

    const openCreateDialog = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateDialog(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dashboard/users', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User created successfully');
                setCreateDialog(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(`/dashboard/users/${selectedUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User updated successfully');
                setEditDialog(false);
                setSelectedUser(null);
            },
        });
    };

    const handleRoleFilter = (value: string) => {
        router.get(
            '/dashboard/users',
            {
                ...filters,
                role: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        setIsDeleting(true);
        router.delete(`/dashboard/users/${selectedUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User deleted successfully');
                setDeleteDialog(false);
                setSelectedUser(null);
            },
            onError: () => {
                toast.error('Failed to delete user');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleBan = () => {
        if (!selectedUser) return;
        setIsBanning(true);
        router.post(
            `/dashboard/users/${selectedUser.id}/ban`,
            { reason: banReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('User banned successfully');
                    setBanDialog(false);
                    setSelectedUser(null);
                    setBanReason('');
                },
                onError: () => {
                    toast.error('Failed to ban user');
                },
                onFinish: () => {
                    setIsBanning(false);
                },
            },
        );
    };

    const handleUnban = (user: User) => {
        router.post(
            `/dashboard/users/${user.id}/unban`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('User unbanned successfully');
                },
                onError: () => {
                    toast.error('Failed to unban user');
                },
            },
        );
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted shrink-0">
                        {row.original.avatar ? (
                            <img
                                src={row.original.avatar}
                                alt={row.original.name}
                                className="size-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-medium">
                                {row.original.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{row.original.name}</p>
                            {row.original.is_verified && (
                                <UserCheck className="size-4 text-primary" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {row.original.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'role_names',
            header: 'Roles',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles && row.original.roles.length > 0 ? (
                        row.original.roles.map((role) => (
                            <Badge key={role.id} variant="secondary">
                                {role.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">No roles</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'posts_count',
            header: 'Posts',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.posts_count}</Badge>
            ),
        },
        {
            accessorKey: 'followers_count',
            header: 'Followers',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.followers_count}
                </Badge>
            ),
        },
        {
            accessorKey: 'banned_at',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.banned_at ? 'destructive' : 'default'}
                >
                    {row.original.banned_at ? 'Banned' : 'Active'}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Joined',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(row.original.created_at), {
                        addSuffix: true,
                    })}
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
                        {can.view_user && (
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${row.original.id}`}>
                                    <Eye />
                                    View
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {can.edit_user && (
                            <DropdownMenuItem
                                onClick={() => openEditDialog(row.original)}
                            >
                                <Edit />
                                Edit
                            </DropdownMenuItem>
                        )}
                        {can.ban_user && (
                            row.original.banned_at ? (
                                <DropdownMenuItem
                                    onClick={() => handleUnban(row.original)}
                                >
                                    <ShieldOff />
                                    Unban
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => openBanDialog(row.original)}
                                >
                                    <Ban />
                                    Ban
                                </DropdownMenuItem>
                            )
                        )}
                        {can.delete_user && (
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
            <Head title="Users" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Users</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage system users
                        </p>
                    </div>
                    {can.create_user && (
                        <Button onClick={openCreateDialog}>
                            <Plus />
                            Add User
                        </Button>
                    )}
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                            <Input
                                placeholder="Search users..."
                                defaultValue={filters.search || ''}
                                onChange={(e) =>
                                    debouncedSearch(e.target.value)
                                }
                                className="w-full sm:max-w-sm"
                            />
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="banned">
                                        Banned
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <AdvancedSelect
                                options={[
                                    { value: 'all', label: 'All Roles' },
                                    ...roles.map((role) => ({
                                        value: role.name,
                                        label: role.name,
                                    })),
                                ]}
                                value={filters.role || 'all'}
                                onChange={handleRoleFilter}
                                placeholder="All Roles"
                                className="w-full sm:w-[180px]"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={users.data} />

                        {/* Pagination */}
                        <Pagination
                            links={users.links}
                            from={users.from}
                            to={users.to}
                            total={users.total}
                            perPage={users.per_page}
                            currentPath="/dashboard/users"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedUser?.name}
                            ? This action cannot be undone.
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

            {/* Ban Dialog */}
            <Dialog open={banDialog} onOpenChange={setBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            Ban {selectedUser?.name} from accessing the
                            platform.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="py-4">
                        <Field>
                            <FieldLabel htmlFor="ban-reason">
                                Reason (optional)
                            </FieldLabel>
                            <Textarea
                                id="ban-reason"
                                placeholder="Enter reason for banning..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBanDialog(false)}
                            disabled={isBanning}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBan}
                            isLoading={isBanning}
                        >
                            Ban User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>
                            Add a new user to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <FieldGroup className="py-4">
                            <Field data-invalid={!!createForm.errors.name}>
                                <FieldLabel htmlFor="create-name">
                                    Name
                                </FieldLabel>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter name"
                                />
                                <FieldError>
                                    {createForm.errors.name}
                                </FieldError>
                            </Field>
                            <Field data-invalid={!!createForm.errors.email}>
                                <FieldLabel htmlFor="create-email">
                                    Email
                                </FieldLabel>
                                <Input
                                    id="create-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter email"
                                />
                                <FieldError>
                                    {createForm.errors.email}
                                </FieldError>
                            </Field>
                            <Field data-invalid={!!createForm.errors.password}>
                                <FieldLabel htmlFor="create-password">
                                    Password
                                </FieldLabel>
                                <Input
                                    id="create-password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter password"
                                />
                                <FieldError>
                                    {createForm.errors.password}
                                </FieldError>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="create-password-confirm">
                                    Confirm Password
                                </FieldLabel>
                                <Input
                                    id="create-password-confirm"
                                    type="password"
                                    value={
                                        createForm.data.password_confirmation
                                    }
                                    onChange={(e) =>
                                        createForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Confirm password"
                                />
                            </Field>
                            <Field data-invalid={!!createForm.errors.roles}>
                                <FieldLabel>Roles</FieldLabel>
                                <MultiSelect
                                    options={roles.map((role) => ({
                                        value: role.name,
                                        label: role.name,
                                    }))}
                                    value={createForm.data.roles.map((r) => ({
                                        value: r,
                                        label: r,
                                    }))}
                                    onChange={(selected) =>
                                        createForm.setData(
                                            'roles',
                                            selected.map((s) => s.value),
                                        )
                                    }
                                    placeholder="Select roles..."
                                />
                                <FieldError>
                                    {createForm.errors.roles}
                                </FieldError>
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialog(false)}
                                disabled={createForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={createForm.processing}
                            >
                                Create User
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <FieldGroup className="py-4">
                            <Field data-invalid={!!editForm.errors.name}>
                                <FieldLabel htmlFor="edit-name">
                                    Name
                                </FieldLabel>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    placeholder="Enter name"
                                />
                                <FieldError>{editForm.errors.name}</FieldError>
                            </Field>
                            <Field data-invalid={!!editForm.errors.email}>
                                <FieldLabel htmlFor="edit-email">
                                    Email
                                </FieldLabel>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter email"
                                />
                                <FieldError>{editForm.errors.email}</FieldError>
                            </Field>
                            <Field data-invalid={!!editForm.errors.password}>
                                <FieldLabel htmlFor="edit-password">
                                    New Password (optional)
                                </FieldLabel>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Leave blank to keep current"
                                />
                                <FieldError>
                                    {editForm.errors.password}
                                </FieldError>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="edit-password-confirm">
                                    Confirm New Password
                                </FieldLabel>
                                <Input
                                    id="edit-password-confirm"
                                    type="password"
                                    value={editForm.data.password_confirmation}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Confirm new password"
                                />
                            </Field>
                            <Field data-invalid={!!editForm.errors.roles}>
                                <FieldLabel>Roles</FieldLabel>
                                <MultiSelect
                                    options={roles.map((role) => ({
                                        value: role.name,
                                        label: role.name,
                                    }))}
                                    value={editForm.data.roles.map((r) => ({
                                        value: r,
                                        label: r,
                                    }))}
                                    onChange={(selected) =>
                                        editForm.setData(
                                            'roles',
                                            selected.map((s) => s.value),
                                        )
                                    }
                                    placeholder="Select roles..."
                                />
                                <FieldError>{editForm.errors.roles}</FieldError>
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialog(false)}
                                disabled={editForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={editForm.processing}
                            >
                                Update User
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
