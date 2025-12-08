import { AdvancedSelect } from '@/components/ui/advanced-select';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Author, Category } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';

interface Props {
    categories: Pick<Category, 'id' | 'name_bn' | 'name_en'>[];
    authors: Pick<Author, 'id' | 'name_bn' | 'name_en'>[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/dashboard/posts' },
    { title: 'Create', href: '/dashboard/posts/create' },
];

export default function CreatePost({ categories, authors }: Props) {
    const [submittingStatus, setSubmittingStatus] = useState<
        'draft' | 'published' | null
    >(null);
    const [isAddingPage, setIsAddingPage] = useState(false);

    const form = useForm<{
        featured_image: File | null;
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
        title_bn: '',
        title_en: '',
        excerpt: '',
        meta_description: '',
        content: '',
        category_ids: [],
        author_id: '',
        status: 'draft',
    });

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

        form.post('/dashboard/posts', {
            forceFormData: true,
            onSuccess: () => {
                toast.success(
                    status === 'published'
                        ? 'Post published successfully'
                        : 'Post saved as draft',
                );
            },
        });
    };

    // Handle adding a new page - saves post first, then creates page 2
    const handleAddPage = () => {
        // Validate content exists
        if (!form.data.content || form.data.content.trim() === '') {
            toast.error('Please add content to the current page first');
            return;
        }

        // Validate required fields
        if (!form.data.title_bn || !form.data.title_en || !form.data.excerpt) {
            toast.error('Please fill in all required fields first');
            return;
        }

        setIsAddingPage(true);

        // Save as draft and create new page
        form.transform((data) => ({
            ...data,
            status: 'draft',
            _create_page: true, // Signal backend to create page 2
        }));

        form.post('/dashboard/posts', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Post saved. Redirecting to add new page...');
            },
            onError: () => {
                toast.error('Failed to save post');
                setIsAddingPage(false);
            },
            onFinish: () => {
                setIsAddingPage(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Create Post</h1>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/posts">
                            <ArrowLeft />
                            Go Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <FieldSet disabled={form.processing}>
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
                                        <CardTitle>Content</CardTitle>
                                        <CardDescription>
                                            Write your post content here (Page
                                            1)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Field
                                            data-invalid={!!form.errors.content}
                                        >
                                            <Textarea
                                                id="content"
                                                value={form.data.content}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'content',
                                                        e.target.value,
                                                    )
                                                }
                                                rows={20}
                                                placeholder="Write your post content here..."
                                                className="mt-2 min-h-[400px]"
                                            />
                                            <FieldError>
                                                {form.errors.content}
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
                                                        form.data.featured_image
                                                    }
                                                    onChange={(file) =>
                                                        form.setData(
                                                            'featured_image',
                                                            file,
                                                        )
                                                    }
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
                                        onClick={() => handleSubmit('draft')}
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        className="w-full"
                                        size="lg"
                                        isLoading={
                                            form.processing &&
                                            submittingStatus === 'published'
                                        }
                                        disabled={form.processing}
                                        onClick={() =>
                                            handleSubmit('published')
                                        }
                                    >
                                        Publish Post
                                    </Button>
                                </div>

                                {/* Pages Section */}
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Pages
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Page 1 - Current */}
                                        <Button
                                            variant="default"
                                            size="icon"
                                            className="size-9 rounded-full"
                                        >
                                            <span>1</span>
                                        </Button>

                                        {/* Add Page Button */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-9 rounded-full"
                                            onClick={handleAddPage}
                                            disabled={
                                                isAddingPage || form.processing
                                            }
                                            isLoading={isAddingPage}
                                            title="Save post and add new page"
                                        >
                                            {!isAddingPage && (
                                                <Plus className="size-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Click + to save and add more pages
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FieldSet>
                </form>
            </div>
        </AppLayout>
    );
}
