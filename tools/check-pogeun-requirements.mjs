import fs from'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../docs/pogeun-requirements.json',import.meta.url),'utf8'));
const pending=[],errors=[],ids=new Set();
for(const row of data.requirements){
 if(ids.has(row.id))errors.push(`Duplicate requirement ${row.id}`);ids.add(row.id);
 if(!['complete','partial','missing','pending'].includes(row.status))errors.push(`${row.id}: invalid status`);
 if(row.status!=='complete')pending.push(`${row.id} ${row.status}: ${row.request}`);
 else for(const key of ['automated','visual','storage','source','url'])if(!row.evidence?.[key])errors.push(`${row.id}: complete without ${key} evidence (use explicit not-applicable when appropriate)`);
}
const complete=pending.length===0;
if(data.all_requested_changes_complete!==complete)errors.push('Overall complete flag disagrees with requirement rows');
console.log(`Requested changes: ${complete?'COMPLETE':'PARTIAL'} (${data.requirements.length-pending.length}/${data.requirements.length})`);
for(const item of pending)console.log('PENDING '+item);
for(const error of errors)console.error(error);
if(errors.length||process.argv.includes('--require-complete')&&!complete)process.exitCode=1;
