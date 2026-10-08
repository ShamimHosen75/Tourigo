import type { SceneKind } from './types';

// Procedural landscape artwork used as a stand-in until real photos are uploaded.
// Every record keeps working with zero assets: pass a seed (the slug/title) and a
// scene kind and you get a deterministic SVG painting of that kind of place.

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 800;
const H = 600;

const skies = [
  { top: '#2b7bd3', mid: '#7cc1f0', bottom: '#dff3ff', sun: '#fff7d6', name: 'day' },
  { top: '#3a5ba8', mid: '#f29e7a', bottom: '#ffd59e', sun: '#fff1c4', name: 'sunset' },
  { top: '#1d4e89', mid: '#5fa8d3', bottom: '#cdeffd', sun: '#ffffff', name: 'morning' },
  { top: '#2d2a6e', mid: '#c0618f', bottom: '#f7b267', sun: '#ffe3a3', name: 'dusk' },
];

function ridge(r: () => number, baseY: number, amp: number, roughness: number, seedShift: number) {
  const f1 = 0.004 + r() * 0.004;
  const f2 = 0.012 + r() * 0.01;
  const f3 = 0.03 + r() * 0.02;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 10) {
    const y =
      baseY -
      amp * (0.6 * Math.sin(x * f1 + seedShift) + 0.3 * Math.sin(x * f2 + seedShift * 2) + roughness * Math.sin(x * f3 + seedShift * 3)) -
      amp * 0.4 * Math.abs(Math.sin(x * f1 * 0.5 + seedShift));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M0,${H} L${pts.join(' L')} L${W},${H} Z`;
}

function mix(hexA: string, hexB: string, t: number) {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function layers(r: () => number, colors: string[], startY: number, step: number, amp: number, haze: string) {
  return colors
    .map((c, i) => {
      const d = ridge(r, startY + i * step, amp * (1 - i * 0.12), 0.25 + r() * 0.2, r() * 10);
      const fill = mix(c, haze, Math.max(0, 0.45 - i * 0.15));
      return `<path d="${d}" fill="${fill}"/>`;
    })
    .join('');
}

function mist(r: () => number, y: number, count: number, opacity = 0.55) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const cx = r() * W;
    const cy = y + (r() - 0.5) * 40;
    s += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(120 + r() * 160).toFixed(0)}" ry="${(14 + r() * 18).toFixed(0)}" fill="#fff" opacity="${(opacity * (0.5 + r() * 0.5)).toFixed(2)}"/>`;
  }
  return `<g filter="url(#blur)">${s}</g>`;
}

function water(y: number, top: string, bottom: string) {
  return `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#water)"/>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${(i * 97) % W}" y="${y + 12 + i * ((H - y) / 10)}" width="${80 + ((i * 53) % 120)}" height="2" rx="1" fill="#fff" opacity="0.25"/>`).join('')}`;
}

function palm(x: number, y: number, s: number) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#14321f">
    <path d="M0,0 C6,-60 10,-120 22,-170 L28,-170 C18,-120 12,-60 8,0 Z"/>
    <path d="M25,-172 C-20,-190 -60,-170 -80,-140 C-50,-165 -15,-170 25,-165 Z"/>
    <path d="M25,-172 C70,-195 110,-175 125,-145 C95,-168 60,-170 25,-165 Z"/>
    <path d="M25,-172 C10,-215 -30,-225 -55,-215 C-25,-210 5,-200 25,-168 Z"/>
    <path d="M25,-172 C45,-218 85,-228 108,-210 C80,-208 50,-200 27,-166 Z"/>
    <path d="M25,-172 C-5,-170 -30,-150 -40,-120 C-20,-145 0,-160 25,-166 Z"/>
  </g>`;
}

function tree(x: number, y: number, s: number, color: string) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-8" width="4" height="12" fill="#2a1d12"/><path d="M0,-60 L18,-8 L-18,-8 Z" fill="${color}"/><path d="M0,-75 L14,-30 L-14,-30 Z" fill="${color}"/></g>`;
}

function hiker(x: number, y: number, s: number) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#111827">
    <circle cx="0" cy="-58" r="6"/>
    <path d="M-7,-50 L7,-50 L9,-24 L-8,-24 Z"/>
    <rect x="-14" y="-52" width="10" height="22" rx="3" fill="#7c2d12"/>
    <path d="M-7,-25 L-11,0 L-6,0 L-1,-22 L3,0 L8,0 L5,-25 Z"/>
    <path d="M9,-46 L18,-20 L19,0 L21,0 L20,-22 L11,-48 Z"/>
  </g>`;
}

function dome(x: number, y: number, w: number, color: string) {
  return `<path d="M${x - w / 2},${y} Q${x - w / 2},${y - w * 0.75} ${x},${y - w * 0.85} Q${x + w / 2},${y - w * 0.75} ${x + w / 2},${y} Z" fill="${color}"/>`;
}

function buildScene(kind: SceneKind, seedStr: string) {
  const seed = hash(seedStr + kind);
  const r = rng(seed);
  const sky = skies[seed % skies.length];
  const sunX = 120 + r() * 560;
  const sunY = 90 + r() * 90;
  let body = '';

  const greens = ['#5f8f5a', '#3f7a45', '#2c6138', '#1d4a2b'];
  const blues = ['#8aa4c4', '#6a86ad', '#4b6a93', '#2f4f78'];

  switch (kind) {
    case 'hills':
      body =
        layers(r, ['#9db7c9', '#6f9a7c', '#4c7f55'], 260, 55, 60, sky.bottom) +
        mist(r, 360, 7, 0.75) +
        layers(r, ['#2f6a3b', '#1f4d2b'], 420, 60, 50, sky.bottom) +
        mist(r, 470, 5, 0.5) +
        (r() > 0.4 ? hiker(400 + (r() - 0.5) * 200, 560, 1.4) : '');
      break;
    case 'snow':
      body =
        `<path d="${ridge(r, 330, 140, 0.4, r() * 10)}" fill="#e8eef6"/>` +
        `<path d="${ridge(r, 380, 90, 0.4, r() * 10)}" fill="#c4d3e6"/>` +
        layers(r, blues.slice(1), 450, 50, 50, sky.bottom) +
        mist(r, 420, 5);
      break;
    case 'beach':
    case 'island': {
      const horizon = 330 + r() * 30;
      body =
        `<rect x="0" y="${horizon}" width="${W}" height="${H - horizon}" fill="#2aa0c9"/>` +
        water(horizon, '#38b6d8', '#0f6f9a') +
        `<path d="M0,${H} L0,${H - 90} Q${W * 0.35},${H - 160} ${W},${H - 70} L${W},${H} Z" fill="#f1dcae"/>` +
        `<path d="M0,${H - 90} Q${W * 0.35},${H - 160} ${W},${H - 70}" stroke="#fff" stroke-width="6" fill="none" opacity="0.7"/>` +
        (kind === 'island' ? `<path d="M${W * 0.55},${horizon} Q${W * 0.7},${horizon - 40} ${W * 0.9},${horizon} Z" fill="#2d6a3e"/>` : '') +
        palm(60 + r() * 60, H - 70, 1.1) +
        palm(W - 120 - r() * 60, H - 50, 0.85);
      break;
    }
    case 'waterfall': {
      // two rocky cliffs with a fall pouring through the gap between them
      const cliff = (x0: number, x1: number, top: number, dir: number) => {
        let d = `M${x0},${H} L${x0},${top}`;
        for (let i = 1; i <= 8; i++) {
          const x = x0 + ((x1 - x0) * i) / 8;
          d += ` L${x.toFixed(0)},${(top + (r() - 0.3) * 30 + (dir * i * 6)).toFixed(0)}`;
        }
        return `${d} L${x1},${H} Z`;
      };
      body =
        layers(r, ['#9fb8a6', '#6f9a7c'], 250, 50, 50, sky.bottom) +
        `<path d="${cliff(-10, 372, 165, 1)}" fill="#3f7a45"/>` +
        `<path d="${cliff(428, 810, 155, -1)}" fill="#2f6a3b"/>` +
        `<path d="${cliff(-10, 372, 205, 1)}" fill="#6b665a"/>` +
        `<path d="${cliff(428, 810, 195, -1)}" fill="#5e5a50"/>` +
        Array.from({ length: 14 }, (_, i) => {
          const x = i < 7 ? 20 + i * 50 : 450 + (i - 7) * 50;
          return `<path d="M${x},${230 + r() * 40} l${(r() - 0.5) * 20},${120 + r() * 120}" stroke="#4a463d" stroke-width="3" opacity=".6"/>`;
        }).join('') +
        `<rect x="366" y="176" width="68" height="350" fill="url(#fall)"/>` +
        `<linearGradient id="fall" x1="0" x2="1"><stop offset="0" stop-color="#d7f0fb" stop-opacity=".5"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#d7f0fb" stop-opacity=".5"/></linearGradient>` +
        Array.from({ length: 6 }, (_, i) => `<rect x="${372 + i * 10}" y="176" width="2" height="340" fill="#b9e3f5" opacity=".7"/>`).join('') +
        `<ellipse cx="400" cy="528" rx="190" ry="34" fill="#9fd8ee"/>` +
        mist(r, 515, 6, 0.85);
      for (let i = 0; i < 10; i++) body += tree(i < 5 ? 20 + i * 60 : 520 + (i - 5) * 65, 600 - r() * 30, 1.6 + r(), i % 2 ? '#1f4d2b' : '#2c6138');
      break;
    }
    case 'forest':
    case 'mangrove': {
      body = layers(r, greens.slice(0, 2), 300, 50, 40, sky.bottom) + water(430, '#4f7f6b', '#173a2e');
      for (let i = 0; i < 22; i++) {
        const x = (i / 22) * W + r() * 30;
        const s = 0.9 + r() * 1.4;
        body += tree(x, 440 + r() * 20, s, i % 2 ? '#1f4d2b' : '#2c6138');
        if (kind === 'mangrove') {
          body += `<path d="M${x - 12},${460} Q${x},${430} ${x + 12},${460}" stroke="#2a1d12" stroke-width="2" fill="none"/>`;
        }
      }
      body += mist(r, 430, 5, 0.45);
      break;
    }
    case 'tea': {
      body = layers(r, ['#9cc29a', '#6da86b'], 260, 60, 50, sky.bottom);
      for (let i = 0; i < 9; i++) {
        const y = 360 + i * 30;
        body += `<path d="M-20,${y} Q${W / 2},${y - 50 + i * 3} ${W + 20},${y}" stroke="${i % 2 ? '#3f8a3e' : '#4f9d47'}" stroke-width="22" fill="none" stroke-linecap="round"/>`;
      }
      body += tree(150, 380, 2.2, '#2c6138') + tree(620, 360, 1.8, '#2c6138') + mist(r, 340, 4, 0.5);
      break;
    }
    case 'lake':
    case 'haor': {
      const horizon = kind === 'haor' ? 360 : 380;
      body =
        layers(r, kind === 'haor' ? ['#8ea5c2', '#6a86ad'] : ['#7ea58a', '#4f8159'], horizon - 60, 40, 60, sky.bottom) +
        water(horizon, kind === 'haor' ? '#5aa0c8' : '#3d8fb0', '#164a6b') +
        `<path d="M${W * 0.6},${H - 40} l60,0 l-10,14 l-40,0 Z" fill="#3b2614"/>` +
        `<rect x="${W * 0.6 + 26}" y="${H - 80}" width="3" height="42" fill="#3b2614"/>` +
        mist(r, horizon, 4, 0.4);
      break;
    }
    case 'heritage': {
      body = layers(r, ['#b8c7a6'], 400, 0, 20, sky.bottom);
      const base = 470;
      body += `<rect x="190" y="${base - 90}" width="420" height="90" fill="#9a4a2b"/>`;
      for (let i = 0; i < 7; i++) body += dome(225 + i * 58, base - 90, 46, '#8a3f22');
      for (let i = 0; i < 6; i++) body += `<path d="M${232 + i * 66},${base} l0,-48 q18,-26 36,0 l0,48 Z" fill="#4a2414"/>`;
      body += `<rect x="170" y="${base - 150}" width="26" height="150" fill="#86391f"/><rect x="604" y="${base - 150}" width="26" height="150" fill="#86391f"/>`;
      body += dome(183, base - 150, 30, '#7a331b') + dome(617, base - 150, 30, '#7a331b');
      body += `<rect x="0" y="${base}" width="${W}" height="${H - base}" fill="#6b8f4e"/>`;
      body += water(base + 50, '#7fb3c9', '#3b6e86');
      break;
    }
    case 'city': {
      body = water(430, '#4d79a8', '#1e3a5f');
      for (let i = 0; i < 20; i++) {
        const w = 26 + r() * 40;
        const h = 60 + r() * 200;
        const x = (i / 20) * W + r() * 10;
        body += `<rect x="${x}" y="${430 - h}" width="${w}" height="${h}" fill="${mix('#24344d', sky.mid, r() * 0.3)}"/>`;
        for (let j = 0; j < h / 18; j++) body += `<rect x="${x + 5}" y="${430 - h + 8 + j * 18}" width="${w - 10}" height="3" fill="#ffd98a" opacity="${(r() * 0.6).toFixed(2)}"/>`;
      }
      body += `<path d="M0,450 Q400,410 ${W},450" stroke="#e5e7eb" stroke-width="4" fill="none"/>`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset=".55" stop-color="${sky.mid}"/><stop offset="1" stop-color="${sky.bottom}"/></linearGradient>
<radialGradient id="sun"><stop offset="0" stop-color="${sky.sun}"/><stop offset=".35" stop-color="${sky.sun}" stop-opacity=".9"/><stop offset="1" stop-color="${sky.sun}" stop-opacity="0"/></radialGradient>
<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<circle cx="${sunX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="70" fill="url(#sun)"/>
${body}
</svg>`;
}

const cache = new Map<string, string>();

export function sceneDataUri(kind: SceneKind, seed: string) {
  const key = `${kind}:${seed}`;
  let uri = cache.get(key);
  if (!uri) {
    uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildScene(kind, seed))}`;
    cache.set(key, uri);
  }
  return uri;
}

/** Real photo when present, otherwise the generated artwork. */
export function imageFor(image: string | undefined | null, kind: SceneKind, seed: string) {
  return image && image.trim() ? image : sceneDataUri(kind, seed);
}
