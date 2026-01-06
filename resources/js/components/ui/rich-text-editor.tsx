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
import { EditorContent, useEditor, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';

// Extend Tiptap commands to include our custom setImage command
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        customImage: {
            setImage: (options: { src: string; alt?: string; title?: string; align?: 'left' | 'center' | 'right' }) => ReturnType;
            setImageAlign: (align: 'left' | 'center' | 'right') => ReturnType;
        };
    }
}
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
    Underline as UnderlineIcon,
    Undo,
    Video,
    Trash,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
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
async function deleteImageFromServer(src: string): Promise<{ success: boolean; error?: string }> {
    if (!src || src.startsWith('data:')) {
        return { success: true };
    }

    try {
        const response = await fetch('/dashboard/editor/image', {
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

        if (!response.ok) {
            const data = await response.json();
            return { success: false, error: data.message || 'Failed to delete image' };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to delete image from server:', error);
        return { success: false, error: 'Network error while deleting image' };
    }
}

// Custom Image Node View Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ImageNodeView = ({ node, selected }: any) => {
    const align = node.attrs.align || 'left';
    
    return (
        <NodeViewWrapper
            className={cn(
                'my-4',
                align === 'center' && 'flex justify-center',
                align === 'right' && 'flex justify-end',
                align === 'left' && 'flex justify-start',
            )}
        >
            <img
                src={node.attrs.src}
                alt={node.attrs.alt || ''}
                title={node.attrs.title || ''}
                className={cn(
                    'editor-image',
                    selected && 'ring-2 ring-primary',
                )}
                draggable="false"
            />
        </NodeViewWrapper>
    );
};

// Custom Image Extension with React NodeView
const CustomImage = Node.create({
    name: 'image',
    group: 'block',
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            align: {
                default: 'left',
                parseHTML: (element) => element.getAttribute('data-align') || 'left',
                renderHTML: (attributes) => {
                    return {
                        'data-align': attributes.align,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'img[src]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(HTMLAttributes, { class: 'editor-image' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },

    addCommands() {
        return {
            setImage:
                (options: { src: string; alt?: string; title?: string; align?: 'left' | 'center' | 'right' }) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: { ...options, align: options.align || 'left' },
                    });
                },
            setImageAlign:
                (align: 'left' | 'center' | 'right') =>
                ({ commands }) => {
                    return commands.updateAttributes(this.name, { align });
                },
        };
    },
});

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    editorClassName?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    uploadContext?: string;
    postId?: number | null;
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
    postId = null,
}: RichTextEditorProps) {
    const [isUploading, setIsUploading] = React.useState(false);
    const [showImageMenu, setShowImageMenu] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
    const [isDeletingImage, setIsDeletingImage] = React.useState(false);
    const editorRef = React.useRef<HTMLDivElement>(null);
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
            CustomImage,
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
                    'tiptap prose prose-sm dark:prose-invert max-w-none focus:outline-none',
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

    // Track image selection and position menu
    React.useEffect(() => {
        if (!editor) return;

        const updateMenu = () => {
            const isImageActive = editor.isActive('image');
            setShowImageMenu(isImageActive);

            if (isImageActive && editorRef.current) {
                const positionMenu = () => {
                    if (!editorRef.current) return;
                    
                    const { view } = editor;
                    const { from } = view.state.selection;
                    const node = view.domAtPos(from);
                    const imageElement = node.node.nodeType === 1 
                        ? (node.node as HTMLElement).querySelector('img')
                        : (node.node.parentElement as HTMLElement)?.querySelector('img');

                    if (imageElement) {
                        const editorRect = editorRef.current.getBoundingClientRect();
                        const imageRect = imageElement.getBoundingClientRect();
                        
                        setMenuPosition({
                            top: imageRect.top - editorRect.top - 50,
                            left: imageRect.left - editorRect.left + (imageRect.width / 2),
                        });
                    }
                };

                // Wait for image to load before positioning
                const { view } = editor;
                const { from } = view.state.selection;
                const node = view.domAtPos(from);
                const imageElement = node.node.nodeType === 1 
                    ? (node.node as HTMLElement).querySelector('img')
                    : (node.node.parentElement as HTMLElement)?.querySelector('img');

                if (imageElement) {
                    if ((imageElement as HTMLImageElement).complete) {
                        // Image already loaded
                        positionMenu();
                    } else {
                        // Wait for image to load
                        imageElement.addEventListener('load', positionMenu, { once: true });
                        // Fallback timeout in case load event doesn't fire
                        setTimeout(positionMenu, 100);
                    }
                }
            }
        };

        editor.on('selectionUpdate', updateMenu);
        editor.on('transaction', updateMenu);

        return () => {
            editor.off('selectionUpdate', updateMenu);
            editor.off('transaction', updateMenu);
        };
    }, [editor]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const addImageFromUrl = React.useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (!url || !editor) return;

        const alt = window.prompt('Enter image description (alt text):') || '';
        const title = window.prompt('Enter image title (optional):') || '';

        editor
            .chain()
            .focus()
            .setImage({
                src: url,
                alt: alt,
                title: title || undefined,
            })
            .run();
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
                if (postId) {
                    formData.append('post_id', postId.toString());
                }

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
                    // Prompt for alt text after successful upload
                    const alt = window.prompt('Enter image description (alt text):') || file.name;
                    const title = window.prompt('Enter image title (optional):') || '';

                    editor
                        .chain()
                        .focus()
                        .setImage({
                            src: data.url,
                            alt: alt,
                            title: title || undefined,
                        })
                        .run();
                }
            } catch (error) {
                console.error('Image upload failed:', error);
                // Fallback to base64 if server upload fails
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target?.result as string;
                    const alt = window.prompt('Enter image description (alt text):') || file.name;
                    const title = window.prompt('Enter image title (optional):') || '';

                    editor
                        .chain()
                        .focus()
                        .setImage({
                            src: base64,
                            alt: alt,
                            title: title || undefined,
                        })
                        .run();
                };
                reader.readAsDataURL(file);
            } finally {
                setIsUploading(false);
            }

            // Reset input so the same file can be selected again
            event.target.value = '';
        },
        [editor, uploadContext, postId],
    );

    const addYoutubeVideo = React.useCallback(() => {
        const url = window.prompt('Enter YouTube URL:');
        if (url && editor) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
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
            <div ref={editorRef} className={cn('relative border rounded-lg', className)}>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b p-2">
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

                {/* Image Bubble Menu */}
                {showImageMenu && (
                    <div
                        className="absolute z-50 flex items-center gap-1 rounded-lg border bg-popover p-1 shadow-md"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setImageAlign('left').run()}
                                isActive={editor.getAttributes('image').align === 'left'}
                                tooltip="Align Left"
                            >
                                <AlignLeft className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setImageAlign('center').run()}
                                isActive={editor.getAttributes('image').align === 'center'}
                                tooltip="Align Center"
                            >
                                <AlignCenter className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setImageAlign('right').run()}
                                isActive={editor.getAttributes('image').align === 'right'}
                                tooltip="Align Right"
                            >
                                <AlignRight className="size-4" />
                            </ToolbarButton>
                            <div className="h-6 w-px bg-border mx-1" />
                            <ToolbarButton
                                onClick={async () => {
                                    const { state } = editor;
                                    const { selection } = state;
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    let imageNode: any = null;
                                    let imagePos: number | null = null;

                                    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                                        if (node.type.name === 'image') {
                                            imageNode = node;
                                            imagePos = pos;
                                            return false;
                                        }
                                    });

                                    if (imageNode && imagePos !== null) {
                                        setIsDeletingImage(true);
                                        const src = imageNode.attrs.src as string;
                                        const result = await deleteImageFromServer(src);
                                        
                                        if (result.success) {
                                            toast.success('Image deleted successfully');
                                            editor.chain().focus().deleteSelection().run();
                                            setIsDeletingImage(false);
                                        } else {
                                            toast.error(result.error || 'Failed to delete image');
                                            setIsDeletingImage(false);
                                        }
                                    }
                                }}
                                tooltip="Delete Image"
                                disabled={isDeletingImage}
                            >
                                {isDeletingImage ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Trash className="size-4" />
                                )}
                            </ToolbarButton>
                    </div>
                )}
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
