/**
 * Interactive map (Leaflet) — lazy-loaded when the plate approaches the viewport.
 */
import { onVisible, loadScript } from './utils.js';

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_SRI = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

/** @type {import('leaflet').Map|null} */
let mapInstance = null;
let loadPromise = null;

const PLACES = [
  {
    c: [24.7991, 93.9364],
    cat: 'capital',
    name: 'Imphal',
    role: 'State capital',
    note: 'Seat of government in the Meitei-valley heartland; repeated curfews and internet bans since May 2023.',
    stat: 'Political centre',
  },
  {
    c: [25.1528, 93.9714],
    cat: 'hotspot',
    name: 'Kangpokpi',
    role: 'Kuki-Zo district',
    note: 'Key NH-2 chokepoint; the epicentre of the 2026 Kuki–Naga escalation and a June 2026 attack that triggered CRPF COBRA deployment.',
    stat: 'Kuki–Naga flashpoint',
  },
  {
    c: [24.3469, 93.6994],
    cat: 'hotspot',
    name: 'Churachandpur',
    role: 'Kuki-Zo stronghold',
    note: 'Epicentre of the May 2023 violence; 1,557+ houses burnt here by May 23, 2023.',
    stat: 'Conflict origin',
  },
  {
    c: [24.3626, 94.2595],
    cat: 'hotspot',
    name: 'Tengnoupal',
    role: 'Kuki-Zo hill district',
    note: 'Overlooks the road to Moreh; a strategic corridor for the cross-border drugs trade.',
    stat: 'Border approach',
  },
  {
    c: [24.2481, 94.3029],
    cat: 'border',
    name: 'Moreh',
    role: 'Indo–Myanmar border',
    note: 'Porous transit town for Golden Triangle heroin & methamphetamines into India.',
    stat: 'Drug-trade gateway',
  },
  {
    c: [24.8024, 93.1165],
    cat: 'node',
    name: 'Jiribam',
    role: 'NH-37 · railhead',
    note: 'Manipur’s only rail link and the NH-37 (Imphal–Silchar) supply lifeline.',
    stat: 'Supply lifeline',
  },
  {
    c: [25.0979, 94.3611],
    cat: 'hotspot',
    name: 'Ukhrul',
    role: 'Naga (Tangkhul) district',
    note: 'One of five new Kuki–Naga tension zones in 2026; 50 houses burnt and a 5-day internet ban in February 2026.',
    stat: 'Kuki–Naga flashpoint',
  },
  {
    c: [24.6387, 93.9969],
    cat: 'node',
    name: 'Thoubal',
    role: 'Meitei-valley district',
    note: 'Curfews and commercial shutdowns through the conflict period.',
    stat: 'Affected district',
  },
  {
    c: [25.3934, 94.1502],
    cat: 'hotspot',
    name: 'Senapati',
    role: 'Naga district · NH-2',
    note: 'A Kuki–Naga flashpoint in 2026; UNC counter-blockades here have repeatedly choked the NH-2 supply line.',
    stat: 'Kuki–Naga flashpoint',
  },
  {
    c: [25.505, 93.69],
    cat: 'hotspot',
    name: 'Noney',
    role: 'Naga (Zeme) district',
    note: 'Nungthut and Khongmol villages burnt here on July 8, 2026 in the widening Kuki–Naga violence.',
    stat: 'New conflict zone',
  },
];

const NH2 = [
  [24.7991, 93.9364],
  [25.1528, 93.9714],
  [25.3934, 94.1502],
  [25.6619, 94.1019],
  [25.9041, 93.7178],
];
const NH37 = [
  [24.7991, 93.9364],
  [24.8024, 93.1165],
  [24.8303, 92.7876],
];

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

function initMap(mapEl) {
  if (mapInstance || !window.L) return;

  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    attributionControl: true,
    zoomControl: true,
  }).setView([24.85, 94.0], 7);
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

  PLACES.forEach((p) => {
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
  highwayLayer.addLayer(drawHighway(NH2, '#A31621', 'NH-2'));
  highwayLayer.addLayer(drawHighway(NH37, '#1E232A', 'NH-37'));
  allBounds.push(...NH2, ...NH37);

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

/** Observe #map and load Leaflet when it nears the viewport. */
export function mountMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  onVisible(
    mapEl,
    () => {
      ensureLeaflet()
        .then(() => initMap(mapEl))
        .catch((err) => {
          console.warn('[map] Leaflet failed to load', err);
          mapEl.classList.add('map-fallback');
        });
    },
    { rootMargin: '200px' }
  );
}
