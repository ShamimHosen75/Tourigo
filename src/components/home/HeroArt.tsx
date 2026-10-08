import { HeroTrekker } from './HeroTrekker';

// Illustrated hero: realistic layered mountains with atmospheric perspective,
// animated parallax clouds, celestial bodies, god rays, birds and volumetric fog.

export type WeatherMode = 'rain' | 'bloom' | 'snow';

const VW = 1600;
const VH = 900;

/* ── deterministic RNG ──────────────────────────────────────────────── */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── midpoint-displacement ridge ───────────────────────────────────── */
function mountain(seed: number, baseY: number, height: number, roughness: number) {
  const r = rng(seed);
  const n = 256;
  const ys = new Array(n + 1).fill(0);
  ys[0] = baseY - r() * height * 0.4;
  ys[n] = baseY - r() * height * 0.4;
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

/* ── per-mode palette ───────────────────────────────────────────────── */
const palettes: Record<WeatherMode, {
  sky: string[]; skyStops: string[];
  far: [string, string]; mid: string; mid2: string;
  near: string; nearDark: string; rock: string;
  snowLine: number; mist: number;
  cloudFill: string; godRayColor: string; ambientFog: string;
}> = {
  rain: {
    sky: ['#0d2235', '#1b3f5c', '#2e6282', '#5a8fa8'],
    skyStops: ['0', '.35', '.7', '1'],
    far: ['#8faab8', '#3d606e'], mid: '#2e5e42', mid2: '#1e4530',
    near: '#142e1e', nearDark: '#0c1f14', rock: '#1e1e1c',
    snowLine: 0.08, mist: 0.78,
    cloudFill: 'rgba(120,150,170,0.55)',
    godRayColor: 'rgba(100,160,200,0.10)',
    ambientFog: 'rgba(60,100,130,0.22)',
  },
  bloom: {
    sky: ['#0a2a6a', '#1d5fa8', '#4e9fd4', '#a8d8f0', '#f5dfc0'],
    skyStops: ['0', '.25', '.55', '.8', '1'],
    far: ['#f2f6fa', '#7ea4b8'], mid: '#4a7a6a', mid2: '#325e50',
    near: '#1e4a32', nearDark: '#122e1f', rock: '#20211e',
    snowLine: 0.28, mist: 0.55,
    cloudFill: 'rgba(255,255,255,0.72)',
    godRayColor: 'rgba(255,240,120,0.14)',
    ambientFog: 'rgba(180,220,255,0.12)',
  },
  snow: {
    sky: ['#0a3fa8', '#1f72d4', '#5da8e8', '#aed8f8', '#dff0ff'],
    skyStops: ['0', '.2', '.5', '.8', '1'],
    far: ['#ffffff', '#8eb0c8'], mid: '#4e7848', mid2: '#345430',
    near: '#1e3c1e', nearDark: '#0f2010', rock: '#1c1e1c',
    snowLine: 0.52, mist: 0.50,
    cloudFill: 'rgba(230,242,255,0.70)',
    godRayColor: 'rgba(160,210,255,0.12)',
    ambientFog: 'rgba(200,228,255,0.18)',
  },
};

/* ── bird flock (V-shapes) ──────────────────────────────────────────── */
function BirdFlock({ mode }: { mode: WeatherMode }) {
  if (mode === 'rain') return null;
  const r = rng(42);
  const count = mode === 'bloom' ? 9 : 5;
  const baseX = 280;
  const baseY = 160 + r() * 60;
  const opacity = mode === 'bloom' ? 0.55 : 0.35;
  return (
    <g opacity={opacity} className="hero-birds">
      {Array.from({ length: count }, (_, i) => {
        const x = baseX + (i - Math.floor(count / 2)) * 42;
        const y = baseY + Math.abs(i - Math.floor(count / 2)) * 16;
        const sz = 8 + r() * 4;
        return (
          <path key={i}
            d={`M${x},${y} q${sz},${-sz * 0.42} ${sz * 2},0`}
            stroke={mode === 'bloom' ? '#1a1200' : '#ffffff'}
            strokeWidth={1.5} fill="none" strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

/* ── sun (bloom) / moon (rain/snow) ────────────────────────────────── */
function CelestialBody({ mode, id }: { mode: WeatherMode; id: string }) {
  if (mode === 'bloom') {
    const sx = 1280, sy = 110, sr = 52;
    return (
      <g>
        <circle cx={sx} cy={sy} r={sr + 90} fill="none" stroke="rgba(255,230,100,0.06)" strokeWidth={50} />
        <circle cx={sx} cy={sy} r={sr + 44} fill="none" stroke="rgba(255,230,100,0.10)" strokeWidth={28} />
        <circle cx={sx} cy={sy} r={sr + 18} fill="rgba(255,240,140,0.18)" />
        {Array.from({ length: 16 }, (_, i) => {
          const ang = (i / 16) * Math.PI * 2;
          const r1 = sr + 22, r2 = sr + 170;
          return (
            <line key={i}
              x1={sx + Math.cos(ang) * r1} y1={sy + Math.sin(ang) * r1}
              x2={sx + Math.cos(ang) * r2} y2={sy + Math.sin(ang) * r2}
              stroke="rgba(255,240,120,0.09)" strokeWidth={12}
            />
          );
        })}
        <circle cx={sx} cy={sy} r={sr} fill={`url(#${id}-sun)`} />
      </g>
    );
  }
  const mx = 240, my = mode === 'rain' ? 130 : 100, mr = 38;
  return (
    <g>
      <circle cx={mx} cy={my} r={mr + 28} fill="none"
        stroke={mode === 'rain' ? 'rgba(180,215,235,0.12)' : 'rgba(200,228,255,0.16)'} strokeWidth={22} />
      <circle cx={mx} cy={my} r={mr + 12}
        fill={mode === 'rain' ? 'rgba(160,200,220,0.14)' : 'rgba(200,228,255,0.18)'} />
      <circle cx={mx} cy={my} r={mr} fill={`url(#${id}-moon)`} />
      <circle cx={mx + mr * 0.35} cy={my - mr * 0.18} r={mr * 0.78}
        fill={mode === 'rain' ? '#162840' : '#0a2050'} opacity={0.72} />
    </g>
  );
}

/* ── main component ─────────────────────────────────────────────────── */
export function HeroArt({ mode }: { mode: WeatherMode }) {
  const p = palettes[mode];
  const id = `h-${mode}`;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map((c, i) => <stop key={i} offset={p.skyStops[i]} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="180" x2="0" y2="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.far[0]} />
          <stop offset={p.snowLine} stopColor={p.far[0]} />
          <stop offset={Math.min(0.95, p.snowLine + 0.14)} stopColor={p.far[1]} />
          <stop offset="1" stopColor={p.far[1]} />
        </linearGradient>
        <linearGradient id={`${id}-mid`} x1="0" y1="350" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mode === 'snow' ? '#ddeef8' : p.mid} />
          <stop offset={mode === 'snow' ? 0.10 : 0} stopColor={p.mid} />
          <stop offset="1" stopColor={p.mid2} />
        </linearGradient>
        <linearGradient id={`${id}-near`} x1="0" y1="600" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.near} />
          <stop offset="1" stopColor={p.nearDark} />
        </linearGradient>
        <linearGradient id={`${id}-gnd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="transparent" />
          <stop offset="1" stopColor={p.nearDark} stopOpacity=".6" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff8e0" />
          <stop offset=".55" stopColor="#ffe066" />
          <stop offset="1" stopColor="#ffb300" />
        </radialGradient>
        <radialGradient id={`${id}-moon`} cx=".38" cy=".35" r=".65">
          <stop offset="0" stopColor={mode === 'rain' ? '#daeaf5' : '#e8f4ff'} />
          <stop offset=".7" stopColor={mode === 'rain' ? '#aac8dc' : '#b8d8f0'} />
          <stop offset="1" stopColor={mode === 'rain' ? '#7aa8c0' : '#8ab8e0'} />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id={`${id}-blur-sm`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-haze`} x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <radialGradient id={`${id}-vig`} cx=".5" cy=".45" r=".78">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect width={VW} height={VH} fill={`url(#${id}-sky)`} />

      {/* stars (snow/rain) */}
      {mode !== 'bloom' && (
        <g opacity={mode === 'rain' ? 0.35 : 0.55}>
          {Array.from({ length: 70 }, (_, i) => {
            const r = rng(i * 7 + 3);
            return <circle key={i} cx={r() * VW} cy={r() * 300} r={0.6 + r() * 1.2} fill="white" opacity={0.4 + r() * 0.6} />;
          })}
        </g>
      )}

      {/* celestial body */}
      <CelestialBody mode={mode} id={id} />

      {/* god rays */}
      <g filter={`url(#${id}-haze)`}>
        {mode === 'bloom'
          ? Array.from({ length: 6 }, (_, i) => {
              const ang = (i / 6) * Math.PI * 2 - 0.3;
              return (
                <polygon key={i}
                  points={`1280,110 ${1280 + Math.cos(ang) * 600},${110 + Math.sin(ang) * 600} ${1280 + Math.cos(ang + 0.08) * 600},${110 + Math.sin(ang + 0.08) * 600}`}
                  fill={p.godRayColor} />
              );
            })
          : Array.from({ length: 5 }, (_, i) => (
              <polygon key={i}
                points={`240,130 ${200 + i * 28},900 ${220 + i * 28},900`}
                fill={p.godRayColor} />
            ))
        }
      </g>

      {/* ghost far mountain (extra depth) */}
      <g filter={`url(#${id}-haze)`} opacity={0.40}>
        <path d={mountain(99, 420, 320, 0.48)} fill={p.far[0]} />
      </g>

      {/* far mountains */}
      <path d={mountain(11, 480, 400, 0.52)} fill={`url(#${id}-far)`} />

      {/* atmospheric fog behind mid mountains */}
      <g filter={`url(#${id}-blur)`} opacity={p.mist} className="hero-mist-a">
        <ellipse cx={320} cy={510} rx={520} ry={48} fill={p.cloudFill} />
        <ellipse cx={1250} cy={490} rx={560} ry={52} fill={p.cloudFill} />
        <ellipse cx={780} cy={535} rx={380} ry={38} fill={p.cloudFill} />
      </g>

      {/* mid mountains */}
      <path d={mountain(27, 610, 310, 0.55)} fill={`url(#${id}-mid)`} />

      {/* volumetric fog low */}
      <g filter={`url(#${id}-blur)`} opacity={mode === 'bloom' ? 0.82 : 0.65} className="hero-mist-b">
        <ellipse cx={180} cy={640} rx={380} ry={44} fill={p.cloudFill} />
        <ellipse cx={950} cy={660} rx={340} ry={38} fill={p.cloudFill} />
        <ellipse cx={1480} cy={635} rx={420} ry={46} fill={p.cloudFill} />
      </g>

      {/* upper cloud puffs – cluster left */}
      <g opacity={mode === 'bloom' ? 0.90 : 0.68} className="hero-clouds-a">
        <ellipse cx={210} cy={195} rx={130} ry={48} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        <ellipse cx={315} cy={172} rx={105} ry={40} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        <ellipse cx={148} cy={218} rx={88} ry={34} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        {/* cluster right */}
        <ellipse cx={1395} cy={208} rx={150} ry={52} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        <ellipse cx={1288} cy={232} rx={112} ry={40} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        <ellipse cx={1485} cy={242} rx={122} ry={38} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
      </g>

      {/* high wispy clouds */}
      <g opacity={mode === 'bloom' ? 0.72 : 0.50} className="hero-clouds-b">
        <ellipse cx={680} cy={145} rx={185} ry={26} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        <ellipse cx={925} cy={162} rx={145} ry={22} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
        <ellipse cx={1105} cy={138} rx={162} ry={20} fill={p.cloudFill} filter={`url(#${id}-blur-sm)`} />
      </g>

      {/* near foreground ridge */}
      <path d={mountain(42, 740, 240, 0.50)} fill={`url(#${id}-near)`} />

      {/* ambient ground fog */}
      <rect x={0} y={700} width={VW} height={200} fill={p.ambientFog} filter={`url(#${id}-haze)`} />

      {/* birds */}
      <BirdFlock mode={mode} />

      {/* rock */}
      <path d="M500,900 L560,810 Q680,782 800,786 Q940,778 1060,816 L1120,900 Z" fill={p.rock} />
      <path d="M570,812 Q685,790 800,793 Q932,786 1050,818" stroke="#000" strokeOpacity=".30" strokeWidth="4" fill="none" />
      <path d="M570,814 Q685,792 800,795 Q930,788 1048,820"
        stroke={mode === 'bloom' ? 'rgba(255,240,120,0.18)' : 'rgba(160,210,255,0.12)'} strokeWidth="6" fill="none" />

      {/* trekker */}
      <HeroTrekker x={800} y={800} scale={0.72} />

      {/* ground fade */}
      <rect x={0} y={750} width={VW} height={150} fill={`url(#${id}-gnd)`} />

      {/* vignette */}
      <rect width={VW} height={VH} fill={`url(#${id}-vig)`} />
    </svg>
  );
}
