'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

declare const Globe: (...args: unknown[]) => unknown;

interface GlobeInstance {
  backgroundColor: (c: string) => GlobeInstance;
  atmosphereColor: (c: string) => GlobeInstance;
  atmosphereAltitude: (n: number) => GlobeInstance;
  globeImageUrl: (u: string) => GlobeInstance;
  bumpImageUrl: (u: string) => GlobeInstance;
  htmlElementsData: (d: unknown[]) => GlobeInstance;
  htmlLat: (k: string) => GlobeInstance;
  htmlLng: (k: string) => GlobeInstance;
  htmlAltitude: (n: number) => GlobeInstance;
  htmlElement: (f: (d: MarkerDatum) => HTMLElement) => GlobeInstance;
  globeMaterial: () => { bumpScale: number };
  pointOfView: (pov: { lat: number; lng: number; altitude: number }, ms: number) => void;
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
  };
  width: (w: number) => GlobeInstance;
  height: (h: number) => GlobeInstance;
}

interface MarkerDatum {
  idx: number;
  lat: number;
  lng: number;
  name: string;
  isActive: boolean;
}

const SLOVAKIA = { lat: 48.1486, lng: 17.1077 };

interface City {
  /** Region label shown above the title (the small uppercase eyebrow). */
  name: string;
  /** Latitude — where the pin and camera-focus point sit. */
  lat: number;
  /** Longitude. */
  lng: number;
  /** Business / office name shown as the big title. */
  business: string;
  /** Short narrative paragraph that opens the card body. */
  desc: string;
  /** Camera altitude when this city is focused. Smaller = closer/zoomed in. */
  altitude: number;
}

// Edit any field below — the panel and the globe focus update automatically.
const CITIES: City[] = [
  { name: 'Beijing',    lat: 39.9042, lng: 116.4074, altitude: 1.7, business: 'Tabernam Beijing Office',         desc: "Where every meaningful negotiation eventually leads. Beijing's rhythm is patient, hierarchical, and rewards relationships built over decades — not deals built overnight." },
  { name: 'Shanghai',   lat: 31.2304, lng: 121.4737, altitude: 1.7, business: 'Pudong Negotiation Hub',          desc: 'The skyline that announced modern China to the world. Pudong has been the setting for some of the most consequential negotiations of my career — fast, formal, and unforgiving of unprepared visitors.' },
  { name: 'Guangzhou',  lat: 23.1291, lng: 113.2644, altitude: 1.0, business: 'Pearl River Trade Center',        desc: "Centuries of merchant trading heritage compressed into one city. Deals here move quickly, but only after the people across the table have decided you're worth their time." },
  { name: 'Shenzhen',   lat: 22.5429, lng: 114.0596, altitude: 0.1, business: 'Shenzhen Innovation Partners',    desc: 'Innovation acceleration engine of the south. Shenzhen demands sustained engagement — partners here remember who showed up early and who stayed.' },
  { name: 'Chengdu',    lat: 30.5728, lng: 104.0668, altitude: 1.7, business: 'Western China Liaison',           desc: 'Patient relationship-building in western China. Business in Chengdu unfolds over tea, meals and long walks — never slide decks.' },
  { name: 'Chongqing',  lat: 29.5630, lng: 106.5516, altitude: 1.7, business: 'Yangtze Industrial Bureau',       desc: 'A mountain-and-river crossroads where industrial scale meets old-world bargaining instincts. Few visitors leave without changing their view of inland China.' },
  { name: "Xi'an",      lat: 34.3416, lng: 108.9398, altitude: 1.7, business: 'Silk Road Heritage Office',       desc: "Silk Road heritage anchors every conversation here. Xi'an reminds you that trade between Europe and Asia is older than most national borders." },
  { name: 'Wuhan',      lat: 30.5928, lng: 114.3055, altitude: 1.7, business: 'Central Logistics Group',         desc: "Central China's manufacturing heart. Deals in Wuhan favour those who understand logistics as deeply as relationships." },
  { name: 'Hangzhou',   lat: 30.2741, lng: 120.1551, altitude: 1.7, business: 'West Lake Enterprise Lab',        desc: "Incubator of national-scale private enterprise. The lake city quietly produced China's most consequential consumer-tech founders." },
  { name: 'Tianjin',    lat: 39.3434, lng: 117.3616, altitude: 0.1, business: 'Bohai Port Office',               desc: "Beijing's port and rehearsal stage. Many strategic conversations begin in Tianjin before they ever reach the capital." },
  { name: 'Nanjing',    lat: 32.0603, lng: 118.7969, altitude: 1.7, business: 'Yangtze Capital Office',          desc: 'Old capital, deep institutions. Nanjing teaches you the difference between ceremony and substance.' },
  { name: 'Harbin',     lat: 45.8038, lng: 126.5340, altitude: 1.7, business: 'Northern Frontier Office',        desc: 'Far-northern gateway to Russia. Cross-border trade here keeps the European-Asian bridge concrete and current.' },
  { name: 'Shenyang',   lat: 41.8057, lng: 123.4315, altitude: 1.7, business: 'Northeast Heavy Industry Hub',    desc: 'Heavy industry heartland. Northeastern factories that powered three generations of growth are now reinventing themselves.' },
  { name: 'Kunming',    lat: 25.0389, lng: 102.7183, altitude: 1.7, business: 'Southwest Gateway Office',        desc: 'Gateway to Southeast Asia. Decisions reached in Kunming ripple south into Laos, Vietnam and Myanmar within weeks.' },
  { name: 'Lhasa',      lat: 29.6520, lng:  91.1721, altitude: 1.7, business: 'High-Plateau Mission',            desc: 'The highest, slowest negotiations on earth. Lhasa rewards reverence and patience above any other quality.' },
  { name: 'Urumqi',     lat: 43.8256, lng:  87.6168, altitude: 1.7, business: 'Westernmost Trade Office',        desc: 'Westernmost frontier, where modern logistics still pass through centuries-old trade corridors.' },
  { name: 'Lanzhou',    lat: 36.0611, lng: 103.8343, altitude: 1.7, business: 'Silk Road Pivot Office',          desc: "The pivot point on the Silk Road. From Lanzhou, China's reach genuinely extends west." },
  { name: 'Qingdao',    lat: 36.0671, lng: 120.3826, altitude: 1.7, business: 'Coastal Manufacturing Office',    desc: "European industrial DNA, Asian execution. Qingdao's port and brewing history quietly shaped global manufacturing standards." },
  { name: 'Hong Kong',  lat: 22.3193, lng: 114.1694, altitude: 0.1, business: 'Pearl Delta Mediation',           desc: 'The bridge that taught the rest of the country how to negotiate with the West — and still the room where the most discreet conversations happen.' },
  { name: 'Xiamen',     lat: 24.4798, lng: 118.0894, altitude: 2.0, business: 'Strait Trade Office',             desc: 'Quiet southern port with deep ties to Taiwan and Southeast Asia. Subtle, careful, and lucrative for those who learn its rhythms.' },
];

const ALL_PHOTOS = Array.from({ length: 28 }, (_, i) =>
  `/carousel/photo-${String(i + 1).padStart(2, '0')}.jpg`,
);

function pickRandom(n: number): string[] {
  return ALL_PHOTOS.slice().sort(() => Math.random() - 0.5).slice(0, n);
}

export default function GlobeActivitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const controlsRef = useRef<ReturnType<GlobeInstance['controls']> | null>(null);
  const globeReadyRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  // One stable set of 5 photos per city.
  const cardsPhotos = useMemo(() => CITIES.map(() => pickRandom(5)), []);

  function buildPoints(activeIdxLocal: number | null): MarkerDatum[] {
    return CITIES.map((d, i) => ({
      idx: i,
      lat: d.lat,
      lng: d.lng,
      name: d.business,
      isActive: i === activeIdxLocal,
    }));
  }

  function initGlobe() {
    const container = globeContainerRef.current;
    if (!container || typeof Globe !== 'function') return;
    if (globeReadyRef.current) return;
    globeReadyRef.current = true;

    const globe = (Globe() as (el: HTMLElement) => GlobeInstance)(container)
      .backgroundColor('rgba(0,0,0,0)')
      .atmosphereColor('#6db4ff')
      .atmosphereAltitude(0.22)
      .globeImageUrl('/earth-blue-marble.jpg')
      .bumpImageUrl('/globe-topology.png')
      .htmlElementsData([])               // intro state shows no pins
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.012)
      .htmlElement((d: MarkerDatum) => {
        const el = document.createElement('div');
        el.className = 'globe-marker' + (d.isActive ? ' is-active' : '');
        el.innerHTML = '<div class="globe-marker-shape"></div>';
        el.addEventListener('mouseenter', () => {
          // setState directly via closure won't see latest; dispatch a custom event
          el.dispatchEvent(new CustomEvent('cityhover', { detail: d.idx, bubbles: true }));
        });
        return el;
      });

    globe.globeMaterial().bumpScale = 5;
    globe.pointOfView({ lat: SLOVAKIA.lat, lng: SLOVAKIA.lng, altitude: 2.2 }, 0);

    const ctrl = globe.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.3;
    ctrl.enableZoom = false;

    globeRef.current = globe;
    controlsRef.current = ctrl;

    function resize() {
      globe.width(window.innerWidth).height(window.innerHeight);
    }
    resize();
    window.addEventListener('resize', resize);
  }

  // Listen for marker hover events bubbling from the globe markers.
  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (typeof idx === 'number') {
        setActiveIdx(idx);
        setPhotoIdx(0);
      }
    };
    container.addEventListener('cityhover', handler as EventListener);
    return () => container.removeEventListener('cityhover', handler as EventListener);
  }, []);

  // Sync globe with active city + open state. No pins in intro state.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (!isOpen) {
      globe.htmlElementsData([]);
      return;
    }
    globe.htmlElementsData(buildPoints(activeIdx));
    if (activeIdx !== null) {
      const c = CITIES[activeIdx];
      globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: c.altitude }, 1200);
    }
  }, [activeIdx, isOpen]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = !isOpen;
  }, [isOpen]);

  // Lock body scroll when detail panel is open.
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Auto-rotate carousel every 2s when panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => {
      setPhotoIdx((p) => (p + 1) % 5);
    }, 2000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  // Reset carousel when active city changes.
  useEffect(() => {
    setPhotoIdx(0);
  }, [activeIdx]);

  // Stars animation (port from globe-ver-3.html, but draws into a canvas
  // that is absolutely positioned inside the section so it scrolls with the page).
  useEffect(() => {
    const canvas = starsRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LAYERS = [
      { density: 9600, speed: 0.0010, sizeMin: 0.3, sizeMax: 0.7, alphaMin: 0.06, alphaMax: 0.18, brightChance: 0.0 },
      { density: 14400, speed: 0.0040, sizeMin: 0.5, sizeMax: 1.0, alphaMin: 0.14, alphaMax: 0.32, brightChance: 0.02 },
      { density: 28000, speed: 0.0080, sizeMin: 0.8, sizeMax: 1.6, alphaMin: 0.28, alphaMax: 0.55, brightChance: 0.12 },
    ];

    let tileW = 0;
    let tileH = 0;
    let last = performance.now();
    let layers: Array<{ tile: HTMLCanvasElement; speed: number; offset: number }> = [];
    let rafId = 0;

    function buildLayer(layer: typeof LAYERS[number], dpr: number) {
      const count = Math.floor((tileW * tileH) / layer.density);
      const tile = document.createElement('canvas');
      tile.width = tileW;
      tile.height = tileH;
      const tctx = tile.getContext('2d');
      if (!tctx) return { tile, speed: layer.speed, offset: 0 };
      for (let i = 0; i < count; i++) {
        const bright = Math.random() < layer.brightChance;
        const x = Math.random() * tileW;
        const y = Math.random() * tileH;
        const r = (layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin)) * dpr * (bright ? 1.6 : 1);
        const a = (layer.alphaMin + Math.random() * (layer.alphaMax - layer.alphaMin)) * (bright ? 1 : 0.85);
        const tint = bright && Math.random() < 0.25 ? 'rgba(150,175,210,' : 'rgba(180,195,215,';
        for (const dx of [0, -tileW, tileW]) {
          tctx.beginPath();
          tctx.fillStyle = tint + a + ')';
          tctx.arc(x + dx, y, r, 0, Math.PI * 2);
          tctx.fill();
        }
      }
      return { tile, speed: layer.speed, offset: Math.random() * tileW };
    }

    function seed() {
      const dpr = window.devicePixelRatio || 1;
      const w = section!.offsetWidth * dpr;
      const h = section!.offsetHeight * dpr;
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = section!.offsetWidth + 'px';
      canvas!.style.height = section!.offsetHeight + 'px';
      tileW = w * 2;
      tileH = h;
      layers = LAYERS.map((l) => buildLayer(l, dpr));
    }

    function tick(now: number) {
      const dt = now - last;
      last = now;
      ctx!.fillStyle = '#000';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      for (const L of layers) {
        const pxPerMs = (canvas!.width * L.speed) / 1000;
        L.offset = (L.offset + dt * pxPerMs) % tileW;
        ctx!.drawImage(L.tile, -L.offset, 0);
        ctx!.drawImage(L.tile, -L.offset + tileW, 0);
      }
      rafId = requestAnimationFrame(tick);
    }

    seed();
    rafId = requestAnimationFrame(tick);
    const onResize = () => seed();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const activeCity = activeIdx !== null ? CITIES[activeIdx] : null;
  const activeCards = activeIdx !== null ? cardsPhotos[activeIdx] : null;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/globe.gl@2"
        strategy="afterInteractive"
        onLoad={initGlobe}
      />
      <section ref={sectionRef} className="ga-section">
        <canvas ref={starsRef} className="ga-stars" />
        {/* Solid backdrop that only exists in detail mode, so the fixed globe
            + panel never reveal whatever section is behind the activity. */}
        <div className={`ga-backdrop${isOpen ? ' visible' : ''}`} aria-hidden="true" />
        <div
          ref={globeContainerRef}
          className={`ga-globe${isOpen ? ' shifted' : ''}`}
        />

        <div className={`ga-intro${isOpen ? ' out' : ''}`}>
          <h2>A career mapped across continents.</h2>
          <p>Each pin marks years of work — negotiations, factories, partnerships and the people behind them. Explore the cities that have shaped four decades of foreign trade, with a focus on the relationships built across China.</p>
          <button type="button" className="ga-cta" onClick={() => { setIsOpen(true); setActiveIdx(0); }}>
            View cities
          </button>
        </div>

        <aside className={`ga-panel${isOpen ? ' in' : ''}`} aria-hidden={!isOpen}>
          {activeCity && activeCards && (
            <article className="ga-card">
              <div className="ga-eyebrow">{activeCity.name}</div>
              <h2 className="ga-name">{activeCity.business}</h2>
              <div className="ga-thumb">
                {activeCards.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p + i}
                    src={p}
                    alt=""
                    loading="lazy"
                    className={'ga-thumb-img' + (i === photoIdx ? ' active' : '')}
                  />
                ))}
              </div>
              <p className="ga-desc">{activeCity.desc}</p>
              <Link href={`/activities?id=${slugify(activeCity.name)}`} className="ga-button">
                View Details
              </Link>
            </article>
          )}
        </aside>

        <button
          type="button"
          aria-label="Close"
          className={`ga-close${isOpen ? ' visible' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </section>

      <style>{`
        .ga-section {
          position: relative;
          width: 100%;
          height: 130vh;
          margin-top: 128px;
          background: #000;
          color: #cfd6dd;
          overflow: hidden;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }
        .ga-stars {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: block;
          pointer-events: none;
        }
        .ga-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: #000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s ease;
        }
        .ga-backdrop.visible {
          opacity: 1;
        }
        .ga-globe {
          position: absolute;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          z-index: 2;
          transform: translateY(30%) scale(1);
          transform-origin: center center;
          transition: transform 1.1s cubic-bezier(0.65, 0.05, 0.36, 1);
        }
        .ga-globe.shifted {
          position: fixed;
          transform: translate(-25%, 0) scale(1.2);
        }
        .ga-intro {
          position: absolute;
          top: 8vh; left: 50%;
          width: 90%; max-width: 720px;
          text-align: center;
          color: #ffffff;
          z-index: 10;
          pointer-events: none;
          transform: translate(-50%, 0);
          opacity: 1;
          transition: transform 1.1s cubic-bezier(0.65, 0.05, 0.36, 1),
                      opacity 0.7s ease;
        }
        .ga-intro.out {
          transform: translate(-50%, -140%);
          opacity: 0;
        }
        .ga-intro h2 {
          margin: 0 0 16px;
          font-size: clamp(24px, 2.6vw, 34px);
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        .ga-intro p {
          margin: 0 auto;
          max-width: 620px;
          font-size: clamp(13px, 1.05vw, 15px);
          line-height: 1.6;
          font-weight: 400;
          color: #b8c2cc;
        }
        .ga-cta {
          pointer-events: auto;
          display: inline-block;
          margin-top: 24px;
          padding: 12px 26px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .ga-cta:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.7);
          transform: translateY(-1px);
        }
        .ga-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 40vw;
          max-width: 100vw;
          z-index: 11;
          padding: 0;
          display: flex; flex-direction: column;
          color: #000000;
          background: #ffffff;
          transform: translateX(110%);
          opacity: 0;
          pointer-events: none;
          transition: transform 1.1s cubic-bezier(0.65, 0.05, 0.36, 1),
                      opacity 0.7s ease;
        }
        .ga-panel.in {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
        }
        .ga-card {
          flex: 1;
          padding: 72px 40px 20px;
          box-sizing: border-box;
          overflow-y: auto;
          background: #ffffff;
          color: #000000;
          display: flex;
          flex-direction: column;
        }
        .ga-eyebrow {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #888888;
        }
        .ga-name {
          margin: 0 0 28px;
          color: #000000;
          font-weight: 700;
          font-size: 34px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .ga-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 4px;
          margin-bottom: 28px;
          flex-shrink: 0;
          overflow: hidden;
          background: #111111;
        }
        .ga-thumb-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .ga-thumb-img.active { opacity: 1; }
        .ga-desc {
          margin: 0 0 24px;
          padding: 0;
          color: #000000;
          font-size: 17px;
          line-height: 1.6;
          font-weight: 400;
        }
        .ga-section-title {
          margin: 8px 0 14px;
          font-size: 18px;
          font-weight: 700;
          color: #000000;
          letter-spacing: -0.005em;
          line-height: 1.25;
        }
        .ga-body {
          margin: 0 0 22px;
          color: #1a1a1a;
          font-size: 16px;
          line-height: 1.65;
          font-weight: 400;
        }
        .ga-list {
          margin: 0 0 28px;
          padding-left: 20px;
          color: #1a1a1a;
          font-size: 16px;
          line-height: 1.7;
        }
        .ga-list li { margin-bottom: 6px; }
        .ga-button {
          margin: 0;
          align-self: flex-start;
          padding: 10px 20px;
          background: #0a1d3a;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          font-family: inherit;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ga-button:hover { background: #142d57; }
        .ga-close {
          position: fixed; top: 18px; right: 42px;
          width: 48px; height: 34px;
          box-sizing: border-box;
          padding: 0 10px;
          z-index: 12;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none;
          color: #000000; cursor: pointer;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s ease 0.3s;
        }
        .ga-close.visible {
          opacity: 0.85;
          pointer-events: auto;
        }
        .ga-close:hover { opacity: 1; }
        .ga-close svg { width: 22px; height: 22px; }
        .globe-marker {
          cursor: pointer;
          pointer-events: auto;
          /* Anchor the pin so its tip (bottom-center) sits on the lat/lng. */
          transform: translate(-50%, -100%);
          padding: 4px;
        }
        .globe-marker-shape {
          width: 28px;
          height: 25px;
          background-image: url('/map-pin.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center bottom;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
          image-rendering: -webkit-optimize-contrast;
          will-change: transform;
          transform: translateZ(0);
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .globe-marker.is-active .globe-marker-shape {
          transform: scale(1.35);
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.55))
                  drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
        }
      `}</style>
    </>
  );
}
