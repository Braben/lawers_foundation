import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import config from '../next.config';

test('editor sanitization removes event handlers, embedded documents and unsafe URLs', async () => {
  const dom = new JSDOM('');
  Object.defineProperty(globalThis,'window',{value:dom.window,configurable:true});
  try {
    const {cleanEditorHtml} = await import('../src/lib/sanitize-html');
    const html=cleanEditorHtml('<p>Safe <b>formatting</b></p><img src=x onerror="alert(1)"><svg onload="alert(1)"></svg><iframe srcdoc="evil"></iframe><a href="javascript:alert(1)" onclick="alert(1)">bad</a><a href="https://example.com">good</a>');
    assert.ok(html.includes('<b>formatting</b>'));
    assert.ok(html.includes('href="https://example.com"'));
    assert.doesNotMatch(html,/javascript:|onerror|onclick|<svg|iframe|<img/);
    assert.doesNotMatch(cleanEditorHtml('<a href="jav&#x61;script:alert(1)">bad</a>'),/href/);
  } finally { dom.window.close(); Reflect.deleteProperty(globalThis,'window'); }
});

test('every frontend path blocks external framing and restricts embedded media', async () => {
  const rules = await config.headers!();
  const all = rules.find(rule=>rule.source==='/:path*')!;
  assert.equal(all.headers.find(h=>h.key==='X-Frame-Options')?.value,'DENY');
  const csp=all.headers.find(h=>h.key==='Content-Security-Policy')!.value;
  assert.match(csp,/frame-ancestors 'none'/);
  assert.match(csp,/object-src 'none'/);
  assert.match(csp,/challenges.cloudflare.com/);
});
