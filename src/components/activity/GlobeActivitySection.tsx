'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CITIES, slugify } from '@/lib/cities';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// [lng, lat] — Mapbox convention, not [lat, lng].
const IDLE_CENTER: [number, number] = [17.1077, 48.1486];
const IDLE_ZOOM = 1.4;
const CITY_ZOOM_CLOSE = 10;
const CITY_ZOOM_MED = 8;
const MIN_ZOOM = 1.2;
const MAX_ZOOM = 14;

function cityZoom(altitude: number): number {
  return altitude <= 0.6 ? CITY_ZOOM_CLOSE : CITY_ZOOM_MED;
}

const ALL_PHOTOS = Array.from({ length: 28 }, (_, i) =>
  `/carousel/photo-${String(i + 1).padStart(2, '0')}.jpg`,
);

function pickRandom(n: number): string[] {
  return ALL_PHOTOS.slice().sort(() => Math.random() - 0.5).slice(0, n);
}

function createMarkerEl(name: string, isActive: boolean, thumbUrl: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'globe-marker' + (isActive ? ' is-active' : '');
  const shape = document.createElement('div');
  shape.className = 'globe-marker-shape';
  shape.innerHTML = `
    <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 2 C8 2 2 8 2 14 C2 22 16 34 16 34 C16 34 30 22 30 14 C30 8 24 2 16 2 Z" fill="currentColor"/>
      <circle cx="16" cy="14" r="5" fill="#ffffff"/>
    </svg>
  `;
  el.appendChild(shape);

  // Hover preview: small thumbnail + city name. Only shown when the marker
  // is in hover state AND not the active pin. Active pin shows the enlarged
  // orange shape only, with no label/preview.
  const preview = document.createElement('div');
  preview.className = 'globe-marker-preview';
  const img = document.createElement('img');
  img.src = thumbUrl;
  img.alt = '';
  img.loading = 'lazy';
  // Force 4:3 landscape, doubled from the previous size. Use setAttribute
  // with `!important` so nothing in the cascade (Mapbox CSS, user-agent
  // styles, anything) can override these dimensions.
  img.setAttribute(
    'style',
    'width: 200px !important;' +
      'height: 150px !important;' +
      'min-width: 200px !important;' +
      'min-height: 150px !important;' +
      'max-width: 200px !important;' +
      'max-height: 150px !important;' +
      'object-fit: cover !important;' +
      'display: block !important;' +
      'border-radius: 4px 4px 0 0 !important;',
  );
  preview.appendChild(img);
  const nameEl = document.createElement('div');
  nameEl.className = 'globe-marker-name';
  nameEl.textContent = name;
  preview.appendChild(nameEl);
  el.appendChild(preview);

  return el;
}

export default function GlobeActivitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const spinRef = useRef(true);
  // True while the camera is moving (user drag/zoom, flyTo, or auto-spin).
  // Used to gate marker hover so markers can't be "auto-hovered" by sliding
  // under a stationary cursor.
  const isCameraMovingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tokenMissing, setTokenMissing] = useState(false);

  const cardsPhotos = useMemo(
    () => CITIES.map((c) => (c.photos && c.photos.length > 0 ? c.photos : pickRandom(5))),
    [],
  );

  // Initialize the Mapbox globe once on mount.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    if (!MAPBOX_TOKEN) {
      setTokenMissing(true);
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/sangtong/cmpmjqywo001f01r1fudm9pw2',
      projection: { name: 'globe' },
      center: IDLE_CENTER,
      zoom: IDLE_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
      interactive: false,
      pitchWithRotate: false,
      dragRotate: false,
    });

    mapRef.current = map;
    // Debug: expose the map so we can inspect lightPreset / theme from console
    if (typeof window !== 'undefined') {
      (window as unknown as { __tabMap?: mapboxgl.Map }).__tabMap = map;
    }

    // Track camera-motion state so marker hovers can be suppressed while
    // the map is moving.
    map.on('movestart', () => { isCameraMovingRef.current = true; });
    map.on('moveend', () => {
      // Small grace period after moveend in case the cursor is parked on
      // a marker that just slid under it — don't immediately fire.
      window.setTimeout(() => { isCameraMovingRef.current = false; }, 200);
    });

    map.on('style.load', () => {
      // White "space" matches the section's page background so the globe
      // appears to float on the page. Fog is a runtime-only API; it's not
      // editable in Mapbox Studio.
      // Sharp, narrow rim — horizon-blend at 0.01 keeps the colored band
      // tight to the globe edge instead of bleeding outward into a gradient.
      map.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(190, 210, 240)',
        'horizon-blend': 0.01,
        'space-color': 'rgb(255, 255, 255)',
        'star-intensity': 0,
      });

      // Force-hide Mapbox Standard's built-in place labels (city/town names
      // like "Yiwu") regardless of what's currently published in Studio.
      // Our city markers already name each city, so the basemap labels are
      // redundant clutter and overlap the active pin.
      try {
        map.setConfigProperty('basemap', 'showPlaceLabels', false);
      } catch {
        /* setConfigProperty only exists on Standard-based styles; ignore
           on classic styles. */
      }

      // 3D terrain — runtime-only for classic styles (also not in Studio).
      // Subtle exaggeration so mountainous regions read as raised when
      // flying into cities near them.
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 0.9 });

      scheduleSpin(map);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Smooth continuous rotation when idle. Each easeTo runs for a long
  // duration with linear easing; when it ends or is interrupted, the
  // `moveend` handler queues the next leg.
  function scheduleSpin(map: mapboxgl.Map) {
    function step() {
      if (!spinRef.current) return;
      const current = map.getBearing();
      map.easeTo({
        bearing: current - 60,
        duration: 60_000,
        easing: (t) => t,
      });
    }
    map.on('moveend', () => {
      if (spinRef.current) step();
    });
    step();
  }

  // Sync map state with the open/active flags.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Always clear old markers — they get recreated when needed.
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!isOpen) {
      spinRef.current = true;
      // Idle view: lock all user interactions so the auto-rotate isn't fought.
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
      map.keyboard.disable();
      map.stop();
      map.flyTo({
        center: IDLE_CENTER,
        zoom: IDLE_ZOOM,
        bearing: map.getBearing(),
        duration: 1200,
        essential: true,
      });
      return;
    }

    spinRef.current = false;
    map.stop();

    // Detail view: let the user drag/pan and zoom freely.
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.touchZoomRotate.enable();
    map.doubleClickZoom.enable();
    map.keyboard.enable();

    CITIES.forEach((c, i) => {
      const thumb = cardsPhotos[i]?.[0] || '/carousel/photo-01.jpg';
      const el = createMarkerEl(c.name, i === activeIdx, thumb);
      // Hover: show the thumbnail preview (gated while camera is moving
      // so markers don't flash previews as they slide under the cursor).
      el.addEventListener('mouseenter', () => {
        if (isCameraMovingRef.current) return;
        el.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('is-hover');
      });
      // Click: activate the city (fly camera + populate the side card).
      el.addEventListener('click', () => {
        setActiveIdx(i);
        setPhotoIdx(0);
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([c.lng, c.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (activeIdx !== null) {
      const c = CITIES[activeIdx];
      map.flyTo({
        center: [c.lng, c.lat],
        zoom: cityZoom(c.altitude),
        bearing: 0,
        duration: 1200,
        essential: true,
      });
    }
  }, [activeIdx, isOpen]);

  function zoomBy(delta: number) {
    const map = mapRef.current;
    if (!map || activeIdx === null) return;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, map.getZoom() + delta));
    if (next === map.getZoom()) return;
    map.flyTo({ zoom: next, duration: 400, essential: true });
  }

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

  // Stars animation kept for the section's white-to-black backdrop strip
  // (currently hidden via CSS). Preserved for parity with the previous build.
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
      <section id="activity" ref={sectionRef} className="ga-section">
        <canvas ref={starsRef} className="ga-stars" />
        <div className={`ga-backdrop${isOpen ? ' visible' : ''}`} aria-hidden="true" />
        <div
          ref={mapContainerRef}
          className={`ga-globe${isOpen ? ' shifted' : ''}`}
        />

        {tokenMissing && (
          <div className="ga-token-warn" role="alert">
            <strong>Mapbox token missing.</strong>
            <span>
              Add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code>.env</code> and restart the dev server.
              Get a free token at <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">mapbox.com</a>.
            </span>
          </div>
        )}

        <div className={`ga-intro${isOpen ? ' out' : ''}`}>
          <h2>A career mapped across continents.</h2>
          <p>Each pin marks years of work — negotiations, factories, partnerships and the people behind them. Explore the cities that have shaped four decades of foreign trade, with a focus on the relationships built across China.</p>
          <button type="button" className="ga-cta" onClick={() => { setIsOpen(true); setActiveIdx(0); }}>
            Explore now
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
                <button
                  type="button"
                  className="ga-location"
                  onClick={() => {
                    const map = mapRef.current;
                    if (!map || activeIdx === null) return;
                    const c = CITIES[activeIdx];
                    map.flyTo({
                      center: [c.lng, c.lat],
                      zoom: cityZoom(c.altitude),
                      bearing: 0,
                      duration: 1000,
                      essential: true,
                    });
                  }}
                >
                  Go to location
                </button>
                <p className="ga-desc">{activeCity.desc}</p>
                <Link href={`/activities?id=${slugify(activeCity.name)}`} className="ga-button">
                  Explore now
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
            onClick={() => zoomBy(+1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="ga-zoom-btn"
            onClick={() => zoomBy(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        <div className={`ga-hints${isOpen ? ' visible' : ''}`} aria-hidden={!isOpen}>
          <div className="ga-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M3 12h18M7 7l-4 5 4 5M17 7l4 5-4 5M7 7l5-4 5 4M7 17l5 4 5-4" />
            </svg>
            <span>Drag to move<br />the globe around</span>
          </div>
          <div className="ga-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" />
            </svg>
            <span>Zoom in &amp; out<br />to view</span>
          </div>
          <div className="ga-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>Click on city to view<br />details</span>
          </div>
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
          background: transparent;
        }
        .ga-globe.shifted {
          position: fixed;
          transform: translate(0, 0) scale(1);
        }
        /* Mapbox renders into a child canvas; ensure full coverage. */
        .ga-globe .mapboxgl-canvas {
          width: 100% !important;
          height: 100% !important;
        }
        /* Hide attribution UI completely (we leave the legal attribution
           in the footer of the site). */
        .ga-globe .mapboxgl-ctrl-attrib,
        .ga-globe .mapboxgl-ctrl-logo {
          display: none !important;
        }
        .ga-token-warn {
          position: absolute;
          top: 20px; left: 50%;
          transform: translateX(-50%);
          z-index: 12;
          max-width: 520px;
          padding: 12px 18px;
          background: #fff3cd;
          color: #664d03;
          border: 1px solid #ffe69c;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.45;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.08);
        }
        .ga-token-warn a { color: #664d03; text-decoration: underline; }
        .ga-token-warn code {
          background: rgba(0,0,0,0.06);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 12px;
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 24px;
          padding: 12px 24px;
          font-family: inherit;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          background: var(--brand);
          border: 0;
          border-radius: 8px;
          text-decoration: none;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .ga-cta:hover {
          filter: brightness(1.1);
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
          background: #ffffff;
          color: #1a1a1a;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 14px 44px rgba(15, 23, 42, 0.12),
                      0 2px 8px rgba(15, 23, 42, 0.06);
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
          margin: 0 0 6px;
          color: #1a1a1a;
          font-weight: 700;
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .ga-location {
          align-self: flex-start;
          margin: 0 0 18px;
          padding: 0;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          color: #2563eb;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.18s ease;
        }
        .ga-location:hover {
          color: #1d4ed8;
          text-decoration: underline;
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
          color: #4a5560;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 400;
        }
        .ga-button {
          margin: 0;
          align-self: flex-start;
          padding: 10px 24px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ga-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }
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
        .ga-hints {
          position: fixed;
          bottom: 28px;
          /* Align the left edge with the zoom button stack (left: 28px). */
          left: 28px;
          z-index: 200;
          display: flex;
          gap: 40px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s ease 0.3s;
        }
        .ga-hints.visible {
          opacity: 1;
        }
        .ga-hint {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1a1a1a;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 500;
          letter-spacing: 0;
        }
        .ga-hint svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: #1a1a1a;
        }
        @media (max-width: 720px) {
          .ga-hints {
            left: 16px;
            right: 16px;
            bottom: 16px;
            gap: 18px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .ga-hint {
            font-size: 11px;
          }
        }
        .ga-close {
          position: absolute;
          top: 14px; right: 14px;
          width: 32px; height: 32px;
          z-index: 2;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255, 255, 255, 0.92);
          border: none;
          border-radius: 50%;
          color: #1a1a1a;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .ga-close:hover { background: #ffffff; transform: scale(1.05); }
        .ga-close svg { width: 16px; height: 16px; }
        .globe-marker {
          /* Do NOT set position here — Mapbox applies position:absolute and
             a translate() transform on the marker element to place it at
             the marker's lng/lat. Overriding position breaks placement. */
          cursor: pointer;
          pointer-events: auto;
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
          /* Do NOT add will-change/translateZ here — it lifts the shape into
             its own GPU layer and makes it lag the parent's transform updates
             during Mapbox's zoom/pan animations (pins appear to drift). */
          transition: color 0.2s ease;
        }
        .globe-marker-shape svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .globe-marker.is-active .globe-marker-shape {
          /* Bright, saturated red so the active pin reads clearly against
             the warm-toned basemap. */
          color: #ef4444;
          transform: scale(1.55);
        }
        /* Hover preview: shown when an inactive marker is hovered.
           Container itself has no fill — only the image and the label
           below it have visible surfaces. */
        .globe-marker-preview {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          /* No background / border-radius / shadow on the container itself. */
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 4;
        }
        .globe-marker-preview img {
          /* 4:3 landscape, ~doubled from the previous 96×60. */
          width: 200px;
          height: 150px;
          object-fit: cover;
          display: block;
          border-radius: 12px;
          background: #e5e7eb;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.22),
                      0 2px 6px rgba(15, 23, 42, 0.10);
        }
        .globe-marker-name {
          /* Sits flush against the image bottom (no gap) so the two form
             one continuous shape: image (rounded top, flat bottom) +
             label (flat top, rounded bottom). Left-aligned to the image. */
          margin-top: 0;
          padding: 8px 18px;
          background: #ffffff;
          color: #1a1a1a;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.2;
          white-space: nowrap;
          text-align: left;
          border-radius: 0 0 4px 4px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
        }
        /* Show preview only when hovering an inactive pin. Active pins
           display the enlarged orange shape only — no label/preview. */
        .globe-marker.is-hover:not(.is-active) .globe-marker-preview {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>
    </>
  );
}
