import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Activity } from '@/types/activity';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, GitCompare, User } from 'lucide-react';

interface Props {
    activity: Activity;
}

export default function ActivityShow({ activity }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Activities', href: '/dashboard/activities' },
        {
            title: `Activity #${activity.id}`,
            href: `/dashboard/activities/${activity.id}`,
        },
    ];

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'medium',
        }).format(date);
    };

    // Get event badge variant
    const getEventBadgeVariant = (event: string | null) => {
        switch (event) {
            case 'created':
                return 'default';
            case 'updated':
                return 'secondary';
            case 'deleted':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Format properties for display
    const formatProperties = (properties: Record<string, unknown>) => {
        if (!properties || Object.keys(properties).length === 0) {
            return null;
        }
        return properties;
    };

    const properties = formatProperties(activity.properties);
    const attributes = properties?.attributes as
        | Record<string, unknown>
        | undefined;
    const old = properties?.old as Record<string, unknown> | undefined;

    // Check if we have changes to show
    const hasChanges = properties && (attributes || old);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Activity #${activity.id}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/activities">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            Activity Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View detailed information about this activity
                        </p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs">
                        {formatDate(activity.created_at)}
                    </Badge>
                </div>

                <div className="grid w-full gap-6 lg:grid-cols-2">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">
                                    ID
                                </span>
                                <span className="font-mono text-sm">
                                    {activity.id}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">
                                    Event
                                </span>
                                {activity.event ? (
                                    <Badge
                                        variant={getEventBadgeVariant(
                                            activity.event,
                                        )}
                                        className="capitalize"
                                    >
                                        {activity.event}
                                    </Badge>
                                ) : (
                                    <span className="text-sm">-</span>
                                )}
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">
                                    Log Name
                                </span>
                                <Badge variant="outline" className="capitalize">
                                    {activity.log_name || 'default'}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">
                                    Description
                                </span>
                                <span className="text-sm capitalize">
                                    {activity.description}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subject & Causer Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4" />
                                Subject & Causer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">
                                    Performed By
                                </span>
                                <span className="font-medium">
                                    {activity.causer_name}
                                </span>
                            </div>
                            <Separator />
                            {activity.causer_id && (
                                <>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Causer ID
                                        </span>
                                        <span className="font-mono text-sm">
                                            {activity.causer_id}
                                        </span>
                                    </div>
                                    <Separator />
                                </>
                            )}
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">
                                    Subject Type
                                </span>
                                <Badge variant="default" className="capitalize">
                                    {activity.subject_type_label || '-'}
                                </Badge>
                            </div>
                            <Separator />
                            {activity.subject_id && (
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-muted-foreground">
                                        Subject ID
                                    </span>
                                    <span className="font-mono text-sm">
                                        {activity.subject_id}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Changes Card - Full Width */}
                    {hasChanges && (
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <GitCompare className="h-4 w-4" />
                                    Changes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {old &&
                                Object.keys(old).length > 0 &&
                                attributes &&
                                Object.keys(attributes).length > 0 ? (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {/* Old Values */}
                                        <div className="space-y-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Old Values
                                            </span>
                                            <div className="rounded-md bg-muted p-4">
                                                <pre className="overflow-auto text-xs whitespace-pre-wrap">
                                                    {JSON.stringify(
                                                        old,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* New Values */}
                                        <div className="space-y-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                New Values
                                            </span>
                                            <div className="rounded-md bg-muted p-4">
                                                <pre className="overflow-auto text-xs whitespace-pre-wrap">
                                                    {JSON.stringify(
                                                        attributes,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ) : old && Object.keys(old).length > 0 ? (
                                    /* Only old values (e.g., deleted) */
                                    <div className="space-y-3">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Old Values
                                        </span>
                                        <div className="rounded-md bg-muted p-4">
                                            <pre className="overflow-auto text-xs whitespace-pre-wrap">
                                                {JSON.stringify(old, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ) : attributes &&
                                  Object.keys(attributes).length > 0 ? (
                                    /* Only new values (e.g., created) */
                                    <div className="space-y-3">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            New Values
                                        </span>
                                        <div className="rounded-md bg-muted p-4">
                                            <pre className="overflow-auto text-xs whitespace-pre-wrap">
                                                {JSON.stringify(
                                                    attributes,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}

                    {/* Raw Properties Card - if no attributes/old structure */}
                    {properties && !hasChanges && (
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <GitCompare className="h-4 w-4" />
                                    Properties
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md bg-muted p-4">
                                    <pre className="overflow-auto text-xs whitespace-pre-wrap">
                                        {JSON.stringify(properties, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
