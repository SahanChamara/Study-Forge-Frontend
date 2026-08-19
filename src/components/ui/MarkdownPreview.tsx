import React from 'react';

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = '',
}) => {
  // Simple, safe Markdown parser for structured smart notes
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    const parseInline = (str: string): React.ReactNode => {
      // Handle simple formatting: inline code `code`, bold **text**, italic *text*
      const segments = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return segments.map((seg, i) => {
        if (seg.startsWith('`') && seg.endsWith('`')) {
          return (
            <code key={i} className="inline-code">
              {seg.slice(1, -1)}
            </code>
          );
        }
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={i}>{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith('*') && seg.endsWith('*')) {
          return <em key={i}>{seg.slice(1, -1)}</em>;
        }
        return seg;
      });
    };

    lines.forEach((line, idx) => {
      // Fenced Code Blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="code-block" data-lang={codeBlockLang}>
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          inCodeBlock = false;
          codeBlockContent = [];
          codeBlockLang = '';
        } else {
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Ignore empty lines
      if (!line.trim()) {
        elements.push(<div key={`spacer-${idx}`} className="md-spacer" />);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${idx}`} className="md-h1">{parseInline(line.slice(2))}</h1>);
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${idx}`} className="md-h2">{parseInline(line.slice(3))}</h2>);
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3-${idx}`} className="md-h3">{parseInline(line.slice(4))}</h3>);
        return;
      }

      // Task Checkboxes
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const isChecked = line.startsWith('- [x] ');
        const taskText = line.slice(6);
        elements.push(
          <div key={`task-${idx}`} className={`md-task-item ${isChecked ? 'checked' : ''}`}>
            <input type="checkbox" checked={isChecked} readOnly />
            <span>{parseInline(taskText)}</span>
          </div>
        );
        return;
      }

      // Unordered Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`li-${idx}`} className="md-list-item">
            {parseInline(line.slice(2))}
          </li>
        );
        return;
      }

      // Ordered Lists
      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={`num-${idx}`} className="md-ordered-item">
            <span className="md-item-number">{numMatch[1]}.</span>
            <span>{parseInline(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Blockquotes / Warnings
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${idx}`} className="md-blockquote">
            {parseInline(line.slice(2))}
          </blockquote>
        );
        return;
      }

      // Comments <!-- ... -->
      if (line.startsWith('<!--') && line.endsWith('-->')) {
        elements.push(
          <p key={`comment-${idx}`} className="md-comment">
            ℹ️ {line.replace(/<!--|-->/g, '').trim()}
          </p>
        );
        return;
      }

      // Regular Paragraphs
      elements.push(
        <p key={`p-${idx}`} className="md-paragraph">
          {parseInline(line)}
        </p>
      );
    });

    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre key="code-final" className="code-block" data-lang={codeBlockLang}>
          <code>{codeBlockContent.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  return (
    <div className={`markdown-rendered ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};
