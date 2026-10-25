'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Sun,
  Moon,
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ─── Destination Data with Real Geographic Coordinates in Bangladesh ─────── */
interface Destination {
  id: string;
  name: string;
  nativeNameBn: string;
  nativeNameHi: string;
  region: string;
  regionBn: string;
  regionHi: string;
  price: string;
  altitudeTag: string;
  bestSeason: string;
  description: string;
  descriptionBn: string;
  descriptionHi: string;
  color: string;
  image: string;
  nx: number; // Normalized X [0-1] (West -> East)
  ny: number; // Normalized Y [0-1] (North -> South)
  elevation: number; // 3D relief elevation [0-1]
  isGateway?: boolean;
  packageSlug?: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'sajek',
    name: 'Sajek Valley',
    nativeNameBn: 'সাজেক ভ্যালি',
    nativeNameHi: 'साजेक वैली',
    region: 'Rangamati / Cloud Valley',
    regionBn: 'রাঙ্গামাটি / মেঘের রাজ্য',
    regionHi: 'रांगामाटी / बादलों की वादी',
    price: 'From ৳4,299',
    altitudeTag: '1,800 ft Ridge',
    bestSeason: 'Oct – Mar & Monsoon',
    description: 'Floating above the sea of clouds at sunrise from Ruilui Para & Konglak Peak.',
    descriptionBn: 'রুইলুই পাড়া ও কংলাক পাহাড়ের চূড়ায় মেঘের ভেলায় ভেসে থাকার অনন্য অনুভূতি।',
    descriptionHi: 'रुईलुई पाड़ा और कोंगलाक चोटी से सूर्योदय के समय बादलों के समुद्र के ऊपर तैरने का मनमोहक अनुभव।',
    color: '#fb7185',
    image: '/images/destinations/sajek.jpg',
    nx: 0.88,
    ny: 0.50,
    elevation: 0.75,
    packageSlug: 'sajek-valley-tour',
  },
  {
    id: 'saint-martin',
    name: 'Saint Martin Island',
    nativeNameBn: 'সেন্ট মার্টিন দ্বীপ',
    nativeNameHi: 'सेंट मार्टिन द्वीप',
    region: 'Bay of Bengal Coral Isle',
    regionBn: 'বঙ্গোপসাগরের প্রবাল দ্বীপ',
    regionHi: 'बंगाल की खाड़ी का प्रवाल द्वीप',
    price: 'From ৳4,499',
    altitudeTag: 'Sea Level Reef',
    bestSeason: 'Nov – Mar',
    description: 'Coconut groves, pristine coral beaches, seafood BBQ and crystal turquoise waters.',
    descriptionBn: 'নারকেল বাগান, প্রবাল সৈকত, সী-ফুড বারবিকিউ ও কাঁচের মতো স্বচ্ছ নীল জলরাশি।',
    descriptionHi: 'नारियल के बगीचे, प्रवाल समुद्र तट, सी-फूड बारबेक्यू और क्रिस्टल नीला समुद्री जल।',
    color: '#06b6d4',
    image: '/images/destinations/saint-martin.jpg',
    nx: 0.88,
    ny: 0.96,
    elevation: 0.05,
    packageSlug: 'saint-martin-island-tour',
  },
  {
    id: 'bandarban',
    name: 'Bandarban & Keokradong',
    nativeNameBn: 'বান্দরবান ও কেওক্রাডং',
    nativeNameHi: 'बंदरबन एवं केओक्राडोंग',
    region: 'Chittagong Hill Tracts',
    regionBn: 'পার্বত্য চট্টগ্রাম',
    regionHi: 'चटगांव हिल ट्रैक्ट्स',
    price: 'From ৳5,499',
    altitudeTag: '3,235 ft Summit',
    bestSeason: 'Sep – Apr',
    description: 'Highest mountain trails of Keokradong, sacred Boga Lake & Nilgiri cloud viewpoint.',
    descriptionBn: 'কেওক্রাডং পাহাড়ের রোমাঞ্চকর ট্রেইল, রহস্যময় বগা লেক ও নীলগিরির মেঘের দৃশ্য।',
    descriptionHi: 'केओक्राडोंग की सबसे ऊंची पहाड़ी पगडंडियां, बोग्गा झील और नीलगिरी का मनमोहक नजारा।',
    color: '#10b981',
    image: '/images/destinations/bandarban.jpg',
    nx: 0.88,
    ny: 0.70,
    elevation: 0.85,
    packageSlug: 'keokradong-trek-expedition',
  },
  {
    id: 'coxs-bazar',
    name: "Cox's Bazar",
    nativeNameBn: 'কক্সবাজার',
    nativeNameHi: 'कॉक्स बाज़ार',
    region: 'World’s Longest Beach',
    regionBn: 'বিশ্বের দীর্ঘতম সমুদ্র সৈকত',
    regionHi: 'दुनिया का सबसे लंबा समुद्र तट',
    price: 'From ৳2,999',
    altitudeTag: 'Coastal Line',
    bestSeason: 'Oct – Apr',
    description: '120 km unbroken golden sandy beach, Marine Drive and magical crimson sunsets.',
    descriptionBn: '১২০ কিমি অবিচ্ছিন্ন বালুকাময় সৈকত, মেরিন ড্রাইভ ও দিগন্তজোড়া রক্তিম সূর্যাস্ত।',
    descriptionHi: '१२० किमी लंबा सुनहरी रेत का समुद्र तट, मरीन ड्राइव और जादुई सूर्यास्त।',
    color: '#f59e0b',
    image: '/images/destinations/coxs-bazar.jpg',
    nx: 0.82,
    ny: 0.82,
    elevation: 0.06,
    isGateway: true,
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans Mangrove',
    nativeNameBn: 'সুন্দরবন ম্যানগ্রোভ বন',
    nativeNameHi: 'सुंदरबन मैंग्रोव वन',
    region: 'Khulna Delta Sanctuary',
    regionBn: 'খুলনা ব-দ্বীপ অভয়ারণ্য',
    regionHi: 'खुलना डेल्टा अभयारण्य',
    price: 'From ৳6,999',
    altitudeTag: 'Tidal Delta',
    bestSeason: 'Nov – Mar',
    description: 'World’s largest mangrove forest, tranquil houseboats and Royal Bengal Tiger habitat.',
    descriptionBn: 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন, লাক্সারি হাউস বোট ভ্রমণ ও রয়েল বেঙ্গল টাইগারের বিচরণভূমি।',
    descriptionHi: 'दुनिया का सबसे बड़ा मैंग्रोव वन, शांत हाउसबोट और रॉयल बंगाल टाइगर का प्राकृतिक आवास।',
    color: '#059669',
    image: '/images/destinations/sundarbans.jpg',
    nx: 0.30,
    ny: 0.74,
    elevation: 0.04,
    packageSlug: 'sundarbans-wildlife-cruise',
  },
  {
    id: 'sylhet',
    name: 'Sylhet & Ratargul',
    nativeNameBn: 'সিলেট ও রাতারগুল',
    nativeNameHi: 'सिलहट एवं रातारगुल',
    region: 'Surma River Basin',
    regionBn: 'সুরমা নদী উপত্যকা',
    regionHi: 'सुरमा नदी घाटी',
    price: 'From ৳3,799',
    altitudeTag: 'Swamp & Foothills',
    bestSeason: 'Jun – Feb',
    description: 'Freshwater swamp forest of Ratargul, crystal Jaflong stone beds and Lalakhal waters.',
    descriptionBn: 'রাতারগুল সোয়াম্প ফরেস্টে ডিঙি নৌকায় ভ্রমণ, জাফলং ও লালাখালের স্বচ্ছ পান্না জল।',
    descriptionHi: 'रातारगुल का मीठे पानी का दलदली जंगल, जाफलॉन्ग के पत्थर और लालाखाल का पानी।',
    color: '#84cc16',
    image: '/images/destinations/ratargul.jpg',
    nx: 0.80,
    ny: 0.28,
    elevation: 0.28,
  },
  {
    id: 'srimangal',
    name: 'Sreemangal Tea Estates',
    nativeNameBn: 'শ্রীমঙ্গল চা বাগান',
    nativeNameHi: 'श्रीमंगल चाय बागान',
    region: 'Moulvibazar Tea Capital',
    regionBn: 'মৌলভীবাজার চা রাজধানী',
    regionHi: 'मौलवीबाजार चाय की राजधानी',
    price: 'From ৳2,799',
    altitudeTag: 'Rolling Highlands',
    bestSeason: 'All Year',
    description: 'Lush green tea carpets, Lawachara rain forest canopy and famous seven-layer tea.',
    descriptionBn: 'দিগন্তজোড়া সবুজ চায়ের বাগান, লাউয়াছড়া রেইনফরেস্ট ও বিখ্যাত সাত রঙের চা।',
    descriptionHi: 'हरी-भरी चाय की ढलानें, लवाछड़ा वर्षावन और प्रसिद्ध सात परतों वाली चाय।',
    color: '#10b981',
    image: '/images/destinations/sreemangal.jpg',
    nx: 0.76,
    ny: 0.38,
    elevation: 0.24,
  },
  {
    id: 'tanguar-haor',
    name: 'Tanguar Haor & Sunamganj',
    nativeNameBn: 'টাঙ্গুয়ার হাওর ও সুনামগঞ্জ',
    nativeNameHi: 'तांगुआ हाओर एवं सुनामगंज',
    region: 'Wetland Sanctuary',
    regionBn: 'রামসার জলাভূমি ও মেঘালয় পাদদেশ',
    regionHi: 'वेटलैंड अभयारण्य एवं मेघालय तलहटी',
    price: 'From ৳3,899',
    altitudeTag: 'Ramsar Wetland',
    bestSeason: 'Jul – Oct & Winter',
    description: 'Sleeping in luxury wooden houseboats under starry skies with Meghalaya hill backdrops.',
    descriptionBn: 'মেঘালয় পাহাড়ের পাদদেশে হাওরে বিলাসবহুল বজরায় রাতযাপন ও স্বচ্ছ নীলাভ জলরাশি।',
    descriptionHi: 'मेघालय की पहाड़ियों की पृष्ठभूमि में तारों भरी रात में हाउसबोट पर ठहरने का आनंद।',
    color: '#0284c7',
    image: '/images/destinations/tanguar-haor.jpg',
    nx: 0.64,
    ny: 0.25,
    elevation: 0.10,
  },
  {
    id: 'rangamati',
    name: 'Rangamati & Kaptai Lake',
    nativeNameBn: 'রাঙ্গামাটি ও কাপ্তাই লেক',
    nativeNameHi: 'रांगामाटी एवं कपताई झील',
    region: 'Lake & Hill District',
    regionBn: 'হ্রদ ও পাহাড়ের শহর',
    regionHi: 'झील एवं पहाड़ी क्षेत्र',
    price: 'From ৳3,999',
    altitudeTag: '1,200 ft Lake Basin',
    bestSeason: 'Aug – Apr',
    description: 'Vast scenic Kaptai Lake cruise, indigenous Chakma culture & iconic Hanging Bridge.',
    descriptionBn: 'মনোরম কাপ্তাই লেকে বোট ট্রিপ, ঝুলন্ত ব্রিজ ও চাকমা ক্ষুদ্র নৃগোষ্ঠীর সংস্কৃতি।',
    descriptionHi: 'विशाल कपताई झील में नाव की सैर, स्वदेशी संस्कृति और प्रसिद्ध हैंगिंग ब्रिज।',
    color: '#8b5cf6',
    image: '/images/destinations/kaptai.jpg',
    nx: 0.86,
    ny: 0.62,
    elevation: 0.52,
  },
  {
    id: 'kuakata',
    name: 'Kuakata Daughter of Sea',
    nativeNameBn: 'কুয়াকাটা সাগরকন্যা',
    nativeNameHi: 'कुआकाटा सागरकन्या',
    region: 'Patuakhali South Coast',
    regionBn: 'পটুয়াখালী দক্ষিণ উপকূল',
    regionHi: 'पटुआखाली दक्षिणी तट',
    price: 'From ৳3,499',
    altitudeTag: 'Panoramic Beach',
    bestSeason: 'Oct – Mar',
    description: 'Rare coastal beach where both sunrise and sunset can be viewed over the Bay of Bengal.',
    descriptionBn: 'একই সৈকত থেকে বঙ্গোপসাগরের সূর্যোদয় ও সূর্যাস্ত দেখার অপরূপ নৈসর্গিক স্থান।',
    descriptionHi: 'दुर्लभ समुद्र तट जहां बंगाल की खाड़ी पर सूर्योदय और सूर्यास्त दोनों देखा जा सकता है।',
    color: '#f97316',
    image: '/images/destinations/kuakata.jpg',
    nx: 0.46,
    ny: 0.78,
    elevation: 0.05,
  },
  {
    id: 'dhaka',
    name: 'Dhaka Capital Hub',
    nativeNameBn: 'ঢাকা রাজধানী',
    nativeNameHi: 'ढाका राजधानी',
    region: 'Central Gateway',
    regionBn: 'কেন্দ্রীয় প্রস্থান হাব',
    regionHi: 'केंद्रीय ट्रांजिट हब',
    price: 'Gateway Departure',
    altitudeTag: 'Central Plain',
    bestSeason: 'All Year',
    description: 'Primary transportation departure hub connecting air, train and highway tour routes.',
    descriptionBn: 'সমগ্র বাংলাদেশে যাত্রা শুরুর প্রধান কেন্দ্রীয় বিমান, ট্রেন ও হাইওয়ে ট্রানজিট কেন্দ্র।',
    descriptionHi: 'पूरे बांग्लादेश में यात्रा शुरू करने का मुख्य हवाई, ट्रेन और बस ट्रांजिट केंद्र।',
    color: '#38bdf8',
    image: '/images/destinations/dhaka.jpg',
    nx: 0.51,
    ny: 0.46,
    elevation: 0.08,
    isGateway: true,
  },
];

const ROUTES: [string, string][] = [
  ['dhaka', 'coxs-bazar'],
  ['dhaka', 'bandarban'],
  ['dhaka', 'sajek'],
  ['dhaka', 'sylhet'],
  ['dhaka', 'tanguar-haor'],
  ['dhaka', 'sundarbans'],
  ['dhaka', 'kuakata'],
  ['coxs-bazar', 'saint-martin'],
  ['coxs-bazar', 'bandarban'],
  ['sylhet', 'srimangal'],
  ['srimangal', 'sajek'],
  ['bandarban', 'rangamati'],
];

/* ─── Boundary polygon of Bangladesh (Normalized [0, 1] across bounds) ───── */
const BD_OUTLINE_NORM: [number, number][] = [
  [0.16, 0.04], [0.22, 0.06], [0.28, 0.08], [0.34, 0.11], [0.38, 0.15],
  [0.44, 0.19], [0.52, 0.20], [0.60, 0.20], [0.70, 0.21], [0.80, 0.23],
  [0.86, 0.25], [0.89, 0.28], [0.84, 0.36], [0.81, 0.42], [0.75, 0.48],
  [0.76, 0.54], [0.84, 0.53], [0.92, 0.50], [0.95, 0.58], [0.94, 0.65],
  [0.96, 0.72], [0.95, 0.80], [0.91, 0.88], [0.90, 0.93], [0.88, 0.96],
  [0.84, 0.90], [0.83, 0.82], [0.77, 0.72], [0.71, 0.67], [0.64, 0.68],
  [0.57, 0.73], [0.50, 0.79], [0.44, 0.78], [0.36, 0.78], [0.28, 0.77],
  [0.23, 0.74], [0.22, 0.66], [0.22, 0.55], [0.20, 0.45], [0.17, 0.36],
  [0.22, 0.27], [0.18, 0.17], [0.16, 0.04]
];

// Check if point is inside Bangladesh polygon
function isPointInPoly(pt: [number, number], poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Distance to polygon edge (for shoreline blending)
function distToPolyEdge(pt: [number, number], poly: [number, number][]): number {
  let minDist = 1e9;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const x1 = poly[i][0], y1 = poly[i][1];
    const x2 = poly[j][0], y2 = poly[j][1];
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let t = ((pt[0] - x1) * dx + (pt[1] - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * dx, py = y1 + t * dy;
    const d = Math.hypot(pt[0] - px, pt[1] - py);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/* ─── Procedural High-Res Texture & Heightfield Generator ────────────────── */
function generateBangladeshMaps(nightMode = false): {
  textureCanvas: HTMLCanvasElement;
  heightfield: (nx: number, ny: number) => number;
} {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // 1. Deep Ocean Background (Bay of Bengal)
  const oceanGrad = ctx.createRadialGradient(
    size * 0.4, size * 0.9, size * 0.1,
    size * 0.5, size * 0.6, size * 0.8
  );
  if (!nightMode) {
    oceanGrad.addColorStop(0, '#0284c7');    // Tropical bright sea
    oceanGrad.addColorStop(0.35, '#0369a1'); // Marine blue
    oceanGrad.addColorStop(0.7, '#082f49');  // Deep ocean
    oceanGrad.addColorStop(1, '#021526');    // Continental dropoff
  } else {
    oceanGrad.addColorStop(0, '#03203c');
    oceanGrad.addColorStop(0.4, '#021324');
    oceanGrad.addColorStop(1, '#010912');
  }
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Bathymetric Ocean Depth Contours & Grid
  ctx.strokeStyle = nightMode ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.10)';
  ctx.lineWidth = 1;
  for (let lat = 0.2; lat <= 0.9; lat += 0.15) {
    ctx.beginPath();
    ctx.moveTo(0, lat * size);
    ctx.lineTo(size, lat * size);
    ctx.stroke();
  }
  for (let lon = 0.2; lon <= 0.9; lon += 0.15) {
    ctx.beginPath();
    ctx.moveTo(lon * size, 0);
    ctx.lineTo(lon * size, size);
    ctx.stroke();
  }

  // Draw nautical coordinates text
  ctx.fillStyle = nightMode ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.30)';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('BAY OF BENGAL  •  20°30′N  90°15′E', size * 0.15, size * 0.92);

  // 3. Draw Bangladesh Landmass Silhouette with Rich Biomes
  ctx.save();
  ctx.beginPath();
  BD_OUTLINE_NORM.forEach(([x, y], idx) => {
    if (idx === 0) ctx.moveTo(x * size, y * size);
    else ctx.lineTo(x * size, y * size);
  });
  ctx.closePath();
  ctx.clip(); // Restrict landmass painting inside authentic border

  // Base Land Gradient (North lush hills -> Central green plain -> South delta)
  const landGrad = ctx.createLinearGradient(0, 0, size, size);
  if (!nightMode) {
    landGrad.addColorStop(0, '#15803d');    // North green plains
    landGrad.addColorStop(0.3, '#16a34a');  // Central delta
    landGrad.addColorStop(0.65, '#22c55e'); // Alluvial plains
    landGrad.addColorStop(1, '#064e3b');    // Southern mangroves
  } else {
    landGrad.addColorStop(0, '#092d1a');
    landGrad.addColorStop(0.5, '#062013');
    landGrad.addColorStop(1, '#03120b');
  }
  ctx.fillStyle = landGrad;
  ctx.fill();

  // Biome: Sundarbans Mangrove Delta (South-West)
  const mangroveGrad = ctx.createRadialGradient(
    size * 0.30, size * 0.74, 10,
    size * 0.30, size * 0.74, size * 0.22
  );
  mangroveGrad.addColorStop(0, nightMode ? '#042f1a' : '#044e29');
  mangroveGrad.addColorStop(0.7, nightMode ? '#063a22' : '#065f38');
  mangroveGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = mangroveGrad;
  ctx.fillRect(0, 0, size, size);

  // Biome: Sylhet & Sreemangal Emerald Tea Highlands (North-East)
  const teaGrad = ctx.createRadialGradient(
    size * 0.80, size * 0.32, 10,
    size * 0.80, size * 0.32, size * 0.18
  );
  teaGrad.addColorStop(0, nightMode ? '#14532d' : '#22c55e');
  teaGrad.addColorStop(0.6, nightMode ? '#052e16' : '#15803d');
  teaGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = teaGrad;
  ctx.fillRect(0, 0, size, size);

  // Biome: Chittagong Hill Tracts & Sajek (East & South-East Mountains)
  const hillsGrad = ctx.createRadialGradient(
    size * 0.90, size * 0.65, 20,
    size * 0.90, size * 0.65, size * 0.28
  );
  if (!nightMode) {
    hillsGrad.addColorStop(0, '#b45309');    // Mountain crag / ochre summits
    hillsGrad.addColorStop(0.35, '#78350f'); // Forest ridge
    hillsGrad.addColorStop(0.7, '#0f766e');  // Dense mountain jungle
    hillsGrad.addColorStop(1, 'transparent');
  } else {
    hillsGrad.addColorStop(0, '#451a03');
    hillsGrad.addColorStop(0.5, '#1e293b');
    hillsGrad.addColorStop(1, 'transparent');
  }
  ctx.fillStyle = hillsGrad;
  ctx.fillRect(0, 0, size, size);

  // Major River Networks: Padma, Jamuna, Meghna, Karnaphuli
  ctx.strokeStyle = nightMode ? '#0ea5e9' : '#38bdf8';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Jamuna (North -> South)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size * 0.40, size * 0.16);
  ctx.quadraticCurveTo(size * 0.42, size * 0.32, size * 0.46, size * 0.44);
  ctx.stroke();

  // Padma (West -> Center)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(size * 0.20, size * 0.38);
  ctx.quadraticCurveTo(size * 0.35, size * 0.44, size * 0.46, size * 0.44);
  ctx.stroke();

  // Meghna Confluence & Southern Estuary
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(size * 0.46, size * 0.44);
  ctx.quadraticCurveTo(size * 0.55, size * 0.55, size * 0.62, size * 0.72);
  ctx.stroke();

  // Karnaphuli River (Chattogram to Kaptai Lake)
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size * 0.73, size * 0.68);
  ctx.quadraticCurveTo(size * 0.80, size * 0.66, size * 0.86, size * 0.62);
  ctx.stroke();

  // City Lights (Night Mode glowing cluster for Dhaka & Chittagong)
  if (nightMode) {
    const drawCityLight = (cx: number, cy: number, r: number, col: string) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, '#fef08a');
      g.addColorStop(0.4, col);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCityLight(size * 0.51, size * 0.46, 32, 'rgba(234, 179, 8, 0.4)'); // Dhaka
    drawCityLight(size * 0.74, size * 0.66, 26, 'rgba(234, 179, 8, 0.35)'); // Chattogram
    drawCityLight(size * 0.80, size * 0.28, 20, 'rgba(56, 189, 248, 0.3)'); // Sylhet
  }

  ctx.restore();

  // 4. Draw Illuminated Shorelines & Beach Sand Rim
  ctx.save();
  ctx.beginPath();
  BD_OUTLINE_NORM.forEach(([x, y], idx) => {
    if (idx === 0) ctx.moveTo(x * size, y * size);
    else ctx.lineTo(x * size, y * size);
  });
  ctx.closePath();

  // Golden Sand Coastline at Cox's Bazar and Southern beaches
  ctx.strokeStyle = nightMode ? 'rgba(56, 189, 248, 0.8)' : '#fde047';
  ctx.lineWidth = nightMode ? 2.5 : 3.5;
  ctx.shadowColor = nightMode ? '#00e5ff' : 'rgba(253, 224, 71, 0.8)';
  ctx.shadowBlur = nightMode ? 14 : 8;
  ctx.stroke();

  // Saint Martin Isolated Island on Canvas
  const smx = size * 0.88, smy = size * 0.96;
  ctx.beginPath();
  ctx.ellipse(smx, smy, 8, 14, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 5. Heightfield Function calculating genuine 3D relief for any (nx, ny)
  const heightfield = (nx: number, ny: number): number => {
    // Check if point falls within Bangladesh landmass
    const inside = isPointInPoly([nx, ny], BD_OUTLINE_NORM);
    if (!inside) {
      // Special check for Saint Martin's island
      const dSm = Math.hypot(nx - 0.88, ny - 0.96);
      if (dSm < 0.025) return 0.06;
      return 0.0; // Sea level in ocean
    }

    const edgeDist = distToPolyEdge([nx, ny], BD_OUTLINE_NORM);
    const shorelineFalloff = Math.min(1.0, edgeDist * 22);

    let h = 0.04; // Baseline flat delta land above water

    // Chittagong Hill Tracts elevation (East & Southeast: Bandarban, Sajek, Keokradong)
    const dHills = Math.hypot(nx - 0.90, ny - 0.65);
    if (dHills < 0.28) {
      const hillFactor = 1 - dHills / 0.28;
      // Ridge formations
      const ridgeNoise = Math.sin(nx * 42) * Math.cos(ny * 36) * 0.12;
      h += (hillFactor * hillFactor * 0.72) + ridgeNoise;
    }

    // Keokradong Summit Peak
    const dSummit = Math.hypot(nx - 0.88, ny - 0.70);
    if (dSummit < 0.09) {
      h += (1 - dSummit / 0.09) * 0.25;
    }

    // Sajek Valley Ridge
    const dSajek = Math.hypot(nx - 0.88, ny - 0.50);
    if (dSajek < 0.10) {
      h += (1 - dSajek / 0.10) * 0.32;
    }

    // Sylhet / Sreemangal Rolling Tea Hills (Northeast)
    const dSylhet = Math.hypot(nx - 0.80, ny - 0.30);
    if (dSylhet < 0.18) {
      const teaFactor = 1 - dSylhet / 0.18;
      h += teaFactor * 0.26 + Math.sin(nx * 30 + ny * 25) * 0.04;
    }

    // North Meghalaya Foothill Wall
    if (ny < 0.24 && nx > 0.45 && nx < 0.85) {
      const northFactor = (0.24 - ny) / 0.24;
      h += northFactor * 0.30;
    }

    // Rivers recession
    const dPadma = Math.abs(ny - (0.44 + (nx - 0.46) * 0.1));
    if (nx > 0.20 && nx < 0.62 && dPadma < 0.018) {
      h -= 0.025;
    }

    return Math.max(0.01, h * shorelineFalloff);
  };

  return { textureCanvas: canvas, heightfield };
}

/* ─── Main 3D Interactive Map Component ───────────────────────────────────── */
export function TouristMap3D() {
  const { t, formatPrice, locale } = useLanguage();
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const terrainMeshRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  // Camera & Interaction states
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: -0.42, y: 0.05 });
  const targetRotRef = useRef({ x: -0.42, y: 0.05 });
  const zoomRef = useRef(4.8);
  const targetZoomRef = useRef(4.8);
  const autoRotateRef = useRef(true);
  // Momentum / inertia
  const velRef = useRef({ x: 0, y: 0 });
  // Auto-rotate resume timer
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pinch zoom tracking
  const lastPinchDistRef = useRef<number | null>(null);
  // Mount-level wheel handler ref for cleanup
  const mountNodeRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [nightMode, setNightMode] = useState(false);
  const [is2DMode, setIs2DMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>('sajek');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinPositions, setPinPositions] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);

  const activeDest = useMemo(
    () => DESTINATIONS.find((d) => d.id === activeId),
    [activeId]
  );

  // Localized text helper
  const getDestName = useCallback(
    (d: Destination) => {
      if (locale === 'bn') return d.nativeNameBn;
      if (locale === 'hi') return d.nativeNameHi;
      return d.name;
    },
    [locale]
  );

  const getDestRegion = useCallback(
    (d: Destination) => {
      if (locale === 'bn') return d.regionBn;
      if (locale === 'hi') return d.regionHi;
      return d.region;
    },
    [locale]
  );

  const getDestDesc = useCallback(
    (d: Destination) => {
      if (locale === 'bn') return d.descriptionBn;
      if (locale === 'hi') return d.descriptionHi;
      return d.description;
    },
    [locale]
  );

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    let destroyed = false;
    let THREE: any;

    async function init() {
      THREE = await import('three');
      if (destroyed || !mountRef.current) return;

      const W = mountRef.current.clientWidth;
      const H = mountRef.current.clientHeight;

      // Renderer with physically correct shadows
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = nightMode ? 1.1 : 1.25;

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
      camera.position.set(0, zoomRef.current * 0.72, zoomRef.current);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Lighting system
      const ambientLight = new THREE.AmbientLight(
        nightMode ? 0x0c1e3d : 0xe0f2fe,
        nightMode ? 1.2 : 1.8
      );
      scene.add(ambientLight);

      // Sun light casting realistic mountain shadows
      const sunLight = new THREE.DirectionalLight(
        nightMode ? 0x38bdf8 : 0xfffbeb,
        nightMode ? 1.5 : 3.2
      );
      sunLight.position.set(6, 12, 7);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.bias = -0.0004;
      scene.add(sunLight);

      // Rim light for relief edge pop
      const rimLight = new THREE.DirectionalLight(
        nightMode ? 0x00e5ff : 0x0284c7,
        nightMode ? 1.8 : 1.2
      );
      rimLight.position.set(-8, 4, -6);
      scene.add(rimLight);

      // Rotating Container Group
      const group = new THREE.Group();
      group.rotation.x = rotRef.current.x;
      group.rotation.y = rotRef.current.y;
      scene.add(group);
      groupRef.current = group;

      // Generate Authentic Bangladesh Texture & Heightfield
      const { textureCanvas, heightfield } = generateBangladeshMaps(nightMode);
      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.anisotropy = 16;

      // ── BUILD 3D REALISTIC RELIEF TERRAIN ──
      const MAP_W = 5.2; // Width (East-West)
      const MAP_D = 6.0; // Depth (North-South)
      const SEGS_X = 140;
      const SEGS_Z = 160;

      const terrainGeo = new THREE.PlaneGeometry(MAP_W, MAP_D, SEGS_X, SEGS_Z);
      terrainGeo.rotateX(-Math.PI / 2);

      const pos = terrainGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const nx = vx / MAP_W + 0.5;
        const ny = vz / MAP_D + 0.5;

        const elevation = heightfield(nx, ny);
        pos.setY(i, elevation * 0.95);
      }
      pos.needsUpdate = true;
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: nightMode ? 0.45 : 0.65,
        metalness: nightMode ? 0.35 : 0.15,
        flatShading: false,
      });

      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.receiveShadow = true;
      terrainMesh.castShadow = true;
      group.add(terrainMesh);
      terrainMeshRef.current = terrainMesh;

      // ── Pedestal / Beveled Acrylic Base ──
      const baseGeo = new THREE.BoxGeometry(MAP_W + 0.25, 0.20, MAP_D + 0.25);
      const baseMat = new THREE.MeshStandardMaterial({
        color: nightMode ? 0x020813 : 0x0b1728,
        roughness: 0.2,
        metalness: 0.8,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.105;
      group.add(baseMesh);

      // Glowing Base Edge Neon Rim
      const rimGeo = new THREE.EdgesGeometry(baseGeo);
      const rimMat = new THREE.LineBasicMaterial({
        color: nightMode ? 0x00e5ff : 0x0284c7,
        transparent: true,
        opacity: nightMode ? 0.65 : 0.35,
      });
      const rimLines = new THREE.LineSegments(rimGeo, rimMat);
      rimLines.position.copy(baseMesh.position);
      group.add(rimLines);

      // ── Animated Atmospheric Clouds ──
      const cloudGroup = new THREE.Group();
      const cloudGeo = new THREE.SphereGeometry(0.24, 8, 8);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: nightMode ? 0.18 : 0.35,
        roughness: 1,
      });
      for (let c = 0; c < 16; c++) {
        const cloud = new THREE.Mesh(cloudGeo, cloudMat);
        const cx = (Math.random() - 0.5) * (MAP_W * 0.85);
        const cz = (Math.random() - 0.5) * (MAP_D * 0.85);
        cloud.position.set(cx, 0.45 + Math.random() * 0.25, cz);
        cloud.scale.set(1.4 + Math.random() * 1.5, 0.3 + Math.random() * 0.2, 1 + Math.random() * 1.2);
        cloudGroup.add(cloud);
      }
      group.add(cloudGroup);

      // ── Destination Beacons & 3D Markers ──
      DESTINATIONS.forEach((dest) => {
        const beacon = new THREE.Group();
        (beacon as any).__destId = dest.id;
        (beacon as any).__phase = Math.random() * Math.PI * 2;

        const wx = (dest.nx - 0.5) * MAP_W;
        const wz = (dest.ny - 0.5) * MAP_D;
        const wy = heightfield(dest.nx, dest.ny) * 0.95;

        beacon.position.set(wx, wy, wz);
        (beacon as any).__baseY = wy;

        const col = new THREE.Color(dest.color);

        // Ground Radar Double Ripple Rings
        const ringGeo = new THREE.RingGeometry(0.04, 0.08, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.005;
        beacon.add(ring);
        (beacon as any).__ring = ring;

        // Vertical Laser Pillar Beam
        const beamH = 0.32;
        const beamGeo = new THREE.CylinderGeometry(0.005, 0.008, beamH, 8);
        const beamMat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.75,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = beamH / 2;
        beacon.add(beam);

        // Floating Diamond Gemstone Beacon Head
        const gemGeo = new THREE.OctahedronGeometry(dest.isGateway ? 0.065 : 0.085, 0);
        const gemMat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.9,
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.position.y = beamH + 0.06;
        beacon.add(gem);
        (beacon as any).__gem = gem;

        // Point light for ground illumination
        const pLight = new THREE.PointLight(dest.color, 0.8, 1.2);
        pLight.position.y = beamH + 0.05;
        beacon.add(pLight);

        group.add(beacon);
      });

      // ── Parabolic Travel Route Arcs ──
      const routeComets: any[] = [];
      ROUTES.forEach(([fromId, toId]) => {
        const from = DESTINATIONS.find((d) => d.id === fromId)!;
        const to = DESTINATIONS.find((d) => d.id === toId)!;

        const p1 = new THREE.Vector3(
          (from.nx - 0.5) * MAP_W,
          heightfield(from.nx, from.ny) * 0.95 + 0.15,
          (from.ny - 0.5) * MAP_D
        );
        const p2 = new THREE.Vector3(
          (to.nx - 0.5) * MAP_W,
          heightfield(to.nx, to.ny) * 0.95 + 0.15,
          (to.ny - 0.5) * MAP_D
        );

        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        mid.y += 0.38 + p1.distanceTo(p2) * 0.18;

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const pts = curve.getPoints(50);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0x06b6d4,
          dashSize: 0.07,
          gapSize: 0.045,
          transparent: true,
          opacity: 0.55,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        group.add(line);

        // Traveling pulse comet on curve
        const cometGeo = new THREE.SphereGeometry(0.022, 8, 8);
        const cometMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const comet = new THREE.Mesh(cometGeo, cometMat);
        (comet as any).__curve = curve;
        (comet as any).__progress = Math.random();
        (comet as any).__speed = 0.0035 + Math.random() * 0.002;
        group.add(comet);
        routeComets.push(comet);
      });

      setIsLoaded(true);

      // ── ANIMATION TICK LOOP ──
      let t = 0;
      function animate() {
        if (destroyed) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.015;

        // Momentum inertia — apply velocity and damp it each frame
        if (!isDraggingRef.current) {
          velRef.current.x *= 0.88;
          velRef.current.y *= 0.88;
          targetRotRef.current.x = Math.max(
            -1.35, Math.min(-0.15,
            targetRotRef.current.x + velRef.current.x)
          );
          targetRotRef.current.y += velRef.current.y;
        }

        // Smooth camera damping — snappier feel with 0.12
        rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.12;
        rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.12;
        zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.10;

        if (autoRotateRef.current && !isDraggingRef.current) {
          targetRotRef.current.y += 0.0008;
        }

        group.rotation.x = rotRef.current.x;
        group.rotation.y = rotRef.current.y;

        camera.position.set(0, zoomRef.current * 0.72, zoomRef.current);
        camera.lookAt(0, 0, 0);

        // Cloud slow drift
        cloudGroup.rotation.y += 0.0004;

        // Route comets movement
        routeComets.forEach((c) => {
          c.__progress += c.__speed;
          if (c.__progress > 1) c.__progress = 0;
          const pos = c.__curve.getPoint(c.__progress);
          c.position.copy(pos);
        });

        // Beacon pulsing & rotation
        group.children.forEach((child: any) => {
          if (child.__gem) {
            child.__gem.rotation.y += 0.03;
            child.__gem.rotation.x += 0.015;
            child.position.y =
              child.__baseY + Math.sin(t * 2 + child.__phase) * 0.012;
          }
          if (child.__ring) {
            const s = 1.0 + Math.sin(t * 3 + child.__phase) * 0.35;
            child.__ring.scale.set(s, s, 1);
            child.__ring.material.opacity =
              0.65 - Math.sin(t * 3 + child.__phase) * 0.3;
          }
        });

        renderer.render(scene, camera);
        updatePinOverlay(THREE, camera, group, renderer);
      }

      function updatePinOverlay(
        THREE: any,
        camera: any,
        group: any,
        renderer: any
      ) {
        const newPos: Record<string, { x: number; y: number; visible: boolean }> =
          {};
        const el = renderer.domElement;
        const w = el.clientWidth;
        const h = el.clientHeight;

        group.children.forEach((child: any) => {
          const id = child.__destId as string | undefined;
          if (!id) return;
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          worldPos.y += 0.42; // Above beacon gem
          const ndc = worldPos.clone().project(camera);
          const x = ((ndc.x + 1) / 2) * w;
          const y = ((-ndc.y + 1) / 2) * h;
          const visible = ndc.z < 1 && ndc.z > -1;
          newPos[id] = { x, y, visible };
        });
        setPinPositions(newPos);
      }

      animate();

      function onResize() {
        if (!mountRef.current || !rendererRef.current || !cameraRef.current)
          return;
        const W = mountRef.current.clientWidth;
        const H = mountRef.current.clientHeight;
        rendererRef.current.setSize(W, H);
        cameraRef.current.aspect = W / H;
        cameraRef.current.updateProjectionMatrix();
      }
      window.addEventListener('resize', onResize);

      // ── Mouse-wheel zoom ──
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.35 : -0.35;
        targetZoomRef.current = Math.max(2.4, Math.min(7.5, targetZoomRef.current + delta));
        scheduleAutoRotateResume();
      };
      mountRef.current?.addEventListener('wheel', handleWheel, { passive: false });

      // ── Keyboard shortcuts ──
      const handleKey = (e: KeyboardEvent) => {
        if (['INPUT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
        if (e.key === '=' || e.key === '+') {
          targetZoomRef.current = Math.max(2.4, targetZoomRef.current - 0.5);
        } else if (e.key === '-') {
          targetZoomRef.current = Math.min(7.5, targetZoomRef.current + 0.5);
        } else if (e.key === 'r' || e.key === 'R') {
          targetRotRef.current = { x: -0.42, y: 0.05 };
          targetZoomRef.current = 4.8;
          autoRotateRef.current = true;
        } else if (e.key === 'Escape') {
          setActiveId(null);
        }
      };
      window.addEventListener('keydown', handleKey);

      return () => {
        destroyed = true;
        cancelAnimationFrame(animFrameRef.current);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', handleKey);
        if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
        const mountEl = mountRef.current;
        mountEl?.removeEventListener('wheel', handleWheel);
        if (rendererRef.current && mountEl) {
          try { mountEl.removeChild(rendererRef.current.domElement); } catch {}
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
      };
    }

    init();
  }, [nightMode]);

  /* ─── Auto-rotate resume helper ─────────────────────────────────────────── */
  const scheduleAutoRotateResume = useCallback(() => {
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setTimeout(() => {
      autoRotateRef.current = true;
    }, 4000);
  }, []);

  /* ─── Pointer Drag & Orbit Controls ───────────────────────────────────────── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore multi-touch — handled by touch events
    if (e.pointerType === 'touch') return;
    isDraggingRef.current = true;
    autoRotateRef.current = false;
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
    velRef.current = { x: 0, y: 0 };
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || e.pointerType === 'touch') return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.005;
    // Store velocity for inertia
    velRef.current.y = dx * sensitivity;
    velRef.current.x = dy * sensitivity;

    targetRotRef.current.y += dx * sensitivity;
    targetRotRef.current.x = Math.max(
      -1.35,
      Math.min(-0.15, targetRotRef.current.x + dy * sensitivity)
    );
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    scheduleAutoRotateResume();
  }, [scheduleAutoRotateResume]);

  /* ─── Touch Pinch-to-Zoom ────────────────────────────────────────────────── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistRef.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      velRef.current = { x: 0, y: 0 };
      prevPointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDistRef.current !== null) {
        const delta = (lastPinchDistRef.current - dist) * 0.025;
        targetZoomRef.current = Math.max(2.4, Math.min(7.5, targetZoomRef.current + delta));
      }
      lastPinchDistRef.current = dist;
    } else if (e.touches.length === 1 && isDraggingRef.current) {
      const tdx = e.touches[0].clientX - prevPointerRef.current.x;
      const tdy = e.touches[0].clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const sensitivity = 0.005;
      velRef.current.y = tdx * sensitivity;
      velRef.current.x = tdy * sensitivity;
      targetRotRef.current.y += tdx * sensitivity;
      targetRotRef.current.x = Math.max(
        -1.35, Math.min(-0.15, targetRotRef.current.x + tdy * sensitivity)
      );
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    lastPinchDistRef.current = null;
    isDraggingRef.current = false;
    scheduleAutoRotateResume();
  }, [scheduleAutoRotateResume]);

  // Zoom controls
  const zoomIn = () => {
    targetZoomRef.current = Math.max(2.4, targetZoomRef.current - 0.6);
    autoRotateRef.current = false;
    scheduleAutoRotateResume();
  };
  const zoomOut = () => {
    targetZoomRef.current = Math.min(7.5, targetZoomRef.current + 0.6);
    scheduleAutoRotateResume();
  };
  const resetView = () => {
    targetRotRef.current = { x: -0.42, y: 0.05 };
    targetZoomRef.current = 4.8;
    velRef.current = { x: 0, y: 0 };
    setIs2DMode(false);
    autoRotateRef.current = true;
    setActiveId(null);
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
  };
  const toggle2D = () => {
    if (is2DMode) {
      targetRotRef.current.x = -0.42;
      setIs2DMode(false);
    } else {
      targetRotRef.current.x = -1.35;
      setIs2DMode(true);
    }
    autoRotateRef.current = false;
    scheduleAutoRotateResume();
  };

  // Fly Camera to Destination Focus
  const focusDestination = useCallback((dest: Destination) => {
    setActiveId(dest.id);
    autoRotateRef.current = false;
    velRef.current = { x: 0, y: 0 };
    // Center rotation smoothly towards destination
    const targetAngle = -(dest.nx - 0.5) * 1.2;
    targetRotRef.current.y = targetAngle;
    targetRotRef.current.x = -0.52;
    targetZoomRef.current = 3.2;
    scheduleAutoRotateResume();
  }, [scheduleAutoRotateResume]);

  return (
    <section className="relative py-20 overflow-hidden bg-slate-950 text-white selection:bg-cyan-500 selection:text-white">
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute -left-48 top-0 h-[600px] w-[600px] rounded-full blur-[140px]"
        style={{
          background: nightMode
            ? 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-48 bottom-0 h-[600px] w-[600px] rounded-full blur-[140px]"
        style={{
          background: nightMode
            ? 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="container relative z-10 max-w-[1400px]">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>{t('mapSection.badge', 'INTERACTIVE 3D EXPLORER')}</span>
          </div>

          <h2 className="mt-3.5 font-display text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            {t('mapSection.title', 'Discover Bangladesh in 3D')}{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              {t('mapSection.titleAccent', 'Real Topography')}
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Drag to orbit • Scroll / pinch to zoom • Click any glowing beacon to explore routes, photos & altitude details. Press <kbd className="rounded border border-white/20 bg-white/10 px-1 text-[10px] font-mono text-white/60">R</kbd> to reset.
          </p>
        </div>

        {/* ── 3D Canvas Stage Container ── */}
        <div className="relative mt-10 h-[580px] sm:h-[640px] md:h-[700px] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Top Left Interaction Hint */}
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-[11px] font-semibold text-white/70 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="hidden sm:inline">360° Drag to Orbit • Scroll to Zoom • Click Pin to Inspect</span>
            <span className="sm:hidden">Drag • Pinch • Tap</span>
          </div>

          {/* Top Right Tool Dock */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
            {/* Day / Night Mode Toggle */}
            <button
              onClick={() => setNightMode((v) => !v)}
              title={nightMode ? 'Switch to Daylight Satellite' : 'Switch to Night Luxe'}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-xs font-bold text-white/80 backdrop-blur-md transition hover:border-cyan-400 hover:text-white"
            >
              {nightMode ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Daylight</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Night Luxe</span>
                </>
              )}
            </button>

            {/* 3D / 2D Tilt Toggle */}
            <button
              onClick={toggle2D}
              title="Toggle Top-Down / 3D Tilt"
              className={`flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md transition ${
                is2DMode
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                  : 'border-white/15 bg-slate-900/80 text-white/70 hover:text-white'
              }`}
            >
              <Compass className="h-4 w-4" />
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center overflow-hidden rounded-xl border border-white/15 bg-slate-900/80 backdrop-blur-md">
              <button
                onClick={zoomIn}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center border-r border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={zoomOut}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center border-r border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={resetView}
                aria-label="Reset view"
                className="flex h-9 w-9 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── 3D Canvas Mount Point ── */}
          <div
            ref={(el) => { (mountRef as any).current = el; mountNodeRef.current = el; }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="h-full w-full cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
          />

          {/* ── Floating HTML 3D Pin Badges ── */}
          {DESTINATIONS.map((dest) => {
            const pos = pinPositions[dest.id];
            if (!pos || !pos.visible) return null;
            const isHovered = hoveredId === dest.id;
            const isActive = activeId === dest.id;

            return (
              <div
                key={dest.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: `translate(-50%, -100%) scale(${isActive ? 1.15 : isHovered ? 1.06 : 1})`,
                  pointerEvents: 'auto',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  zIndex: isActive ? 40 : isHovered ? 30 : 20,
                }}
              >
                <button
                  type="button"
                  onClick={() => focusDestination(dest)}
                  onMouseEnter={() => setHoveredId(dest.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  title={dest.name}
                  className={`group relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black shadow-lg backdrop-blur-md transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'border-white bg-white text-slate-900'
                      : isHovered
                      ? 'border-cyan-400 bg-slate-900/95 text-cyan-300'
                      : 'border-white/25 bg-slate-950/85 text-white/90 hover:border-white/50 hover:text-white'
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 0 20px ${dest.color}80, 0 4px 16px rgba(0,0,0,0.5)`
                      : isHovered
                      ? `0 0 14px ${dest.color}60`
                      : `0 4px 16px ${dest.color}30`,
                  }}
                >
                  {/* Colored dot */}
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: dest.color, boxShadow: `0 0 6px ${dest.color}` }}
                  />
                  <span className="max-w-[120px] truncate">{getDestName(dest)}</span>
                  {dest.price && !dest.isGateway && (
                    <span
                      className="hidden sm:inline rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ backgroundColor: `${dest.color}30`, color: dest.color }}
                    >
                      {dest.price.replace('From ', '')}
                    </span>
                  )}
                </button>
                {/* Connector tick */}
                <div
                  className="mx-auto mt-0.5 w-px"
                  style={{
                    height: 8,
                    background: `linear-gradient(to bottom, ${dest.color}80, transparent)`,
                  }}
                />
              </div>
            );
          })}

          {/* ── Bottom Left Geographic Key ── */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden sm:flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-slate-900/85 p-3 text-[11px] font-medium text-slate-400 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
              <span>Chittagong Hill Tracts &amp; Islands</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Sundarbans Mangrove Delta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span>Sylhet Highlands &amp; Haors</span>
            </div>
          </div>

          {/* ── Detailed Showcase Card on Active Selection ── */}
          <AnimatePresence>
            {activeDest && (
              <motion.div
                key={activeDest.id}
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute bottom-4 right-4 z-30 w-[92%] sm:w-[330px] md:w-[360px] overflow-hidden rounded-3xl border border-white/15 bg-slate-900/98 shadow-2xl backdrop-blur-2xl"
                style={{
                  boxShadow: `0 24px 60px -12px ${activeDest.color}45, 0 0 0 1px ${activeDest.color}20`,
                }}
              >
                {/* Photo Preview — taller for better visual impact */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeDest.image}
                    alt={activeDest.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    loading="eager"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                  {/* Close button */}
                  <button
                    onClick={() => setActiveId(null)}
                    aria-label="Close detail"
                    className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 backdrop-blur-md transition hover:bg-black hover:text-white hover:scale-110 active:scale-95"
                  >
                    ✕
                  </button>

                  {/* Altitude badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-md"
                      style={{ backgroundColor: activeDest.color }}
                    >
                      {activeDest.altitudeTag}
                    </span>
                    {activeDest.isGateway && (
                      <span className="rounded-full border border-sky-400/50 bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 backdrop-blur-md">
                        Gateway
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-4">
                  {/* Name + price row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold leading-tight text-white">
                        {getDestName(activeDest)}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">{getDestRegion(activeDest)}</p>
                    </div>
                    <span
                      className="flex-shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-extrabold"
                      style={{ backgroundColor: `${activeDest.color}20`, color: activeDest.color }}
                    >
                      {activeDest.price}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300 line-clamp-3">
                    {getDestDesc(activeDest)}
                  </p>

                  {/* Meta row */}
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-[11px]">
                    <div className="flex-1">
                      <p className="text-slate-500">Best Season</p>
                      <p className="font-semibold text-white">{activeDest.bestSeason}</p>
                    </div>
                    <div
                      className="h-6 w-px"
                      style={{ backgroundColor: `${activeDest.color}40` }}
                    />
                    <div className="flex-1">
                      <p className="text-slate-500">Altitude</p>
                      <p className="font-semibold text-white">{activeDest.altitudeTag}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`/tour-guide?to=${activeDest.id}`}
                      className="btn-primary flex-1 py-2.5 text-xs font-bold justify-center"
                    >
                      <span>A-Z Route Guide</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href="/packages"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-white/18 active:scale-95"
                    >
                      Tours
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Filter Pills Bar Beneath Map ── */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={resetView}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
              !activeId
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
            }`}
          >
            All Destinations
          </button>
          {DESTINATIONS.filter((d) => !d.isGateway).map((dest) => {
            const isActive = activeId === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => focusDestination(dest)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'scale-105 border-white bg-white text-slate-900 shadow-lg'
                    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        boxShadow: `0 0 16px ${dest.color}66`,
                      }
                    : {}
                }
              >
                {getDestName(dest)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
