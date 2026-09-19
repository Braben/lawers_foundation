"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
export function VisitTracker(){
  const path=usePathname();const previous=useRef('');
  useEffect(()=>{
    if(path.startsWith('/admin')||previous.current===path||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
    previous.current=path;
    try{
      const now=Date.now();
      let visitor=JSON.parse(localStorage.getItem('lf_visit_identity')||'null') as {id:string;expires:number}|null;
      if(!visitor||visitor.expires<now){visitor={id:crypto.randomUUID(),expires:now+90*86400000};localStorage.setItem('lf_visit_identity',JSON.stringify(visitor));}
      let session=JSON.parse(localStorage.getItem('lf_visit_session')||'null') as {id:string;last:number}|null;
      if(!session||now-session.last>30*60000)session={id:crypto.randomUUID(),last:now};
      session.last=now;localStorage.setItem('lf_visit_session',JSON.stringify(session));
      const body={eventId:crypto.randomUUID(),visitorId:visitor.id,sessionId:session.id,path,referrer:document.referrer?new URL(document.referrer).origin:'direct'};
      void fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'}/api/analytics/pageview`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
    }catch{/* Storage restrictions or unavailable tracking never interrupt the page. */}
  },[path]);
  return null;
}
