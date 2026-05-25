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
  /** City name shown as the card title and the pin label. */
  name: string;
  /** Latitude — where the pin and camera-focus point sit. */
  lat: number;
  /** Longitude. */
  lng: number;
  /** Short narrative paragraph that opens the card body. */
  desc: string;
  /** Camera altitude when this city is focused. Smaller = closer/zoomed in. */
  altitude: number;
  /** Optional curated carousel photos for this city. When omitted, 5 random
   *  photos are picked from /carousel/photo-XX.jpg. */
  photos?: string[];
}

// Edit any field below — the panel and the globe focus update automatically.
const CITIES: City[] = [
  { name: 'Shanghai',   lat: 31.2304, lng: 121.4737, altitude: 0.5, desc: 'The skyline that announced modern China to the world. Pudong has been the setting for some of the most consequential negotiations of my career — fast, formal, and unforgiving of unprepared visitors.', photos: ['/cities/shanghai/1.jpeg', '/cities/shanghai/2.jpeg', '/cities/shanghai/3.jpeg', '/cities/shanghai/4.jpeg', '/cities/shanghai/5.jpeg'] },
  { name: 'Beijing',    lat: 39.9042, lng: 116.4074, altitude: 0.5, desc: "Where every meaningful negotiation eventually leads. Beijing's rhythm is patient, hierarchical, and rewards relationships built over decades — not deals built overnight.", photos: ['/cities/beijing/1.jpeg', '/cities/beijing/2.jpeg', '/cities/beijing/3.jpeg', '/cities/beijing/4.jpeg'] },
  { name: 'Guangzhou',  lat: 23.1291, lng: 113.2644, altitude: 0.5, desc: "Centuries of merchant trading heritage compressed into one city. Deals here move quickly, but only after the people across the table have decided you're worth their time." },
  { name: 'Chengdu',    lat: 30.5728, lng: 104.0668, altitude: 1.0, desc: 'Patient relationship-building in western China. Business in Chengdu unfolds over tea, meals and long walks — never slide decks.' },
  { name: 'Chongqing',  lat: 29.5630, lng: 106.5516, altitude: 1.0, desc: 'A mountain-and-river crossroads where industrial scale meets old-world bargaining instincts. Few visitors leave without changing their view of inland China.' },
  { name: 'Shenzhen',   lat: 22.5429, lng: 114.0596, altitude: 0.5, desc: 'Innovation acceleration engine of the south. Shenzhen demands sustained engagement — partners here remember who showed up early and who stayed.' },
  { name: 'Tianjin',    lat: 39.3434, lng: 117.3616, altitude: 0.5, desc: "Beijing's port and rehearsal stage. Many strategic conversations begin in Tianjin before they ever reach the capital." },
  { name: "Xi'an",      lat: 34.3416, lng: 108.9398, altitude: 1.0, desc: "Silk Road heritage anchors every conversation here. Xi'an reminds you that trade between Europe and Asia is older than most national borders." },
  { name: 'Hangzhou',   lat: 30.2741, lng: 120.1551, altitude: 0.5, desc: "Incubator of national-scale private enterprise. The lake city quietly produced China's most consequential consumer-tech founders." },
  { name: 'Foshan',     lat: 23.0218, lng: 113.1219, altitude: 0.5, desc: 'Workshop city of the Pearl River Delta. Foshan rewards buyers who care about craftsmanship as much as price.' },
  { name: 'Hong Kong',  lat: 22.3193, lng: 114.1694, altitude: 0.5, desc: 'International financial gateway with deep colonial trading roots. Hong Kong moves between Western boardrooms and mainland realities with practiced ease — and remembers everyone who treated it as merely a stepping stone.', photos: ['/cities/hongkong/1.jpeg', '/cities/hongkong/2.jpeg', '/cities/hongkong/3.jpeg', '/cities/hongkong/4.jpeg'] },
  { name: 'Nanjing',    lat: 32.0603, lng: 118.7969, altitude: 0.5, desc: 'Old capital, deep institutions. Nanjing teaches you the difference between ceremony and substance.' },
  { name: 'Jinan',      lat: 36.6512, lng: 117.1201, altitude: 1.0, desc: 'Spring city and provincial seat of Shandong. Jinan keeps a long memory — careers are made by people who return.', photos: ['/cities/jinan/1.jpeg', '/cities/jinan/2.jpeg', '/cities/jinan/3.jpeg', '/cities/jinan/4.jpeg', '/cities/jinan/5.jpeg', '/cities/jinan/6.jpeg', '/cities/jinan/7.jpeg', '/cities/jinan/8.jpeg'] },
  { name: 'Qingdao',    lat: 36.0671, lng: 120.3826, altitude: 1.0, desc: "European industrial DNA, Asian execution. Qingdao's port and brewing history quietly shaped global manufacturing standards.", photos: ['/cities/qingdao/1.jpeg', '/cities/qingdao/2.jpeg', '/cities/qingdao/3.jpeg', '/cities/qingdao/4.jpeg', '/cities/qingdao/5.jpeg', '/cities/qingdao/6.jpeg'] },
  { name: 'Changsha',   lat: 28.2282, lng: 112.9388, altitude: 1.0, desc: 'Confident, media-savvy capital of Hunan. Changsha negotiates with appetite and the assumption that anything can be built.' },
  { name: 'Xiamen',     lat: 24.4798, lng: 118.0894, altitude: 0.5, desc: 'Quiet southern port with deep ties to Taiwan and Southeast Asia. Subtle, careful, and lucrative for those who learn its rhythms.' },
  { name: 'Ningbo',     lat: 29.8683, lng: 121.5440, altitude: 0.5, desc: "One of the world's busiest container ports. Ningbo handles volume the way other cities handle conversation — quietly and without fuss." },
  { name: 'Suzhou',     lat: 31.2989, lng: 120.5853, altitude: 0.5, desc: 'Classical gardens and one of the most successful industrial parks in Asia. Suzhou pairs aesthetic restraint with relentless execution.' },
  { name: 'Hefei',      lat: 31.8206, lng: 117.2272, altitude: 0.5, desc: 'Quietly emergent science-and-industry capital. Hefei has become the city you must visit before assuming you understand modern Chinese manufacturing.' },
  { name: 'Songpan',    lat: 32.6347, lng: 103.6018, altitude: 0.5, desc: 'Ancient walled town on the edge of the Tibetan Plateau. Conversations here move at altitude — slow, deliberate, and unforgettable.' },
  { name: 'Jiuzhaigou', lat: 33.2614, lng: 103.9197, altitude: 0.5, desc: 'Turquoise lakes and protected valleys. Jiuzhaigou is the rare partner site where the meeting room is the landscape itself.' },
  { name: 'Qiang City', lat: 31.6788, lng: 103.8519, altitude: 0.5, desc: 'Stone watchtowers and one of the oldest continuously inhabited cultures in western Sichuan. Trust here is generational, not contractual.' },
  { name: 'Maoxian',    lat: 31.6815, lng: 103.8533, altitude: 0.5, desc: 'Mountain seat of the Qiang people. Maoxian rewards visitors who treat hospitality as the first stage of every negotiation.' },
  { name: 'Cangzhou',   lat: 38.3037, lng: 116.8388, altitude: 0.5, desc: 'Industrial Hebei at its most direct. Cangzhou expects facts on the table within the first ten minutes — and respects you for arriving with them.' },
  { name: 'Taipei',     lat: 25.0330, lng: 121.5654, altitude: 0.5, desc: 'Where supply chains, semiconductors and old family businesses still talk to each other. Taipei negotiates softly and remembers everything.' },
  { name: 'Hohhot',     lat: 40.8414, lng: 111.7522, altitude: 1.0, desc: 'Grasslands capital with deep dairy, energy and cross-border interests. Hohhot conducts business with steppe-wide horizons.' },
  { name: 'Yiwu',       lat: 29.3088, lng: 120.0762, altitude: 1.0, desc: "The world's small-commodities trading floor. A single afternoon in Yiwu can redraw what you thought a global supply chain looks like." },
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
  const currentAltitudeRef = useRef(2.2);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  // One stable set of 5 photos per city.
  const cardsPhotos = useMemo(
    () => CITIES.map((c) => (c.photos && c.photos.length > 0 ? c.photos : pickRandom(5))),
    [],
  );

  function buildPoints(activeIdxLocal: number | null): MarkerDatum[] {
    return CITIES.map((d, i) => ({
      idx: i,
      lat: d.lat,
      lng: d.lng,
      name: d.name,
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
        const shape = document.createElement('div');
        shape.className = 'globe-marker-shape';
        shape.innerHTML = `
          <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16 2 C8 2 2 8 2 14 C2 22 16 34 16 34 C16 34 30 22 30 14 C30 8 24 2 16 2 Z" fill="currentColor"/>
            <circle cx="16" cy="14" r="5" fill="#ffffff"/>
          </svg>
        `;
        el.appendChild(shape);
        const label = document.createElement('div');
        label.className = 'globe-marker-label';
        label.textContent = d.name;
        el.appendChild(label);
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
      globe.pointOfView({ lat: SLOVAKIA.lat, lng: SLOVAKIA.lng, altitude: 2.2 }, 1200);
      currentAltitudeRef.current = 2.2;
      return;
    }
    globe.htmlElementsData(buildPoints(activeIdx));
    if (activeIdx !== null) {
      const c = CITIES[activeIdx];
      globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: c.altitude }, 1200);
      currentAltitudeRef.current = c.altitude;
    }
  }, [activeIdx, isOpen]);

  function zoomBy(factor: number) {
    const globe = globeRef.current;
    if (!globe || activeIdx === null) return;
    const c = CITIES[activeIdx];
    const next = Math.min(4, Math.max(0.15, currentAltitudeRef.current * factor));
    if (next === currentAltitudeRef.current) return;
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: next }, 400);
    currentAltitudeRef.current = next;
  }

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

  // Hide the site header while the detail view is open.
  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    if (isOpen) {
      header.classList.add('is-hidden');
      return () => {
        header.classList.remove('is-hidden');
      };
    }
  }, [isOpen]);

  // Auto-rotate carousel every 2s when panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => {
      setPhotoIdx((p) => {
        const count = activeIdx !== null ? cardsPhotos[activeIdx].length : 5;
        return count > 0 ? (p + 1) % count : 0;
      });
    }, 2000);
    return () => window.clearInterval(id);
  }, [isOpen, activeIdx, cardsPhotos]);

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
      <section id="activity" ref={sectionRef} className="ga-section">
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
                <div className="ga-progress" aria-hidden="true">
                  {activeCards.map((p, i) => (
                    <span
                      key={p + i}
                      className={'ga-progress-seg' + (i === photoIdx ? ' active' : '')}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  className="ga-close"
                  onClick={() => setIsOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="ga-card-body">
                <h2 className="ga-name">{activeCity.name}</h2>
                <p className="ga-desc">{activeCity.desc}</p>
                <Link href={`/activities?id=${slugify(activeCity.name)}`} className="ga-button">
                  View Details
                </Link>
              </div>
            </article>
          )}
        </aside>

        <div className={`ga-zoom${isOpen ? ' visible' : ''}`} aria-hidden={!isOpen}>
          <button
            type="button"
            aria-label="Zoom in"
            className="ga-zoom-btn"
            onClick={() => zoomBy(0.7)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="ga-zoom-btn"
            onClick={() => zoomBy(1.4)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

      </section>

      <style>{`
        .ga-section {
          position: relative;
          width: 100%;
          height: 130vh;
          margin-top: 128px;
          background: #ffffff;
          color: #1a1a1a;
          overflow: hidden;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        }
        .ga-stars {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: none;
          pointer-events: none;
        }
        .ga-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: #ffffff;
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
          transform: translate(0, 0) scale(1);
        }
        .ga-intro {
          position: absolute;
          top: 8vh; left: 50%;
          width: 90%; max-width: 720px;
          text-align: center;
          color: #1a1a1a;
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
          color: #4a5560;
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
          color: #1a1a1a;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.35);
          border-radius: 999px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .ga-cta:hover {
          background: rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 0, 0, 0.7);
          transform: translateY(-1px);
        }
        .ga-panel {
          position: fixed;
          top: 50%;
          right: 48px;
          width: 420px;
          max-width: calc(100vw - 32px);
          z-index: 11;
          color: #ffffff;
          background: transparent;
          transform: translate(120%, -50%);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.9s cubic-bezier(0.65, 0.05, 0.36, 1),
                      opacity 0.5s ease;
        }
        .ga-panel.in {
          transform: translate(0, -50%);
          opacity: 1;
          pointer-events: auto;
        }
        .ga-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: #0a1d3a;
          color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
        }
        .ga-progress {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
          display: flex;
          gap: 4px;
          pointer-events: none;
        }
        .ga-progress-seg {
          width: 30px;
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.28);
          transition: background 0.3s ease;
        }
        .ga-progress-seg.active {
          background: rgba(255, 255, 255, 0.85);
        }
        .ga-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
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
        .ga-card-body {
          padding: 24px 28px 28px;
          display: flex;
          flex-direction: column;
        }
        .ga-name {
          margin: 0 0 18px;
          color: #ffffff;
          font-weight: 700;
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .ga-eyebrow {
          margin: 0 0 18px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #34d399;
        }
        .ga-desc {
          margin: 0 0 24px;
          padding: 0;
          color: #d8dde6;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 400;
        }
        .ga-button {
          margin: 0;
          align-self: flex-start;
          padding: 10px 22px;
          background: #ffffff;
          color: #0a1d3a;
          border: none;
          border-radius: 999px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .ga-button:hover { background: #e6ecf5; transform: translateY(-1px); }
        .ga-zoom {
          position: fixed;
          top: 50%;
          left: 28px;
          transform: translateY(-50%);
          z-index: 200;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s ease 0.3s;
        }
        .ga-zoom.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .ga-zoom-btn {
          width: 38px;
          height: 38px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a1a1a;
          padding: 0;
          transition: background 0.18s ease;
        }
        .ga-zoom-btn:hover { background: rgba(0, 0, 0, 0.06); }
        .ga-zoom-btn + .ga-zoom-btn { border-top: 1px solid rgba(0, 0, 0, 0.12); }
        .ga-zoom-btn svg { width: 16px; height: 16px; }
        .ga-close {
          position: absolute;
          top: 14px; right: 14px;
          width: 34px; height: 34px;
          z-index: 2;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0, 0, 0, 0.45);
          border: none;
          border-radius: 50%;
          color: #ffffff;
          cursor: pointer;
          padding: 0;
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .ga-close:hover { background: rgba(0, 0, 0, 0.7); transform: scale(1.05); }
        .ga-close svg { width: 16px; height: 16px; }
        .globe-marker {
          cursor: pointer;
          pointer-events: auto;
          position: relative;
          /* Anchor the pin so its tip (at 85% of the SVG) sits on the lat/lng. */
          transform: translate(-50%, -85%);
          padding: 4px;
        }
        .globe-marker.is-active {
          z-index: 5;
        }
        .globe-marker-shape {
          width: 18px;
          height: 22.5px;
          display: block;
          color: #1a1a1a;
          will-change: transform;
          transform: translateZ(0);
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .globe-marker-shape svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .globe-marker.is-active .globe-marker-shape {
          color: #e8421c;
          transform: scale(1.55);
        }
        .globe-marker-label {
          position: absolute;
          left: calc(100% + 2px);
          top: 50%;
          transform: translateY(-50%) translateX(-6px);
          background: #0a1d3a;
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .globe-marker.is-active .globe-marker-label {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>
    </>
  );
}
