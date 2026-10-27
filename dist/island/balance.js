import data from './balance.json?v=48' with {type:'json'};
import{validateBalance}from'./balance-schema.js?v=48';
const errors=validateBalance(data);if(errors.length)throw Error('포근섬 설정 오류: '+errors.join('; '));
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const BALANCE=freeze(data);
