import { HeroTrekker } from './HeroTrekker';

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
      <path d="M540,900 L590,805 Q690,778 800,784 Q930,776 1020,812 L1070,900 Z" fill={p.rock} />
      <path d="M600,806 Q700,786 800,790 Q920,784 1010,814" stroke="#000" strokeOpacity=".25" strokeWidth="3" fill="none" />
      <HeroTrekker x={800} y={800} scale={1.16} />
      <rect width={VW} height={VH} fill={`url(#${id}-vig)`} />
    </svg>
  );
}
