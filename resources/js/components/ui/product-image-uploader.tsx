import { cn } from '@/lib/utils';
import { ImagePlus, Loader2, X } from 'lucide-react';
import * as React from 'react';

interface ImageItem {
    id: string;
    file?: File;
    url: string;
    isExisting: boolean;
}

interface ProductImageUploaderProps {
    value: File[];
    onChange: (files: File[]) => void;
    existingUrls?: string[];
    onRemoveExisting?: (index: number) => void;
    accept?: string;
    maxSize?: number; // in MB
    maxFiles?: number;
    className?: string;
    disabled?: boolean;
    error?: string;
}

export function ProductImageUploader({
    value = [],
    onChange,
    existingUrls = [],
    onRemoveExisting,
    accept = 'image/jpeg,image/png,image/webp',
    maxSize = 2,
    maxFiles = 10,
    className,
    disabled = false,
    error,
}: ProductImageUploaderProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [loadingFiles, setLoadingFiles] = React.useState<Set<string>>(new Set());
    const [previews, setPreviews] = React.useState<Map<string, string>>(new Map());
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Generate previews for new files
    React.useEffect(() => {
        const newPreviews = new Map<string, string>();
        
        value.forEach((file, index) => {
            const key = `new-${index}-${file.name}`;
            const objectUrl = URL.createObjectURL(file);
            newPreviews.set(key, objectUrl);
        });

        setPreviews(newPreviews);

        return () => {
            newPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [value]);

    // Combine existing and new images for display
    const allImages: ImageItem[] = [
        ...existingUrls.map((url, index) => ({
            id: `existing-${index}`,
            url,
            isExisting: true,
        })),
        ...value.map((file, index) => ({
            id: `new-${index}-${file.name}`,
            file,
            url: previews.get(`new-${index}-${file.name}`) || '',
            isExisting: false,
        })),
    ];

    const totalImages = allImages.length;
    const canAddMore = totalImages < maxFiles;

    const validateFile = (file: File): string | null => {
        if (!accept.split(',').some((type) => file.type === type.trim())) {
            return `Invalid file type. Accepted: ${accept}`;
        }
        if (file.size > maxSize * 1024 * 1024) {
            return `File too large. Max size: ${maxSize}MB`;
        }
        return null;
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || disabled) return;

        const newFiles: File[] = [];
        const errors: string[] = [];

        Array.from(files).forEach((file) => {
            if (totalImages + newFiles.length >= maxFiles) {
                errors.push(`Maximum ${maxFiles} images allowed`);
                return;
            }

            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
                return;
            }

            newFiles.push(file);
        });

        if (newFiles.length > 0) {
            onChange([...value, ...newFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const removeNewImage = (index: number) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
    };

    const removeExistingImage = (index: number) => {
        if (onRemoveExisting) {
            onRemoveExisting(index);
        }
    };

    return (
        <div className={cn('w-full', className)}>
            {/* Upload Area */}
            <div
                onClick={() => canAddMore && !disabled && inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50',
                    disabled && 'cursor-not-allowed opacity-50',
                    error && 'border-destructive',
                    !canAddMore && 'cursor-not-allowed',
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleInputChange}
                    disabled={disabled || !canAddMore}
                    className="hidden"
                />

                {allImages.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <ImagePlus className="size-12 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Click or drag images here</p>
                            <p className="text-sm text-muted-foreground">
                                Max {maxFiles} images, {maxSize}MB each
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        {/* Images Grid */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {allImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {image.url ? (
                                        <img
                                            src={image.url}
                                            alt={`Image ${index + 1}`}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center">
                                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Serial Number Badge */}
                                    <div
                                        className={cn(
                                            'absolute left-2 top-2 flex size-6 items-center justify-center rounded-full text-xs font-bold text-white',
                                            index === 0 ? 'bg-primary' : 'bg-black/60',
                                        )}
                                    >
                                        {index + 1}
                                    </div>

                                    {/* Featured Badge */}
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-white">
                                            Featured
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (image.isExisting) {
                                                    const existingIndex = existingUrls.indexOf(image.url);
                                                    removeExistingImage(existingIndex);
                                                } else {
                                                    const newIndex = allImages
                                                        .filter((img) => !img.isExisting)
                                                        .findIndex((img) => img.id === image.id);
                                                    removeNewImage(newIndex);
                                                }
                                            }}
                                            className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add More Button */}
                            {canAddMore && !disabled && (
                                <div
                                    className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        inputRef.current?.click();
                                    }}
                                >
                                    <ImagePlus className="size-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Helper Text */}
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            The first image will be used as the featured image. Drag to reorder (coming soon).
                        </p>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
            )}

            {/* Image Count */}
            <p className="mt-2 text-sm text-muted-foreground">
                {totalImages} of {maxFiles} images selected
            </p>
        </div>
    );
}
