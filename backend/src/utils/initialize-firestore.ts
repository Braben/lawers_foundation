import fs from 'fs';
import path from 'path';
import { getApps, deleteApp } from 'firebase-admin/app';
import { initFirebase, getFirestore, getAuth } from '../config/firebase';
import { DEFAULT_ROLES, DEFAULT_CURRENCIES } from '../config/features';
import { CollectionName, mergeLocalData } from '../config/db';

async function main() {
  initFirebase();
  const firestore=getFirestore();
  if(!firestore)throw new Error('Configure Firebase credentials first');
  let created=0;
  const createMissing=async(collection:string,id:string,data:Record<string,unknown>)=>{
    await firestore.runTransaction(async transaction=>{
      const ref=firestore.collection(collection).doc(id);
      if((await transaction.get(ref)).exists)return;
      transaction.create(ref,{...data,id,createdAt:data.createdAt||new Date().toISOString(),updatedAt:data.updatedAt||new Date().toISOString()});
      created++;
    });
  };
  for(const role of DEFAULT_ROLES)await createMissing('roles',role.id,role);
  await createMissing('settings','currencies',DEFAULT_CURRENCIES);
  await createMissing('settings','analytics',{retentionDays:90,sessionTimeoutMinutes:30,enabled:true});
  // Run only as a trusted operator. Resolve configured accounts once to immutable UIDs;
  // runtime authorization never trusts email allowlists.
  const provision = [
    {roleId:'super_admin',values:[process.env.ADMIN_EMAILS,process.env.SUPER_ADMINS]},
    {roleId:'publisher',values:[process.env.CONTENT_PUBLISHERS]},
    {roleId:'event_manager',values:[process.env.EVENT_MANAGERS]},
  ];
  for (const group of provision) for (const email of group.values.flatMap(value=>(value||'').split(',')).map(s=>s.trim()).filter(Boolean)) {
    try {
      const user=await getAuth()!.getUserByEmail(email);
      await createMissing('staff',user.uid,{email:user.email||email,name:user.displayName||'Staff',roleId:group.roleId,disabled:user.disabled});
    } catch(error:any) {
      if(error.code==='auth/user-not-found') console.warn('A configured staff account does not yet exist in Firebase Auth.'); else throw error;
    }
  }
  if(process.argv.includes('--migrate-local')){
    const names:CollectionName[]=['programs','stories','events','gallery','siteContent','donations','contacts','rsvps','roles','staff','settings','analyticsEvents'];
    let merged=Object.fromEntries(names.map(name=>[name,[] as Record<string,any>[]])) as Record<CollectionName,Record<string,any>[]>;
    for(const file of [path.resolve(__dirname,'../../dist/data/db.json'),path.resolve(__dirname,'../../src/data/db.json')]){
      if(fs.existsSync(file))merged=mergeLocalData(merged,JSON.parse(fs.readFileSync(file,'utf8')));
    }
    for(const name of ['programs','stories','events','gallery','siteContent','donations','contacts','rsvps'] as CollectionName[]){
      for(const record of merged[name]){
        if(!record.id)continue;
        if(name==='donations'&&!record.currency)record.currency='GHS';
        await createMissing(name,String(record.id),record);
      }
    }
  }
  console.log(`Firestore initialized: ${created} missing records added; existing records preserved.`);
}
main().catch(error=>{console.error('Firestore initialization failed:',error.message);process.exitCode=1;}).finally(async()=>{await Promise.all(getApps().map(app=>deleteApp(app)));});
