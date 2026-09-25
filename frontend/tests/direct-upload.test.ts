import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uploadGalleryImages } from '../src/lib/direct-upload';

test('large image bypasses API and failed publication retries without uploading twice',async()=>{
  const bytes=new Uint8Array(5_000_000);bytes.set([137,80,78,71,13,10,26,10]);
  const file=new File([bytes],'large.png',{type:'image/png'});
  const original=globalThis.fetch;let uploads=0;let fail=true;
  globalThis.fetch=async(url,options)=>{
    uploads++;assert.equal(url,'https://api.cloudinary.com/v1_1/test/image/upload');
    assert.equal(options?.credentials,'omit');assert.equal(options?.headers,undefined);
    assert.equal(((options?.body as FormData).get('file') as File).size,5_000_000);
    return Response.json({});
  };
  const request=async<T>(url:string,options:RequestInit):Promise<T>=>{
    assert.ok(String(options.body).length<1000,'API receives metadata only');
    if(url.endsWith('/authorize'))return [{ticket:'ticket',uploadUrl:'https://api.cloudinary.com/v1_1/test/image/upload',fields:{signature:'signed'}}] as T;
    if(fail)throw new Error('Temporary save failure');
    return {id:'saved'} as T;
  };
  try {
    const metadata={title:'Photo',description:'',category:'community'};
    const first=await uploadGalleryImages([file],metadata,request);
    assert.equal(first.failed.length,1);assert.equal(first.failed[0].uploaded,true);
    fail=false;
    const retry=await uploadGalleryImages([file],metadata,request,undefined,first.failed);
    assert.equal(retry.items.length,1);assert.equal(uploads,1);
    await assert.rejects(uploadGalleryImages([new File(['invalid'],'bad.png')],metadata,request),/JPEG, PNG or WebP/);
  } finally {globalThis.fetch=original;}
});
