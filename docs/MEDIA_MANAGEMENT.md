# Media Management with Spatie Media Library

## Overview

This document covers the integration of Spatie Media Library for handling all file uploads (images, documents) in the Sahittyacanvas platform.

---

## Installation

```bash
# Install package
composer require "spatie/laravel-medialibrary:^11.0"

# Publish migration
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"

# Publish config
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-config"

# Run migration
php artisan migrate
```

---

## Configuration

### config/media-library.php

```php
return [
    'disk_name' => env('MEDIA_DISK', 'public'),

    'max_file_size' => 1024 * 1024 * 10, // 10MB

    'queue_name' => env('MEDIA_QUEUE', 'default'),

    'queue_conversions_by_default' => true,

    'media_model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,

    'temporary_upload_model' => Spatie\MediaLibrary\MediaCollections\Models\TemporaryUpload::class,

    'enable_temporary_uploads_session_affinity' => true,

    'generate_thumbnails_for_temporary_uploads' => true,

    'file_namer' => Spatie\MediaLibrary\Support\FileNamer\DefaultFileNamer::class,

    'path_generator' => Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator::class,

    'url_generator' => Spatie\MediaLibrary\Support\UrlGenerator\DefaultUrlGenerator::class,

    'moves_media_on_update' => false,

    'version_urls' => false,

    'image_optimizers' => [
        Spatie\ImageOptimizer\Optimizers\Jpegoptim::class => [
            '-m85', // Max quality 85%
            '--strip-all',
            '--all-progressive',
        ],
        Spatie\ImageOptimizer\Optimizers\Pngquant::class => [
            '--force',
        ],
        Spatie\ImageOptimizer\Optimizers\Optipng::class => [
            '-i0',
            '-o2',
            '-quiet',
        ],
        Spatie\ImageOptimizer\Optimizers\Svgo::class => [
            '--disable=cleanupIDs',
        ],
        Spatie\ImageOptimizer\Optimizers\Gifsicle::class => [
            '-b',
            '-O3',
        ],
        Spatie\ImageOptimizer\Optimizers\Cwebp::class => [
            '-m 6',
            '-pass 10',
            '-mt',
            '-q 80',
        ],
    ],

    'image_generators' => [
        Spatie\MediaLibrary\Conversions\ImageGenerators\Image::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Webp::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Pdf::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Svg::class,
        Spatie\MediaLibrary\Conversions\ImageGenerators\Video::class,
    ],

    'temporary_directory_path' => null,

    'image_driver' => env('IMAGE_DRIVER', 'gd'),

    'ffmpeg_path' => env('FFMPEG_PATH', '/usr/bin/ffmpeg'),

    'ffprobe_path' => env('FFPROBE_PATH', '/usr/bin/ffprobe'),

    'jobs' => [
        'perform_conversions' => Spatie\MediaLibrary\Conversions\Jobs\PerformConversionsJob::class,
        'generate_responsive_images' => Spatie\MediaLibrary\ResponsiveImages\Jobs\GenerateResponsiveImagesJob::class,
    ],

    'media_downloader' => Spatie\MediaLibrary\Downloaders\DefaultDownloader::class,

    'remote' => [
        'extra_headers' => [
            'CacheControl' => 'max-age=604800',
        ],
    ],

    'responsive_images' => [
        'width_calculator' => Spatie\MediaLibrary\ResponsiveImages\WidthCalculator\FileSizeOptimizedWidthCalculator::class,
        'use_tiny_placeholders' => true,
        'tiny_placeholder_generator' => Spatie\MediaLibrary\ResponsiveImages\TinyPlaceholderGenerator\Blurred::class,
    ],

    'enable_vapor_uploads' => env('ENABLE_MEDIA_VAPOR_UPLOADS', false),

    'default_loading_attribute_value' => null,
];
```

---

## Model Integration

### User Model

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class User extends Authenticatable implements HasMedia
{
    use InteractsWithMedia;

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        // Avatar collection
        $this->addMediaCollection('avatar')
            ->singleFile() // Only one avatar per user
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(150)
                    ->height(150)
                    ->sharpen(10)
                    ->nonQueued();

                $this->addMediaConversion('medium')
                    ->width(300)
                    ->height(300)
                    ->sharpen(10);
            });

        // Banner collection
        $this->addMediaCollection('banner')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('large')
                    ->width(1920)
                    ->height(400)
                    ->fit('crop', 1920, 400);
            });
    }

    /**
     * Get avatar URL with fallback
     */
    public function getAvatarUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('avatar', 'thumb')
            ?: 'https://ui-avatars.com/api/?name=' . urlencode($this->name);
    }

    /**
     * Get banner URL with fallback
     */
    public function getBannerUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('banner', 'large')
            ?: asset('images/default-banner.jpg');
    }
}
```

### Post Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Post extends Model implements HasMedia
{
    use InteractsWithMedia;

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        // Featured image
        $this->addMediaCollection('featured_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->registerMediaConversions(function (Media $media) {
                // Thumbnail
                $this->addMediaConversion('thumb')
                    ->width(400)
                    ->height(300)
                    ->fit('crop', 400, 300)
                    ->sharpen(10)
                    ->nonQueued();

                // Medium
                $this->addMediaConversion('medium')
                    ->width(800)
                    ->height(600)
                    ->fit('crop', 800, 600)
                    ->sharpen(10);

                // Large
                $this->addMediaConversion('large')
                    ->width(1920)
                    ->height(1080)
                    ->fit('max', 1920, 1080);

                // WebP versions
                $this->addMediaConversion('thumb-webp')
                    ->width(400)
                    ->height(300)
                    ->fit('crop', 400, 300)
                    ->format('webp')
                    ->quality(80);

                $this->addMediaConversion('medium-webp')
                    ->width(800)
                    ->height(600)
                    ->fit('crop', 800, 600)
                    ->format('webp')
                    ->quality(80);
            });

        // Content images (inline images in post content)
        $this->addMediaCollection('content_images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('optimized')
                    ->width(1200)
                    ->height(1200)
                    ->fit('max', 1200, 1200)
                    ->sharpen(5);

                $this->addMediaConversion('optimized-webp')
                    ->width(1200)
                    ->height(1200)
                    ->fit('max', 1200, 1200)
                    ->format('webp')
                    ->quality(80);
            });
    }

    /**
     * Get featured image URL
     */
    public function getFeaturedImageUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('featured_image', 'large')
            ?: asset('images/default-post.jpg');
    }

    /**
     * Get featured image thumb
     */
    public function getFeaturedImageThumbAttribute(): string
    {
        return $this->getFirstMediaUrl('featured_image', 'thumb')
            ?: asset('images/default-post-thumb.jpg');
    }
}
```

### Category Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Category extends Model implements HasMedia
{
    use InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('category_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(300)
                    ->height(200)
                    ->fit('crop', 300, 200);

                $this->addMediaConversion('banner')
                    ->width(1920)
                    ->height(400)
                    ->fit('crop', 1920, 400);
            });
    }

    public function getCategoryImageUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('category_image', 'banner')
            ?: asset('images/default-category.jpg');
    }
}
```

### Author Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Author extends Model implements HasMedia
{
    use InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('author_photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(200)
                    ->height(200)
                    ->fit('crop', 200, 200);

                $this->addMediaConversion('large')
                    ->width(600)
                    ->height(600)
                    ->fit('crop', 600, 600);
            });
    }

    public function getPhotoUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('author_photo', 'large')
            ?: asset('images/default-author.jpg');
    }
}
```

---

## Controllers

### MediaController

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    /**
     * Upload media (generic endpoint)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:10240', // 10MB
            'collection' => 'required|string',
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
        ]);

        $modelClass = 'App\\Models\\' . $request->model_type;
        $model = $modelClass::findOrFail($request->model_id);

        $media = $model->addMediaFromRequest('file')
            ->toMediaCollection($request->collection);

        return response()->json([
            'success' => true,
            'media' => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb_url' => $media->getUrl('thumb'),
                'file_name' => $media->file_name,
                'size' => $media->size,
            ],
        ]);
    }

    /**
     * Upload content image (for rich text editor)
     */
    public function uploadContentImage(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:10240',
            'post_id' => 'required|exists:posts,id',
        ]);

        $post = \App\Models\Post::findOrFail($request->post_id);

        // Check authorization
        $this->authorize('update', $post);

        $media = $post->addMediaFromRequest('file')
            ->toMediaCollection('content_images');

        return response()->json([
            'success' => true,
            'url' => $media->getUrl('optimized'),
            'media_id' => $media->id,
        ]);
    }

    /**
     * Delete media
     */
    public function destroy(Media $media)
    {
        // Check authorization
        $model = $media->model;
        $this->authorize('update', $model);

        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully',
        ]);
    }

    /**
     * Get media details
     */
    public function show(Media $media)
    {
        return response()->json([
            'id' => $media->id,
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'url' => $media->getUrl(),
            'conversions' => $media->getGeneratedConversions()->map(function ($conversion, $name) use ($media) {
                return [
                    'name' => $name,
                    'url' => $media->getUrl($name),
                ];
            }),
        ]);
    }
}
```

---

## Frontend Integration

### Image Upload Component (React)

```tsx
// resources/js/Components/ImageUpload.tsx
import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ImageUploadProps {
    collection: string;
    modelType: string;
    modelId: number;
    currentImage?: string;
    onUploadComplete?: (media: any) => void;
    maxSize?: number; // in MB
}

export default function ImageUpload({
    collection,
    modelType,
    modelId,
    currentImage,
    onUploadComplete,
    maxSize = 10,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        setError(null);

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('collection', collection);
        formData.append('model_type', modelType);
        formData.append('model_id', modelId.toString());

        try {
            const response = await axios.post('/api/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setPreview(response.data.media.url);
                onUploadComplete?.(response.data.media);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                {preview ? (
                    <div className="group relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-64 w-full rounded-lg object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-blue-500"
                    >
                        {uploading ? (
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                        ) : (
                            <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                    Click to upload or drag and drop
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    PNG, JPG, WebP up to {maxSize}MB
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
```

### Rich Text Editor Image Upload

```tsx
// resources/js/Components/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useCallback } from 'react';
import axios from 'axios';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    postId: number;
}

export default function RichTextEditor({
    content,
    onChange,
    postId,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: false,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const handleImageUpload = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('post_id', postId.toString());

            try {
                const response = await axios.post(
                    '/api/media/upload-content-image',
                    formData,
                );

                if (response.data.success && editor) {
                    editor
                        .chain()
                        .focus()
                        .setImage({ src: response.data.url })
                        .run();
                }
            } catch (error) {
                console.error('Image upload failed:', error);
                alert('Failed to upload image');
            }
        };

        input.click();
    }, [editor, postId]);

    if (!editor) {
        return null;
    }

    return (
        <div className="rounded-lg border">
            <div className="flex flex-wrap gap-2 border-b p-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded px-3 py-1 ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                    Bold
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded px-3 py-1 ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={handleImageUpload}
                    className="rounded bg-gray-100 px-3 py-1"
                >
                    Insert Image
                </button>
            </div>
            <EditorContent editor={editor} className="prose max-w-none p-4" />
        </div>
    );
}
```

---

## API Routes

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/media/upload', [MediaController::class, 'upload']);
    Route::post('/media/upload-content-image', [MediaController::class, 'uploadContentImage']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);
    Route::get('/media/{media}', [MediaController::class, 'show']);
});
```

---

## Optimization & Best Practices

### 1. Queue Image Conversions

```php
// In model's registerMediaConversions
$this->addMediaConversion('large')
    ->width(1920)
    ->height(1080)
    ->queued(); // Process in background
```

### 2. Responsive Images

```php
$this->addMediaCollection('featured_image')
    ->withResponsiveImages(); // Auto-generate multiple sizes
```

### 3. Custom Properties

```php
$media = $post->addMedia($file)
    ->withCustomProperties([
        'alt_text' => 'Beautiful sunset',
        'caption' => 'Taken in 2025',
    ])
    ->toMediaCollection('featured_image');
```

### 4. CDN Integration

```php
// config/filesystems.php
'disks' => [
    'media' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
        'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    ],
],

// config/media-library.php
'disk_name' => 'media',
```

### 5. Cleanup Old Media

```php
// Command to clean up unused media
php artisan make:command CleanupUnusedMedia

// In command
Media::whereDoesntHave('model')->delete();
```

---

**Next**: See [CONTENT_EDITOR.md](./CONTENT_EDITOR.md) for rich text editor implementation.
