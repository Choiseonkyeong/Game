'use strict';
// Paths are relative to index.html. Adjust this file only when registering artwork.
const SpriteConfig = {
  frame: {width:1230, height:1278}, // Shared registration rectangle, not tightly cropped parts.
  reference:'./images/character.png', // Transparent full-character derivative. Original JPG is preserved separately.
  referenceOverlays: ['bottom','top','outer','accessory','hat'], // Dress over the fully clothed character; no body separation required.
  layers: {
    body:      {z:10,x:0,y:0,scale:1},
    hair:      {z:20,x:0,y:0,scale:1},
    bottom:    {z:30,x:0,y:0,scale:1},
    top:       {z:40,x:0,y:0,scale:1},
    outer:     {z:50,x:0,y:0,scale:1},
    accessory: {z:60,x:0,y:0,scale:1},
    hat:       {z:70,x:0,y:0,scale:1}
  },
  items: {
    'body-basic':       {src:'./images/body.png'},
    'hair-long':        {src:'./images/hair.png'},
    'hair-bob':         {src:'./images/hair-bob.png'},
    'bottom-denim':     {src:'./images/bottom.png'},
    'bottom-skirt':     {src:'./images/bottom-skirt.png'},
    'top-oat':          {src:'./images/top.png'},
    'top-pink':         {src:'./images/top-pink.png'},
    'outer-cream':      {src:'./images/outer.png'},
    'outer-pink':       {src:'./images/outer-pink.png'},
    'accessory-tote':   {src:'./images/accessory.png'},
    'accessory-ribbon': {src:'./images/accessory-ribbon.png'},
    'hat-beret':        {src:'./images/hat.png'},
    'hat-ribbon':       {src:'./images/hat-ribbon.png'},
    'shop-cloud':      {src:'./images/shop-cloud.png'},
    'shop-rose':       {src:'./images/shop-rose.png'},
    'shop-sage':       {src:'./images/shop-sage.png'},
    'shop-ribbon':     {src:'./images/shop-ribbon.png'},
    'craft-cotton':    {src:'./images/craft-cotton.png'},
    'craft-moon':      {src:'./images/craft-moon.png'}
    // Per-item placement overrides are optional, e.g. x:12, y:-8, scale:1.02.
  }
};

if(typeof ClothingItems!=='undefined')for(const item of ClothingItems)SpriteConfig.items[item.id]={...SpriteConfig.items[item.id],src:item.layerImg};

// Illustrated cardigan uses the same registration in CSS and Canvas.
for(const id of ["outer-cream","outer-ivory"])SpriteConfig.items[id]={src:"./images/cardigan-illustrated.png",x:185,y:150,scale:.7};
