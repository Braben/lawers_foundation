import sanitizeHtml from 'sanitize-html';

export function cleanHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ['p','br','strong','b','em','i','u','ul','ol','li','blockquote','h2','h3','h4','a','div','span'],
    allowedAttributes: { a: ['href','title'] },
    allowedSchemes: ['https','http','mailto'], allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
}
