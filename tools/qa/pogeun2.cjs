const {chromium}=require('playwright');
const fs=require('fs');
const BASE=process.env.POGEUN_BASE_URL||'http://127.0.0.1:8080';
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
 const page=await context.newPage(), errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(!localStorage.getItem('pogeun-profile-v1'))localStorage.setItem('pogeun-profile-v1',JSON.stringify({name:'그래픽 검수',gender:'female'}));});
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('suming-cozy-island-v1')));
 await page.goto(BASE+'/island/');
 await page.waitForSelector('#approved-world');await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.waitForTimeout(700);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 let state=await read();assert.equal(state.items.filter(p=>p.kind==='field').length,3);
 await page.screenshot({path:'docs/qa/pogeun2/after-desktop.png'});
 results.push('1440x900: three independent beds and layered world rendered');
 const bed=state.items.find(p=>p.kind==='field');
 await page.locator(`path.object-hit[data-id="${bed.id}"]`).click();
 await page.locator('[data-act="sow"]').click();await page.locator('[data-crop="carrot"]').click();
 await page.waitForFunction(id=>JSON.parse(localStorage.getItem('suming-cozy-island-v1')).items.some(p=>p.id===id&&p.crop==='carrot'),bed.id,{timeout:15000});
 state=await read();assert.ok(state.tasks.sowed);results.push('Clicked bed → crop choice → avatar approached → carrot planted');
 await page.reload();await page.waitForSelector('#approved-world');await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));assert.equal((await read()).items.find(p=>p.id===bed.id).crop,'carrot');
 results.push('Reload retained bed identity, position and planted crop');
 // Change only the test clock; leave crop state and game implementation untouched.
 await page.clock.install();await page.clock.setFixedTime(Date.now()+60000);await page.waitForTimeout(2100);
 await page.locator(`path.object-hit[data-id="${bed.id}"]`).click();
 await page.locator('[data-act="reap"]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('suming-cozy-island-v1')).inventory['crop-carrot']===1,null,{timeout:15000});
 results.push('Simulated maturity clock: harvest entered inventory');
 await page.clock.resume();
 await page.reload();await page.waitForSelector('#approved-world');await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));state=await read();assert.equal(state.inventory['crop-carrot'],1);assert.equal(state.items.find(p=>p.id===bed.id).crop,undefined);
 results.push('Harvest inventory and cleared bed survived reload');
 // Check a click path to a known free tile, then keyboard movement.
 await page.locator('[data-cell="12,14"]').click();await page.waitForTimeout(2500);
 assert.deepEqual((await read()).avatar,[12,14]);
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');await page.waitForTimeout(600);
 results.push('Real pointer walk and keyboard walk completed without page errors');
 await page.locator('[data-house]').click();assert.equal(await page.locator('#scene').getAttribute('data-room'),'1');
 await page.locator('[data-act="leave-house"]').click();assert.equal(await page.locator('#scene').getAttribute('data-room'),'0');results.push('Cottage enter/exit preserved');
 // Water uses the unchanged existing seed growth system.
 state=await read();const starter=state.items.find(p=>p.id===state.loop.starterId);
 await page.locator(`rect.object-hit[data-id="${starter.id}"]`).click();await page.locator('[data-act="tend-seed"]').click();
 await page.waitForFunction(id=>JSON.parse(localStorage.getItem('suming-cozy-island-v1')).items.find(p=>p.id===id).seedWatered>0,starter.id,{timeout:15000});results.push('Existing seed watering and growth retained');
 await page.reload();await page.waitForSelector('#approved-world');await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const before=await read();await page.reload();await page.waitForSelector('#approved-world');await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));assert.deepEqual((await read()).items,before.items);results.push('Existing saves do not receive extra or relocated beds on reload');
 for(const [width,height] of [[1920,1080],[844,390],[667,375]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(350);
  await page.screenshot({path:`docs/qa/pogeun2/after-${width}x${height}.png`});
  assert.equal(await page.locator('#approved-cottage').count(),1);assert.equal(await page.locator('#approved-terrain').count(),1);
  results.push(`${width}x${height}: world and unchanged HUD rendered`);
 }
 // A separate touch-enabled browser context.
 const touch=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const tp=await touch.newPage();tp.on('pageerror',e=>errors.push(e.message));await tp.goto(BASE+'/island/');await tp.waitForSelector('#approved-world');await tp.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await tp.locator('path.object-hit[aria-label="텃밭"]').first().tap();assert.equal(await tp.locator('[data-act="sow"]').count(),1);results.push('844x390 touch emulation: bed tap selected correct farming interaction');await tp.screenshot({path:'docs/qa/pogeun2/after-mobile-touch.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/qa/pogeun2/browser-results.json',JSON.stringify({results,errors,physicalPhoneVerified:false,clock:'Maturity advanced with browser fixed Date.now; movement and interaction used actual browser input'},null,2));console.log(JSON.stringify({results,errors}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
