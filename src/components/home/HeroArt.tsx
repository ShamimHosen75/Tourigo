import { HeroTrekker } from './HeroTrekker';

// ── Photorealistic layered landscape hero art ────────────────────────────────
// 8 depth planes: sky → stars/aurora → celestial → far-ridge → valley-haze →
//                 mid-ridge → near-ridge → foreground-jungle → trekker → ground-glow
// Weather modes: rain (monsoon dusk), bloom (golden dawn), snow (icy twilight)

export type WeatherMode = 'rain' | 'bloom' | 'snow';

const VW = 1600;
const VH = 900;

/* ── deterministic RNG ─────────────────────────────────────────────────────── */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── midpoint-displacement mountain ────────────────────────────────────────── */
function mountain(seed: number, baseY: number, height: number, roughness: number, n = 512) {
  const r = rng(seed);
  const ys = new Array(n + 1).fill(0);
  ys[0] = baseY - r() * height * 0.45;
  ys[n] = baseY - r() * height * 0.45;
  let step = n, disp = height;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      ys[i] = (ys[i - half] + ys[i + half]) / 2 + (r() - 0.5) * disp;
    }
    disp *= roughness;
    step = half;
  }
  const pts = ys.map((y, i) => `${((i / n) * VW).toFixed(1)},${Math.max(0, Math.min(VH, y)).toFixed(1)}`);
  return `M0,${VH} L${pts.join(' L')} L${VW},${VH} Z`;
}

/* ── Per-mode palettes ─────────────────────────────────────────────────────── */
const P = {
  rain: {
    // Dramatic monsoon dusk — indigo→steel-blue sky, deep teal valleys
    sky: ['#060d1f','#0d2040','#1a3a5c','#265f82','#3d849e','#5fa8bc','#8cc5d4','#b8dde8'],
    skyStops: ['0','0.10','0.22','0.38','0.55','0.70','0.85','1'],
    celestial: { x: 230, y: 145, r: 34, type: 'moon' as const, glow: 'rgba(140,190,220,0.18)', corona: 'rgba(120,170,200,0.08)' },
    farRidge:  { fill0: '#486e80', fill1: '#263d4a', snow: 0.06 },
    midRidge:  { fill0: '#2a5c42', fill1: '#183322', snow: 0 },
    nearRidge: { fill0: '#183828', fill1: '#0c1e15' },
    jungle:    { fill: '#0d1d11' },
    aurora: false,
    horizonGlow: 'rgba(80,160,200,0.18)',
    godRay: 'rgba(100,160,200,0.07)',
    mist: 'rgba(100,150,180,0.30)',
    groundGlow: 'rgba(40,100,140,0.22)',
    stars: { count: 90, opacity: 0.45 },
    waterSheen: 'rgba(60,120,160,0.35)',
  },
  bloom: {
    // Warm golden sunrise — deep violet→peach→gold sky
    sky: ['#080820','#1a1060','#2e40a8','#5878d4','#8fa8e8','#f0b870','#f5d090','#fde8c0'],
    skyStops: ['0','0.12','0.25','0.42','0.58','0.72','0.85','1'],
    celestial: { x: 1280, y: 115, r: 58, type: 'sun' as const, glow: 'rgba(255,220,100,0.25)', corona: 'rgba(255,200,60,0.12)' },
    farRidge:  { fill0: '#bcc8d8', fill1: '#6888a0', snow: 0.28 },
    midRidge:  { fill0: '#4a7860', fill1: '#2e5040', snow: 0 },
    nearRidge: { fill0: '#1e4830', fill1: '#112a1c' },
    jungle:    { fill: '#0e2016' },
    aurora: false,
    horizonGlow: 'rgba(255,180,60,0.35)',
    godRay: 'rgba(255,220,80,0.10)',
    mist: 'rgba(220,190,130,0.28)',
    groundGlow: 'rgba(200,140,60,0.22)',
    stars: { count: 30, opacity: 0.20 },
    waterSheen: 'rgba(220,170,80,0.30)',
  },
  snow: {
    // Ethereal arctic twilight — midnight-blue→arctic-white sky, aurora bands
    sky: ['#040c28','#0a1a50','#122870','#2040a8','#3868c8','#6898e0','#a8c8f0','#d8eeff'],
    skyStops: ['0','0.10','0.20','0.35','0.52','0.68','0.84','1'],
    celestial: { x: 240, y: 105, r: 40, type: 'moon' as const, glow: 'rgba(180,210,255,0.22)', corona: 'rgba(160,200,255,0.10)' },
    farRidge:  { fill0: '#e8f0ff', fill1: '#8090b8', snow: 0.62 },
    midRidge:  { fill0: '#506050', fill1: '#304030', snow: 0 },
    nearRidge: { fill0: '#1a3020', fill1: '#0e1c12' },
    jungle:    { fill: '#0c1810' },
    aurora: true,
    horizonGlow: 'rgba(100,180,255,0.28)',
    godRay: 'rgba(160,210,255,0.08)',
    mist: 'rgba(180,220,255,0.28)',
    groundGlow: 'rgba(80,140,220,0.25)',
    stars: { count: 130, opacity: 0.65 },
    waterSheen: 'rgba(140,190,255,0.35)',
  },
} as const;

/* ── Stars ─────────────────────────────────────────────────────────────────── */
function Stars({ mode }: { mode: WeatherMode }) {
  const cfg = P[mode].stars;
  const r = rng(mode === 'rain' ? 100 : mode === 'bloom' ? 200 : 300);
  return (
    <g>
      {Array.from({ length: cfg.count }, (_, i) => {
        const x = r() * VW;
        const y = r() * (mode === 'bloom' ? 260 : 380);
        const sz = 0.5 + r() * 1.8;
        const op = (0.3 + r() * 0.7) * cfg.opacity;
        const delay = r() * 5;
        return (
          <circle
            key={i} cx={x} cy={y} r={sz} fill="white" opacity={op}
            style={{ animation: `twinkle ${3 + r() * 4}s ${delay}s ease-in-out infinite` }}
          />
        );
      })}
    </g>
  );
}

/* ── Aurora (snow mode) ────────────────────────────────────────────────────── */
function Aurora({ id }: { id: string }) {
  return (
    <g>
      {/* ribbon 1 — emerald-cyan */}
      <path
        d="M-100,280 C200,200 500,320 800,240 C1100,160 1400,280 1700,200"
        stroke="none" fill="none"
      />
      <rect
        x={0} y={160} width={VW} height={160}
        fill={`url(#${id}-aurora-a)`}
        className="hero-aurora-a"
        style={{ transformOrigin: '800px 240px' }}
      />
      {/* ribbon 2 — violet-pink */}
      <rect
        x={0} y={230} width={VW} height={120}
        fill={`url(#${id}-aurora-b)`}
        className="hero-aurora-b"
        style={{ transformOrigin: '800px 290px' }}
      />
    </g>
  );
}

/* ── Celestial body (sun / moon) ────────────────────────────────────────────── */
function Celestial({ mode, id }: { mode: WeatherMode; id: string }) {
  const c = P[mode].celestial;
  if (c.type === 'sun') {
    return (
      <g>
        {/* outer halo rings */}
        <circle cx={c.x} cy={c.y} r={c.r + 110} fill="none" stroke="rgba(255,220,80,0.06)" strokeWidth={70} />
        <circle cx={c.x} cy={c.y} r={c.r + 54}  fill="none" stroke="rgba(255,200,60,0.10)" strokeWidth={36} />
        <circle cx={c.x} cy={c.y} r={c.r + 22}  fill="rgba(255,230,120,0.15)" />
        {/* god rays — fan */}
        {Array.from({ length: 20 }, (_, i) => {
          const ang = (i / 20) * Math.PI * 2;
          const r1 = c.r + 24, r2 = c.r + 190;
          return (
            <line key={i}
              x1={c.x + Math.cos(ang) * r1} y1={c.y + Math.sin(ang) * r1}
              x2={c.x + Math.cos(ang) * r2} y2={c.y + Math.sin(ang) * r2}
              stroke="rgba(255,230,80,0.07)" strokeWidth={14}
              className="hero-ray"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          );
        })}
        <circle cx={c.x} cy={c.y} r={c.r} fill={`url(#${id}-sun)`} />
        {/* lens flare streak */}
        <ellipse cx={c.x - 180} cy={c.y + 60} rx={110} ry={6} fill="rgba(255,240,160,0.06)" transform={`rotate(-18 ${c.x - 180} ${c.y + 60})`} />
      </g>
    );
  }
  // Moon
  return (
    <g>
      <circle cx={c.x} cy={c.y} r={c.r + 32} fill="none" stroke={c.corona} strokeWidth={28} />
      <circle cx={c.x} cy={c.y} r={c.r + 14} fill={c.glow} />
      <circle cx={c.x} cy={c.y} r={c.r}      fill={`url(#${id}-moon)`} />
      {/* shadow bite */}
      <circle cx={c.x + c.r * 0.38} cy={c.y - c.r * 0.18} r={c.r * 0.80}
        fill={mode === 'rain' ? '#14263c' : '#07122a'} opacity={0.76} />
      {/* halo shimmer ring */}
      <circle cx={c.x} cy={c.y} r={c.r + 22} fill="none"
        stroke={mode === 'snow' ? 'rgba(160,210,255,0.18)' : 'rgba(120,170,210,0.14)'}
        strokeWidth={3} strokeDasharray="6 10"
      />
    </g>
  );
}

/* ── God-ray beams ─────────────────────────────────────────────────────────── */
function GodRays({ mode, id }: { mode: WeatherMode; id: string }) {
  const c = P[mode].celestial;
  const col = P[mode].godRay;
  const cx = c.x, cy = c.y;
  if (mode === 'bloom') {
    // Fan from sun
    return (
      <g filter={`url(#${id}-haze)`}>
        {Array.from({ length: 8 }, (_, i) => {
          const ang = (i / 8) * Math.PI * 2 - 0.5;
          return (
            <polygon key={i}
              points={`${cx},${cy} ${cx + Math.cos(ang) * 800},${cy + Math.sin(ang) * 800} ${cx + Math.cos(ang + 0.09) * 800},${cy + Math.sin(ang + 0.09) * 800}`}
              fill={col}
              className="hero-ray"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
      </g>
    );
  }
  // Crepuscular rays from moon
  return (
    <g filter={`url(#${id}-haze)`}>
      {Array.from({ length: 6 }, (_, i) => (
        <polygon key={i}
          points={`${cx},${cy} ${200 + i * 30},${VH} ${220 + i * 30},${VH}`}
          fill={col}
          className="hero-ray"
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </g>
  );
}

/* ── Horizon glow ───────────────────────────────────────────────────────────── */
function HorizonGlow({ mode, id }: { mode: WeatherMode; id: string }) {
  return (
    <ellipse
      cx={P[mode].celestial.type === 'sun' ? P[mode].celestial.x : VW / 2}
      cy={VH * 0.52}
      rx={VW * 0.55}
      ry={120}
      fill={`url(#${id}-horizon)`}
      className="hero-horizon"
    />
  );
}

/* ── Mountain snow cap ──────────────────────────────────────────────────────── */
function SnowCap({ path, id }: { path: string; id: string }) {
  return (
    <clipPath id={id}>
      <path d={path} />
    </clipPath>
  );
}

/* ── Bokeh orbs (depth-of-field circles) ───────────────────────────────────── */
function Bokeh({ mode, id }: { mode: WeatherMode; id: string }) {
  const r = rng(mode === 'rain' ? 77 : mode === 'bloom' ? 88 : 99);
  const colors = mode === 'bloom'
    ? ['rgba(255,210,80,', 'rgba(255,180,60,', 'rgba(200,240,255,']
    : mode === 'snow'
    ? ['rgba(100,180,255,', 'rgba(160,220,255,', 'rgba(200,240,255,']
    : ['rgba(60,130,180,', 'rgba(80,160,200,', 'rgba(120,190,220,'];
  return (
    <g filter={`url(#${id}-blur-lg)`} opacity={0.55}>
      {Array.from({ length: 12 }, (_, i) => {
        const cx = r() * VW;
        const cy = r() * VH * 0.65;
        const radius = 20 + r() * 55;
        const col = colors[Math.floor(r() * colors.length)];
        const op = 0.08 + r() * 0.18;
        return (
          <circle key={i} cx={cx} cy={cy} r={radius}
            fill={`${col}${op.toFixed(2)})`}
            className="hero-bokeh"
            style={{ animationDelay: `${r() * 8}s`, animationDuration: `${14 + r() * 10}s` }}
          />
        );
      })}
    </g>
  );
}

/* ── Cloud puffs ────────────────────────────────────────────────────────────── */
function Clouds({ mode, id }: { mode: WeatherMode; id: string }) {
  const fill = mode === 'bloom'
    ? 'rgba(255,240,200,0.75)'
    : mode === 'snow'
    ? 'rgba(210,232,255,0.68)'
    : 'rgba(100,145,170,0.52)';
  const mistFill = mode === 'bloom'
    ? 'rgba(200,170,110,0.30)'
    : mode === 'snow'
    ? 'rgba(160,210,255,0.30)'
    : 'rgba(80,130,160,0.28)';

  return (
    <>
      {/* upper wispy cirrus */}
      <g opacity={mode === 'bloom' ? 0.80 : 0.60} className="hero-clouds-b">
        {[
          [680, 128, 210, 22], [940, 108, 165, 18], [1120, 136, 185, 20],
          [380, 118, 130, 16], [1380, 112, 145, 17],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill={fill} filter={`url(#${id}-blur-sm)`} />
        ))}
      </g>

      {/* mid cumulus left cluster */}
      <g opacity={mode === 'bloom' ? 0.92 : 0.72} className="hero-clouds-a">
        {[
          [195, 188, 150, 56], [310, 162, 118, 44], [130, 215, 95, 36],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill={fill} filter={`url(#${id}-blur-sm)`} />
        ))}
        {/* right cluster */}
        {[
          [1420, 202, 165, 54], [1295, 228, 122, 42], [1510, 240, 135, 40],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={`r${i}`} cx={cx} cy={cy} rx={rx} ry={ry}
            fill={fill} filter={`url(#${id}-blur-sm)`} />
        ))}
      </g>

      {/* valley mist ribbons */}
      <g filter={`url(#${id}-blur)`} opacity={mode === 'bloom' ? 0.85 : 0.68} className="hero-mist-a">
        {[
          [320, 508, 530, 50], [1255, 492, 560, 52], [780, 532, 390, 40],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={mistFill} />
        ))}
      </g>
      {/* low fog layer */}
      <g filter={`url(#${id}-blur)`} opacity={mode === 'bloom' ? 0.88 : 0.68} className="hero-mist-b">
        {[
          [180, 645, 390, 48], [960, 658, 345, 42], [1490, 632, 430, 48],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={mistFill} />
        ))}
      </g>
    </>
  );
}

/* ── Birds ─────────────────────────────────────────────────────────────────── */
function Birds({ mode }: { mode: WeatherMode }) {
  if (mode === 'rain') return null;
  const r = rng(42);
  const count = mode === 'bloom' ? 11 : 7;
  const baseX = 300, baseY = 155 + r() * 50;
  return (
    <g opacity={mode === 'bloom' ? 0.55 : 0.38} className="hero-birds">
      {Array.from({ length: count }, (_, i) => {
        const x = baseX + (i - Math.floor(count / 2)) * 46;
        const y = baseY + Math.abs(i - Math.floor(count / 2)) * 18;
        const sz = 7 + r() * 5;
        return (
          <path key={i}
            d={`M${x},${y} q${sz},${-sz * 0.4} ${sz * 2},0`}
            stroke={mode === 'bloom' ? '#1a1200' : '#d0e8ff'}
            strokeWidth={1.5} fill="none" strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

/* ── Foreground jungle silhouette ───────────────────────────────────────────── */
function JungleSilhouette({ mode, id }: { mode: WeatherMode; id: string }) {
  const fill = P[mode].jungle.fill;
  // Irregular tree-line with pointed peaks for palm/tropical feel
  return (
    <g>
      {/* left jungle bank */}
      <path
        d={`M0,${VH} L0,740 Q20,700 55,720 Q80,680 110,700 Q140,650 175,680 Q210,640 250,670 
            Q280,630 315,655 Q350,610 385,640 Q415,615 440,640 Q460,620 480,640 
            L480,${VH} Z`}
        fill={fill}
      />
      {/* right jungle bank */}
      <path
        d={`M${VW},${VH} L${VW},740 Q${VW - 30},705 ${VW - 65},722 Q${VW - 95},685 ${VW - 130},705 
            Q${VW - 165},660 ${VW - 200},685 Q${VW - 235},645 ${VW - 275},668 
            Q${VW - 310},622 ${VW - 345},648 Q${VW - 380},618 ${VW - 410},642 
            Q${VW - 440},622 ${VW - 470},644 L${VW - 470},${VH} Z`}
        fill={fill}
      />
      {/* jungle shimmer edge */}
      <path
        d={`M0,742 Q55,720 110,700 Q175,680 250,670 Q315,655 385,640 Q440,620 480,640`}
        stroke={mode === 'bloom' ? 'rgba(80,180,100,0.25)' : 'rgba(30,80,50,0.20)'}
        strokeWidth={2} fill="none"
      />
      {/* ground water reflection strip */}
      <rect
        x={0} y={VH * 0.86} width={VW} height={VH * 0.14}
        fill={`url(#${id}-water)`} opacity={0.45}
      />
    </g>
  );
}

/* ── Detailed foreground rocks & trekker platform ──────────────────────────── */
function RockPlatform({ mode }: { mode: WeatherMode }) {
  const rk = mode === 'bloom' ? '#1c1a18' : '#16181a';
  const edge = mode === 'bloom' ? 'rgba(255,200,80,0.15)' : mode === 'snow' ? 'rgba(160,210,255,0.12)' : 'rgba(80,150,200,0.10)';
  return (
    <g>
      {/* main flat rock */}
      <path d="M480,900 L545,800 Q680,768 800,774 Q935,764 1060,802 L1120,900 Z" fill={rk} />
      {/* rock shading */}
      <path d="M550,802 Q680,775 800,780 Q930,770 1055,804"
        stroke="rgba(0,0,0,0.35)" strokeWidth={4} fill="none" />
      {/* light edge on rock */}
      <path d="M552,804 Q680,777 800,782 Q928,772 1053,806"
        stroke={edge} strokeWidth={5} fill="none" />
      {/* smaller boulder left */}
      <path d="M520,900 L545,842 Q570,828 600,835 L615,900 Z" fill={rk} opacity={0.85} />
      {/* smaller boulder right */}
      <path d="M1085,900 L1095,848 Q1120,832 1150,840 L1165,900 Z" fill={rk} opacity={0.85} />
    </g>
  );
}

/* ── Main HeroArt ──────────────────────────────────────────────────────────── */
export function HeroArt({ mode }: { mode: WeatherMode }) {
  const p = P[mode];
  const id = `ha-${mode}`;

  const farPath  = mountain(11, 490, 420, 0.50);
  const mid1Path = mountain(27, 620, 330, 0.54);
  const mid2Path = mountain(53, 660, 280, 0.56);
  const nearPath = mountain(42, 750, 260, 0.52);

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map((c, i) => <stop key={i} offset={p.skyStops[i]} stopColor={c} />)}
        </linearGradient>

        {/* Far ridge gradient */}
        <linearGradient id={`${id}-far`} x1="0" y1="200" x2="0" y2="720" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.farRidge.fill0} />
          <stop offset={p.farRidge.snow} stopColor={p.farRidge.fill0} />
          <stop offset={Math.min(0.92, p.farRidge.snow + 0.15)} stopColor={p.farRidge.fill1} />
          <stop offset="1" stopColor={p.farRidge.fill1} />
        </linearGradient>

        {/* Mid ridge gradient */}
        <linearGradient id={`${id}-mid`} x1="0" y1="380" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset={mode === 'snow' ? '0.08' : '0'} stopColor={p.midRidge.fill0} />
          <stop offset="1" stopColor={p.midRidge.fill1} />
        </linearGradient>

        {/* Near ridge gradient */}
        <linearGradient id={`${id}-near`} x1="0" y1="600" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.nearRidge.fill0} />
          <stop offset="1" stopColor={p.nearRidge.fill1} />
        </linearGradient>

        {/* Horizon glow */}
        <radialGradient id={`${id}-horizon`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.horizonGlow} />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>

        {/* Ground glow */}
        <radialGradient id={`${id}-gnd-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.groundGlow} />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>

        {/* Water reflection */}
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.waterSheen} />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>

        {/* Aurora gradient a */}
        {mode === 'snow' && (
          <>
            <linearGradient id={`${id}-aurora-a`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0"    stopColor="transparent" />
              <stop offset="0.15" stopColor="rgba(20,220,150,0.22)" />
              <stop offset="0.40" stopColor="rgba(40,240,180,0.28)" />
              <stop offset="0.65" stopColor="rgba(80,200,240,0.22)" />
              <stop offset="0.85" stopColor="rgba(100,180,255,0.18)" />
              <stop offset="1"    stopColor="transparent" />
            </linearGradient>
            <linearGradient id={`${id}-aurora-b`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0"    stopColor="transparent" />
              <stop offset="0.20" stopColor="rgba(180,60,240,0.14)" />
              <stop offset="0.50" stopColor="rgba(220,80,200,0.18)" />
              <stop offset="0.80" stopColor="rgba(140,80,255,0.14)" />
              <stop offset="1"    stopColor="transparent" />
            </linearGradient>
          </>
        )}

        {/* Celestial gradients */}
        <radialGradient id={`${id}-sun`} cx=".5" cy=".5" r=".5">
          <stop offset="0"   stopColor="#fff9e0" />
          <stop offset="0.5" stopColor="#ffe060" />
          <stop offset="1"   stopColor="#ffb020" />
        </radialGradient>
        <radialGradient id={`${id}-moon`} cx=".40" cy=".35" r=".65">
          <stop offset="0"  stopColor={mode === 'rain' ? '#daeaf8' : '#e4f0ff'} />
          <stop offset="0.65" stopColor={mode === 'rain' ? '#a8c8dc' : '#b4d4f0'} />
          <stop offset="1"  stopColor={mode === 'rain' ? '#78a8c0' : '#88b4e0'} />
        </radialGradient>

        {/* Vignette */}
        <radialGradient id={`${id}-vig`} cx=".5" cy=".48" r=".76">
          <stop offset=".50" stopColor="#000" stopOpacity="0" />
          <stop offset="1"   stopColor="#000" stopOpacity=".62" />
        </radialGradient>

        {/* Ground fade */}
        <linearGradient id={`${id}-gfade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="transparent" />
          <stop offset="1" stopColor={p.nearRidge.fill1} stopOpacity=".65" />
        </linearGradient>

        {/* Filters */}
        <filter id={`${id}-blur`} x="-25%" y="-120%" width="150%" height="340%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id={`${id}-blur-sm`} x="-15%" y="-30%" width="130%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`${id}-haze`} x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id={`${id}-blur-lg`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id={`${id}-glow-sm`} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── 1: Sky ───────────────────────────────────────────────────────── */}
      <rect width={VW} height={VH} fill={`url(#${id}-sky)`} />

      {/* ── 2: Stars ─────────────────────────────────────────────────────── */}
      <Stars mode={mode} />

      {/* ── 3: Aurora ribbons (snow only) ────────────────────────────────── */}
      {mode === 'snow' && <Aurora id={id} />}

      {/* ── 4: Bokeh depth-of-field orbs ─────────────────────────────────── */}
      <Bokeh mode={mode} id={id} />

      {/* ── 5: Celestial body ────────────────────────────────────────────── */}
      <Celestial mode={mode} id={id} />

      {/* ── 6: God rays ──────────────────────────────────────────────────── */}
      <GodRays mode={mode} id={id} />

      {/* ── 7: Horizon glow strip ────────────────────────────────────────── */}
      <HorizonGlow mode={mode} id={id} />

      {/* ── 8: Ghost far ridge (atmospheric depth) ───────────────────────── */}
      <g filter={`url(#${id}-haze)`} opacity={0.38}>
        <path d={mountain(99, 430, 340, 0.47)} fill={p.farRidge.fill0} />
      </g>

      {/* ── 9: Far ridge ─────────────────────────────────────────────────── */}
      <path d={farPath} fill={`url(#${id}-far)`} />

      {/* ── 10: Clouds & mist ────────────────────────────────────────────── */}
      <Clouds mode={mode} id={id} />

      {/* ── 11: Mid ridge 1 ──────────────────────────────────────────────── */}
      <path d={mid1Path} fill={`url(#${id}-mid)`} />

      {/* ── 12: Mid ridge 2 (darker) ─────────────────────────────────────── */}
      <path d={mid2Path} fill={p.midRidge.fill1} opacity={0.85} />

      {/* ── 13: Near ridge ───────────────────────────────────────────────── */}
      <path d={nearPath} fill={`url(#${id}-near)`} />

      {/* ── 14: Ground glow pool ─────────────────────────────────────────── */}
      <ellipse cx={VW / 2} cy={VH * 0.90} rx={VW * 0.42} ry={80}
        fill={`url(#${id}-gnd-glow)`} opacity={0.7} className="hero-horizon" />

      {/* ── 15: Jungle silhouette ────────────────────────────────────────── */}
      <JungleSilhouette mode={mode} id={id} />

      {/* ── 16: Birds ────────────────────────────────────────────────────── */}
      <Birds mode={mode} />

      {/* ── 17: Rock platform ────────────────────────────────────────────── */}
      <RockPlatform mode={mode} />

      {/* ── 18: Trekker ──────────────────────────────────────────────────── */}
      <g filter={`url(#${id}-glow-sm)`}>
        <HeroTrekker x={800} y={800} scale={0.75} />
      </g>

      {/* ── 19: Ground fade ──────────────────────────────────────────────── */}
      <rect x={0} y={760} width={VW} height={140} fill={`url(#${id}-gfade)`} />

      {/* ── 20: Atmospheric top vignette ─────────────────────────────────── */}
      <rect x={0} y={0} width={VW} height={120}
        fill="url(#ha-top-fade)" opacity={0.55} />

      {/* ── 21: Full vignette ────────────────────────────────────────────── */}
      <rect width={VW} height={VH} fill={`url(#${id}-vig)`} />
    </svg>
  );
}
