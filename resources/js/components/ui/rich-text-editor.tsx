import { cn } from '@/lib/utils';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Youtube } from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    ImageIcon,
    ImagePlus,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Minus,
    Pilcrow,
    Quote,
    Redo,
    RemoveFormatting,
    Strikethrough,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Table as TableIcon,
    Trash2,
    Underline as UnderlineIcon,
    Undo,
    Video,
} from 'lucide-react';
import * as React from 'react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { Separator } from './separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './tooltip';

// Helper function to delete image from server
async function deleteImageFromServer(src: string) {
    if (!src || src.startsWith('data:')) return;

    try {
        await fetch('/dashboard/editor/image', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                Accept: 'application/json',
            },
            body: JSON.stringify({ url: src }),
        });
    } catch (error) {
        console.error('Failed to delete image from server:', error);
    }
}

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    editorClassName?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    uploadContext?: string;
}

export function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Start writing...',
    editorClassName,
    className,
    disabled = false,
    error,
    uploadContext = 'general',
}: RichTextEditorProps) {
    const [isUploading, setIsUploading] = React.useState(false);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'editor-image',
                },
                resize: {
                    enabled: true,
                    minWidth: 50,
                    minHeight: 50,
                    alwaysPreserveAspectRatio: true,
                },
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-lg',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Subscript,
            Superscript,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
                    'min-h-[150px] px-3 py-2',
                    editorClassName,
                ),
            },
        },
    });

    // Update editor content when value prop changes externally
    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const addImageFromUrl = React.useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addImageFromFile = React.useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = React.useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file || !editor) return;

            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('context', uploadContext);

                const csrfToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');

                const response = await fetch('/dashboard/editor/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.url) {
                    editor.chain().focus().setImage({ src: data.url }).run();
                }
            } catch (error) {
                console.error('Image upload failed:', error);
                // Fallback to base64 if server upload fails
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target?.result as string;
                    editor.chain().focus().setImage({ src: base64 }).run();
                };
                reader.readAsDataURL(file);
            } finally {
                setIsUploading(false);
            }

            // Reset input so the same file can be selected again
            event.target.value = '';
        },
        [editor, uploadContext],
    );

    const addYoutubeVideo = React.useCallback(() => {
        const url = window.prompt('Enter YouTube URL:');
        if (url && editor) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    }, [editor]);

    const deleteSelectedImage = React.useCallback(async () => {
        if (!editor) return;

        const { state } = editor;
        const { selection } = state;
        const node = state.doc.nodeAt(selection.from);

        if (node?.type.name === 'image') {
            const src = node.attrs.src as string;
            // Delete from server
            await deleteImageFromServer(src);
            // Delete from editor
            editor.chain().focus().deleteSelection().run();
        }
    }, [editor]);

    const setLink = React.useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    }, [editor]);

    const addTable = React.useCallback(() => {
        if (editor) {
            editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    'rounded-lg border-2 border-input bg-background transition-colors',
                    'focus-within:border-primary',
                    error && 'border-destructive',
                    disabled && 'opacity-50',
                    className,
                )}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1">
                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        tooltip="Undo"
                    >
                        <Undo className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        tooltip="Redo"
                    >
                        <Redo className="size-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Headings Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 px-2"
                            >
                                <Pilcrow className="size-4" />
                                <span className="text-xs">Format</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() =>
                                    editor.chain().focus().setParagraph().run()
                                }
                            >
                                <Pilcrow className="mr-2 size-4" />
                                Paragraph
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({ level: 1 })
                                        .run()
                                }
                            >
                                <Heading1 className="mr-2 size-4" />
                                Heading 1
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({ level: 2 })
                                        .run()
                                }
                            >
                                <Heading2 className="mr-2 size-4" />
                                Heading 2
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({ level: 3 })
                                        .run()
                                }
                            >
                                <Heading3 className="mr-2 size-4" />
                                Heading 3
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Text Formatting */}
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        isActive={editor.isActive('bold')}
                        tooltip="Bold"
                    >
                        <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        isActive={editor.isActive('italic')}
                        tooltip="Italic"
                    >
                        <Italic className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        isActive={editor.isActive('underline')}
                        tooltip="Underline"
                    >
                        <UnderlineIcon className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        isActive={editor.isActive('strike')}
                        tooltip="Strikethrough"
                    >
                        <Strikethrough className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        isActive={editor.isActive('code')}
                        tooltip="Inline Code"
                    >
                        <Code className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleHighlight().run()
                        }
                        isActive={editor.isActive('highlight')}
                        tooltip="Highlight"
                    >
                        <Highlighter className="size-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Subscript/Superscript */}
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleSubscript().run()
                        }
                        isActive={editor.isActive('subscript')}
                        tooltip="Subscript"
                    >
                        <SubscriptIcon className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleSuperscript().run()
                        }
                        isActive={editor.isActive('superscript')}
                        tooltip="Superscript"
                    >
                        <SuperscriptIcon className="size-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Alignment */}
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().setTextAlign('left').run()
                        }
                        isActive={editor.isActive({ textAlign: 'left' })}
                        tooltip="Align Left"
                    >
                        <AlignLeft className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().setTextAlign('center').run()
                        }
                        isActive={editor.isActive({ textAlign: 'center' })}
                        tooltip="Align Center"
                    >
                        <AlignCenter className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().setTextAlign('right').run()
                        }
                        isActive={editor.isActive({ textAlign: 'right' })}
                        tooltip="Align Right"
                    >
                        <AlignRight className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().setTextAlign('justify').run()
                        }
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        tooltip="Justify"
                    >
                        <AlignJustify className="size-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        isActive={editor.isActive('bulletList')}
                        tooltip="Bullet List"
                    >
                        <List className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        isActive={editor.isActive('orderedList')}
                        tooltip="Numbered List"
                    >
                        <ListOrdered className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                        isActive={editor.isActive('blockquote')}
                        tooltip="Quote"
                    >
                        <Quote className="size-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Link */}
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        tooltip="Add Link"
                    >
                        <LinkIcon className="size-4" />
                    </ToolbarButton>

                    {/* Image Upload */}
                    <ToolbarButton
                        onClick={addImageFromFile}
                        tooltip={isUploading ? 'Uploading...' : 'Upload Image'}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <ImagePlus className="size-4" />
                        )}
                    </ToolbarButton>

                    {/* Image URL */}
                    <ToolbarButton
                        onClick={addImageFromUrl}
                        tooltip="Add Image from URL"
                    >
                        <ImageIcon className="size-4" />
                    </ToolbarButton>

                    {/* Delete Selected Image */}
                    <ToolbarButton
                        onClick={deleteSelectedImage}
                        tooltip="Delete Selected Image"
                        disabled={!editor.isActive('image')}
                    >
                        <Trash2 className="size-4" />
                    </ToolbarButton>

                    {/* YouTube */}
                    <ToolbarButton
                        onClick={addYoutubeVideo}
                        tooltip="Add YouTube Video"
                    >
                        <Video className="size-4" />
                    </ToolbarButton>

                    {/* Table */}
                    <ToolbarButton onClick={addTable} tooltip="Insert Table">
                        <TableIcon className="size-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Horizontal Rule */}
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().setHorizontalRule().run()
                        }
                        tooltip="Horizontal Line"
                    >
                        <Minus className="size-4" />
                    </ToolbarButton>

                    {/* Clear Formatting */}
                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .clearNodes()
                                .unsetAllMarks()
                                .run()
                        }
                        tooltip="Clear Formatting"
                    >
                        <RemoveFormatting className="size-4" />
                    </ToolbarButton>
                </div>

                {/* Editor Content */}
                <EditorContent editor={editor} />
            </div>

            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </TooltipProvider>
    );
}

// Toolbar Button Component
interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip: string;
    children: React.ReactNode;
}

function ToolbarButton({
    onClick,
    isActive,
    disabled,
    tooltip,
    children,
}: ToolbarButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'size-8',
                        isActive && 'bg-accent text-accent-foreground',
                    )}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}
