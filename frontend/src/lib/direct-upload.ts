import type { GalleryItem } from '../types';

type Authorization = {ticket:string;uploadUrl:string;fields:Record<string,string>};
type Request = <T>(path:string,options:RequestInit)=>Promise<T>;
export type UploadMetadata = {title:string;description:string;category:string};
export type PendingImage = {file:File;authorization?:Authorization;uploaded?:boolean};
export type UploadBatchResult = {items:GalleryItem[];failed:(PendingImage & {message:string})[]};

async function validate(files:File[]) {
  if(files.length<1 || files.length>20)throw new Error('Choose between 1 and 20 images.');
  if(files.some(file=>!file.size || file.size>5*1024*1024))throw new Error('Each image must be 5 MB or smaller.');
  if(files.reduce((sum,file)=>sum+file.size,0)>50*1024*1024)throw new Error('The batch must be 50 MB or smaller.');
  for(const file of files){
    const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
    const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
    const jpeg=bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
    const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF' && new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
    if(!png&&!jpeg&&!webp)throw new Error(`${file.name}: choose a JPEG, PNG or WebP image.`);
  }
}

export async function uploadGalleryImages(files:File[],metadata:UploadMetadata,request:Request,onProgress?:(done:number,total:number)=>void,retry?:PendingImage[]):Promise<UploadBatchResult> {
  await validate(files);
  const jobs:PendingImage[]=retry || files.map(file=>({file}));
  const newJobs=jobs.filter(job=>!job.authorization);
  if(newJobs.length){
    const authorizations=await request<Authorization[]>('/api/upload/authorize',{method:'POST',body:JSON.stringify({...metadata,files:newJobs.map(({file})=>({name:file.name,size:file.size}))})});
    if(authorizations.length!==newJobs.length)throw new Error('Invalid upload authorization response.');
    newJobs.forEach((job,index)=>{job.authorization=authorizations[index];});
  }
  const result:UploadBatchResult={items:[],failed:[]};onProgress?.(0,jobs.length);
  for(const [index,job] of jobs.entries()){
    try {
      const authorization=job.authorization!;
      if(!/^https:\/\/api\.cloudinary\.com\/v1_1\/[\w-]+\/image\/upload$/.test(authorization.uploadUrl))throw new Error('Invalid image storage endpoint.');
      if(!job.uploaded){
        const body=new FormData();
        Object.entries(authorization.fields).forEach(([key,value])=>body.append(key,value));body.append('file',job.file);
        // Never use the authenticated API client here: Firebase tokens must not go to Cloudinary.
        const response=await fetch(authorization.uploadUrl,{method:'POST',body,credentials:'omit',signal:AbortSignal.timeout(120000)});
        if(!response.ok)throw new Error(`Image storage rejected ${job.file.name} (${response.status}).`);
        job.uploaded=true;
      }
      let saved:GalleryItem|undefined;let lastError:unknown;
      for(let attempt=0;attempt<3;attempt++){
        try{saved=await request<GalleryItem>('/api/upload/complete',{method:'POST',body:JSON.stringify({ticket:authorization.ticket})});break;}
        catch(error){lastError=error;}
      }
      if(!saved)throw lastError || new Error('Could not save image details.');
      result.items.push(saved);
    }catch(error){result.failed.push({...job,message:error instanceof Error?error.message:'Upload failed.'});}
    onProgress?.(index+1,jobs.length);
  }
  return result;
}
