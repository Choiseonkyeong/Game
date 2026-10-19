export const SHELL_KEY='pogeun-shells-v1';
export function readShells(raw){const n=Number(raw);return Number.isSafeInteger(n)&&n>=0?n:0;}
export function sale(balance,kind,stock){const price={apple:5,fish:8}[kind];if(!price||!Number.isSafeInteger(balance)||balance<0||balance+price>Number.MAX_SAFE_INTEGER||!Number.isSafeInteger(stock)||stock<1)return{ok:false,balance,stock};return{ok:true,balance:balance+price,stock:stock-1,earned:price};}
export const shellIcon='<svg viewBox="0 0 30 24" aria-hidden="true"><path d="M4 17C-2 4 6-2 15 4C24-2 32 4 26 17L20 22H10Z" fill="#f7e4c6" stroke="#b69b7c" stroke-width="1.5"/><path d="M15 5V21M7 6L12 21M23 6L18 21" stroke="#d1b392" stroke-width="1.2" fill="none"/></svg>';
