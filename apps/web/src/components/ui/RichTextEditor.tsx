'use client';

import * as React from 'react';
import { Button, Tooltip, Space, Segmented } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CheckSquareOutlined,
  CodeOutlined,
  LinkOutlined,
  TableOutlined,
  EyeOutlined,
  EditOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  readOnly?: boolean;
  className?: string;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Nhập mô tả chi tiết, tiêu chí nghiệm thu (Acceptance Criteria)...',
  minRows = 6,
  readOnly = false,
  className = '',
}: RichTextEditorProps) {
  const [content, setContent] = React.useState(value);
  const [mode, setMode] = React.useState<'write' | 'preview'>('write');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setContent(value);
  }, [value]);

  const updateContent = (newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  // Helper to wrap or prepend text at cursor selection
  const applyFormat = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = `${beforeText}${replacement}${afterText}`;

    updateContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const insertPrefixLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(start);

    // If we're not at the start of a line, add a newline first
    const needsNewline = beforeText.length > 0 && !beforeText.endsWith('\n');
    const insertion = (needsNewline ? '\n' : '') + prefix;

    const newContent = `${beforeText}${insertion}${afterText}`;
    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Simple, secure markdown renderer for the preview tab
  const renderMarkdown = (text: string) => {
    if (!text || !text.trim()) {
      return (
        <div className="text-zinc-400 italic text-xs py-4 text-center">
          Chưa có nội dung mô tả...
        </div>
      );
    }

    const lines = text.split('\n');
    const renderedElements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const rows = tableRows.slice(1).filter((r) => !r.every((c) => c.trim().startsWith('-')));
        renderedElements.push(
          <div key={`table-${key}`} className="my-3 overflow-x-auto">
            <table className="min-w-full text-xs border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                      {col.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/20">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          renderedElements.push(
            <pre
              key={`code-${index}`}
              className="p-3 my-2 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800"
            >
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          flushTable(`before-code-${index}`);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cols = line.split('|').slice(1, -1);
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(`table-end-${index}`);
      }

      // Headings
      if (line.startsWith('# ')) {
        renderedElements.push(
          <h1 key={index} className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
            {line.substring(2)}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        renderedElements.push(
          <h2 key={index} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1">
            {line.substring(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        renderedElements.push(
          <h3 key={index} className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-2.5 mb-1">
            {line.substring(4)}
          </h3>
        );
        return;
      }

      // Checklists
      if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ')) {
        const isChecked = line.trim().startsWith('- [x] ');
        const itemText = line.trim().substring(6);
        renderedElements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-xs text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={isChecked} readOnly className="rounded border-zinc-300 text-indigo-600" />
            <span className={isChecked ? 'line-through text-zinc-400' : ''}>{itemText}</span>
          </div>
        );
        return;
      }

      // Bullet lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        renderedElements.push(
          <li key={index} className="ml-4 text-xs text-zinc-700 dark:text-zinc-300 list-disc my-0.5">
            {line.trim().substring(2)}
          </li>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        renderedElements.push(
          <blockquote
            key={index}
            className="border-l-2 border-indigo-500 pl-3 my-2 text-xs italic text-zinc-600 dark:text-zinc-400 bg-indigo-50/20 dark:bg-indigo-950/20 py-1 rounded-r"
          >
            {line.substring(2)}
          </blockquote>
        );
        return;
      }

      // Horizontal Rules
      if (line.trim() === '---' || line.trim() === '***') {
        renderedElements.push(<hr key={index} className="my-3 border-zinc-200 dark:border-zinc-800" />);
        return;
      }

      // Regular paragraphs
      if (line.trim().length > 0) {
        // Format bold, italics, inline code inside paragraph
        renderedElements.push(
          <p key={index} className="text-xs text-zinc-700 dark:text-zinc-300 my-1 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable('end');
    }

    return renderedElements;
  };

  return (
    <div className={`border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 transition-all ${className}`}>
      {/* Header Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
          <Space size={2} wrap>
            <Tooltip title="In đậm (Bold - **text**)">
              <Button
                type="text"
                size="small"
                icon={<BoldOutlined className="text-xs" />}
                onClick={() => applyFormat('**', '**', 'văn bản')}
              />
            </Tooltip>
            <Tooltip title="In nghiêng (Italic - *text*)">
              <Button
                type="text"
                size="small"
                icon={<ItalicOutlined className="text-xs" />}
                onClick={() => applyFormat('*', '*', 'văn bản')}
              />
            </Tooltip>
            <Tooltip title="Gạch ngang (Strikethrough - ~~text~~)">
              <Button
                type="text"
                size="small"
                icon={<StrikethroughOutlined className="text-xs" />}
                onClick={() => applyFormat('~~', '~~', 'văn bản')}
              />
            </Tooltip>

            <div className="w-px h-4 my-auto bg-zinc-300 dark:bg-zinc-700 mx-1" />

            <Tooltip title="Tiêu đề 1 (H1)">
              <Button
                type="text"
                size="small"
                className="text-xs font-bold px-1.5"
                onClick={() => insertPrefixLine('# ')}
              >
                H1
              </Button>
            </Tooltip>
            <Tooltip title="Tiêu đề 2 (H2)">
              <Button
                type="text"
                size="small"
                className="text-xs font-bold px-1.5"
                onClick={() => insertPrefixLine('## ')}
              >
                H2
              </Button>
            </Tooltip>
            <Tooltip title="Tiêu đề 3 (H3)">
              <Button
                type="text"
                size="small"
                className="text-xs font-bold px-1.5"
                onClick={() => insertPrefixLine('### ')}
              >
                H3
              </Button>
            </Tooltip>

            <div className="w-px h-4 my-auto bg-zinc-300 dark:bg-zinc-700 mx-1" />

            <Tooltip title="Danh sách đầu dòng (Bullets)">
              <Button
                type="text"
                size="small"
                icon={<UnorderedListOutlined className="text-xs" />}
                onClick={() => insertPrefixLine('- ')}
              >
              </Button>
            </Tooltip>
            <Tooltip title="Danh sách số (Numbered list)">
              <Button
                type="text"
                size="small"
                icon={<OrderedListOutlined className="text-xs" />}
                onClick={() => insertPrefixLine('1. ')}
              >
              </Button>
            </Tooltip>
            <Tooltip title="Checklist nghiệm thu (- [ ] )">
              <Button
                type="text"
                size="small"
                icon={<CheckSquareOutlined className="text-xs" />}
                onClick={() => insertPrefixLine('- [ ] ')}
              >
              </Button>
            </Tooltip>

            <div className="w-px h-4 my-auto bg-zinc-300 dark:bg-zinc-700 mx-1" />

            <Tooltip title="Khối mã (Code block)">
              <Button
                type="text"
                size="small"
                icon={<CodeOutlined className="text-xs" />}
                onClick={() => insertPrefixLine('```\n// Code snippet\n```\n')}
              />
            </Tooltip>
            <Tooltip title="Chèn liên kết">
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined className="text-xs" />}
                onClick={() => applyFormat('[', '](https://example.com)', 'Tiêu đề liên kết')}
              />
            </Tooltip>
            <Tooltip title="Chèn bảng (Table)">
              <Button
                type="text"
                size="small"
                icon={<TableOutlined className="text-xs" />}
                onClick={() =>
                  insertPrefixLine(
                    '| Tiêu chí | Mô tả | Trạng thái |\n|---|---|---|\n| Yêu cầu 1 | Đạt chuẩn thiết kế | Đã xong |\n'
                  )
                }
              />
            </Tooltip>
          </Space>

          <Segmented
            size="small"
            value={mode}
            onChange={(val) => setMode(val as 'write' | 'preview')}
            options={[
              { label: 'Soạn thảo', value: 'write', icon: <EditOutlined /> },
              { label: 'Xem trước', value: 'preview', icon: <EyeOutlined /> },
            ]}
            className="text-xs"
          />
        </div>
      )}

      {/* Editor Body */}
      <div className="p-3">
        {mode === 'write' && !readOnly ? (
          <textarea
            ref={textareaRef}
            rows={minRows}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none resize-y text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-mono leading-relaxed focus:ring-0"
          />
        ) : (
          <div className="min-h-[140px] text-xs">
            {renderMarkdown(content)}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-3 py-1 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1">
          <FileMarkdownOutlined /> Hỗ trợ định dạng Markdown tiêu chuẩn
        </span>
        <span>{content.length} ký tự</span>
      </div>
    </div>
  );
}
