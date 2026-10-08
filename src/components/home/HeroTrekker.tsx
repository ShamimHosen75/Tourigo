import { siteConfig } from '@/config/site';

// Back view of the trekker in the hero: short dark hair, brown shell jacket,
// large pack with top lid, rolled sleeping mat on the left, bottle on the
// right, gloves, wooden staff in the right hand, cargo trousers and boots.
// Drawn in a 230×480 frame (feet at y≈472) and placed by the caller.

export function HeroTrekker({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) translate(-112 -472)`}>
      <defs>
        <linearGradient id="trk-jacket" x1="0" x2="1">
          <stop offset="0" stopColor="#2a1f18" />
          <stop offset=".45" stopColor="#47372a" />
          <stop offset="1" stopColor="#2c2119" />
        </linearGradient>
        <linearGradient id="trk-pack" x1="0" x2="1">
          <stop offset="0" stopColor="#231c16" />
          <stop offset=".5" stopColor="#3a3027" />
          <stop offset="1" stopColor="#211a14" />
        </linearGradient>
        <linearGradient id="trk-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3e33" />
          <stop offset="1" stopColor="#2a221b" />
        </linearGradient>
        <linearGradient id="trk-pants" x1="0" x2="1">
          <stop offset="0" stopColor="#1f1813" />
          <stop offset=".5" stopColor="#3a2e25" />
          <stop offset="1" stopColor="#1e1712" />
        </linearGradient>
        <linearGradient id="trk-mat" x1="0" x2="1">
          <stop offset="0" stopColor="#5f5343" />
          <stop offset=".5" stopColor="#a69478" />
          <stop offset="1" stopColor="#6a5c49" />
        </linearGradient>
        <linearGradient id="trk-staff" x1="0" x2="1">
          <stop offset="0" stopColor="#4a3220" />
          <stop offset=".5" stopColor="#8a6440" />
          <stop offset="1" stopColor="#4a3220" />
        </linearGradient>
        <linearGradient id="trk-bottle" x1="0" x2="1">
          <stop offset="0" stopColor="#4b4b4b" />
          <stop offset=".5" stopColor="#8a8a88" />
          <stop offset="1" stopColor="#3f3f3f" />
        </linearGradient>
        <radialGradient id="trk-hair" cx=".5" cy=".35" r=".6">
          <stop offset="0" stopColor="#3a2c22" />
          <stop offset="1" stopColor="#140f0b" />
        </radialGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx="112" cy="474" rx="95" ry="9" fill="#000" opacity=".45" />

      {/* staff (behind right hand) */}
      <path d="M208,178 L214,176 L222,474 L214,474 Z" fill="url(#trk-staff)" />
      <path d="M210,250 l6,-1 M211,330 l7,-1 M213,410 l7,-1" stroke="#3a2617" strokeWidth="1.5" />

      {/* legs */}
      <path d="M52,262 L106,262 L104,300 C103,340 101,385 100,436 L58,436 C55,390 52,340 50,300 Z" fill="url(#trk-pants)" />
      <path d="M110,262 L166,262 L168,300 C167,340 165,385 163,436 L118,436 C117,385 113,340 110,300 Z" fill="url(#trk-pants)" />
      {/* seams, knee darts and cargo pocket */}
      <path d="M78,268 C77,320 77,380 79,436 M138,268 C139,320 140,380 140,436" stroke="#15100c" strokeWidth="1.6" fill="none" opacity=".8" />
      <path d="M58,350 q20,8 42,0 M118,350 q22,8 44,0" stroke="#15100c" strokeWidth="2" fill="none" opacity=".7" />
      <path d="M60,360 q18,5 38,-1 M120,360 q20,5 40,-1" stroke="#4d3d31" strokeWidth="1.2" fill="none" opacity=".6" />
      <rect x="150" y="288" width="15" height="44" rx="3" fill="#2a2119" stroke="#15100c" strokeWidth="1.2" />
      <path d="M150,296 h15" stroke="#15100c" strokeWidth="1.2" />
      <rect x="52" y="292" width="13" height="40" rx="3" fill="#251d16" stroke="#15100c" strokeWidth="1.2" />

      {/* boots */}
      <path d="M56,430 L101,430 L103,462 C103,470 98,474 90,474 L52,474 C47,474 46,468 49,462 Z" fill="#1b1511" />
      <path d="M117,430 L164,430 L167,462 C169,469 165,474 158,474 L120,474 C114,474 112,469 114,462 Z" fill="#1b1511" />
      <path d="M53,461 H102 M115,461 H166" stroke="#0c0907" strokeWidth="4" />
      <path d="M60,438 h36 M121,438 h38" stroke="#3a2e25" strokeWidth="2" />

      {/* jacket body and hem */}
      <path d="M30,92 C50,78 172,78 194,92 L188,250 C186,262 176,268 160,268 L60,268 C44,268 34,262 32,250 Z" fill="url(#trk-jacket)" />
      <path d="M36,248 C70,258 154,258 188,248" stroke="#1a130e" strokeWidth="3" fill="none" />

      {/* left arm hanging down, gloved hand */}
      <path d="M32,92 C18,110 14,150 15,200 C16,230 18,250 22,262 L42,262 C41,235 42,190 46,150 C48,125 46,104 40,94 Z" fill="url(#trk-jacket)" />
      <path d="M22,150 C24,180 26,220 28,250" stroke="#1a130e" strokeWidth="1.6" fill="none" opacity=".8" />
      <path d="M20,254 L44,254 L45,272 C44,284 38,290 30,290 C22,290 18,282 19,272 Z" fill="#17120e" />
      <rect x="20" y="250" width="25" height="7" rx="2" fill="#2d241c" />

      {/* right arm reaching to the staff, gloved hand around it */}
      <path d="M190,92 C202,104 208,124 210,150 L216,182 L200,190 L190,160 C186,140 184,118 182,102 Z" fill="url(#trk-jacket)" />
      <path d="M196,120 C200,140 204,160 208,178" stroke="#1a130e" strokeWidth="1.6" fill="none" opacity=".8" />
      <path d="M200,176 C204,170 218,170 224,178 L226,196 C224,206 206,208 200,200 Z" fill="#17120e" />
      <path d="M204,184 h18 M204,191 h19" stroke="#2d241c" strokeWidth="1.5" />

      {/* collar and neck */}
      <path d="M78,72 C90,64 120,64 132,72 L130,86 L80,86 Z" fill="#2c2119" />
      <rect x="94" y="56" width="22" height="18" rx="6" fill="#6b4a36" />

      {/* head: short dark hair from behind, ears */}
      <ellipse cx="80" cy="42" rx="4" ry="7" fill="#7a553e" />
      <ellipse cx="130" cy="42" rx="4" ry="7" fill="#7a553e" />
      <path d="M82,40 C80,18 92,8 105,8 C120,8 131,18 128,40 C127,52 120,62 105,63 C90,62 83,52 82,40 Z" fill="url(#trk-hair)" />
      <path d="M90,20 q6,-4 12,-2 M104,14 q8,-1 14,4 M94,30 q8,-3 16,0" stroke="#4a382b" strokeWidth="1.4" fill="none" opacity=".7" />

      <g transform="translate(0 24)">
      {/* sleeping mat strapped to the left of the pack */}
      <rect x="30" y="62" width="34" height="176" rx="12" fill="url(#trk-mat)" />
      {Array.from({ length: 28 }, (_, i) => (
        <path key={i} d={`M32,${70 + i * 6} q15,2 30,0`} stroke="#4f4436" strokeWidth="1.2" fill="none" opacity=".75" />
      ))}
      <rect x="28" y="96" width="38" height="5" rx="2" fill="#1d1712" />
      <rect x="28" y="196" width="38" height="5" rx="2" fill="#1d1712" />

      {/* pack body */}
      <path d="M58,64 C60,48 152,48 158,64 L166,236 C166,250 156,258 142,258 L80,258 C66,258 56,250 56,236 Z" fill="url(#trk-pack)" />
      {/* top lid */}
      <path d="M62,58 C64,30 150,30 154,58 L156,82 C130,90 86,90 60,82 Z" fill="url(#trk-lid)" />
      <path d="M64,80 C88,88 128,88 154,80" stroke="#15100c" strokeWidth="2" fill="none" />
      <path d="M100,48 l8,-8 l8,8" stroke="#c9c2b6" strokeWidth="2.4" fill="none" strokeLinejoin="round" />

      {/* compression straps and buckles */}
      <path d="M74,86 L72,236 M144,86 L148,236" stroke="#18130f" strokeWidth="7" />
      <rect x="66" y="118" width="13" height="10" rx="2" fill="#7d6a52" />
      <rect x="140" y="118" width="13" height="10" rx="2" fill="#7d6a52" />
      <rect x="66" y="178" width="13" height="10" rx="2" fill="#7d6a52" />
      <rect x="141" y="178" width="13" height="10" rx="2" fill="#7d6a52" />
      <path d="M58,104 C80,98 140,98 162,104" stroke="#18130f" strokeWidth="5" fill="none" />

      {/* front pocket with the brand patch */}
      <path d="M80,140 C80,132 140,132 140,140 L142,226 C142,234 80,234 80,226 Z" fill="#2b231c" stroke="#15100c" strokeWidth="1.5" />
      <path d="M84,146 C100,142 122,142 136,146" stroke="#4b3f33" strokeWidth="1.2" fill="none" />
      <rect x="93" y="158" width="34" height="34" rx="12" fill="#e9e5dc" />
      <path d="M97,184 L105,172 L110,179 L114,174 L123,184 Z" fill="#2f7a56" />
      <circle cx="117" cy="167" r="3" fill="#f59e0b" />
      <text x="110" y="206" textAnchor="middle" fontSize="10" fontWeight="700" fill="#e9e5dc" fontFamily="var(--font-display), sans-serif" letterSpacing=".3">
        {siteConfig.name.toLowerCase()}
      </text>

      {/* water bottle in the right side pocket */}
      <rect x="152" y="150" width="20" height="62" rx="6" fill="url(#trk-bottle)" />
      <rect x="155" y="142" width="14" height="10" rx="3" fill="#2a2a2a" />
      <path d="M150,190 h24 v26 c0,6 -24,6 -24,0 Z" fill="#241d17" />

      {/* hip-belt ends and dangling straps */}
      <path d="M80,250 L78,286 M140,250 L144,288" stroke="#18130f" strokeWidth="6" strokeLinecap="round" />
      <rect x="72" y="238" width="16" height="9" rx="2" fill="#7d6a52" />
      <rect x="134" y="238" width="16" height="9" rx="2" fill="#7d6a52" />

      </g>

      {/* rim light from the sky */}
      <path d="M38,90 C60,80 160,80 186,90" stroke="#9fb3bf" strokeWidth="2" fill="none" opacity=".35" />
      <path d="M86,22 C92,12 118,10 126,22" stroke="#9fb3bf" strokeWidth="2" fill="none" opacity=".3" />
    </g>
  );
}
