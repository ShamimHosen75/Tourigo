// Illustrated hero: layered mountains, drifting mist and a trekker seen from behind.
// Used until real hero photos are set in siteConfig.heroImages.

export type WeatherMode = 'rain' | 'bloom' | 'snow';

const VW = 1600;
const VH = 900;

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Midpoint-displacement ridge line → closed path down to the bottom edge. */
function mountain(seed: number, baseY: number, height: number, roughness: number) {
  const r = rng(seed);
  const n = 128;
  const ys = new Array(n + 1).fill(0);
  ys[0] = baseY - r() * height * 0.5;
  ys[n] = baseY - r() * height * 0.5;
  let step = n;
  let disp = height;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      ys[i] = (ys[i - half] + ys[i + half]) / 2 + (r() - 0.5) * disp;
    }
    disp *= roughness;
    step = half;
  }
  const pts = ys.map((y, i) => `${((i / n) * VW).toFixed(1)},${Math.min(VH, y).toFixed(1)}`);
  return `M0,${VH} L${pts.join(' L')} L${VW},${VH} Z`;
}

const palettes: Record<WeatherMode, { sky: [string, string, string]; far: [string, string]; mid: string; mid2: string; near: string; rock: string; mist: number; snowLine: number }> = {
  rain: { sky: ['#1f3f5c', '#47708c', '#9fb7c2'], far: ['#c9d6dc', '#56777a'], mid: '#3e7650', mid2: '#2f6640', near: '#1f4a2c', rock: '#2b2a28', mist: 0.85, snowLine: 0.12 },
  bloom: { sky: ['#0b2f6b', '#2f6db3', '#9cc9ec'], far: ['#e9eef5', '#5d7f99'], mid: '#4c7d74', mid2: '#3b6b5c', near: '#24493b', rock: '#26282c', mist: 0.6, snowLine: 0.3 },
  snow: { sky: ['#0f5fc4', '#3f8fe0', '#cfe8ff'], far: ['#ffffff', '#6f8ca8'], mid: '#5b8a52', mid2: '#3f7340', near: '#2a5230', rock: '#2a2a2a', mist: 0.55, snowLine: 0.55 },
};

function Hiker() {
  // Back view silhouette: cap, shoulders, tall pack with bedroll, trekking pole.
  return (
    <g transform="translate(800 792) scale(0.82)" fill="#16120f">
      <ellipse cx="0" cy="2" rx="110" ry="12" fill="#000" opacity=".35" />
      {/* legs + boots */}
      <path d="M-30,-200 C-34,-140 -36,-70 -38,-8 L-12,-8 C-10,-70 -6,-130 -2,-170 L2,-170 C6,-130 10,-70 12,-8 L38,-8 C36,-70 34,-140 30,-200 Z" fill="#1f1a16" />
      <path d="M-42,-12 L-8,-12 L-6,2 L-46,2 Z M8,-12 L42,-12 L46,2 L6,2 Z" />
      {/* torso */}
      <path d="M-52,-330 C-30,-346 30,-346 52,-330 L46,-196 L-46,-196 Z" fill="#221c17" />
      {/* arms */}
      <path d="M-52,-326 C-62,-290 -66,-250 -66,-214 L-54,-212 C-52,-246 -46,-284 -40,-310 Z" />
      <path d="M52,-326 C64,-292 74,-262 80,-236 L69,-230 C60,-256 50,-284 42,-306 Z" />
      <path d="M76,-240 L92,0" stroke="#3b2f25" strokeWidth="4.5" strokeLinecap="round" />
      {/* backpack */}
      <path d="M-44,-334 C-44,-352 44,-352 44,-334 L46,-214 C46,-200 -46,-200 -46,-214 Z" fill="#2c241d" />
      <rect x="-34" y="-300" width="68" height="46" rx="12" fill="#231d17" />
      <rect x="-48" y="-224" width="96" height="12" rx="6" fill="#1a1612" />
      <rect x="-50" y="-372" width="100" height="26" rx="13" fill="#3a2f25" />
      <path d="M-24,-372 v26 M2,-372 v26 M28,-372 v26" stroke="#2a221b" strokeWidth="3" />
      {/* neck, head, cap */}
      <rect x="-9" y="-384" width="18" height="14" />
      <ellipse cx="0" cy="-400" rx="17" ry="19" />
      <path d="M-20,-406 C-18,-428 18,-428 20,-406 L24,-402 L-24,-402 Z" fill="#0f0c0a" />
    </g>
  );
}

export function HeroArt({ mode }: { mode: WeatherMode }) {
  const p = palettes[mode];
  const id = `h-${mode}`;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset=".55" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="220" x2="0" y2="620" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.far[0]} />
          <stop offset={p.snowLine} stopColor={p.far[0]} />
          <stop offset={Math.min(0.95, p.snowLine + 0.12)} stopColor={p.far[1]} />
          <stop offset="1" stopColor={p.far[1]} />
        </linearGradient>
        <linearGradient id={`${id}-mid`} x1="0" y1="380" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mode === 'snow' ? '#e8eef3' : p.mid} />
          <stop offset={mode === 'snow' ? 0.12 : 0} stopColor={p.mid} />
          <stop offset="1" stopColor={p.mid2} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <radialGradient id={`${id}-vig`} cx=".5" cy=".45" r=".75">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".45" />
        </radialGradient>
      </defs>
      <rect width={VW} height={VH} fill={`url(#${id}-sky)`} />
      <path d={mountain(11, 470, 380, 0.52)} fill={`url(#${id}-far)`} />
      <g filter={`url(#${id}-blur)`} opacity={p.mist} className="hero-mist-a">
        <ellipse cx="300" cy="520" rx="420" ry="40" fill="#fff" />
        <ellipse cx="1200" cy="500" rx="460" ry="46" fill="#fff" />
      </g>
      <path d={mountain(27, 600, 300, 0.55)} fill={`url(#${id}-mid)`} />
      <g filter={`url(#${id}-blur)`} opacity={p.mist * 0.9} className="hero-mist-b">
        <ellipse cx="200" cy="640" rx="360" ry="36" fill="#fff" />
        <ellipse cx="900" cy="660" rx="300" ry="30" fill="#fff" />
        <ellipse cx="1450" cy="630" rx="380" ry="40" fill="#fff" />
      </g>
      <path d={mountain(42, 730, 220, 0.5)} fill={p.near} />
      {/* rock the trekker stands on */}
      <path d="M560,900 L600,800 Q700,760 800,770 Q930,760 1010,810 L1050,900 Z" fill={p.rock} />
      <Hiker />
      <rect width={VW} height={VH} fill={`url(#${id}-vig)`} />
    </svg>
  );
}
