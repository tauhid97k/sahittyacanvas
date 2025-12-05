# Content Editor Implementation

## Current Status

> **Note**: The multi-page system is implemented using a simple Textarea. The Tiptap rich text editor below is planned for future implementation.
>
> For the current multi-page implementation, see [POST_MULTIPAGE.md](./POST_MULTIPAGE.md).

---

## Overview

This document covers the planned implementation of a rich text/MDX editor with multi-page support for the Sahittyacanvas blogging platform.

---

## Editor Choice: Tiptap (Planned)

**Why Tiptap?**

- Modern, extensible rich text editor
- React-first architecture
- Excellent TypeScript support
- Markdown shortcuts built-in
- Highly customizable
- Active development and community

**Alternative**: Novel.sh (built on top of Tiptap with AI features)

---

## Installation

```bash
# Core packages
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm

# Extensions
npm install @tiptap/extension-image
npm install @tiptap/extension-link
npm install @tiptap/extension-placeholder
npm install @tiptap/extension-typography
npm install @tiptap/extension-code-block-lowlight
npm install @tiptap/extension-table
npm install @tiptap/extension-table-row
npm install @tiptap/extension-table-cell
npm install @tiptap/extension-table-header
npm install @tiptap/extension-youtube
npm install @tiptap/extension-color
npm install @tiptap/extension-text-align
npm install @tiptap/extension-underline
npm install @tiptap/extension-subscript
npm install @tiptap/extension-superscript
npm install @tiptap/extension-highlight
npm install @tiptap/extension-character-count

# Syntax highlighting
npm install lowlight

# Icons
npm install lucide-react
```

---

## Rich Text Editor Component

### Basic Editor

```tsx
// resources/js/Components/Editor/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { EditorToolbar } from './EditorToolbar';
import { ImageUploadModal } from './ImageUploadModal';
import { useState } from 'react';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    postId?: number;
    placeholder?: string;
    minHeight?: string;
    maxLength?: number;
}

export default function RichTextEditor({
    content,
    onChange,
    postId,
    placeholder = 'Start writing your story...',
    minHeight = '400px',
    maxLength,
}: RichTextEditorProps) {
    const [showImageModal, setShowImageModal] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We'll use CodeBlockLowlight instead
            }),
            Image.configure({
                inline: true,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Typography,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            CharacterCount.configure({
                limit: maxLength,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none',
                style: `min-height: ${minHeight}`,
            },
        },
    });

    const handleImageInsert = (url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setShowImageModal(false);
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white">
            <EditorToolbar
                editor={editor}
                onImageClick={() => setShowImageModal(true)}
            />

            <div className="p-4">
                <EditorContent editor={editor} />
            </div>

            {maxLength && (
                <div className="flex justify-between border-t px-4 py-2 text-sm text-gray-600">
                    <span>
                        {editor.storage.characterCount.characters()} /{' '}
                        {maxLength} characters
                    </span>
                    <span>{editor.storage.characterCount.words()} words</span>
                </div>
            )}

            {showImageModal && postId && (
                <ImageUploadModal
                    postId={postId}
                    onInsert={handleImageInsert}
                    onClose={() => setShowImageModal(false)}
                />
            )}
        </div>
    );
}
```

### Editor Toolbar

```tsx
// resources/js/Components/Editor/EditorToolbar.tsx
import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Code2,
} from 'lucide-react';

interface EditorToolbarProps {
    editor: Editor;
    onImageClick: () => void;
}

export function EditorToolbar({ editor, onImageClick }: EditorToolbarProps) {
    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title,
    }: any) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`rounded p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? 'bg-blue-100 text-blue-600' : ''
            }`}
        >
            {children}
        </button>
    );

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="flex flex-wrap gap-1 border-b p-2">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r pr-2">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHighlight().run()
                    }
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex gap-1 border-r pr-2">
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r pr-2">
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code2 className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r pr-2">
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().setTextAlign('left').run()
                    }
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().setTextAlign('center').run()
                    }
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().setTextAlign('right').run()
                    }
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Insert */}
            <div className="flex gap-1 border-r pr-2">
                <ToolbarButton
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                    title="Insert Link (Ctrl+K)"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton onClick={onImageClick} title="Insert Image">
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* History */}
            <div className="flex gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>
            </div>
        </div>
    );
}
```

---

## Multi-Page Editor

### Multi-Page Editor Component

```tsx
// resources/js/Components/Editor/MultiPageEditor.tsx
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, Eye } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface Page {
    id: string;
    title: string;
    content: string;
    page_number: number;
}

interface MultiPageEditorProps {
    pages: Page[];
    onChange: (pages: Page[]) => void;
    postId?: number;
}

export default function MultiPageEditor({
    pages,
    onChange,
    postId,
}: MultiPageEditorProps) {
    const [activePage, setActivePage] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);

    const handleAddPage = () => {
        const newPage: Page = {
            id: `page-${Date.now()}`,
            title: `Chapter ${pages.length + 1}`,
            content: '',
            page_number: pages.length + 1,
        };
        onChange([...pages, newPage]);
        setActivePage(pages.length);
    };

    const handleDeletePage = (index: number) => {
        if (pages.length === 1) {
            alert('You must have at least one page');
            return;
        }

        if (confirm('Are you sure you want to delete this page?')) {
            const newPages = pages.filter((_, i) => i !== index);
            // Renumber pages
            const renumbered = newPages.map((page, i) => ({
                ...page,
                page_number: i + 1,
            }));
            onChange(renumbered);
            setActivePage(Math.max(0, index - 1));
        }
    };

    const handlePageTitleChange = (index: number, title: string) => {
        const newPages = [...pages];
        newPages[index] = { ...newPages[index], title };
        onChange(newPages);
    };

    const handlePageContentChange = (index: number, content: string) => {
        const newPages = [...pages];
        newPages[index] = { ...newPages[index], content };
        onChange(newPages);
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(pages);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Renumber pages
        const renumbered = items.map((page, i) => ({
            ...page,
            page_number: i + 1,
        }));

        onChange(renumbered);
        setActivePage(result.destination.index);
    };

    return (
        <div className="flex h-[800px] gap-4">
            {/* Sidebar - Page List */}
            <div className="w-64 overflow-y-auto rounded-lg border bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Pages</h3>
                    <button
                        type="button"
                        onClick={handleAddPage}
                        className="rounded p-1 hover:bg-gray-200"
                        title="Add Page"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="pages">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2"
                            >
                                {pages.map((page, index) => (
                                    <Draggable
                                        key={page.id}
                                        draggableId={page.id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`cursor-pointer rounded-lg border p-3 ${
                                                    activePage === index
                                                        ? 'border-blue-500 bg-blue-100'
                                                        : 'bg-white hover:bg-gray-100'
                                                } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                                onClick={() =>
                                                    setActivePage(index)
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="cursor-grab"
                                                    >
                                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {page.page_number}.{' '}
                                                            {page.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {page.content
                                                                .replace(
                                                                    /<[^>]*>/g,
                                                                    '',
                                                                )
                                                                .substring(
                                                                    0,
                                                                    30,
                                                                )}
                                                            ...
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePage(
                                                                index,
                                                            );
                                                        }}
                                                        className="rounded p-1 text-red-600 hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 overflow-hidden rounded-lg border">
                <div className="flex items-center justify-between border-b bg-white p-4">
                    <input
                        type="text"
                        value={pages[activePage]?.title || ''}
                        onChange={(e) =>
                            handlePageTitleChange(activePage, e.target.value)
                        }
                        className="flex-1 border-none text-xl font-semibold focus:outline-none focus:ring-0"
                        placeholder="Page Title"
                    />
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 rounded bg-gray-100 px-4 py-2 hover:bg-gray-200"
                    >
                        <Eye className="h-4 w-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                </div>

                <div
                    className="overflow-y-auto p-4"
                    style={{ height: 'calc(100% - 73px)' }}
                >
                    {previewMode ? (
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: pages[activePage]?.content || '',
                            }}
                        />
                    ) : (
                        <RichTextEditor
                            content={pages[activePage]?.content || ''}
                            onChange={(content) =>
                                handlePageContentChange(activePage, content)
                            }
                            postId={postId}
                            placeholder={`Write page ${activePage + 1} content...`}
                            minHeight="600px"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
```

---

## Auto-Save Feature

```tsx
// resources/js/Components/Editor/AutoSaveEditor.tsx
import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Save, Check } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface AutoSaveEditorProps {
    postId: number;
    content: string;
    onChange: (content: string) => void;
    saveUrl: string;
}

export default function AutoSaveEditor({
    postId,
    content,
    onChange,
    saveUrl,
}: AutoSaveEditorProps) {
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save (30 seconds after last change)
        saveTimeoutRef.current = setTimeout(() => {
            handleAutoSave();
        }, 30000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content]);

    const handleAutoSave = async () => {
        if (!content) return;

        setSaving(true);

        try {
            await router.post(
                saveUrl,
                {
                    content,
                    _method: 'PATCH',
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: [],
                },
            );

            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return 'Not saved yet';

        const seconds = Math.floor(
            (new Date().getTime() - lastSaved.getTime()) / 1000,
        );
        if (seconds < 60) return 'Saved just now';
        if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
        return `Saved ${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {saving ? (
                        <>
                            <Save className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span>{formatLastSaved()}</span>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleAutoSave}
                    disabled={saving}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    Save Now
                </button>
            </div>

            <RichTextEditor
                content={content}
                onChange={onChange}
                postId={postId}
            />
        </div>
    );
}
```

---

## Markdown Support

```tsx
// Add markdown extension
import { Markdown } from '@tiptap/extension-markdown';

const editor = useEditor({
    extensions: [
        // ... other extensions
        Markdown,
    ],
    // ...
});

// Get markdown
const markdown = editor.storage.markdown.getMarkdown();

// Set markdown
editor.commands.setContent(markdown, true);
```

---

## Bengali Language Support

```tsx
// Add Bengali font support in CSS
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

.prose {
    font-family: 'Noto Sans Bengali', sans-serif;
}

// Configure editor for Bengali
const editor = useEditor({
    editorProps: {
        attributes: {
            lang: 'bn',
            dir: 'ltr',
        },
    },
});
```

---

**Next**: See [REVIEW_MODERATION.md](./REVIEW_MODERATION.md) for content moderation workflows.
