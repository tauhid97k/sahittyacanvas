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
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import {
    MultiSelect,
    type MultiSelectOption,
} from '@/components/ui/multi-select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Author, Category, Post, PostPage } from '@/types/models';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';

interface Props {
    post: Post;
    categories: Pick<Category, 'id' | 'name_bn' | 'name_en'>[];
    authors: Pick<Author, 'id' | 'name_bn' | 'name_en'>[];
    currentPage: number;
    currentPageData: PostPage | null;
    pageOrders: number[];
}

export default function EditPost({
    post,
    categories,
    authors,
    currentPage,
    currentPageData,
    pageOrders,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Posts', href: '/dashboard/posts' },
        { title: 'Edit', href: `/dashboard/posts/${post.slug}/edit` },
    ];

    // Track if user explicitly removed the existing image
    const [removeImage, setRemoveImage] = useState(false);
    const [submittingStatus, setSubmittingStatus] = useState<
        'draft' | 'published' | null
    >(null);
    const [isAddingPage, setIsAddingPage] = useState(false);
    const [isDeletingPage, setIsDeletingPage] = useState(false);
    const [showDeletePageDialog, setShowDeletePageDialog] = useState(false);

    // Determine if we're editing page 1 (main post) or page 2+
    const isEditingMainPost = currentPage === 1;

    // Get content based on which page we're editing
    const initialContent = isEditingMainPost
        ? post.content || ''
        : currentPageData?.content || '';

    const form = useForm<{
        featured_image: File | null;
        remove_image: boolean;
        title_bn: string;
        title_en: string;
        excerpt: string;
        meta_description: string;
        content: string;
        category_ids: number[];
        author_id: string | number;
        status: string;
    }>({
        featured_image: null,
        remove_image: false,
        title_bn: post.title_bn,
        title_en: post.title_en,
        excerpt: post.excerpt,
        meta_description: post.meta_description || '',
        content: initialContent,
        category_ids: post.categories?.map((c) => c.id) || [],
        author_id: post.author_id || '',
        status: post.status,
    });

    // Page form for editing page 2+
    const pageForm = useForm<{ content: string }>({
        content: initialContent,
    });

    // Track previous page to detect navigation and sync form content
    const prevPageRef = useRef({
        page: currentPage,
        pageDataId: currentPageData?.id,
    });

    // Sync pageForm content when navigating to a different page
    // This is necessary because Inertia preserves component state on navigation
    useEffect(() => {
        const prevPage = prevPageRef.current;
        const hasPageChanged =
            prevPage.page !== currentPage ||
            prevPage.pageDataId !== currentPageData?.id;

        if (hasPageChanged) {
            const newContent =
                currentPage === 1
                    ? post.content || ''
                    : currentPageData?.content || '';
            pageForm.setData('content', newContent);
            prevPageRef.current = {
                page: currentPage,
                pageDataId: currentPageData?.id,
            };
        }
    }, [
        currentPage,
        currentPageData?.id,
        currentPageData?.content,
        post.content,
        pageForm,
    ]);

    // Derived slug preview from title_en
    const slugPreview = slugify(form.data.title_en, {
        lower: true,
        strict: true,
    });

    // Options for selects
    const categoryOptions: MultiSelectOption[] = categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name_bn,
    }));

    // Selected categories for MultiSelect
    const selectedCategories = categoryOptions.filter((opt) =>
        form.data.category_ids.includes(parseInt(opt.value)),
    );

    const authorOptions = authors.map((author) => ({
        value: author.id.toString(),
        label: author.name_bn,
        description: author.name_en || undefined,
    }));

    const handleSubmit = (status: 'draft' | 'published') => {
        setSubmittingStatus(status);

        form.transform((data) => ({
            ...data,
            status,
        }));

        form.post(`/dashboard/posts/${post.slug}`, {
            forceFormData: true,
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
            onSuccess: () => {
                toast.success(
                    status === 'published'
                        ? 'Post published successfully'
                        : 'Post saved as draft',
                );
            },
        });
    };

    // Handle page content save (for page 2+)
    const handlePageSubmit = () => {
        if (!currentPageData) return;

        pageForm.put(
            `/dashboard/posts/${post.slug}/pages/${currentPageData.id}`,
            {
                preserveScroll: false,
                onSuccess: () => {
                    toast.success('Page content saved successfully');
                },
            },
        );
    };

    // Handle adding a new page
    const handleAddPage = () => {
        // Check if current page has content before allowing new page creation
        const currentContent = isEditingMainPost
            ? form.data.content
            : pageForm.data.content;

        if (!currentContent || currentContent.trim() === '') {
            toast.error('Please add content to the current page first');
            return;
        }

        setIsAddingPage(true);
        router.post(
            `/dashboard/posts/${post.slug}/pages?from_page=${currentPage}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('New page created');
                },
                onError: (errors) => {
                    // Show validation error if backend rejects
                    if (errors.content) {
                        toast.error(errors.content);
                    } else {
                        toast.error('Failed to create new page');
                    }
                },
                onFinish: () => {
                    setIsAddingPage(false);
                },
            },
        );
    };

    // Handle deleting current page
    const handleDeletePage = () => {
        if (!currentPageData) return;

        setIsDeletingPage(true);
        router.delete(
            `/dashboard/posts/${post.slug}/pages/${currentPageData.id}`,
            {
                onSuccess: () => {
                    toast.success('Page deleted successfully');
                    setShowDeletePageDialog(false);
                },
                onError: () => {
                    toast.error('Failed to delete page');
                },
                onFinish: () => {
                    setIsDeletingPage(false);
                },
            },
        );
    };

    // Page numbers for navigation: page 1 (main) + actual page orders from DB
    const pageNumbers = [1, ...pageOrders];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${post.title_bn}`} />

            <div className="flex flex-col gap-6">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Post</h1>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/posts">
                            <ArrowLeft />
                            Go Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <FieldSet disabled={form.processing || pageForm.processing}>
                        {/* Two Column Grid */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column */}
                            <div className="flex flex-col gap-6 lg:col-span-2">
                                {/* Card 1: Basic Info - Title, Slug, Excerpt */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Post Information</CardTitle>
                                        <CardDescription>
                                            Basic details about the post
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldGroup>
                                            {/* Title (Bengali) */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.title_bn
                                                }
                                            >
                                                <FieldLabel htmlFor="title_bn">
                                                    Title (Bengali){' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    id="title_bn"
                                                    value={form.data.title_bn}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'title_bn',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <FieldError>
                                                    {form.errors.title_bn}
                                                </FieldError>
                                            </Field>

                                            {/* Title (English) */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.title_en
                                                }
                                            >
                                                <FieldLabel htmlFor="title_en">
                                                    Title (English){' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    id="title_en"
                                                    value={form.data.title_en}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'title_en',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <FieldError>
                                                    {form.errors.title_en}
                                                </FieldError>
                                            </Field>

                                            {/* Slug Preview */}
                                            <Field>
                                                <FieldLabel htmlFor="slug">
                                                    Slug (auto-generated)
                                                </FieldLabel>
                                                <Input
                                                    id="slug"
                                                    value={slugPreview}
                                                    disabled
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </Field>

                                            {/* Excerpt */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.excerpt
                                                }
                                            >
                                                <FieldLabel htmlFor="excerpt">
                                                    Excerpt{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <Textarea
                                                    id="excerpt"
                                                    value={form.data.excerpt}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'excerpt',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={2}
                                                    placeholder="A short summary of the post..."
                                                />
                                                <FieldError>
                                                    {form.errors.excerpt}
                                                </FieldError>
                                            </Field>
                                        </FieldGroup>
                                    </CardContent>
                                </Card>

                                {/* Card 2: Content (Large) */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="mb-1.5 flex items-center gap-2">
                                                    <CardTitle>
                                                        Content
                                                    </CardTitle>
                                                    {!isEditingMainPost && (
                                                        <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
                                                            Page {currentPage}
                                                        </span>
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {isEditingMainPost
                                                        ? 'Write your post content here'
                                                        : 'Continue your content for this page'}
                                                </CardDescription>
                                            </div>
                                            {/* Delete Page Button (only for page 2+) */}
                                            {!isEditingMainPost && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon-lg"
                                                    onClick={() =>
                                                        setShowDeletePageDialog(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Field
                                            data-invalid={
                                                isEditingMainPost
                                                    ? !!form.errors.content
                                                    : !!pageForm.errors.content
                                            }
                                        >
                                            <RichTextEditor
                                                value={
                                                    isEditingMainPost
                                                        ? form.data.content
                                                        : pageForm.data.content
                                                }
                                                onChange={(value) =>
                                                    isEditingMainPost
                                                        ? form.setData(
                                                              'content',
                                                              value,
                                                          )
                                                        : pageForm.setData(
                                                              'content',
                                                              value,
                                                          )
                                                }
                                                placeholder={
                                                    isEditingMainPost
                                                        ? 'Write your post content here...'
                                                        : `Continue your content for page ${currentPage}...`
                                                }
                                                editorClassName="min-h-[400px]"
                                                error={
                                                    isEditingMainPost
                                                        ? form.errors.content
                                                        : pageForm.errors
                                                              .content
                                                }
                                                uploadContext="post"
                                            />
                                            <FieldError>
                                                {isEditingMainPost
                                                    ? form.errors.content
                                                    : pageForm.errors.content}
                                            </FieldError>
                                        </Field>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">
                                {/* Settings Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Settings</CardTitle>
                                        <CardDescription>
                                            Media and classification
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldGroup>
                                            {/* Featured Image */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.featured_image
                                                }
                                            >
                                                <FieldLabel>
                                                    Featured Image
                                                </FieldLabel>
                                                <ImageUploader
                                                    value={
                                                        form.data
                                                            .featured_image ||
                                                        (!removeImage &&
                                                        post.featured_image_url
                                                            ? post.featured_image_url
                                                            : null)
                                                    }
                                                    onChange={(file) => {
                                                        form.setData(
                                                            'featured_image',
                                                            file,
                                                        );
                                                        if (file) {
                                                            setRemoveImage(
                                                                false,
                                                            );
                                                            form.setData(
                                                                'remove_image',
                                                                false,
                                                            );
                                                        } else {
                                                            setRemoveImage(
                                                                true,
                                                            );
                                                            form.setData(
                                                                'remove_image',
                                                                true,
                                                            );
                                                        }
                                                    }}
                                                    error={
                                                        form.errors
                                                            .featured_image
                                                    }
                                                    containerClassName="w-full aspect-video"
                                                />
                                            </Field>

                                            {/* Categories */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.category_ids
                                                }
                                            >
                                                <FieldLabel>
                                                    Categories{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <MultiSelect
                                                    options={categoryOptions}
                                                    value={selectedCategories}
                                                    onChange={(selected) =>
                                                        form.setData(
                                                            'category_ids',
                                                            selected.map((s) =>
                                                                parseInt(
                                                                    s.value,
                                                                ),
                                                            ),
                                                        )
                                                    }
                                                    placeholder="Select categories"
                                                    emptyMessage="No categories found"
                                                />
                                                <FieldError>
                                                    {form.errors.category_ids}
                                                </FieldError>
                                            </Field>

                                            {/* Author (Famous Writer) */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.author_id
                                                }
                                            >
                                                <FieldLabel>
                                                    Author (Famous Writer)
                                                </FieldLabel>
                                                <AdvancedSelect
                                                    options={authorOptions}
                                                    value={form.data.author_id?.toString()}
                                                    onChange={(value) =>
                                                        form.setData(
                                                            'author_id',
                                                            value
                                                                ? parseInt(
                                                                      value,
                                                                  )
                                                                : '',
                                                        )
                                                    }
                                                    placeholder="Select author"
                                                    emptyMessage="No authors found"
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Optional: Attribute to a
                                                    famous writer
                                                </p>
                                                <FieldError>
                                                    {form.errors.author_id}
                                                </FieldError>
                                            </Field>

                                            {/* Meta Description */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors
                                                        .meta_description
                                                }
                                            >
                                                <FieldLabel htmlFor="meta_description">
                                                    Meta Description
                                                </FieldLabel>
                                                <Textarea
                                                    id="meta_description"
                                                    value={
                                                        form.data
                                                            .meta_description
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'meta_description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={2}
                                                    maxLength={160}
                                                    placeholder="SEO description for search engines..."
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        form.data
                                                            .meta_description
                                                            .length
                                                    }
                                                    /160 characters
                                                </p>
                                                <FieldError>
                                                    {
                                                        form.errors
                                                            .meta_description
                                                    }
                                                </FieldError>
                                            </Field>
                                        </FieldGroup>
                                    </CardContent>
                                </Card>

                                {/* Submit Buttons */}
                                <div className="flex flex-col gap-3">
                                    {isEditingMainPost ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="w-full"
                                                size="lg"
                                                isLoading={
                                                    form.processing &&
                                                    submittingStatus === 'draft'
                                                }
                                                disabled={form.processing}
                                                onClick={() =>
                                                    handleSubmit('draft')
                                                }
                                            >
                                                Save as Draft
                                            </Button>
                                            <Button
                                                type="button"
                                                className="w-full"
                                                size="lg"
                                                isLoading={
                                                    form.processing &&
                                                    submittingStatus ===
                                                        'published'
                                                }
                                                disabled={form.processing}
                                                onClick={() =>
                                                    handleSubmit('published')
                                                }
                                            >
                                                {post.status === 'published'
                                                    ? 'Update Post'
                                                    : 'Publish Post'}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            type="button"
                                            className="w-full"
                                            size="lg"
                                            isLoading={pageForm.processing}
                                            disabled={pageForm.processing}
                                            onClick={handlePageSubmit}
                                        >
                                            Save Page {currentPage}
                                        </Button>
                                    )}
                                </div>

                                {/* Pages Section */}
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Pages
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {pageNumbers.map((pageNum) => (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    currentPage === pageNum
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="icon"
                                                className="size-9 rounded-full"
                                                asChild={
                                                    currentPage !== pageNum
                                                }
                                            >
                                                {currentPage === pageNum ? (
                                                    <span>{pageNum}</span>
                                                ) : (
                                                    <Link
                                                        href={
                                                            pageNum === 1
                                                                ? `/dashboard/posts/${post.slug}/edit`
                                                                : `/dashboard/posts/${post.slug}/edit?page=${pageNum}`
                                                        }
                                                    >
                                                        {pageNum}
                                                    </Link>
                                                )}
                                            </Button>
                                        ))}

                                        {/* Add Page Button */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                            onClick={handleAddPage}
                                            disabled={
                                                isAddingPage ||
                                                post.status === 'draft'
                                            }
                                            title={
                                                post.status === 'draft'
                                                    ? 'Save post first to add pages'
                                                    : 'Add new page'
                                            }
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                    {post.status === 'draft' && (
                                        <p className="text-xs text-muted-foreground">
                                            Save post to add more pages
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FieldSet>
                </form>
            </div>

            {/* Delete Page Dialog */}
            <AlertDialog
                open={showDeletePageDialog}
                onOpenChange={setShowDeletePageDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Page {currentPage}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this page and its
                            content. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingPage}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePage}
                            isLoading={isDeletingPage}
                            variant="destructive"
                        >
                            Delete Page
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
