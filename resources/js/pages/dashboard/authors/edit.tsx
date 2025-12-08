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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Author } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';

interface Props {
    author: Author;
}

export default function EditAuthor({ author }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Authors', href: '/dashboard/authors' },
        { title: 'Edit', href: `/dashboard/authors/${author.slug}/edit` },
    ];

    // Track if user explicitly removed the existing avatar
    const [removeAvatar, setRemoveAvatar] = useState(false);

    const form = useForm<{
        avatar: File | null;
        remove_avatar: boolean;
        name_bn: string;
        name_en: string;
        bio: string;
        birth_date: string;
        death_date: string;
        nationality: string;
        is_active: boolean;
    }>({
        avatar: null,
        remove_avatar: false,
        name_bn: author.name_bn,
        name_en: author.name_en || '',
        bio: author.bio || '',
        birth_date: author.birth_date?.split('T')[0] || '',
        death_date: author.death_date?.split('T')[0] || '',
        nationality: author.nationality || '',
        is_active: author.is_active,
    });

    // Derived slug preview
    const slugPreview = slugify(form.data.name_en, {
        lower: true,
        strict: true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/dashboard/authors/${author.slug}`, {
            forceFormData: true,
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
            onSuccess: () => {
                toast.success('Author updated successfully');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${author.name_bn}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Author</h1>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/authors">
                            <ArrowLeft />
                            Go Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={onSubmit}>
                    <FieldSet disabled={form.processing}>
                        {/* Two Column Grid */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Main Info */}
                            <div className="flex flex-col gap-6 lg:col-span-2">
                                {/* Basic Info Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Author Information
                                        </CardTitle>
                                        <CardDescription>
                                            Basic details about the author
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldGroup>
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

                                            {/* Nationality */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.nationality
                                                }
                                            >
                                                <FieldLabel htmlFor="nationality">
                                                    Nationality
                                                </FieldLabel>
                                                <Input
                                                    id="nationality"
                                                    value={
                                                        form.data.nationality
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'nationality',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g., Bangladeshi, Indian"
                                                />
                                                <FieldError>
                                                    {form.errors.nationality}
                                                </FieldError>
                                            </Field>

                                            {/* Birth Date & Death Date */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <Field
                                                    data-invalid={
                                                        !!form.errors.birth_date
                                                    }
                                                >
                                                    <FieldLabel htmlFor="birth_date">
                                                        Birth Date
                                                    </FieldLabel>
                                                    <Input
                                                        id="birth_date"
                                                        type="date"
                                                        value={
                                                            form.data.birth_date
                                                        }
                                                        onChange={(e) =>
                                                            form.setData(
                                                                'birth_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <FieldError>
                                                        {form.errors.birth_date}
                                                    </FieldError>
                                                </Field>

                                                <Field
                                                    data-invalid={
                                                        !!form.errors.death_date
                                                    }
                                                >
                                                    <FieldLabel htmlFor="death_date">
                                                        Death Date
                                                    </FieldLabel>
                                                    <Input
                                                        id="death_date"
                                                        type="date"
                                                        value={
                                                            form.data.death_date
                                                        }
                                                        onChange={(e) =>
                                                            form.setData(
                                                                'death_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <FieldError>
                                                        {form.errors.death_date}
                                                    </FieldError>
                                                </Field>
                                            </div>
                                        </FieldGroup>
                                    </CardContent>
                                </Card>

                                {/* Bio Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Biography</CardTitle>
                                        <CardDescription>
                                            Write a detailed biography of the
                                            author
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Field data-invalid={!!form.errors.bio}>
                                            <RichTextEditor
                                                value={form.data.bio}
                                                onChange={(value) =>
                                                    form.setData('bio', value)
                                                }
                                                placeholder="Write the author's biography here..."
                                                editorClassName="min-h-[250px]"
                                                error={form.errors.bio}
                                                uploadContext="author"
                                            />
                                        </Field>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Settings Card + Submit */}
                            <div className="flex flex-col gap-6">
                                <Card className="h-fit">
                                    <CardHeader>
                                        <CardTitle>Settings</CardTitle>
                                        <CardDescription>
                                            Photo and status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldGroup>
                                            {/* Avatar Upload */}
                                            <Field
                                                data-invalid={
                                                    !!form.errors.avatar
                                                }
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <FieldLabel>
                                                        Author Photo
                                                    </FieldLabel>
                                                    <ImageUploader
                                                        value={
                                                            form.data.avatar ||
                                                            (!removeAvatar &&
                                                            author.avatar_url
                                                                ? author.avatar_url
                                                                : null)
                                                        }
                                                        onChange={(file) => {
                                                            form.setData(
                                                                'avatar',
                                                                file,
                                                            );
                                                            if (file) {
                                                                setRemoveAvatar(
                                                                    false,
                                                                );
                                                                form.setData(
                                                                    'remove_avatar',
                                                                    false,
                                                                );
                                                            } else {
                                                                setRemoveAvatar(
                                                                    true,
                                                                );
                                                                form.setData(
                                                                    'remove_avatar',
                                                                    true,
                                                                );
                                                            }
                                                        }}
                                                        error={
                                                            form.errors.avatar
                                                        }
                                                    />
                                                </div>
                                            </Field>

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
                                    Update Author
                                </Button>
                            </div>
                        </div>
                    </FieldSet>
                </form>
            </div>
        </AppLayout>
    );
}
