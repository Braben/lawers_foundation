// Explicit live Cloudinary smoke check: publishes only to temporary local data,
// then deletes its own generated Cloudinary asset. Run after npm run build.
require('dotenv').config({quiet:true});
const {randomBytes,createHash}=require('node:crypto');
const {deflateSync}=require('node:zlib');
const {mkdtempSync,writeFileSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const dir=mkdtempSync(path.join(tmpdir(),'direct-upload-smoke-'));
process.env.NODE_ENV='test';process.env.DATA_BACKEND='local';process.env.DATA_DIR=dir;
writeFileSync(path.join(dir,'db.json'),JSON.stringify({gallery:[]}));
const {authorizeImages,completeImage,readTicket,directUploadSchema}=require('../dist/services/direct-upload');
function chunk(type,data){
  const body=Buffer.concat([Buffer.from(type),data]);let crc=0xffffffff;
  for(const byte of body){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  const length=Buffer.alloc(4);length.writeUInt32BE(data.length);
  const checksum=Buffer.alloc(4);checksum.writeUInt32BE((crc^0xffffffff)>>>0);
  return Buffer.concat([length,body,checksum]);
}
let authorization;
(async()=>{
  try {
    const width=1300,height=1300;const raw=randomBytes(height*(width*3+1));
    for(let row=0;row<height;row++)raw[row*(width*3+1)]=0;
    const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
    const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
    assert.ok(png.length>4.5*1024*1024&&png.length<=5*1024*1024);
    authorization=authorizeImages('smoke-test',directUploadSchema.parse({files:[{name:'smoke.png',size:png.length}]}))[0];
    const body=new FormData();for(const [key,value]of Object.entries(authorization.fields))body.append(key,value);
    body.append('file',new Blob([png],{type:'image/png'}),'smoke.png');
    const response=await fetch(authorization.uploadUrl,{method:'POST',body,signal:AbortSignal.timeout(120000)});
    assert.equal(response.status,200,'Cloudinary upload status');
    const saved=await completeImage(authorization.ticket,'smoke-test');
    assert.equal((await completeImage(authorization.ticket,'smoke-test')).id,saved.id);
    console.log(JSON.stringify({bytes:png.length,directUpload:'passed',providerVerification:'passed',idempotentSave:'passed'}));
  } finally {
    if(authorization){
      const values={public_id:readTicket(authorization.ticket,'smoke-test').publicId,timestamp:String(Math.floor(Date.now()/1000))};
      const signature=createHash('sha256').update(Object.keys(values).sort().map(key=>`${key}=${values[key]}`).join('&')+process.env.CLOUDINARY_API_SECRET).digest('hex');
      const body=new FormData();for(const [key,value]of Object.entries(values))body.append(key,value);
      body.append('api_key',process.env.CLOUDINARY_API_KEY);body.append('signature',signature);
      const response=await fetch(authorization.uploadUrl.replace(/upload$/,'destroy'),{method:'POST',body,signal:AbortSignal.timeout(30000)});
      const result=await response.json();assert.ok(response.ok&&['ok','not found'].includes(result.result),'Test asset cleanup failed');
      console.log('Cloudinary test asset cleanup confirmed');
    }
    rmSync(dir,{recursive:true,force:true});
  }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
