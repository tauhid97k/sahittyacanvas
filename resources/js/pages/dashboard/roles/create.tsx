import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Permission {
    id: number;
    name: string;
    group: string;
}

interface Props {
    permissions: Record<string, Permission[]>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/dashboard/roles' },
    { title: 'Create', href: '/dashboard/roles/create' },
];

export default function RoleCreate({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/dashboard/roles');
    };

    const handlePermissionToggle = (permissionName: string) => {
        setData(
            'permissions',
            data.permissions.includes(permissionName)
                ? data.permissions.filter((p) => p !== permissionName)
                : [...data.permissions, permissionName],
        );
    };

    const handleGroupToggle = (groupPermissions: Permission[]) => {
        const groupPermissionNames = groupPermissions.map((p) => p.name);
        const allSelected = groupPermissionNames.every((name) =>
            data.permissions.includes(name),
        );

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter(
                    (p) => !groupPermissionNames.includes(p),
                ),
            );
        } else {
            setData('permissions', [
                ...data.permissions.filter(
                    (p) => !groupPermissionNames.includes(p),
                ),
                ...groupPermissionNames,
            ]);
        }
    };

    const isGroupFullySelected = (groupPermissions: Permission[]) => {
        return groupPermissions.every((p) => data.permissions.includes(p.name));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/roles">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Create Role</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new role with permissions
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="p-4 md:p-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            'name',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Enter role name (e.g., MANAGER)"
                                    className="max-w-md"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions by Group */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {Object.entries(permissions).map(
                            ([group, groupPermissions]) => (
                                <Card key={group}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={`group-${group}`}
                                                checked={isGroupFullySelected(
                                                    groupPermissions,
                                                )}
                                                onCheckedChange={() =>
                                                    handleGroupToggle(
                                                        groupPermissions,
                                                    )
                                                }
                                            />
                                            <CardTitle className="text-base">
                                                {group}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {groupPermissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center gap-3"
                                            >
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={data.permissions.includes(
                                                        permission.name,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handlePermissionToggle(
                                                            permission.name,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="cursor-pointer text-sm font-normal"
                                                >
                                                    {permission.name.replace(
                                                        /_/g,
                                                        ' ',
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/roles">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            Create Role
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
