import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { consumeLimit, clientAddress, verifyBotToken } from '../src/services/abuse';
import { cleanHtml } from '../src/services/html';
import { contentSchemas } from '../src/services/content-schema';

test('saved rich text strips executable markup while retaining formatting', () => {
  const result = cleanHtml('<p>Hello <strong>world</strong><img src=x onerror="alert(1)"><svg onload="alert(1)"></svg><a href="javascript:alert(1)" onclick="alert(1)">bad</a><a href="https://example.com">good</a><script>alert(1)</script></p>');
  assert.ok(result.includes('<strong>world</strong>'));
  assert.ok(result.includes('href="https://example.com"'));
  assert.doesNotMatch(result,/script|onerror|onclick|svg|<img/i);
});

test('page schemas reject unknown fields, ID replacement and malformed nested data', () => {
  assert.equal(contentSchemas.home.safeParse({id:'about'}).success,false);
  assert.equal(contentSchemas.home.safeParse({hero:{title:'Title',subtitle:'Text',onclick:'evil'}}).success,false);
  assert.equal(contentSchemas.home.safeParse({impactStats:'broken'}).success,false);
  assert.equal(contentSchemas.home.safeParse({mission:{title:'Mission',text:'Our mission'}}).success,true);
});

test('shared limit blocks excess concurrent requests and permits a new window', async () => {
  process.env.NODE_ENV = 'test'; process.env.DATA_BACKEND = 'local';
  const responses = await Promise.allSettled(Array.from({length:12},()=>consumeLimit('test', 'client', 3, 1000, 100)));
  assert.equal(responses.filter(r=>r.status==='fulfilled').length,3);
  assert.equal(responses.filter(r=>r.status==='rejected' && r.reason.status===429).length,9);
  await consumeLimit('test','client',3,1000,1100);
  await consumeLimit('test','other-client',3,1000,100);
});

test('client IP cannot be overridden by forwarded headers outside Vercel', () => {
  delete process.env.VERCEL;
  const req = {get:()=> '203.0.113.8',socket:{remoteAddress:'127.0.0.1'}} as any;
  assert.equal(clientAddress(req),'127.0.0.1');
  process.env.VERCEL='1'; assert.equal(clientAddress(req),'203.0.113.8'); delete process.env.VERCEL;
});

test('Turnstile fails closed for missing, invalid, wrong-site and wrong-action tokens', async () => {
  delete process.env.TURNSTILE_SECRET_KEY;
  await assert.rejects(verifyBotToken('token','contact'),{status:503});
  process.env.TURNSTILE_SECRET_KEY='test-secret'; process.env.FRONTEND_URL='https://example.com';
  await assert.rejects(verifyBotToken('','contact'),{status:400});
  let result = {success:true,hostname:'attacker.example',action:'contact'};
  const transport = mock.method(globalThis,'fetch',async()=>Response.json(result));
  try {
    await assert.rejects(verifyBotToken('token','contact'),{status:400});
    result={success:true,hostname:'example.com',action:'pledge'};
    await assert.rejects(verifyBotToken('token','contact'),{status:400});
    result={success:false,hostname:'example.com',action:'contact'};
    await assert.rejects(verifyBotToken('token','contact'),{status:400});
    result={success:true,hostname:'example.com',action:'contact'};
    await verifyBotToken('token','contact');
  } finally { transport.mock.restore(); }
});
