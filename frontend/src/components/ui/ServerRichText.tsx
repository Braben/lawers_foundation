import sanitizeHtml from 'sanitize-html';
export function ServerRichText({ content }: { content: string }) {
  const html = sanitizeHtml(content, { allowedTags: ['p','br','strong','b','em','i','u','ul','ol','li','blockquote','h2','h3','h4','a','div','span'], allowedAttributes: { a: ['href'] }, allowedSchemes: ['https','http','mailto'], allowProtocolRelative: false });
  return <div className="space-y-4 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4" dangerouslySetInnerHTML={{ __html: html }} />;
}
