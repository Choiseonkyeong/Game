import {seedStage} from './seed-shop.js?v=42';

// The approved background already contains stage one at this exact position.
// Only draw the growing starter; all purchased seeds retain their existing art.
export function starterTreeArt(plant, now = Date.now()) {
  const stage = seedStage(plant, now);
  if (stage === 1) return '';
  const height = [0, 0, 48, 68, 83, 83][stage];
  const crown = stage === 2 ? 20 : stage === 3 ? 29 : 36;
  const foliage = (x, y, radius) => `<g transform="translate(${x} ${y})">
    <path d="M${-radius} 3q-8-10 0-17q-1-12 12-12q8-13 19-4q15-3 17 11q12 6 4 19q-4 13-20 9q-18 8-32-6Z" fill="#8bbb62" stroke="#5f834c" stroke-width="1.6"/>
    <path d="M${-radius+4}-8q0-10 12-9q10-11 18-3q10-2 11 6" fill="none" stroke="#badb82" stroke-width="5" stroke-linecap="round"/>
    <path d="M${-radius+5} 3q12 8 24 1q12 3 19-4" fill="none" stroke="#729f55" stroke-width="4" stroke-linecap="round"/>
  </g>`;
  const apple = (x,y) => `<g transform="translate(${x} ${y})"><path d="M0-4q-6-5-9 1q-2 8 5 11q4-1 7 0q7-5 4-11q-3-4-7-1Z" fill="#e78d7e" stroke="#a56f57" stroke-width="1.2"/><path d="M0-4l2-5" stroke="#7f8050" stroke-width="1.5"/><path d="M3-8q5-4 6 0q-3 3-6 0" fill="#a4bf6d"/><path d="M-5-1l-1 3" stroke="#f9c8ac" stroke-width="2" stroke-linecap="round"/></g>`;
  const fruit = stage === 5 ? [[-19,-height-6],[10,-height-17],[27,-height+2],[-5,-height+9]].map(([x,y])=>apple(x,y)).join('') : '';
  const buds = stage === 4 ? [[-19,-height-6],[10,-height-17],[24,-height+2]].map(([x,y])=>`<g transform="translate(${x} ${y})" fill="#f5d6c6" stroke="#c49b89" stroke-width=".7"><circle cx="-2" r="3"/><circle cx="2" r="3"/><circle cy="-3" r="3"/><circle cy="3" r="3"/><circle r="1.8" fill="#e5c66f"/></g>`).join('') : '';
  return `<g class="starter-tree" data-growth-stage="${stage}" stroke-linejoin="round">
    <ellipse cy="1" rx="31" ry="8" fill="#64894e" opacity=".18"/>
    <path d="M-6 0q6-${height/2} 1-${height}h10q-6 ${height/2} 0 ${height}l-9-4Z" fill="#bd9569" stroke="#876e4f" stroke-width="1.7"/>
    <path d="M5-14l-16-22M8-24l16-15" fill="none" stroke="#a9855c" stroke-width="4" stroke-linecap="round"/>
    ${foliage(0,-27,17)}${foliage(-5,-height,crown)}${stage>=3?foliage(12,-height+9,crown-7):''}${buds}${fruit}
    <path d="M-10 0q7-7 15-3q9-3 14 3" fill="none" stroke="#a9cb78" stroke-width="2"/>
  </g>`;
}
