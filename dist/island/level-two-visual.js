// Presentation only. Inventory, currency, growth and logical walkable cells stay untouched.
const cache = new WeakMap();

function projectedBounds(cells, grid) {
  const points = cells.map(([c, r]) => [
    grid.ox + (c - r) * grid.hx,
    grid.oy + (c + r) * grid.hy
  ]);
  return {
    left: Math.min(...points.map(p => p[0])),
    right: Math.max(...points.map(p => p[0])),
    top: Math.min(...points.map(p => p[1])),
    bottom: Math.max(...points.map(p => p[1]))
  };
}

export function levelTwoScene(logicalStage, terrain, level) {
  const base = terrain?.stages?.[0];
  if (level < 2 || !logicalStage || !base || !terrain.grid) return logicalStage;
  if (cache.has(logicalStage)) return cache.get(logicalStage);

  // Fit the existing logical coordinates into the original round island's lawn.
  // Neither saved coordinates nor the collision mask is rewritten.
  const from = projectedBounds(logicalStage.cells, terrain.grid);
  const to = projectedBounds(base.cells, terrain.grid);
  const scale = Math.min(
    (to.right - to.left) / Math.max(1, from.right - from.left),
    (to.bottom - to.top) / Math.max(1, from.bottom - from.top)
  );
  const fromX = (from.left + from.right) / 2;
  const fromY = (from.top + from.bottom) / 2;
  const toX = (to.left + to.right) / 2;
  const toY = (to.top + to.bottom) / 2;
  const expansion = Math.pow(1.08, Math.max(0, level - 2));
  const growX = x => 480 + (x - 480) * expansion;
  const growY = y => 430 + (y - 430) * expansion;
  const renderGrid = {
    hx: terrain.grid.hx * scale * expansion,
    hy: terrain.grid.hy * scale * expansion,
    ox: growX(toX + (terrain.grid.ox - fromX) * scale),
    oy: growY(toY + (terrain.grid.oy - fromY) * scale)
  };
  const scene = {
    ...base,
    level,
    expansion,
    x: growX(base.x),
    y: growY(base.y),
    width: base.width * expansion,
    height: base.height * expansion,
    house: [growX(base.house[0]), growY(base.house[1]), base.house[2] * expansion, base.house[3] * expansion],
    cells: logicalStage.cells,
    renderGrid,
    compactReference: true
  };
  cache.set(logicalStage, scene);
  return scene;
}

export function levelTwoDetails(scene) {
  if (!scene?.compactReference) return '';
  const flower = (x, y, color) => `<g transform="translate(${x} ${y})"><path d="M0 0v-5" stroke="#789553" stroke-width="1.2" stroke-linecap="round"/><path d="M0-2q-4-3-4 0q2 2 4 0" fill="#9bbb72"/><g fill="${color}" stroke="#bd9f86" stroke-width=".45"><circle cx="0" cy="-8" r="2.1"/><circle cx="-2.5" cy="-5.5" r="2.1"/><circle cx="2.5" cy="-5.5" r="2.1"/><circle cx="0" cy="-3.5" r="2.1"/></g><circle cy="-5.7" r="1.4" fill="#efce83"/></g>`;
  return `<g id="level-two-details" transform="translate(480 430) scale(${scene.expansion || 1}) translate(-480 -430)" pointer-events="none" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(536 425)">
      <ellipse cy="1" rx="9" ry="3" fill="#6d754a" opacity=".12"/>
      <path d="M-6-7h12l-1.8 9h-8.4z" fill="#c49a7b" stroke="#967958" stroke-width="1.1"/>
      <ellipse cy="-7" rx="7" ry="2.3" fill="#e1bc98" stroke="#a28766" stroke-width="1"/>
      <ellipse cy="-7" rx="4.6" ry="1.2" fill="#937454"/>
      <path d="M0-8v-9M0-12q-9-8-8-2q2 5 8 2M0-15q8-8 8-2q-3 5-8 2" fill="#91b674" stroke="#6e9158" stroke-width="1.1"/>
      ${flower(0, -17, '#f2c2b3')}
    </g>
    ${flower(345, 485, '#f5e5bf')}
    ${flower(353, 489, '#f1c7c4')}
    ${flower(548, 493, '#f5e5bf')}
  </g>`;
}
