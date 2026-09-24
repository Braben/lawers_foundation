import DOMPurify from 'dompurify';

export function cleanEditorHtml(value: string) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['p','br','strong','b','em','i','u','ul','ol','li','blockquote','h2','h3','h4','a','div','span'],
    ALLOWED_ATTR: ['href','title'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(https?:\/\/|mailto:|\/(?!\/)|#)/i,
  });
}
