import React, { useRef, useCallback, useEffect } from 'react';
import { IconBold, IconItalic, IconUnderline } from './icons';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  singleLine?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, singleLine = false }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // This effect synchronizes the editor's HTML with the `value` prop.
  // Crucially, it only runs when the `value` prop changes from an external source.
  // It avoids re-setting the HTML on every keystroke (which was the cause of the bug),
  // thus preserving the user's caret position and typing behavior.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Prevent pasting rich text, which can carry unwanted styles.
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    // For single line editors, replace newlines with spaces to keep it on one line.
    const processedText = singleLine ? text.replace(/(\r\n|\n|\r)/gm, ' ') : text;
    // Insert the sanitized plain text.
    document.execCommand('insertText', false, processedText);
  }

  const execCmd = (cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
  };

  const editorClasses = `
    w-full p-2 outline-none relative
    ${singleLine ? 'whitespace-nowrap overflow-hidden' : 'min-h-[80px]'}
  `;
  
  // Using a data attribute for the placeholder and styling with a pseudo-element
  // because placeholders are not native to contentEditable divs.
  const placeholderClasses = `
    before:content-[attr(data-placeholder)] before:absolute before:text-gray-500 before:cursor-text
  `;

  return (
    <div className="bg-base-200 border border-base-300 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
      <div className="flex items-center gap-1 p-1 border-b border-base-300">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('bold')} className="p-2 hover:bg-base-300 rounded-md transition-colors"><IconBold className="w-4 h-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('italic')} className="p-2 hover:bg-base-300 rounded-md transition-colors"><IconItalic className="w-4 h-4" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('underline')} className="p-2 hover:bg-base-300 rounded-md transition-colors"><IconUnderline className="w-4 h-4" /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={`${editorClasses} ${!value ? placeholderClasses : ''}`}
        style={{
          textAlign: 'left',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
