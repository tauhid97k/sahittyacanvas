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
import { ArrowLeft } from 'lucide-react';
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
                            {/* Left Card - Main Info */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Post Information</CardTitle>
                                    <CardDescription>
                                        Basic details about the post
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
                                            <div className="flex flex-col items-center gap-4">
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
                                                />
                                            </div>
                                        </Field>

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
                                            data-invalid={!!form.errors.excerpt}
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

                                        {/* Content */}
                                        <Field
                                            data-invalid={!!form.errors.content}
                                        >
                                            <FieldLabel htmlFor="content">
                                                Content{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FieldLabel>
                                            <Textarea
                                                id="content"
                                                value={form.data.content}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'content',
                                                        e.target.value,
                                                    )
                                                }
                                                rows={12}
                                                placeholder="Write your post content here..."
                                            />
                                            <FieldError>
                                                {form.errors.content}
                                            </FieldError>
                                        </Field>

                                        {/* Meta Description */}
                                        <Field
                                            data-invalid={
                                                !!form.errors.meta_description
                                            }
                                        >
                                            <FieldLabel htmlFor="meta_description">
                                                Meta Description
                                            </FieldLabel>
                                            <Textarea
                                                id="meta_description"
                                                value={
                                                    form.data.meta_description
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
                                                    form.data.meta_description
                                                        .length
                                                }
                                                /160 characters
                                            </p>
                                            <FieldError>
                                                {form.errors.meta_description}
                                            </FieldError>
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>

                            {/* Right Column - Settings Card + Submit */}
                            <div className="flex flex-col gap-6">
                                <Card className="h-fit">
                                    <CardHeader>
                                        <CardTitle>Settings</CardTitle>
                                        <CardDescription>
                                            Post status and classification
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldGroup>
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
                            </div>
                        </div>
                    </FieldSet>
                </form>
            </div>
        </AppLayout>
    );
}
