'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading2, 
  Heading3, 
  Heading4,
  ListOrdered,
  List,
  Quote,
  Minus,
  Code,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: boolean;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Write your blog post content here...',
  error = false 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate dark:prose-invert max-w-none',
          'focus:outline-none min-h-[400px] px-4 py-3',
          'prose-headings:font-bold',
          'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4',
          'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3',
          'prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2',
          'prose-p:my-3 prose-p:leading-7',
          'prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6',
          'prose-li:my-1',
          'prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4',
          'prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-slate-900 prose-pre:dark:bg-slate-950 prose-pre:text-slate-100',
          'prose-hr:my-8 prose-hr:border-slate-200 prose-hr:dark:border-slate-700',
        ),
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false,
    title,
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        isActive && 'bg-amber-100 text-amber-700 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-300'
      )}
    >
      {children}
    </Button>
  );

  const ToolbarSeparator = () => (
    <Separator orientation="vertical" className="h-6 mx-1" />
  );

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-700'
    )}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-2 flex items-center flex-wrap gap-1">
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2 (Ctrl+Alt+2)"
        >
          <Heading2 className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3 (Ctrl+Alt+3)"
        >
          <Heading3 className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          title="Heading 4 (Ctrl+Alt+4)"
        >
          <Heading4 className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough (Ctrl+Shift+X)"
        >
          <Strikethrough className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Links and Code */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add/Edit Link (Ctrl+K)"
        >
          <LinkIcon className="w-5 h-5" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <Unlink className="w-5 h-5" />
          </ToolbarButton>
        )}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code (Ctrl+E)"
        >
          <Code className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <ListOrdered className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote (Ctrl+Shift+B)"
        >
          <Quote className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-5 h-5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-slate-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}