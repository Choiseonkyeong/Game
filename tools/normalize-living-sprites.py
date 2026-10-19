from PIL import Image
import numpy as np
from scipy.ndimage import label,binary_erosion,binary_opening,binary_dilation
from pathlib import Path
import os
ROOT=Path(os.environ.get('POGEUN_GENERATED_IMAGES','generated_images'))
for gender,name in [('female','exec-e6e58f46-69a3-4bba-b699-82d0e93e6f15.png'),('male','exec-fb3bc6d5-269e-4a4d-9a4f-a71c8ff17ef6.png')]:
 im=Image.open(ROOT/name).convert('RGBA');frames=[]
 density=(np.array(im)[:,:,3]>150).sum(axis=1);bounds=[0]
 for k in range(1,4):
  mid=round(im.height*k/4);ys=np.arange(mid-35,mid+36);minimum=density[ys].min();gap=ys[density[ys]<=minimum+3];bounds.append(round(float(np.median(gap))))
 bounds.append(im.height)
 for row in range(4):
  for col in range(6):
   cell=im.crop((round(col*im.width/6),bounds[row],round((col+1)*im.width/6),bounds[row+1]))
   a=np.array(cell);rgb=a[:,:,:3].astype(float);mask=a[:,:,3]>130
   # Remove only saturated chroma spill around the generated silhouette.
   spill=((rgb[:,:,0]>rgb[:,:,1]*1.8)&(rgb[:,:,0]>rgb[:,:,2]*1.6))|((rgb[:,:,1]>rgb[:,:,0]*1.5)&(rgb[:,:,1]>rgb[:,:,2]*1.5))|((rgb[:,:,0]>180)&(rgb[:,:,1]>170)&(rgb[:,:,2]<90))
   edge=mask&~binary_erosion(mask,iterations=4)
   mask[edge&spill]=False
   opened=binary_opening(mask,iterations=1);cc,n=label(opened);counts=np.bincount(cc.ravel());counts[0]=0;main=cc==counts.argmax();main=binary_dilation(main,iterations=1)&mask;a[:,:,3]=np.where(main,a[:,:,3],0)
   cell=Image.fromarray(a);box=cell.getbbox();frames.append((cell,box))
 # One scale per gender, aligned to head center and fixed planted-foot baseline.
 maxh=max(b[3]-b[1] for _,b in frames);scale=min(172/maxh,60/max(max(cell.width/2-b[0],b[2]-cell.width/2)for cell,b in frames))
 atlas=Image.new('RGBA',(768,768))
 for i,(cell,b) in enumerate(frames):
  a=np.array(cell);upper=a[:int(b[1]+(b[3]-b[1])*.42),:,3]>130;ys,xs=np.where(upper)
  cx=cell.width/2
  crop=cell.crop(b);sz=(round(crop.width*scale),round(crop.height*scale));crop=crop.resize(sz,Image.Resampling.LANCZOS)
  x=round(64+(b[0]-cx)*scale);y=183-sz[1];atlas.alpha_composite(crop,(i%6*128+x,i//6*192+y))
 out=Path('dist/island/art/humans')/(gender+'-cozy.webp');atlas.save(out,lossless=True);print(out,atlas.getbbox())
Image.open(ROOT/'exec-d88e7d5c-1869-4511-a4e6-22586150d334.png').resize((960,800),Image.Resampling.NEAREST).save('dist/island/art/world/island-floating.webp',quality=97,method=6)
