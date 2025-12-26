import { cn } from '@/lib/utils';
import { ImagePlus, X } from 'lucide-react';
import * as React from 'react';

interface ImageUploaderProps {
    value?: File | string | null;
    onChange: (file: File | null) => void;
    existingUrl?: string | null;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    containerClassName?: string; // For overriding the upload box styles
    disabled?: boolean;
    error?: string;
}

export function ImageUploader({
    value,
    onChange,
    existingUrl,
    accept = 'image/jpeg,image/png,image/webp',
    maxSize = 2,
    className,
    containerClassName,
    disabled = false,
    error,
}: ImageUploaderProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [dragActive, setDragActive] = React.useState(false);
    const [localError, setLocalError] = React.useState<string | null>(null);

    // Generate preview from File, URL string, or existingUrl
    React.useEffect(() => {
        if (!value && !existingUrl) {
            setPreview(null);
            return;
        }

        if (typeof value === 'string') {
            setPreview(value);
            return;
        }

        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }

        // Use existingUrl if no value
        if (existingUrl) {
            setPreview(existingUrl);
            return;
        }

        setPreview(null);
    }, [value, existingUrl]);

    const validateFile = (file: File): boolean => {
        setLocalError(null);

        // Check file type
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        if (!acceptedTypes.includes(file.type)) {
            setLocalError('Invalid file type. Please upload JPG, PNG, or WebP.');
            return false;
        }

        // Check file size
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            setLocalError(`File size must be less than ${maxSize}MB.`);
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            onChange(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setPreview(null);
        setLocalError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const openFileDialog = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const displayError = error || localError;

    return (
        <div className={cn('space-y-2', className)}>
            <div className="relative">
                <div
                    onClick={!preview ? openFileDialog : undefined}
                    onDragEnter={!preview ? handleDrag : undefined}
                    onDragLeave={!preview ? handleDrag : undefined}
                    onDragOver={!preview ? handleDrag : undefined}
                    onDrop={!preview ? handleDrop : undefined}
                    className={cn(
                        'aspect-square w-40 overflow-hidden rounded-lg border-2 transition-colors',
                        preview ? 'border-solid' : 'border-dashed',
                        !preview && 'cursor-pointer',
                        !preview && dragActive && 'border-primary bg-primary/5',
                        !preview && !dragActive && 'border-input hover:border-primary/50',
                        preview && (displayError ? 'border-destructive' : 'border-input'),
                        disabled && 'cursor-not-allowed opacity-50',
                        !preview && displayError && 'border-destructive',
                        containerClassName
                    )}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleChange}
                        disabled={disabled}
                        className="hidden"
                    />
                    {preview ? (
                        <img
                            src={preview}
                            alt="Preview"
                            className="size-full cursor-pointer object-cover"
                            onClick={openFileDialog}
                        />
                    ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center">
                            <ImagePlus className="size-6 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Upload</p>
                        </div>
                    )}
                </div>
                {preview && !disabled && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive shadow-sm transition-transform hover:scale-110"
                    >
                        <X className="size-3.5 text-white" />
                    </button>
                )}
            </div>

            {displayError && (
                <p className="text-sm text-destructive">{displayError}</p>
            )}
        </div>
    );
}
