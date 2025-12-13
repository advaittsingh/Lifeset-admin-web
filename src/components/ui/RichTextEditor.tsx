import { useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '../../lib/utils';

// Register page break as a custom blot
const Block = Quill.import('blots/block');
class PageBreak extends Block {
  static blotName = 'page-break';
  static tagName = 'div';
  static className = 'ql-page-break';

  static create() {
    const node = super.create();
    node.setAttribute('style', 'page-break-after: always; border-top: 2px dashed #cbd5e1; margin: 2rem 0; padding: 1rem 0; text-align: center;');
    node.innerHTML = '<span style="color: #94a3b8; font-size: 0.875rem;">━━━ Page Break ━━━</span>';
    return node;
  }
}
Quill.register(PageBreak);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '300px',
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['blockquote', 'code-block'],
          [{ 'custom-page-break': 'Page Break' }],
          ['horizontal-rule'],
          ['clean'],
        ],
        handlers: {
          'custom-page-break': function() {
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection(true);
              if (range) {
                quill.insertText(range.index, '\n', 'user');
                quill.insertEmbed(range.index + 1, 'page-break', true, 'user');
                quill.setSelection(range.index + 2, 0);
              }
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'list',
    'bullet',
    'indent',
    'direction',
    'align',
    'link',
    'image',
    'video',
    'blockquote',
    'code-block',
    'page-break',
  ];

  return (
    <div className={cn('rich-text-editor-wrapper', className)}>
      <style>{`
        .rich-text-editor-wrapper .ql-container {
          font-family: inherit;
          font-size: 14px;
          min-height: ${minHeight};
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight};
          padding: 1rem;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .rich-text-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border: 1px solid #cbd5e1;
          border-bottom: none;
          background: #f8fafc;
          padding: 0.75rem;
        }
        .rich-text-editor-wrapper .ql-container {
          border: 1px solid #cbd5e1;
          border-top: none;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #475569;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: #475569;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: #3b82f6;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }
        .rich-text-editor-wrapper .ql-editor {
          color: #1e293b;
        }
        .rich-text-editor-wrapper .ql-editor p,
        .rich-text-editor-wrapper .ql-editor ol,
        .rich-text-editor-wrapper .ql-editor ul,
        .rich-text-editor-wrapper .ql-editor pre,
        .rich-text-editor-wrapper .ql-editor blockquote {
          margin-bottom: 0.75rem;
        }
        .rich-text-editor-wrapper .ql-editor h1,
        .rich-text-editor-wrapper .ql-editor h2,
        .rich-text-editor-wrapper .ql-editor h3,
        .rich-text-editor-wrapper .ql-editor h4,
        .rich-text-editor-wrapper .ql-editor h5,
        .rich-text-editor-wrapper .ql-editor h6 {
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor-wrapper .ql-editor h1 {
          font-size: 2rem;
        }
        .rich-text-editor-wrapper .ql-editor h2 {
          font-size: 1.5rem;
        }
        .rich-text-editor-wrapper .ql-editor h3 {
          font-size: 1.25rem;
        }
        .rich-text-editor-wrapper .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .rich-text-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          color: #64748b;
          font-style: italic;
        }
        .rich-text-editor-wrapper .ql-editor code,
        .rich-text-editor-wrapper .ql-editor pre {
          background: #f1f5f9;
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
        }
        .rich-text-editor-wrapper .ql-editor pre {
          padding: 0.75rem;
          margin: 0.75rem 0;
        }
        .rich-text-editor-wrapper .ql-editor .ql-page-break {
          page-break-after: always;
          border-top: 2px dashed #cbd5e1;
          margin: 2rem 0;
          padding: 1rem 0;
          text-align: center;
          background: #f8fafc;
        }
        .rich-text-editor-wrapper .ql-editor .ql-page-break span {
          color: #94a3b8;
          font-size: 0.875rem;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}

