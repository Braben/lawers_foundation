"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanHtml = cleanHtml;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
function cleanHtml(value) {
    return (0, sanitize_html_1.default)(value, {
        allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'h4', 'a', 'div', 'span'],
        allowedAttributes: { a: ['href', 'title'] },
        allowedSchemes: ['https', 'http', 'mailto'], allowProtocolRelative: false,
        disallowedTagsMode: 'discard',
    });
}
