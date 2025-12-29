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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ProductCategory } from '@/types/models';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';

interface CategoryOption {
    id: number;
    name_bn: string;
    name_en: string | null;
}

interface Props {
    category: ProductCategory;
    categories: CategoryOption[];
}

export default function EditProductCategory({ category, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Product Categories', href: '/dashboard/product-categories' },
        {
            title: category.name_en || category.name_bn,
            href: `/dashboard/product-categories/${category.slug}/edit`,
        },
    ];

    // Track if user explicitly removed the existing image
    const [removeImage, setRemoveImage] = useState(false);

    const form = useForm<{
        image: File | null;
        remove_image: boolean;
        name_bn: string;
        name_en: string;
        description: string;
        meta_description: string;
        parent_id: string | number;
        is_active: boolean;
        _method: string;
    }>({
        image: null,
        remove_image: false,
        name_bn: category.name_bn,
        name_en: category.name_en || '',
        description: category.description || '',
        meta_description: category.meta_description || '',
        parent_id: category.parent_id || '',
        is_active: category.is_active,
        _method: 'PUT',
    });

    // Derived slug preview
    const slugPreview = slugify(form.data.name_en, {
        lower: true,
        strict: true,
    });

    // Parent options for select (exclude current category)
    const parentOptions = categories
        .filter((cat) => cat.id !== category.id)
        .map((cat) => ({
            value: cat.id.toString(),
            label: cat.name_bn,
            description: cat.name_en || undefined,
        }));

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/dashboard/product-categories/${category.slug}`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Category updated successfully');
                router.visit('/dashboard/product-categories');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${category.name_en || category.name_bn}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Edit Product Category
                    </h1>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/product-categories">
                            <ArrowLeft />
                            Go Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={onSubmit}>
                    <FieldSet disabled={form.processing}>
                        {/* Two Column Grid */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Card - Main Info */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Category Information</CardTitle>
                                    <CardDescription>
                                        Update category details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FieldGroup>
                                        {/* Image Upload */}
                                        <Field
                                            data-invalid={!!form.errors.image}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <FieldLabel>
                                                    Category Image
                                                </FieldLabel>
                                                <ImageUploader
                                                    value={
                                                        form.data.image ||
                                                        (!removeImage &&
                                                        category.image_url
                                                            ? category.image_url
                                                            : null)
                                                    }
                                                    onChange={(file) => {
                                                        form.setData(
                                                            'image',
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
                                                    error={form.errors.image}
                                                />
                                            </div>
                                        </Field>

                                        {/* Name English */}
                                        <Field
                                            data-invalid={!!form.errors.name_en}
                                        >
                                            <FieldLabel htmlFor="name_en">
                                                Name (English){' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FieldLabel>
                                            <Input
                                                id="name_en"
                                                value={form.data.name_en}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'name_en',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <FieldError>
                                                {form.errors.name_en}
                                            </FieldError>
                                        </Field>

                                        {/* Name Bengali */}
                                        <Field
                                            data-invalid={!!form.errors.name_bn}
                                        >
                                            <FieldLabel htmlFor="name_bn">
                                                Name (Bengali){' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FieldLabel>
                                            <Input
                                                id="name_bn"
                                                value={form.data.name_bn}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'name_bn',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <FieldError>
                                                {form.errors.name_bn}
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

                                        {/* Description */}
                                        <Field
                                            data-invalid={
                                                !!form.errors.description
                                            }
                                        >
                                            <FieldLabel htmlFor="description">
                                                Description
                                            </FieldLabel>
                                            <Textarea
                                                id="description"
                                                value={form.data.description}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                            <FieldError>
                                                {form.errors.description}
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
                                            Category status and hierarchy
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldGroup>
                                            {/* Status */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.is_active
                                                }
                                            >
                                                <FieldLabel>Status</FieldLabel>
                                                <Select
                                                    value={
                                                        form.data.is_active
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                    onValueChange={(value) =>
                                                        form.setData(
                                                            'is_active',
                                                            value === 'true',
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">
                                                            Active
                                                        </SelectItem>
                                                        <SelectItem value="false">
                                                            Inactive
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>
                                                    {form.errors.is_active}
                                                </FieldError>
                                            </Field>

                                            {/* Parent Category */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.parent_id
                                                }
                                            >
                                                <FieldLabel>
                                                    Parent Category
                                                </FieldLabel>
                                                <AdvancedSelect
                                                    options={parentOptions}
                                                    value={form.data.parent_id?.toString()}
                                                    onChange={(value) =>
                                                        form.setData(
                                                            'parent_id',
                                                            value
                                                                ? parseInt(
                                                                      value,
                                                                  )
                                                                : '',
                                                        )
                                                    }
                                                    placeholder="Select parent category"
                                                    emptyMessage="No categories found"
                                                />
                                                <FieldError>
                                                    {form.errors.parent_id}
                                                </FieldError>
                                            </Field>
                                        </FieldGroup>
                                    </CardContent>
                                </Card>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={form.processing}
                                >
                                    Update Category
                                </Button>
                            </div>
                        </div>
                    </FieldSet>
                </form>
            </div>
        </AppLayout>
    );
}
