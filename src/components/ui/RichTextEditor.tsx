import { useMemo, useRef, useEffect } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Add tooltips to toolbar buttons
  useEffect(() => {
    const addTooltips = () => {
      if (!wrapperRef.current) return;
      
      const toolbar = wrapperRef.current.querySelector('.ql-toolbar');
      if (!toolbar) return;

      const tooltipMap: Record<string, string> = {
        'ql-bold': 'Bold (Ctrl+B)',
        'ql-italic': 'Italic (Ctrl+I)',
        'ql-underline': 'Underline (Ctrl+U)',
        'ql-strike': 'Strikethrough',
        'ql-link': 'Insert Link',
        'ql-image': 'Insert Image',
        'ql-video': 'Insert Video',
        'ql-blockquote': 'Blockquote',
        'ql-code-block': 'Code Block',
        'ql-clean': 'Remove Formatting',
        'ql-horizontal-rule': 'Horizontal Rule',
      };

      // Add tooltips to buttons
      toolbar.querySelectorAll('button').forEach((button) => {
        const classes = Array.from(button.classList);
        for (const [className, tooltip] of Object.entries(tooltipMap)) {
          if (classes.includes(className)) {
            button.setAttribute('title', tooltip);
            break;
          }
        }
        
        // Handle list buttons
        if (button.classList.contains('ql-list')) {
          const value = button.getAttribute('value');
          if (value === 'ordered') {
            button.setAttribute('title', 'Numbered List');
          } else if (value === 'bullet') {
            button.setAttribute('title', 'Bullet List');
          }
        }
        
        // Handle indent buttons
        if (button.classList.contains('ql-indent')) {
          const value = button.getAttribute('value');
          if (value === '-1') {
            button.setAttribute('title', 'Decrease Indent');
          } else if (value === '+1') {
            button.setAttribute('title', 'Increase Indent');
          }
        }
        
        // Handle align buttons
        if (button.classList.contains('ql-align')) {
          const value = button.getAttribute('value') || '';
          const alignMap: Record<string, string> = {
            '': 'Align Left',
            'center': 'Align Center',
            'right': 'Align Right',
            'justify': 'Justify',
          };
          if (alignMap[value]) {
            button.setAttribute('title', alignMap[value]);
          }
        }
        
        // Handle script buttons
        if (button.classList.contains('ql-script')) {
          const value = button.getAttribute('value');
          if (value === 'sub') {
            button.setAttribute('title', 'Subscript');
          } else if (value === 'super') {
            button.setAttribute('title', 'Superscript');
          }
        }
        
        // Handle direction button
        if (button.classList.contains('ql-direction')) {
          button.setAttribute('title', 'Right to Left');
        }
      });

      // Add tooltips to pickers
      const pickerTooltips: Record<string, string> = {
        'ql-header': 'Heading Style',
        'ql-font': 'Font Family',
        'ql-size': 'Font Size',
        'ql-color': 'Text Color',
        'ql-background': 'Background Color',
        'ql-align': 'Text Alignment',
        'ql-list': 'List Style',
        'ql-indent': 'Indentation',
        'ql-script': 'Script Style',
        'ql-direction': 'Text Direction',
      };

      toolbar.querySelectorAll('.ql-picker').forEach((picker) => {
        const pickerType = Array.from(picker.classList).find((c) => c.startsWith('ql-'));
        if (pickerType && pickerTooltips[pickerType]) {
          picker.setAttribute('title', pickerTooltips[pickerType]);
        }
      });
      
      // Handle custom page break button (if it exists)
      const allButtons = toolbar.querySelectorAll('button');
      allButtons.forEach((button) => {
        // Check if this button triggers the custom page break handler
        const onClick = button.getAttribute('onclick');
        if (!button.hasAttribute('title') && button.classList.length === 0) {
          // This might be a custom button, check if it's the page break
          const parent = button.parentElement;
          if (parent && parent.classList.contains('ql-toolbar')) {
            // Try to find by position or add a data attribute
            button.setAttribute('title', 'Insert Page Break');
          }
        }
      });
    };

    // Add tooltips after a short delay to ensure Quill is fully rendered
    const timeoutId = setTimeout(addTooltips, 100);
    return () => clearTimeout(timeoutId);
  }, [value]);

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
    <div ref={wrapperRef} className={cn('rich-text-editor-wrapper', className)}>
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
          background: #ffffff;
          padding: 0.75rem;
        }
        .rich-text-editor-wrapper .ql-container {
          border: 1px solid #cbd5e1;
          border-top: none;
        }
        /* Make all toolbar icons visible */
        .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #1e293b !important;
          stroke-width: 1.5;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: #1e293b !important;
        }
        .rich-text-editor-wrapper .ql-toolbar button {
          color: #1e293b !important;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: #3b82f6 !important;
          background: #eff6ff;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6 !important;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }
        /* Dropdown styling */
        .rich-text-editor-wrapper .ql-toolbar .ql-picker {
          color: #1e293b !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label {
          color: #1e293b !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover {
          color: #3b82f6 !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label .ql-stroke {
          stroke: #1e293b !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke {
          stroke: #3b82f6 !important;
        }
        /* Ensure picker options are visible */
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-options {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-item {
          color: #1e293b !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-item:hover {
          background: #eff6ff;
          color: #3b82f6 !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-item.ql-selected {
          background: #dbeafe;
          color: #3b82f6 !important;
        }
        /* Add tooltips to toolbar buttons */
        .rich-text-editor-wrapper .ql-toolbar button,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker {
          position: relative;
        }
        .rich-text-editor-wrapper .ql-toolbar button[title]:hover::after,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker[title]:hover::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.375rem 0.75rem;
          background: #1e293b;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .rich-text-editor-wrapper .ql-toolbar button[title]:hover::before,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker[title]:hover::before {
          content: '';
          position: absolute;
          bottom: calc(100% - 0.25rem);
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #1e293b;
          z-index: 1001;
          pointer-events: none;
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

