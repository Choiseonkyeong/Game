"""Create original transparent clothing artwork at the avatar registration coordinates."""
from pathlib import Path
from PIL import Image, ImageDraw
import json,re
root=Path(__file__).resolve().parents[1]; out=root/'dist/images'; (out/'icons').mkdir(exist_ok=True)
config=(root/'dist/sprite-config.js').read_text()
entries=dict(re.findall(r"'([^']+)':\s*\{src:'\./images/([^']+)'",config))
for i in json.loads((root/'dist/clothing-items.json').read_text()):entries[i['id']]=i['layerImg'].split('/')[-1]
colors={'pink':'#e7a7bb','lace':'#f2bfd0','beige':'#c9b39c','ivory':'#f5e9d9','cream':'#eee0ca','rose':'#dca4b5','sage':'#adbea1','moon':'#b9abd9','cloud':'#c5cfe5','cotton':'#eee5cc','denim':'#758ba6','check':'#c4adb0'}
for id,file in entries.items():
 if id.startswith(('body','hair')):continue
 im=Image.new('RGBA',(1230,1278));d=ImageDraw.Draw(im);color=next((v for k,v in colors.items() if k in id),'#ebd9c7');line='#977f79'
 def poly(p,fill=color):d.polygon(p,fill=fill);d.line(p+[p[0]],fill=line,width=4,joint='curve')
 def bow(x,y):
  poly([(x,y),(x-65,y-40),(x-72,y+32),(x,y+9)]);poly([(x,y),(x+65,y-40),(x+72,y+32),(x,y+9)]);d.ellipse((x-13,y-13,x+13,y+17),fill=color,outline=line,width=3)
 if id.startswith('top') or id in ['shop-cloud','craft-cotton','craft-moon']:
  poly([(520,547),(560,538),(586,558),(637,558),(669,538),(708,552),(758,654),(711,682),(688,652),(705,721),(501,725),(514,654),(487,681),(442,656)])
  d.arc((558,530,673,584),0,180,fill=line,width=5);d.line([(508,708),(695,708)],fill='#fff2e6',width=5)
  if 'pink' in id:
   for y in range(590,702,25):d.line([(523,y),(688,y)],fill='#fff0f3',width=8)
  if any(x in id for x in ['lace','cotton','moon']):
   for x in range(510,700,15):d.ellipse((x,710,x+18,731),fill=color,outline=line,width=2)
  if 'moon' in id:
   for x,y in [(560,603),(643,630),(590,678),(670,580)]:poly([(x,y-10),(x+3,y-3),(x+10,y),(x+3,y+3),(x,y+10),(x-3,y+3),(x-10,y),(x-3,y-3)],'#fff0b4')
 elif id.startswith('bottom') or id=='shop-sage':
  if 'denim' in id:poly([(503,726),(703,726),(722,829),(626,837),(613,777),(600,837),(489,829)]);d.line([(510,747),(696,747)],fill=line,width=4)
  else:
   end=988 if 'tiered' in id else 856
   poly([(502,724),(704,724),(752,end),(459,end)])
   for x in range(490,735,28):d.line([(int(603+(x-603)*.78),740),(x,end-6)],fill='#a3918a',width=3)
   if 'tiered' in id:
    for y in [800,880,970]:d.line([(482,y),(731,y)],fill='#d5c7bd',width=5)
 elif id.startswith('outer') or id=='shop-rose':
  poly([(522,545),(566,542),(584,590),(560,782),(480,799),(498,675),(455,788),(415,765),(469,598)])
  poly([(660,542),(705,550),(759,601),(803,765),(762,788),(713,675),(737,799),(655,782),(636,590)])
  d.line([(553,563),(574,600),(545,757)],fill='#fff6ec',width=10);d.line([(674,563),(647,600),(675,757)],fill='#fff6ec',width=10)
 elif id.startswith('hat') or id=='shop-ribbon':
  if 'beret' in id:d.ellipse((378,75,827,237),fill=color,outline=line,width=5);d.rounded_rectangle((410,191,792,225),15,fill=color,outline=line,width=4)
  elif 'lace' in id:d.arc((367,96,848,493),190,350,fill=color,width=30);bow(780,208)
  else:bow(788,226)
 elif 'fairy' in id:
  for box in [(312,556,465,725),(767,556,920,725),(334,690,465,836),(767,690,898,836)]:d.ellipse(box,fill='#d8c6ee99',outline='#aa94c0',width=5)
 elif 'ribbon' in id:bow(615,565)
 else:
  d.line([(708,593),(757,798)],fill=line,width=14);d.rounded_rectangle((718,754,842,874),22,fill=color,outline=line,width=5);d.arc((741,715,819,800),180,360,fill=line,width=9)
 im.save(out/file)
 box=im.getbbox();icon=im.crop(box);icon.thumbnail((220,220));card=Image.new('RGBA',(256,256));card.alpha_composite(icon,((256-icon.width)//2,(256-icon.height)//2));card.save(out/'icons'/f'{id}.png')
print('Created clothing overlays and icons')
