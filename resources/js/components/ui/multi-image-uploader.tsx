import { cn } from '@/lib/utils';
import { ImagePlus, X } from 'lucide-react';
import * as React from 'react';

interface MultiImageUploaderProps {
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

export function MultiImageUploader({
    value,
    onChange,
    existingUrls = [],
    onRemoveExisting,
    accept = 'image/jpeg,image/png,image/webp',
    maxSize = 2,
    maxFiles = 5,
    className,
    disabled = false,
    error,
}: MultiImageUploaderProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = React.useState<string[]>([]);
    const [dragActive, setDragActive] = React.useState(false);
    const [localError, setLocalError] = React.useState<string | null>(null);

    // Generate previews from Files
    React.useEffect(() => {
        if (value.length === 0) {
            setPreviews([]);
            return;
        }

        const urls = value.map((file) => URL.createObjectURL(file));
        setPreviews(urls);

        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [value]);

    const validateFile = (file: File): boolean => {
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

    const handleFiles = (files: FileList) => {
        setLocalError(null);

        const totalCount = value.length + existingUrls.length + files.length;
        if (totalCount > maxFiles) {
            setLocalError(`Maximum ${maxFiles} images allowed.`);
            return;
        }

        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            if (validateFile(files[i])) {
                validFiles.push(files[i]);
            }
        }

        if (validFiles.length > 0) {
            onChange([...value, ...validFiles]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
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

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
    };

    const handleRemove = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onChange(newFiles);
        setLocalError(null);
    };

    const handleRemoveExisting = (index: number) => {
        if (onRemoveExisting) {
            onRemoveExisting(index);
        }
    };

    const openFileDialog = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const displayError = error || localError;
    const canAddMore = value.length + existingUrls.length < maxFiles;

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-wrap gap-3">
                {/* Existing Images */}
                {existingUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                        <div className="size-24 overflow-hidden rounded-lg border-2 border-input">
                            <img
                                src={url}
                                alt={`Existing ${index + 1}`}
                                className="size-full object-cover"
                            />
                        </div>
                        {!disabled && onRemoveExisting && (
                            <button
                                type="button"
                                onClick={() => handleRemoveExisting(index)}
                                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive shadow-sm transition-transform hover:scale-110"
                            >
                                <X className="size-3.5 text-white" />
                            </button>
                        )}
                    </div>
                ))}

                {/* New Image Previews */}
                {previews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                        <div className="size-24 overflow-hidden rounded-lg border-2 border-input">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="size-full object-cover"
                            />
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive shadow-sm transition-transform hover:scale-110"
                            >
                                <X className="size-3.5 text-white" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Upload Button */}
                {canAddMore && (
                    <div
                        onClick={openFileDialog}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                            'flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors',
                            dragActive && 'border-primary bg-primary/5',
                            !dragActive && 'border-input hover:border-primary/50',
                            disabled && 'cursor-not-allowed opacity-50',
                            displayError && 'border-destructive',
                        )}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept={accept}
                            onChange={handleChange}
                            disabled={disabled}
                            multiple
                            className="hidden"
                        />
                        <ImagePlus className="size-5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Add</p>
                    </div>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                {value.length + existingUrls.length}/{maxFiles} images
            </p>

            {displayError && (
                <p className="text-sm text-destructive">{displayError}</p>
            )}
        </div>
    );
}
