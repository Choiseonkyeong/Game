import{SEED_CATALOG}from'./seed-shop.js?v=42';
// Numbers baked into the preserved illustration. Any differing live price gets
// a small data-driven label over the number only; original artwork stays intact.
const BAKED={apple:[120,138,368],lemon:[120,278,368],persimmon:[120,420,368],banana:[120,270,476],corn:[90,138,670],sweetpotato:[80,278,670],potato:[90,420,670]};
export function seedPriceLabels(catalog=SEED_CATALOG){
 return Object.entries(BAKED).flatMap(([kind,[baked,x,y]])=>{
  const price=catalog[kind]?.price;if(!Number.isSafeInteger(price)||price<0||price===baked)return[];
  return `<svg data-seed-price="${kind}" aria-label="${catalog[kind].name} 씨앗 조개 ${price}" viewBox="0 0 48 34" style="position:absolute;left:${(x-23)/1536*100}%;top:${(y-18)/864*100}%;width:${48/1536*100}%;height:${34/864*100}%;pointer-events:none"><rect width="48" height="34" rx="5" fill="#ffe5b8"/><text x="24" y="25" text-anchor="middle" font-family="Jua, sans-serif" font-size="25" fill="#4d291b">${price}</text></svg>`;
 }).join('');
}
