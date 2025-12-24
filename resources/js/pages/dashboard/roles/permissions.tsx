import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    allPermissions: Record<string, Permission[]>;
    rolePermissions: string[];
}

export default function RolePermissions({
    role,
    allPermissions,
    rolePermissions,
}: Props) {
    const [selectedPermissions, setSelectedPermissions] =
        useState<string[]>(rolePermissions);
    const [isProcessing, setIsProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/dashboard/roles' },
        { title: role.name, href: `/dashboard/roles/${role.id}` },
        {
            title: 'Permissions',
            href: `/dashboard/roles/${role.id}/permissions`,
        },
    ];

    const handlePermissionToggle = (permissionName: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionName)
                ? prev.filter((p) => p !== permissionName)
                : [...prev, permissionName],
        );
    };

    const handleGroupToggle = (group: string, permissions: Permission[]) => {
        const groupPermissionNames = permissions.map((p) => p.name);
        const allSelected = groupPermissionNames.every((name) =>
            selectedPermissions.includes(name),
        );

        if (allSelected) {
            setSelectedPermissions((prev) =>
                prev.filter((p) => !groupPermissionNames.includes(p)),
            );
        } else {
            setSelectedPermissions((prev) => [
                ...prev.filter((p) => !groupPermissionNames.includes(p)),
                ...groupPermissionNames,
            ]);
        }
    };

    const handleSubmit = () => {
        setIsProcessing(true);
        router.put(
            `/dashboard/roles/${role.id}/permissions`,
            { permissions: selectedPermissions },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Permissions updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update permissions');
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const isGroupFullySelected = (permissions: Permission[]) => {
        return permissions.every((p) => selectedPermissions.includes(p.name));
    };

    const isGroupPartiallySelected = (permissions: Permission[]) => {
        const selected = permissions.filter((p) =>
            selectedPermissions.includes(p.name),
        );
        return selected.length > 0 && selected.length < permissions.length;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${role.name} - Permissions`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/roles">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            Permissions for {role.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage permissions for this role
                        </p>
                    </div>
                </div>

                {/* Role Name Display */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Role Name</FieldLabel>
                                <Input value={role.name} disabled />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>

                {/* Permissions by Group */}
                <div className="grid gap-6 md:grid-cols-2">
                    {Object.entries(allPermissions).map(
                        ([group, permissions]) => (
                            <Card key={group}>
                                <CardHeader className="rounded-t-lg border-b bg-muted/50 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={`group-${group}`}
                                            checked={
                                                isGroupPartiallySelected(
                                                    permissions,
                                                )
                                                    ? 'indeterminate'
                                                    : isGroupFullySelected(
                                                          permissions,
                                                      )
                                            }
                                            onCheckedChange={() =>
                                                handleGroupToggle(
                                                    group,
                                                    permissions,
                                                )
                                            }
                                        />
                                        <CardTitle className="text-base font-semibold">
                                            {group}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 p-4">
                                    {permissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="flex items-center gap-3"
                                        >
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={selectedPermissions.includes(
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

                {/* Save Button (bottom) */}
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} isLoading={isProcessing}>
                        Save Permissions
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
