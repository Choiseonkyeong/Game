const ink = '#4b5147';
const svg = (body) => `<defs><pattern id="floor" width="70" height="28" patternUnits="userSpaceOnUse"><path d="M0 28H70M35 0V28" fill="none" stroke="#a49c8425"/></pattern><pattern id="rain" width="32" height="42" patternUnits="userSpaceOnUse"><path d="M14 3l-5 12" stroke="#8caaa8" stroke-width="1.5" opacity=".6"/></pattern></defs><g stroke="${ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
const interact = (id, label, body, target = false) => `<g ${target ? 'data-target' : 'data-item'}="${id}" tabindex="0" role="button" aria-label="${label}"><title>${label}</title>${body}</g>`;
function cat(x, y, happy = false, scale = 1) {return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-27 24Q-44 29-39 9Q-36 2-32 10" fill="none" stroke="#b38d65" stroke-width="9"/><ellipse cy="12" rx="24" ry="30" fill="#d4ab79"/><path d="M-25-7l-4-26 21 12Q1-24 10-21l20-12-5 27Q31 18 0 21Q-31 18-25-7Z" fill="#d4ab79"/><path d="M-22-23l2 10 8-6M22-23l-2 10-8-6" fill="#e7b3a0" stroke="none"/><path d="M-14-5q4 ${happy ? '-6' : '3'} 8 0m12 0q4 ${happy ? '-6' : '3'} 8 0" fill="none"/><path d="M-3 2h6L0 5Z" fill="#9c7768" stroke="none"/><path d="M0 5v3m-5 0q5 5 10 0M-24 1l-9-2m9 7-9 2M24 1l9-2m-9 7 9 2" fill="none" stroke-width="1.2"/><path d="M-9 35v-8m18 8v-8"/><path d="M-14 21q14 7 28 0" fill="none" stroke="#6d8564" stroke-width="5"/><circle cy="27" r="3" fill="#e4c77f" stroke-width="1"/></g>`;}
const towel = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-24-19h45l6 42h-48Z" fill="#f4dcad"/><path d="M-18 14h41M-17 18h40" stroke="#c49460" stroke-width="1"/><path d="M-19-12h34" stroke="#ffefcc" stroke-width="4"/></g>`;
const mug = (x, y, filled = false) => `<g transform="translate(${x} ${y})"><path d="M14-10q20-3 16 12q-3 9-15 6" fill="none" stroke-width="5" stroke="#697e71"/><path d="M-19-15h37l-3 34q-14 9-30 0Z" fill="#819a89"/><ellipse cy="-15" rx="18" ry="5" fill="${filled ? '#a07857' : '#eff0dd'}"/><path d="M-8 0h12M-2-6v12" stroke="#f1e8cb" stroke-width="2"/></g>`;
export function scene(s) {
 if (s.level === 0) return svg(`
 <path d="M0 0H400V460H0Z" fill="${s.sun ? '#e6ebd8' : '#cedbd6'}" stroke="none"/>
 <path d="M0 286h400v174H0Z" fill="#d8d2b9" stroke="none"/><path d="M0 286h400v174H0Z" fill="url(#floor)" stroke="none"/>
 <path d="M0 153h258v151H0Z" fill="#eadbc1"/><path d="M31 170h196v118H31Z" fill="#7e9b8b"/><path d="M48 184h162v104H48Z" fill="#b7cac0"/><path d="M129 184v104M48 234h162" stroke="#e3d9bd" stroke-width="5"/>
 <path d="M0 132h270l-16 40H0Z" fill="#74896b"/><path d="M17 133l-7 39m57-39-6 39m57-39-5 39m57-39-4 39m57-39-3 39" stroke="#c3c9a5" stroke-width="23"/><path d="M0 172h254"/>
 <path d="M69 103h122v30H69Z" fill="#faf0d7"/><text x="130" y="123" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="${ink}" stroke="none" letter-spacing="3">LITTLE CAFÉ</text>
 <path d="M290 276v-50q-23-31-4-47 14 3 10 26 15-35 26-13-1 15-25 32v52" fill="#91a481"/><path d="M274 267h44l-7 36h-29Z" fill="#bc9375"/>
 <ellipse cx="270" cy="366" rx="63" ry="11" fill="#b9bba0" stroke="none"/>
 ${interact('cat','고양이 · 수건을 사용하는 곳',cat(267,328,s.dry,1.25),true)}
 ${s.dry ? '<path d="M215 299l-4-10m-3 20-10-2m126-10 6-8m-5 21 11-2" stroke="#be985b"/>' : '<path d="M245 296l-3 11m18-14-2 12m20-6-1 12" stroke="#7f9da1"/>'}
 <path d="M41 356v-34h107v34m-98 0v41m90-41v41" fill="#9da486"/><path d="M37 320h117v17H37Z" fill="#afb293"/>
 ${!s.dry ? interact('towel','수건 · 고양이에게 옮기기',towel(94,312)) : ''}
 ${interact('sun','햇살 자리 · 구름을 이곳으로 옮기기',`<circle cx="331" cy="78" r="26" fill="${s.sun ? '#efd598' : '#e8dfbd'}" stroke="#b4ae86"/><path d="M331 41v-8m0 90v-8m-37-37h-8m90 0h-8m-64-26-6-6m52 52 6 6m-52 0-6 6m52-52 6-6" stroke="#c2ad75"/>`,true)}
 ${!s.sun ? `<path d="M0 0h400v380H0Z" fill="url(#rain)" stroke="none" pointer-events="none"/>${interact('cloud','구름 · 오른쪽 햇살 자리로 옮기기','<path d="M75 80Q50 80 55 60Q59 46 76 49Q75 27 98 26Q118 25 124 45Q145 31 159 48Q185 47 186 65Q188 82 167 83Z" fill="#f6f5e9"/><path d="M91 92l-5 13m35-14-5 13m35-14-5 13" stroke="#8ca5a1"/>')}` : '<path d="M53 66q10-9 20 0m9 0q10-9 20 0" fill="none" stroke="#90a28b"/>'}
 <g stroke="none" fill="#6b7665"><text x="24" y="427" font-size="10" letter-spacing="2">01 / AFTER THE RAIN</text></g>`);
 if(s.level === 1) return svg(`
 <path d="M0 0h400v460H0Z" fill="#eae4cf" stroke="none"/><path d="M0 326h400v134H0Z" fill="#d4c9ad" stroke="none"/><path d="M0 326h400v134H0Z" fill="url(#floor)" stroke="none"/>
 <path d="M20 30h143v151H20Z" fill="#f9f1d9"/><path d="M30 40h123v130H30Z" fill="#c0d0ba"/><path d="M91 40v130M30 104h123" stroke="#f6efdb" stroke-width="5"/><path d="M111 40l42 58v33L94 40Z" fill="#dbe2cc" stroke="none"/>
 <path d="M213 51h144v90H213Z" fill="#6e8067"/><text x="285" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#faf1d9" stroke="none">TODAY'S SPECIAL</text><path d="M239 94h90M249 108h70M262 121h43" stroke="#c8d2b6" stroke-width="1.5"/>
 <path d="M13 272h374v105H13Z" fill="#a7ae8c"/><path d="M35 296h331v60H35Z" fill="#b9bf9d"/><path d="M130 297v59m114-59v59" stroke="#979f7b"/><path d="M8 261h384v21H8Z" fill="#d1ba91"/>
 <path d="M60 202h17v57H60Z" fill="#a98b6a"/><path d="M64 202q-26-17-14-34 17 0 20 24 3-37 19-30 11 19-19 40" fill="#879d76"/>
 ${interact('machine','커피 머신 · 빈 컵을 놓는 자리',`<path d="M177 166h154v95H177Z" fill="#8b9c89"/><path d="M187 177h133v44H187Z" fill="#c0cab0"/><path d="M194 225h120v31H194Z" fill="#667865"/><path d="M211 214v12m80-12v12" stroke-width="5"/><path d="M198 252h109" stroke="#c8ccb7" stroke-width="3"/><circle cx="204" cy="191" r="4" fill="${s.power ? '#eac886' : '#7c8371'}"/>`,true)}
 ${interact('brew','추출 버튼 · 누르기','<circle cx="292" cy="192" r="19" fill="transparent" stroke="none"/><circle cx="292" cy="192" r="10" fill="#e4d6ad"/><circle cx="292" cy="192" r="4" fill="#aa9875"/>')}
 ${s.cup ? mug(254,236,s.coffee).replace('scale(1)','') : interact('mug','빈 컵 · 커피 머신으로 옮기기',mug(112,244))}
 ${s.coffee ? '<path d="M248 192q-6-8 0-16m12 16q-6-8 0-16" stroke="#fff9e1" stroke-width="3" fill="none"/>' : ''}
 ${interact('switch','벽 스위치 · 전원 켜기',`<rect x="352" y="181" width="31" height="44" rx="5" fill="#f8efd8"/><rect x="360" y="190" width="15" height="25" rx="3" fill="${s.power ? '#e5ce8a' : '#b1b6a0'}"/><path d="M363 ${s.power ? 197 : 207}h9" stroke="#777b63"/>`)}
 <path d="M333 229v-38h35" stroke="#6b7566" fill="none"/>
 ${cat(72,361,true,.82)}<path d="M179 359h100v33H179Z" fill="#f0dfbc"/><text x="229" y="380" text-anchor="middle" font-size="11" stroke="none" fill="#7c8069">slow coffee club</text>
 <text x="24" y="427" font-size="10" letter-spacing="2" stroke="none" fill="#6b7665">02 / A CUP OF SOMETHING GOOD</text>`);
 return svg(`
 <path d="M0 0h400v460H0Z" fill="#d0d7c9" stroke="none"/><path d="M0 304h400v156H0Z" fill="#b8b59d" stroke="none"/><path d="M0 304h400v156H0Z" fill="url(#floor)" stroke="none"/>
 <path d="M31 50h105v129H31Z" fill="#eae2c9"/><path d="M40 59h87v111H40Z" fill="#6f8181"/><path d="M84 59v111M40 115h87" stroke="#e2dcc6" stroke-width="4"/><path d="M107 73a15 15 0 1 0 11 22 13 13 0 0 1-11-22Z" fill="#f4e1ac" stroke="none"/><circle cx="57" cy="80" r="1.5" fill="#f4e1ac" stroke="none"/>
 ${interact('door','카페 출입문 · 열쇠를 사용하는 곳',`<path d="M221 43h143v266H221Z" fill="#8c9b85"/><path d="M232 55h120v246H232Z" fill="${s.door ? '#e9debb' : '#a8b49c'}"/><path d="M246 69h91v139H246Z" fill="${s.door ? '#f1e6c8' : '#798d85'}"/><path d="M256 158l70-66" stroke="#b9c3a4" stroke-width="8" opacity=".3"/><path d="M260 115h66v39h-66Z" fill="#ede2c3"/><text x="293" y="140" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#69755f" stroke="none">${s.door ? 'OPEN' : 'CLOSED'}</text><circle cx="335" cy="240" r="7" fill="#ddc58f"/><path d="M335 238v5"/>`,true)}
 <path d="M24 230h148v64H24Z" fill="#899a82"/><path d="M17 249h162v24H17Z" fill="#a8b49a"/><path d="M36 274v47m121-47v47" stroke-width="6" stroke="#899a82"/>
 ${interact('rug','바닥 러그 · 쿠션을 놓는 곳','<ellipse cx="218" cy="372" rx="82" ry="24" fill="#d6cba8"/><ellipse cx="218" cy="372" rx="69" ry="16" fill="none" stroke="#b6b193"/>',true)}
 ${interact('bowl','고양이 밥그릇 · 생선을 놓는 자리',`<path d="M307 354h58l-7 19h-44Z" fill="#d5b097"/><ellipse cx="336" cy="354" rx="29" ry="7" fill="#f1ddbc"/>${s.fed ? '<path d="M321 351q12-12 26 0-14 10-26 0m25 0 7-5v10Z" fill="#9fae96"/>' : ''}`,true)}
 ${s.cushion ? interact('key','열쇠 · 출입문으로 옮기기','<g transform="translate(92 249)"><circle r="9" fill="#dec382"/><circle r="3" fill="#a8b49a" stroke="none"/><path d="M8 0h28m-6 0v7m-8-7v5" fill="none" stroke="#c1a15b" stroke-width="5"/></g>') : ''}
 ${!s.fed ? cat(94,s.cushion ? 219 : 226,false,.9) : cat(310,317,true,.85)}
 ${!s.cushion ? interact('cushion','스트라이프 쿠션 · 바닥으로 옮기기','<g><path d="M53 226q38-14 78 0l-5 30q-33 9-70 0Z" fill="#e7c7a2"/><path d="M69 224l3 33m15-36 2 38m16-37 2 36m16-32-1 30" stroke="#b1977e" stroke-width="3"/></g>') : '<path d="M183 348q35-14 72 0l-5 31q-33 9-67 0Z" fill="#e7c7a2"/><path d="M198 347l3 33m15-36 2 38m16-37 2 36" stroke="#b1977e" stroke-width="3"/>'}
 ${!s.fed ? interact('fish','생선 · 고양이 밥그릇으로 옮기기','<g transform="translate(60 362)"><ellipse rx="32" ry="13" fill="#a5b6a6"/><path d="M28 0l19-13v26Z" fill="#8faba1"/><circle cx="-18" cy="-2" r="2" fill="#4b5147" stroke="none"/><path d="M-6-9q-7 10 0 19m10-20 5-8 8 10" fill="#a5b6a6"/></g>') : ''}
 <text x="24" y="427" font-size="10" letter-spacing="2" stroke="none" fill="#6b7665">03 / SEE YOU TOMORROW</text>`);
}
