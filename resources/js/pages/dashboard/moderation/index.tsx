import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    Check,
    Eye,
    FileText,
    MessageCircle,
    MoreVertical,
    Settings,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface PendingPost {
    id: number;
    user_id: number;
    title_bn: string;
    title_en: string;
    slug: string;
    excerpt: string;
    status: string;
    moderation_status: 'auto' | 'pending' | 'approved' | 'rejected';
    moderated_at: string | null;
    created_at: string;
    featured_image_url: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
    author?: {
        id: number;
        name_bn: string;
        name_en: string | null;
    } | null;
    categories?: {
        id: number;
        name_bn: string;
        name_en: string | null;
    }[];
}

interface PendingComment {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    moderation_status: 'auto' | 'pending' | 'approved' | 'rejected';
    moderated_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
    post: {
        id: number;
        title_bn: string;
        title_en: string;
        slug: string;
    };
}

interface Props {
    pendingPosts: PaginatedData<PendingPost>;
    pendingComments: PaginatedData<PendingComment>;
    filters: {
        tab: string;
        search: string;
    };
    counts: {
        posts: number;
        comments: number;
    };
    settings: {
        posts_require_approval: boolean;
        comments_require_approval: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Moderation', href: '/dashboard/moderation' },
];

export default function ModerationIndex({
    pendingPosts,
    pendingComments,
    filters,
    counts,
    settings,
}: Props) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [postModeration, setPostModeration] = useState(
        settings.posts_require_approval,
    );
    const [commentModeration, setCommentModeration] = useState(
        settings.comments_require_approval,
    );

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/moderation',
            { tab: filters.tab, search: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleTabChange = (value: string) => {
        router.get(
            '/dashboard/moderation',
            { tab: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSettingChange = (key: string, value: boolean) => {
        router.post(
            '/dashboard/moderation/settings',
            { key, value },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (key === 'posts_require_approval') {
                        setPostModeration(value);
                    } else {
                        setCommentModeration(value);
                    }
                    toast.success(
                        `Moderation ${value ? 'turned on' : 'turned off'} for ${key === 'posts_require_approval' ? 'Post' : 'Comment'}`,
                    );
                },
                onError: () => {
                    toast.error('Failed to update setting');
                },
            },
        );
    };

    const handleApprovePost = (post: PendingPost) => {
        setIsProcessing(true);
        router.post(
            `/dashboard/moderation/posts/${post.id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Post approved and published');
                },
                onError: () => {
                    toast.error('Failed to approve post');
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleRejectPost = (post: PendingPost) => {
        setIsProcessing(true);
        router.post(
            `/dashboard/moderation/posts/${post.id}/reject`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Post rejected');
                },
                onError: () => {
                    toast.error('Failed to reject post');
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleApproveComment = (comment: PendingComment) => {
        setIsProcessing(true);
        router.post(
            `/dashboard/moderation/comments/${comment.id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Comment approved');
                },
                onError: () => {
                    toast.error('Failed to approve comment');
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleRejectComment = (comment: PendingComment) => {
        setIsProcessing(true);
        router.post(
            `/dashboard/moderation/comments/${comment.id}/reject`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Comment rejected');
                },
                onError: () => {
                    toast.error('Failed to reject comment');
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const postColumns: ColumnDef<PendingPost>[] = [
        {
            accessorKey: 'title',
            header: 'Post',
            cell: ({ row }) => (
                <div className="max-w-md">
                    <p className="line-clamp-1 font-medium">
                        {row.original.title_bn}
                    </p>
                    {row.original.title_en && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                            {row.original.title_en}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'user',
            header: 'Submitted By',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {row.original.user.email}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'categories',
            header: 'Categories',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.categories?.slice(0, 2).map((cat) => (
                        <Badge key={cat.id} variant="secondary">
                            {cat.name_bn}
                        </Badge>
                    ))}
                    {(row.original.categories?.length ?? 0) > 2 && (
                        <Badge variant="outline">
                            +{(row.original.categories?.length ?? 0) - 2}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Submitted',
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
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/dashboard/posts/${row.original.slug}`}
                            >
                                <Eye />
                                View Post
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleApprovePost(row.original)}
                            disabled={isProcessing}
                        >
                            <Check />
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleRejectPost(row.original)}
                            disabled={isProcessing}
                        >
                            <X />
                            Reject
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const commentColumns: ColumnDef<PendingComment>[] = [
        {
            accessorKey: 'content',
            header: 'Comment',
            cell: ({ row }) => (
                <div className="max-w-md">
                    <p className="line-clamp-2">{row.original.content}</p>
                </div>
            ),
        },
        {
            accessorKey: 'user',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                        {row.original.user.avatar ? (
                            <img
                                src={row.original.user.avatar}
                                alt={row.original.user.name}
                                className="size-9 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-medium">
                                {row.original.user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium">{row.original.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {row.original.user.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'post',
            header: 'On Post',
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <p className="line-clamp-1 font-medium">
                        {row.original.post.title_bn}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
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
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/dashboard/posts/${row.original.post.slug}`}
                            >
                                <Eye />
                                View Post
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleApproveComment(row.original)}
                            disabled={isProcessing}
                        >
                            <Check />
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleRejectComment(row.original)}
                            disabled={isProcessing}
                        >
                            <X />
                            Reject
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderation" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Moderation</h1>
                        <p className="text-sm text-muted-foreground">
                            Review and approve pending content
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setSettingsOpen(true)}
                        className="gap-2"
                    >
                        <Settings className="size-4" />
                        Moderation Settings
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2">
                    <Button
                        variant={
                            filters.tab === 'posts' ? 'default' : 'outline'
                        }
                        onClick={() => handleTabChange('posts')}
                        className="gap-2"
                    >
                        <FileText className="size-4" />
                        Posts
                        {counts.posts > 0 && (
                            <Badge
                                variant={
                                    filters.tab === 'posts'
                                        ? 'secondary'
                                        : 'outline'
                                }
                                className="ml-1 h-5 min-w-5 px-1"
                            >
                                {counts.posts}
                            </Badge>
                        )}
                    </Button>
                    <Button
                        variant={
                            filters.tab === 'comments' ? 'default' : 'outline'
                        }
                        onClick={() => handleTabChange('comments')}
                        className="gap-2"
                    >
                        <MessageCircle className="size-4" />
                        Comments
                        {counts.comments > 0 && (
                            <Badge
                                variant={
                                    filters.tab === 'comments'
                                        ? 'secondary'
                                        : 'outline'
                                }
                                className="ml-1 h-5 min-w-5 px-1"
                            >
                                {counts.comments}
                            </Badge>
                        )}
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Search */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                            <Input
                                placeholder={
                                    filters.tab === 'posts'
                                        ? 'Search posts...'
                                        : 'Search comments...'
                                }
                                defaultValue={filters.search || ''}
                                onChange={(e) =>
                                    debouncedSearch(e.target.value)
                                }
                                className="w-full sm:max-w-sm"
                            />
                        </div>

                        {/* Content based on tab */}
                        {filters.tab === 'posts' ? (
                            <>
                                <DataTable
                                    columns={postColumns}
                                    data={pendingPosts.data}
                                />
                                <Pagination
                                    links={pendingPosts.links}
                                    from={pendingPosts.from}
                                    to={pendingPosts.to}
                                    total={pendingPosts.total}
                                    perPage={pendingPosts.per_page}
                                    currentPath="/dashboard/moderation"
                                />
                            </>
                        ) : (
                            <>
                                <DataTable
                                    columns={commentColumns}
                                    data={pendingComments.data}
                                />
                                <Pagination
                                    links={pendingComments.links}
                                    from={pendingComments.from}
                                    to={pendingComments.to}
                                    total={pendingComments.total}
                                    perPage={pendingComments.per_page}
                                    currentPath="/dashboard/moderation"
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Settings Modal */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Moderation Settings</DialogTitle>
                        <DialogDescription>
                            Configure moderation requirements for posts and
                            comments.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="post-moderation">
                                    Post Moderation
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Require approval before publishing posts
                                </p>
                            </div>
                            <Switch
                                id="post-moderation"
                                checked={postModeration}
                                onCheckedChange={(checked) =>
                                    handleSettingChange(
                                        'posts_require_approval',
                                        checked,
                                    )
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="comment-moderation">
                                    Comment Moderation
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Require approval before showing comments
                                </p>
                            </div>
                            <Switch
                                id="comment-moderation"
                                checked={commentModeration}
                                onCheckedChange={(checked) =>
                                    handleSettingChange(
                                        'comments_require_approval',
                                        checked,
                                    )
                                }
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
