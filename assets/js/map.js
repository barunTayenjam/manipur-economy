/**
 * Interactive map (Leaflet) — lazy-loaded when the plate approaches the viewport.
 * Geometry lives in data/map.geo.json (editorial); colours come from CSS tokens.
 */
import { onVisible, loadScript, cssVar } from './utils.js';

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_SRI = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

/** @type {import('leaflet').Map|null} */
let mapInstance = null;
let loadPromise = null;

function pinIcon(cat) {
  const pulse = cat === 'hotspot' || cat === 'border';
  return L.divIcon({
    className: 'm-pinwrap',
    html: `<div class="pin ${cat}">${pulse ? '<span class="pulse"></span>' : ''}<i></i></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function popupHTML(p) {
  return (
    `<div class="mpop"><span class="mpop-cat ${p.cat}">${p.role}</span>` +
    `<div class="mpop-name">${p.name}</div>` +
    `<div class="mpop-note">${p.note}</div>` +
    `<div class="mpop-stat">${p.stat}</div></div>`
  );
}

function drawHighway(pts, color, code) {
  const g = L.layerGroup();
  g.addLayer(
    L.polyline(pts, {
      color,
      weight: 7,
      opacity: 0.12,
      lineCap: 'round',
      lineJoin: 'round',
    })
  );
  g.addLayer(
    L.polyline(pts, {
      color,
      weight: 2,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).bindTooltip(code, {
      permanent: true,
      direction: 'center',
      className: 'm-hwlabel',
    })
  );
  return g;
}

async function fetchGeo() {
  const res = await fetch('data/map.geo.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error(`map.geo.json HTTP ${res.status}`);
  return res.json();
}

function initMap(mapEl, geo) {
  if (mapInstance || !window.L) return;

  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    attributionControl: true,
    zoomControl: true,
  }).setView(geo.view.center, geo.view.zoom);
  mapInstance = map;

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());

  const hotspotLayer = L.layerGroup();
  const nodeLayer = L.layerGroup();
  const allBounds = [];

  geo.places.forEach((p) => {
    const m = L.marker(p.c, {
      icon: pinIcon(p.cat),
      title: p.name,
      alt: p.name,
      riseOnHover: true,
    })
      .bindTooltip(p.name, {
        direction: 'top',
        offset: [0, -10],
        className: 'm-placelabel',
        opacity: 1,
      })
      .bindPopup(popupHTML(p), { className: 'm-popup', maxWidth: 250 });
    allBounds.push(p.c);
    (p.cat === 'hotspot' ? hotspotLayer : nodeLayer).addLayer(m);
  });
  hotspotLayer.addTo(map);
  nodeLayer.addTo(map);

  const highwayLayer = L.layerGroup().addTo(map);
  geo.highways.forEach((h) => {
    const color = cssVar(h.token, h.token === '--ink' ? '#1E232A' : '#A31621');
    highwayLayer.addLayer(drawHighway(h.points, color, h.code));
    allBounds.push(...h.points);
  });

  L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 120 }).addTo(map);
  map.fitBounds(L.latLngBounds(allBounds), { padding: [30, 30] });
  requestAnimationFrame(() => map.invalidateSize());
}

function ensureLeaflet() {
  if (window.L) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = loadScript({ src: LEAFLET_JS, integrity: LEAFLET_SRI }).catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

/** Observe #map; load Leaflet + geometry when it nears the viewport. */
export function mountMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  onVisible(
    mapEl,
    () => {
      Promise.all([ensureLeaflet(), fetchGeo()])
        .then(([, geo]) => initMap(mapEl, geo))
        .catch((err) => {
          console.warn('[map] failed to load', err);
          mapEl.classList.add('map-fallback');
          if (!mapEl.textContent.trim()) {
            mapEl.innerHTML =
              '<div class="map-fallback">Map unavailable — locations are listed in the table below.</div>';
          }
        });
    },
    { rootMargin: '200px' }
  );
}
