import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
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

interface Role {
    id: number;
    name: string;
}

interface Props {
    role: Role;
    permissions: Record<string, Permission[]>;
    rolePermissions: string[];
}

export default function RoleEdit({
    role,
    permissions,
    rolePermissions,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/dashboard/roles' },
        { title: role.name, href: `/dashboard/roles/${role.id}` },
        { title: 'Edit', href: `/dashboard/roles/${role.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: rolePermissions,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dashboard/roles/${role.id}`);
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

    const isGroupPartiallySelected = (groupPermissions: Permission[]) => {
        const selected = groupPermissions.filter((p) =>
            data.permissions.includes(p.name),
        );
        return selected.length > 0 && selected.length < groupPermissions.length;
    };

    const isSuperRole = role.name === 'SUPER';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${role.name}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/roles">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Edit Role</h1>
                        <p className="text-sm text-muted-foreground">
                            Update role and permissions
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="p-4 md:p-6">
                            <FieldGroup>
                                <Field data-invalid={!!errors.name}>
                                    <FieldLabel htmlFor="name">
                                        Role Name
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData(
                                                'name',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="Enter role name"
                                        className="max-w-md"
                                        disabled={isSuperRole}
                                    />
                                    <FieldError>{errors.name}</FieldError>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {/* Permissions by Group */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {Object.entries(permissions).map(
                            ([group, groupPermissions]) => (
                                <Card key={group}>
                                    <CardHeader className="rounded-t-lg border-b bg-muted/50 px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={`group-${group}`}
                                                checked={
                                                    isGroupPartiallySelected(
                                                        groupPermissions,
                                                    )
                                                        ? 'indeterminate'
                                                        : isGroupFullySelected(
                                                              groupPermissions,
                                                          )
                                                }
                                                onCheckedChange={() =>
                                                    handleGroupToggle(
                                                        groupPermissions,
                                                    )
                                                }
                                                disabled={isSuperRole}
                                            />
                                            <CardTitle className="text-base font-semibold">
                                                {group}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-4">
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
                                                    disabled={isSuperRole}
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

                    {!isSuperRole && (
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/roles">Cancel</Link>
                            </Button>
                            <Button type="submit" isLoading={processing}>
                                <Save />
                                Update Role
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
