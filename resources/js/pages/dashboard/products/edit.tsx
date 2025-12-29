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
import { Input } from '@/components/ui/input';
import {
    MultiSelect,
    type MultiSelectOption,
} from '@/components/ui/multi-select';
import { ProductImageUploader } from '@/components/ui/product-image-uploader';
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
import { Product, ProductCategory } from '@/types/models';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';

interface Props {
    product: Product;
    categories: ProductCategory[];
}

export default function EditProduct({ product, categories }: Props) {
    const [removedExistingImages, setRemovedExistingImages] = useState<
        number[]
    >([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/dashboard/products' },
        {
            title: product.name_en || product.name_bn,
            href: `/dashboard/products/${product.slug}/edit`,
        },
    ];

    // Track if featured image was removed
    const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);

    const form = useForm<{
        images: File[];
        removed_images: number[];
        remove_featured_image: boolean;
        name_bn: string;
        name_en: string;
        description: string;
        price: string;
        discount_type: string;
        discount_value: string;
        stock_count: string;
        stock_alert_threshold: string;
        sku: string;
        status: string;
        category_ids: number[];
        _method: string;
    }>({
        images: [],
        removed_images: [],
        remove_featured_image: false,
        name_bn: product.name_bn,
        name_en: product.name_en || '',
        description: product.description || '',
        price: product.price_in_taka?.toString() || '',
        discount_type: product.discount_type || '',
        discount_value:
            product.discount_type === 'flat'
                ? product.discount_value_in_taka?.toString() || ''
                : product.discount_value?.toString() || '',
        stock_count: product.stock_count.toString(),
        stock_alert_threshold: product.stock_alert_threshold.toString(),
        sku: product.sku || '',
        status: product.status,
        category_ids: product.categories?.map((c) => c.id) || [],
        _method: 'PUT',
    });

    // Derived slug preview
    const slugPreview = slugify(form.data.name_en, {
        lower: true,
        strict: true,
    });

    // Category options for multi-select
    const categoryOptions: MultiSelectOption[] = categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name_bn,
    }));

    // Selected categories for MultiSelect
    const selectedCategories = categoryOptions.filter((opt) =>
        form.data.category_ids.includes(parseInt(opt.value)),
    );

    // Combine featured image + gallery images for display
    // Index 0 = featured image, Index 1+ = gallery images
    const allExistingImages = [
        ...(product.featured_image_url && !removeFeaturedImage
            ? [product.featured_image_url]
            : []),
        ...(product.image_urls || []).filter(
            (_, index) => !removedExistingImages.includes(index),
        ),
    ];

    // Calculate discounted price for preview
    const priceValue = parseFloat(form.data.price) || 0;
    const discountValue = parseFloat(form.data.discount_value) || 0;
    let discountedPrice = priceValue;
    let discountAmount = 0;

    if (priceValue > 0 && discountValue > 0 && form.data.discount_type) {
        if (form.data.discount_type === 'percentage') {
            discountAmount = priceValue * (discountValue / 100);
            discountedPrice = priceValue - discountAmount;
        } else if (form.data.discount_type === 'flat') {
            discountAmount = Math.min(discountValue, priceValue);
            discountedPrice = priceValue - discountAmount;
        }
    }

    // Check if discount fields should be enabled
    const isPriceValid = priceValue > 0;

    const handleRemoveExistingImage = (index: number) => {
        // Check if we're removing the featured image (index 0 when featured exists)
        const hasFeaturedImage =
            !!product.featured_image_url && !removeFeaturedImage;

        if (index === 0 && hasFeaturedImage) {
            // Removing featured image
            setRemoveFeaturedImage(true);
            form.setData('remove_featured_image', true);
        } else {
            // Removing gallery image - adjust index if featured image exists
            const galleryIndex = hasFeaturedImage ? index - 1 : index;
            const newRemoved = [...removedExistingImages, galleryIndex];
            setRemovedExistingImages(newRemoved);
            form.setData('removed_images', newRemoved);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/dashboard/products/${product.slug}`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Product updated successfully');
                router.visit('/dashboard/products');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${product.name_en || product.name_bn}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Product</h1>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/products">
                            <ArrowLeft />
                            Go Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={onSubmit}>
                    <FieldSet disabled={form.processing}>
                        <div className="flex flex-col gap-6">
                            {/* Product Images - Full Width */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Images</CardTitle>
                                    <CardDescription>
                                        Upload product images. The first image
                                        will be used as the featured image.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProductImageUploader
                                        value={form.data.images}
                                        onChange={(files) =>
                                            form.setData('images', files)
                                        }
                                        existingUrls={allExistingImages}
                                        onRemoveExisting={
                                            handleRemoveExistingImage
                                        }
                                        maxFiles={6}
                                        error={form.errors.images}
                                    />
                                </CardContent>
                            </Card>

                            {/* Two Column Grid */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Left Column */}
                                <div className="flex flex-col gap-6 lg:col-span-2">
                                    {/* Product Information Card */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Product Information
                                            </CardTitle>
                                            <CardDescription>
                                                Update product details
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FieldGroup>
                                                {/* Name English */}
                                                <Field
                                                    data-invalid={
                                                        !!form.errors.name_en
                                                    }
                                                >
                                                    <FieldLabel htmlFor="name_en">
                                                        Name (English){' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id="name_en"
                                                        value={
                                                            form.data.name_en
                                                        }
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
                                                    data-invalid={
                                                        !!form.errors.name_bn
                                                    }
                                                >
                                                    <FieldLabel htmlFor="name_bn">
                                                        Name (Bengali){' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id="name_bn"
                                                        value={
                                                            form.data.name_bn
                                                        }
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
                                                        !!form.errors
                                                            .description
                                                    }
                                                >
                                                    <FieldLabel htmlFor="description">
                                                        Description
                                                    </FieldLabel>
                                                    <Textarea
                                                        id="description"
                                                        value={
                                                            form.data
                                                                .description
                                                        }
                                                        onChange={(e) =>
                                                            form.setData(
                                                                'description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        rows={5}
                                                        placeholder="Optional product description"
                                                    />
                                                    <FieldError>
                                                        {
                                                            form.errors
                                                                .description
                                                        }
                                                    </FieldError>
                                                </Field>

                                                {/* Inventory Section */}
                                                <div className="mt-2 border-t pt-4">
                                                    <h4 className="mb-3 text-sm font-medium">
                                                        Inventory
                                                    </h4>
                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        {/* SKU */}
                                                        <Field
                                                            data-invalid={
                                                                !!form.errors
                                                                    .sku
                                                            }
                                                        >
                                                            <FieldLabel htmlFor="sku">
                                                                SKU
                                                            </FieldLabel>
                                                            <Input
                                                                id="sku"
                                                                value={
                                                                    form.data
                                                                        .sku
                                                                }
                                                                onChange={(e) =>
                                                                    form.setData(
                                                                        'sku',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="PRD-001"
                                                            />
                                                            <FieldError>
                                                                {
                                                                    form.errors
                                                                        .sku
                                                                }
                                                            </FieldError>
                                                        </Field>

                                                        {/* Stock Count */}
                                                        <Field
                                                            data-invalid={
                                                                !!form.errors
                                                                    .stock_count
                                                            }
                                                        >
                                                            <FieldLabel htmlFor="stock_count">
                                                                Stock Count{' '}
                                                                <span className="text-destructive">
                                                                    *
                                                                </span>
                                                            </FieldLabel>
                                                            <Input
                                                                id="stock_count"
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    form.data
                                                                        .stock_count
                                                                }
                                                                onChange={(e) =>
                                                                    form.setData(
                                                                        'stock_count',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="0"
                                                            />
                                                            <FieldError>
                                                                {
                                                                    form.errors
                                                                        .stock_count
                                                                }
                                                            </FieldError>
                                                        </Field>

                                                        {/* Stock Alert Threshold */}
                                                        <Field
                                                            data-invalid={
                                                                !!form.errors
                                                                    .stock_alert_threshold
                                                            }
                                                        >
                                                            <FieldLabel htmlFor="stock_alert_threshold">
                                                                Low Stock Alert
                                                            </FieldLabel>
                                                            <Input
                                                                id="stock_alert_threshold"
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    form.data
                                                                        .stock_alert_threshold
                                                                }
                                                                onChange={(e) =>
                                                                    form.setData(
                                                                        'stock_alert_threshold',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="10"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Alert when stock
                                                                falls below this
                                                            </p>
                                                            <FieldError>
                                                                {
                                                                    form.errors
                                                                        .stock_alert_threshold
                                                                }
                                                            </FieldError>
                                                        </Field>
                                                    </div>
                                                </div>
                                            </FieldGroup>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column - Settings */}
                                <div className="flex flex-col gap-6">
                                    {/* Pricing Card */}
                                    <Card className="h-fit">
                                        <CardHeader>
                                            <CardTitle>Pricing</CardTitle>
                                            <CardDescription>
                                                Set product pricing and discount
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FieldGroup>
                                                {/* Price */}
                                                <Field
                                                    data-invalid={
                                                        !!form.errors.price
                                                    }
                                                >
                                                    <FieldLabel htmlFor="price">
                                                        Price (৳){' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={form.data.price}
                                                        onChange={(e) => {
                                                            form.setData(
                                                                'price',
                                                                e.target.value,
                                                            );
                                                            if (
                                                                !e.target
                                                                    .value ||
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) <= 0
                                                            ) {
                                                                form.setData(
                                                                    'discount_type',
                                                                    '',
                                                                );
                                                                form.setData(
                                                                    'discount_value',
                                                                    '',
                                                                );
                                                            }
                                                        }}
                                                        placeholder="0.00"
                                                    />
                                                    <FieldError>
                                                        {form.errors.price}
                                                    </FieldError>
                                                </Field>

                                                {/* Discount Type */}
                                                <Field
                                                    data-invalid={
                                                        !!form.errors
                                                            .discount_type
                                                    }
                                                >
                                                    <FieldLabel>
                                                        Discount Type
                                                    </FieldLabel>
                                                    <Select
                                                        value={
                                                            form.data
                                                                .discount_type
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            form.setData(
                                                                'discount_type',
                                                                value,
                                                            );
                                                            form.setData(
                                                                'discount_value',
                                                                '',
                                                            );
                                                        }}
                                                        disabled={!isPriceValid}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="No discount" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">
                                                                Percentage (%)
                                                            </SelectItem>
                                                            <SelectItem value="flat">
                                                                Flat Amount (৳)
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldError>
                                                        {
                                                            form.errors
                                                                .discount_type
                                                        }
                                                    </FieldError>
                                                </Field>

                                                {/* Discount Value */}
                                                {form.data.discount_type && (
                                                    <Field
                                                        data-invalid={
                                                            !!form.errors
                                                                .discount_value
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="discount_value">
                                                            {form.data
                                                                .discount_type ===
                                                            'percentage'
                                                                ? 'Discount Percentage (%)'
                                                                : 'Discount Amount (৳)'}
                                                        </FieldLabel>
                                                        <Input
                                                            id="discount_value"
                                                            type="number"
                                                            step={
                                                                form.data
                                                                    .discount_type ===
                                                                'percentage'
                                                                    ? '1'
                                                                    : '0.01'
                                                            }
                                                            min="0"
                                                            max={
                                                                form.data
                                                                    .discount_type ===
                                                                'percentage'
                                                                    ? '100'
                                                                    : form.data
                                                                          .price
                                                            }
                                                            value={
                                                                form.data
                                                                    .discount_value
                                                            }
                                                            onChange={(e) =>
                                                                form.setData(
                                                                    'discount_value',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={
                                                                form.data
                                                                    .discount_type ===
                                                                'percentage'
                                                                    ? '0'
                                                                    : '0.00'
                                                            }
                                                            disabled={
                                                                !isPriceValid
                                                            }
                                                        />
                                                        <FieldError>
                                                            {
                                                                form.errors
                                                                    .discount_value
                                                            }
                                                        </FieldError>
                                                    </Field>
                                                )}

                                                {/* Price Preview */}
                                                {isPriceValid &&
                                                    discountAmount > 0 && (
                                                        <div className="rounded-lg border bg-muted/50 p-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">
                                                                    Original:
                                                                </span>
                                                                <span className="line-through">
                                                                    ৳
                                                                    {priceValue.toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">
                                                                    Discount:
                                                                </span>
                                                                <span className="text-destructive">
                                                                    -৳
                                                                    {discountAmount.toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
                                                                <span>
                                                                    Final Price:
                                                                </span>
                                                                <span className="text-primary">
                                                                    ৳
                                                                    {discountedPrice.toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                            </FieldGroup>
                                        </CardContent>
                                    </Card>

                                    {/* Settings Card */}
                                    <Card className="h-fit">
                                        <CardHeader>
                                            <CardTitle>Settings</CardTitle>
                                            <CardDescription>
                                                Status and categories
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FieldGroup>
                                                {/* Status */}
                                                <Field
                                                    data-invalid={
                                                        !!form.errors.status
                                                    }
                                                >
                                                    <FieldLabel>
                                                        Status
                                                    </FieldLabel>
                                                    <Select
                                                        value={form.data.status}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            form.setData(
                                                                'status',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">
                                                                Draft
                                                            </SelectItem>
                                                            <SelectItem value="published">
                                                                Published
                                                            </SelectItem>
                                                            <SelectItem value="archived">
                                                                Archived
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldError>
                                                        {form.errors.status}
                                                    </FieldError>
                                                </Field>

                                                {/* Categories - Multi-select */}
                                                <Field
                                                    data-invalid={
                                                        !!form.errors
                                                            .category_ids
                                                    }
                                                >
                                                    <FieldLabel>
                                                        Categories
                                                    </FieldLabel>
                                                    <MultiSelect
                                                        options={
                                                            categoryOptions
                                                        }
                                                        value={
                                                            selectedCategories
                                                        }
                                                        onChange={(
                                                            selected,
                                                        ) => {
                                                            form.setData(
                                                                'category_ids',
                                                                selected.map(
                                                                    (opt) =>
                                                                        parseInt(
                                                                            opt.value,
                                                                        ),
                                                                ),
                                                            );
                                                        }}
                                                        placeholder="Select categories"
                                                        emptyMessage="No categories found"
                                                    />
                                                    <FieldError>
                                                        {
                                                            form.errors
                                                                .category_ids
                                                        }
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
                                        Update Product
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
