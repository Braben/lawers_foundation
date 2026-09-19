'use client';
import { createElement, useEffect, useState, ReactNode } from 'react';

// Rebuild only supported formatting as React elements. Never execute saved HTML.
const allowed = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'h4', 'a', 'div', 'span']);
export function RichTextContent({ content }: { content: string }) {
  const [nodes, setNodes] = useState<ReactNode>(null);
  useEffect(() => {
    let active = true;
    const document = new DOMParser().parseFromString(content, 'text/html');
    const render = (node: Node, key: string): ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (!(node instanceof Element)) return null;
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'iframe', 'object', 'svg', 'form'].includes(tag)) return null;
      const children = Array.from(node.childNodes).map((child, i) => render(child, `${key}-${i}`));
      if (!allowed.has(tag)) return children;
      const props: { key: string; href?: string; rel?: string } = { key };
      if (tag === 'a') {
        const href = node.getAttribute('href') || '';
        if (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) props.href = href;
        props.rel = 'noopener noreferrer';
      }
      return createElement(tag, props, ...(tag === 'br' ? [] : children));
    };
    const result = Array.from(document.body.childNodes).map((node, index) => render(node, String(index)));
    queueMicrotask(() => { if (active) setNodes(result); });
    return () => { active = false; };
  }, [content]);
  return <div className="space-y-4 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4">{nodes}</div>;
}
