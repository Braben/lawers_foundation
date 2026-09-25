import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('direct uploads verify provider metadata, ownership and idempotent publication', async () => {
  const dir=mkdtempSync(path.join(tmpdir(),'gallery-direct-'));
  process.env.NODE_ENV='test';process.env.DATA_BACKEND='local';process.env.DATA_DIR=dir;
  process.env.CLOUDINARY_CLOUD_NAME='test-cloud';process.env.CLOUDINARY_API_KEY='test-key';process.env.CLOUDINARY_API_SECRET='test-secret';
  writeFileSync(path.join(dir,'db.json'),JSON.stringify({gallery:[]}));
  const {authorizeImages,completeImage,readTicket,directUploadSchema}=await import('../src/services/direct-upload');
  const original=globalThis.fetch;
  let asset:Record<string,unknown>;let reads=0;
  globalThis.fetch=async()=>{reads++;return Response.json(asset);};
  try {
    const data=directUploadSchema.parse({files:[{name:'large.png',size:5_000_000}]});
    const auth=authorizeImages('owner',data)[0];
    assert.ok(!JSON.stringify(auth).includes('test-secret'));
    assert.throws(()=>readTicket(auth.ticket,'other'),/another account/);
    assert.throws(()=>readTicket(auth.ticket+'x','owner'),/Invalid upload/);
    const now=Date.now;
    try {Date.now=()=>now()+3600001;assert.throws(()=>readTicket(auth.ticket,'owner'),/expired/);}
    finally {Date.now=now;}
    const ticket=readTicket(auth.ticket,'owner');
    asset={public_id:ticket.publicId,resource_type:'image',type:'upload',format:'png',bytes:5_000_000,width:1300,height:1300,secure_url:`https://res.cloudinary.com/test-cloud/image/upload/${ticket.publicId}.png`};
    const saved=await completeImage(auth.ticket,'owner');
    assert.equal(saved.id,ticket.id);
    assert.equal((await completeImage(auth.ticket,'owner')).id,ticket.id);
    assert.equal(reads,1,'retry must not publish or verify again');
    const next=authorizeImages('owner',data)[0];const nextTicket=readTicket(next.ticket,'owner');
    asset={...asset,public_id:nextTicket.publicId,bytes:6_000_000};
    await assert.rejects(completeImage(next.ticket,'owner'),/limits/);
    asset={...asset,bytes:5_000_000,width:undefined};
    await assert.rejects(completeImage(next.ticket,'owner'),/limits/);
    asset={...asset,width:1300,secure_url:'https://evil.example/image.png'};
    await assert.rejects(completeImage(next.ticket,'owner'),/invalid delivery/);
    assert.equal(directUploadSchema.safeParse({files:[{name:'huge.png',size:6_000_000}]}).success,false);
  } finally {globalThis.fetch=original;rmSync(dir,{recursive:true,force:true});}
});
