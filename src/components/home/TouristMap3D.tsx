'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Navigation } from 'lucide-react';

/* ─── Destination data for Bangladesh ─────────────────────────────────────── */
interface Destination {
  id: string;
  name: string;
  region: string;
  price: string;
  description: string;
  color: string;
  nx: number; // normalised X position [0-1]
  ny: number; // normalised Z position [0-1]
  elevation: number; // terrain height factor [0-1]
  isGateway?: boolean;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'saint-martin',
    name: 'Saint Martin',
    region: "Bangladesh's coral island",
    price: 'From ৳4,499',
    description: 'Pristine coral beaches & turquoise waters of the Bay of Bengal',
    color: '#06b6d4',
    nx: 0.72, ny: 0.80, elevation: 0.04,
  },
  {
    id: 'coxs-bazar',
    name: "Cox's Bazar",
    region: 'World\'s longest sea beach',
    price: 'From ৳2,999',
    description: '120 km unbroken sandy beach & seafront sunsets — perfect coastal escape',
    color: '#f59e0b',
    nx: 0.63, ny: 0.72, elevation: 0.07,
    isGateway: true,
  },
  {
    id: 'bandarban',
    name: 'Bandarban',
    region: 'Hill District',
    price: 'From ৳5,499',
    description: 'Lush jungle trails, Buddhist monasteries, Boga Lake & Keokradong peak',
    color: '#10b981',
    nx: 0.53, ny: 0.55, elevation: 0.60,
  },
  {
    id: 'rangamati',
    name: 'Rangamati',
    region: 'Lake & Hill District',
    price: 'From ৳3,999',
    description: 'Serene Kaptai Lake, tribal culture & iconic hanging bridge',
    color: '#8b5cf6',
    nx: 0.61, ny: 0.47, elevation: 0.44,
  },
  {
    id: 'khagrachhari',
    name: 'Khagrachhari',
    region: 'Hill District',
    price: 'From ৳3,499',
    description: 'Alutila mystery cave, misty mountain peaks & hidden waterfalls',
    color: '#ec4899',
    nx: 0.46, ny: 0.43, elevation: 0.50,
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    region: 'Tea Garden Region',
    price: 'From ৳3,799',
    description: 'Rolling emerald tea estates, Ratargul swamp forest & Jaflong stones',
    color: '#84cc16',
    nx: 0.74, ny: 0.30, elevation: 0.26,
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans',
    region: 'Mangrove Delta',
    price: 'From ৳6,999',
    description: "World's largest mangrove forest, home of the Royal Bengal Tiger",
    color: '#14b8a6',
    nx: 0.20, ny: 0.65, elevation: 0.03,
  },
  {
    id: 'srimangal',
    name: 'Srimangal',
    region: 'Tea Capital',
    price: 'From ৳2,799',
    description: 'Famous seven-layer tea, Lawachara rainforest & rare bird watching',
    color: '#a78bfa',
    nx: 0.66, ny: 0.39, elevation: 0.19,
  },
  {
    id: 'sajek',
    name: 'Sajek Valley',
    region: 'Cloud Valley',
    price: 'From ৳4,299',
    description: 'Floating above the clouds at sunrise — Ruilui Para & trekking bliss',
    color: '#fb7185',
    nx: 0.55, ny: 0.34, elevation: 0.74,
  },
  {
    id: 'dhaka',
    name: 'Dhaka',
    region: 'Capital Gateway',
    price: 'Gateway hub',
    description: 'Central departure hub connecting all Bangladesh tour routes',
    color: '#64748b',
    nx: 0.44, ny: 0.60, elevation: 0.03,
    isGateway: true,
  },
];

const ROUTES: [string, string][] = [
  ['dhaka', 'coxs-bazar'],
  ['dhaka', 'bandarban'],
  ['dhaka', 'sylhet'],
  ['dhaka', 'sundarbans'],
  ['coxs-bazar', 'saint-martin'],
  ['coxs-bazar', 'bandarban'],
  ['bandarban', 'rangamati'],
  ['rangamati', 'khagrachhari'],
  ['sylhet', 'srimangal'],
  ['srimangal', 'sajek'],
];

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function TouristMap3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: -0.38, y: 0 });
  const autoRotateRef = useRef(true);
  const zoomRef = useRef(5.0);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pinPositions, setPinPositions] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});

  const activeDest = DESTINATIONS.find((d) => d.id === activeId);

  useEffect(() => {
    if (!mountRef.current) return;
    let destroyed = false;
    let THREE: any;

    async function init() {
      THREE = await import('three');
      if (destroyed || !mountRef.current) return;

      const W = mountRef.current.clientWidth;
      const H = mountRef.current.clientHeight;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x060d1a, 0.048);

      // Camera
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.set(0, zoomRef.current * 0.65, zoomRef.current);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Lighting
      scene.add(new THREE.AmbientLight(0x1a2a4a, 1.5));

      const sun = new THREE.DirectionalLight(0x7dd3fc, 2.8);
      sun.position.set(4, 9, 5);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      scene.add(sun);

      const rim = new THREE.DirectionalLight(0x0ea5e9, 0.7);
      rim.position.set(-6, 2, -4);
      scene.add(rim);

      const fillLight = new THREE.PointLight(0x06b6d4, 0.9, 20);
      fillLight.position.set(0, 3, 0);
      scene.add(fillLight);

      // Group for terrain + pins (rotated by drag)
      const group = new THREE.Group();
      group.rotation.x = rotRef.current.x;
      scene.add(group);
      groupRef.current = group;

      // Build terrain
      buildTerrain(THREE, group);

      // Build pins
      DESTINATIONS.forEach((dest) => {
        const pinGroup = buildPin(THREE, dest);
        group.add(pinGroup);
      });

      // Build routes
      buildRoutes(THREE, group);

      // Stars
      buildParticles(THREE, scene);

      // Animation loop
      let t = 0;
      function animate() {
        if (destroyed) return;
        animFrameRef.current = requestAnimationFrame(animate);
        t += 0.008;

        if (autoRotateRef.current) {
          rotRef.current.y += 0.0012;
        }

        group.rotation.x = rotRef.current.x;
        group.rotation.y = rotRef.current.y;

        fillLight.intensity = 0.7 + Math.sin(t * 1.5) * 0.2;

        // Pin floating animation
        group.children.forEach((child: any) => {
          if (child.__isPinGroup) {
            child.position.y = child.__baseY + Math.sin(t * 2.2 + child.__phase) * 0.018;
            // Pulsing glow
            if (child.__sphere) {
              child.__sphere.material.emissiveIntensity = 0.6 + Math.sin(t * 3 + child.__phase) * 0.3;
            }
            // Ripple ring scale
            if (child.__ring) {
              const s = 1 + Math.sin(t * 2.5 + child.__phase) * 0.25;
              child.__ring.scale.set(s, s, 1);
              child.__ring.material.opacity = 0.5 - Math.sin(t * 2.5 + child.__phase) * 0.2;
            }
          }
        });

        // Animate route dashes
        group.children.forEach((child: any) => {
          if (child.__isRoute) {
            const mat = child.material;
            mat.dashSize = 0.06 + Math.sin(t * 0.8) * 0.01;
          }
        });

        updatePinOverlayPositions(THREE, camera, group, renderer);
        renderer.render(scene, camera);
      }
      animate();
      setIsLoaded(true);
    }

    function buildTerrain(THREE: any, group: any) {
      const W = 5.2, D = 5.2;
      const SEG = 100;

      const geo = new THREE.PlaneGeometry(W, D, SEG, SEG);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const nx = x / (W / 2);
        const nz = z / (D / 2);

        const dist = Math.sqrt(nx * nx + nz * nz);
        const falloff = Math.max(0, 1 - dist * 0.82);

        let h = 0;
        // Octave 1: large hills
        h += Math.sin(nx * 3.8 + 0.4) * Math.cos(nz * 3.5 + 0.9) * 0.58;
        // Octave 2: medium ridges
        h += Math.sin(nx * 7.8 + 1.1) * Math.cos(nz * 6.9 + 0.4) * 0.24;
        // Octave 3: small terrain detail
        h += Math.sin(nx * 14 + 1.8) * Math.cos(nz * 12 + 1.0) * 0.10;
        // Octave 4: micro-detail
        h += Math.sin(nx * 28) * Math.cos(nz * 26) * 0.035;
        h *= falloff;
        h = Math.max(h, -0.06);

        pos.setY(i, h);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();

      // Vertex colours by height
      const colors: number[] = [];
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        let r: number, g: number, b: number;
        if (y < -0.02) {
          // deep water
          r = 0.02; g = 0.10; b = 0.26;
        } else if (y < 0.04) {
          // shallow water / coast
          r = 0.03; g = 0.20; b = 0.32;
        } else if (y < 0.12) {
          // lowland forest
          r = 0.04; g = 0.24; b = 0.24;
        } else if (y < 0.28) {
          // mid hills
          r = 0.06; g = 0.22; b = 0.36;
        } else if (y < 0.46) {
          // high mountain
          r = 0.10; g = 0.20; b = 0.44;
        } else {
          // snow / peak
          r = 0.65; g = 0.78; b = 0.92;
        }
        colors.push(r, g, b);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true,
        shininess: 22,
        flatShading: false,
      });

      const terrain = new THREE.Mesh(geo, mat);
      terrain.receiveShadow = true;
      group.add(terrain);

      // Water base plane
      const waterGeo = new THREE.PlaneGeometry(W + 1.5, D + 1.5);
      waterGeo.rotateX(-Math.PI / 2);
      const waterMat = new THREE.MeshPhongMaterial({
        color: 0x0a1f3a,
        transparent: true,
        opacity: 0.82,
        shininess: 65,
        specular: 0x0ea5e9,
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.y = -0.01;
      group.add(water);
    }

    function buildPin(THREE: any, dest: Destination): any {
      const pinGroup = new THREE.Group();
      pinGroup.__isPinGroup = true;
      pinGroup.__phase = Math.random() * Math.PI * 2;
      pinGroup.__destId = dest.id;

      const wx = (dest.nx - 0.5) * 4.8;
      const wz = (dest.ny - 0.5) * 4.8;
      const wy = dest.elevation * 0.65 + 0.06;
      pinGroup.position.set(wx, wy, wz);
      pinGroup.__baseY = wy;

      const col = new THREE.Color(dest.color);

      // Main sphere
      const sphereGeo = new THREE.SphereGeometry(dest.isGateway ? 0.045 : 0.058, 16, 16);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.65,
        shininess: 90,
        transparent: true,
        opacity: 0.95,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      pinGroup.add(sphere);
      pinGroup.__sphere = sphere;

      // Pole
      const poleH = 0.16;
      const poleGeo = new THREE.CylinderGeometry(0.004, 0.006, poleH, 6);
      const poleMat = new THREE.MeshBasicMaterial({
        color: dest.color,
        transparent: true,
        opacity: 0.55,
      });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = -(poleH / 2 + 0.06);
      pinGroup.add(pole);

      // Point light glow
      const light = new THREE.PointLight(dest.color, 0.45, 0.9);
      pinGroup.add(light);

      // Ripple ring on ground
      const ringGeo = new THREE.RingGeometry(0.06, 0.085, 28);
      const ringMat = new THREE.MeshBasicMaterial({
        color: dest.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.38,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -(poleH + 0.07);
      pinGroup.add(ring);
      pinGroup.__ring = ring;

      return pinGroup;
    }

    function buildRoutes(THREE: any, group: any) {
      ROUTES.forEach(([fromId, toId]) => {
        const from = DESTINATIONS.find((d) => d.id === fromId)!;
        const to = DESTINATIONS.find((d) => d.id === toId)!;

        const p1 = new THREE.Vector3(
          (from.nx - 0.5) * 4.8,
          from.elevation * 0.65 + 0.1,
          (from.ny - 0.5) * 4.8,
        );
        const p2 = new THREE.Vector3(
          (to.nx - 0.5) * 4.8,
          to.elevation * 0.65 + 0.1,
          (to.ny - 0.5) * 4.8,
        );
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        mid.y += 0.28;

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const points = curve.getPoints(45);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineDashedMaterial({
          color: 0x06b6d4,
          dashSize: 0.065,
          gapSize: 0.04,
          transparent: true,
          opacity: 0.48,
        });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        (line as any).__isRoute = true;
        group.add(line);
      });
    }

    function buildParticles(THREE: any, scene: any) {
      const count = 700;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = Math.random() * 7 + 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.022,
        transparent: true,
        opacity: 0.5,
      });
      scene.add(new THREE.Points(geo, mat));
    }

    function updatePinOverlayPositions(THREE: any, camera: any, group: any, renderer: any) {
      const newPos: Record<string, { x: number; y: number; visible: boolean }> = {};
      const el = renderer.domElement;
      const w = el.clientWidth;
      const h = el.clientHeight;

      group.children.forEach((child: any) => {
        const id = child.__destId as string | undefined;
        if (!id) return;
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        const ndc = worldPos.clone().project(camera);
        const x = ((ndc.x + 1) / 2) * w;
        const y = ((-ndc.y + 1) / 2) * h;
        const visible = ndc.z < 1 && ndc.z > -1;
        newPos[id] = { x, y, visible };
      });
      setPinPositions(newPos);
    }

    init();

    function onResize() {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const W = mountRef.current.clientWidth;
      const H = mountRef.current.clientHeight;
      rendererRef.current.setSize(W, H);
      cameraRef.current.aspect = W / H;
      cameraRef.current.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    return () => {
      destroyed = true;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      if (rendererRef.current && mountRef.current) {
        try { mountRef.current.removeChild(rendererRef.current.domElement); } catch {}
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  /* ─── Drag controls ──────────────────────────────────────────────────── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    autoRotateRef.current = false;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    rotRef.current.y += dx * 0.007;
    rotRef.current.x = Math.max(-0.75, Math.min(-0.04, rotRef.current.x + dy * 0.004));
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(2.5, Math.min(8.5, zoomRef.current + e.deltaY * 0.005));
    if (cameraRef.current) {
      cameraRef.current.position.set(0, zoomRef.current * 0.65, zoomRef.current);
    }
  }, []);

  const zoomIn = () => {
    zoomRef.current = Math.max(2.5, zoomRef.current - 0.6);
    if (cameraRef.current) cameraRef.current.position.set(0, zoomRef.current * 0.65, zoomRef.current);
  };
  const zoomOut = () => {
    zoomRef.current = Math.min(8.5, zoomRef.current + 0.6);
    if (cameraRef.current) cameraRef.current.position.set(0, zoomRef.current * 0.65, zoomRef.current);
  };
  const resetView = () => {
    rotRef.current = { x: -0.38, y: 0 };
    zoomRef.current = 5.0;
    if (cameraRef.current) cameraRef.current.position.set(0, zoomRef.current * 0.65, zoomRef.current);
    autoRotateRef.current = true;
    setActiveId(null);
    setFilterActive(null);
  };

  return (
    <section className="relative w-full bg-[#060d1a] py-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-60 w-60 rounded-full bg-sky-500/6 blur-[100px]" />
      </div>

      {/* Section header */}
      <div className="relative z-10 mx-auto mb-10 max-w-7xl px-5 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Navigation className="h-3.5 w-3.5" />
            Interactive 3D Explorer
          </span>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl md:text-[2.8rem]">
            Discover{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Bangladesh
            </span>{' '}
            in 3D
          </h2>
          <p className="max-w-lg text-sm text-white/50 leading-relaxed">
            Rotate the terrain · Scroll to zoom · Tap a glowing pin to unlock tour details
          </p>
        </motion.div>
      </div>

      {/* 3D canvas wrapper */}
      <div className="relative mx-auto max-w-7xl px-5 sm:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#060d1a] shadow-[0_0_80px_-20px_rgba(6,182,212,0.3),0_0_0_1px_rgba(6,182,212,0.06)]"
          style={{ height: 'clamp(440px, 62vh, 640px)' }}
        >
          {/* Drag hint */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/12 bg-black/55 px-3.5 py-1.5 text-[11px] font-semibold text-white/55 backdrop-blur-md">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            Drag to rotate · Tap a pin
          </div>

          {/* Three.js canvas mount */}
          <div
            ref={mountRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          />

          {/* Loading spinner */}
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#060d1a]"
              >
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-transparent animate-spin" />
                </div>
                <p className="text-xs font-semibold text-white/35 tracking-wider uppercase">
                  Building 3D terrain…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HTML pin label overlays */}
          {DESTINATIONS.map((dest) => {
            const pos = pinPositions[dest.id];
            if (!pos || !pos.visible) return null;
            const isActive = activeId === dest.id;
            const isHovered = hoveredId === dest.id;

            return (
              <button
                key={dest.id}
                id={`map-pin-${dest.id}`}
                onClick={() => setActiveId(isActive ? null : dest.id)}
                onMouseEnter={() => { setHoveredId(dest.id); autoRotateRef.current = false; }}
                onMouseLeave={() => setHoveredId(null)}
                className="absolute z-20 -translate-x-1/2 -translate-y-full focus:outline-none"
                style={{ left: pos.x, top: pos.y - 14 }}
                aria-label={`View details for ${dest.name}`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.05 : isHovered ? 0.98 : 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="flex flex-col items-center gap-0"
                >
                  {/* Tooltip card */}
                  <AnimatePresence>
                    {(isActive || isHovered) && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92 }}
                        transition={{ duration: 0.18 }}
                        className="mb-1.5 min-w-[145px] max-w-[185px] rounded-xl border bg-black/88 px-3 py-2 text-left backdrop-blur-xl shadow-2xl"
                        style={{ borderColor: dest.color + '50' }}
                      >
                        <p className="text-[11px] font-black leading-tight" style={{ color: dest.color }}>
                          {dest.name}
                        </p>
                        <p className="text-[10px] text-white/50 leading-snug">{dest.region}</p>
                        {!dest.isGateway && (
                          <p className="mt-0.5 text-[10px] font-bold" style={{ color: dest.color }}>
                            {dest.price}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pin dot */}
                  <motion.div
                    animate={{
                      boxShadow: isActive
                        ? `0 0 16px 4px ${dest.color}80`
                        : isHovered
                        ? `0 0 10px 2px ${dest.color}60`
                        : `0 0 5px 1px ${dest.color}40`,
                    }}
                    className="h-3 w-3 rounded-full ring-2 ring-black/60"
                    style={{ backgroundColor: dest.color }}
                  />
                </motion.div>
              </button>
            );
          })}

          {/* Active destination detail panel */}
          <AnimatePresence>
            {activeDest && (
              <motion.div
                key={activeDest.id}
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-5 right-5 z-20 w-60 rounded-2xl border bg-black/90 p-4 backdrop-blur-xl shadow-2xl"
                style={{ borderColor: activeDest.color + '40' }}
              >
                {/* Header */}
                <div className="mb-3 flex items-start gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: activeDest.color + '20' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: activeDest.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-tight">{activeDest.name}</p>
                    <p className="text-[10px] text-white/45 leading-tight">{activeDest.region}</p>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-white/60">{activeDest.description}</p>

                {!activeDest.isGateway && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40">Starting from</span>
                      <span className="text-sm font-black" style={{ color: activeDest.color }}>
                        {activeDest.price}
                      </span>
                    </div>
                    <a
                      href="/packages"
                      className="block w-full rounded-xl py-2 text-center text-[11px] font-black text-white transition hover:brightness-110 hover:-translate-y-0.5"
                      style={{ backgroundColor: activeDest.color + 'cc' }}
                    >
                      View Packages →
                    </a>
                  </div>
                )}

                <button
                  onClick={() => setActiveId(null)}
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-white/40 hover:bg-white/18 hover:text-white transition text-[9px]"
                  aria-label="Close panel"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom / reset controls */}
          <div className="absolute right-5 top-5 z-20 flex flex-col gap-2">
            {[
              { id: 'zoom-in', Icon: ZoomIn, onClick: zoomIn, label: 'Zoom in' },
              { id: 'zoom-out', Icon: ZoomOut, onClick: zoomOut, label: 'Zoom out' },
              { id: 'reset-view', Icon: RotateCcw, onClick: resetView, label: 'Reset view' },
            ].map(({ id, Icon, onClick, label }) => (
              <button
                key={id}
                id={id}
                onClick={onClick}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-black/65 text-white/55 backdrop-blur-md transition hover:bg-white/15 hover:text-white hover:border-white/25 active:scale-95"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-5 left-5 z-20 flex flex-col gap-1.5 text-[10px] text-white/40">
            <span className="flex items-center gap-2">
              <span className="inline-flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="inline-block h-px w-2 rounded-full bg-cyan-500/60" />
                ))}
              </span>
              Popular routes
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              Destinations
            </span>
          </div>
        </motion.div>

        {/* Destination filter dock */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.25 }}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          <button
            id="filter-all"
            onClick={() => { setFilterActive(null); setActiveId(null); autoRotateRef.current = true; }}
            className={`rounded-full border px-4 py-2 text-[11px] font-bold transition-all ${
              !filterActive
                ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-400 shadow-[0_0_12px_-4px_rgba(6,182,212,0.4)]'
                : 'border-white/12 bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/75'
            }`}
          >
            All Destinations
          </button>
          {DESTINATIONS.filter((d) => !d.isGateway).map((dest) => (
            <button
              key={dest.id}
              id={`filter-${dest.id}`}
              onClick={() => {
                const next = filterActive === dest.id ? null : dest.id;
                setFilterActive(next);
                setActiveId(next);
                autoRotateRef.current = false;
              }}
              className="rounded-full border px-4 py-2 text-[11px] font-bold transition-all"
              style={
                filterActive === dest.id
                  ? {
                      backgroundColor: dest.color + '22',
                      borderColor: dest.color + '70',
                      color: dest.color,
                      boxShadow: `0 0 14px -4px ${dest.color}55`,
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.45)',
                    }
              }
            >
              {dest.name}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
