import { useEffect, useMemo, useRef, useState } from 'react';
import { Ambulance, Building2, Layers, LocateFixed, MessageSquare, Navigation, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mapLocations, type MapLocation } from '@/data/mapLocations';
import { MobileMapsBottomSheet, useFilteredMapLocations } from '@/components/maps/MapsSidebar';
import { useSidebarMapStore } from '@/stores/sidebarMapStore';

type LeafletApi = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
  layerGroup: () => LeafletLayerGroup;
  divIcon: (options: Record<string, unknown>) => unknown;
  marker: (latLng: [number, number], options?: Record<string, unknown>) => LeafletMarker;
  latLngBounds: (latLngs: [number, number][]) => unknown;
  control: { zoom: (options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void } };
};

type LeafletMap = {
  setView: (latLng: [number, number], zoom?: number, options?: Record<string, unknown>) => void;
  fitBounds: (bounds: unknown, options?: Record<string, unknown>) => void;
  getZoom: () => number;
  invalidateSize: () => void;
  remove: () => void;
};

type LeafletMarker = {
  addTo: (layer: LeafletLayerGroup) => LeafletMarker;
  bindTooltip: (content: string, options?: Record<string, unknown>) => LeafletMarker;
  on: (eventName: string, callback: () => void) => LeafletMarker;
};

type LeafletLayerGroup = {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
};

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const INDONESIA_BOUNDS: [number, number][] = [
  [-11.2, 94.5],
  [6.2, 141.1],
];

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function createMarkerHtml(location: MapLocation, isSelected: boolean) {
  const tone = location.hasEmergency ? 'is-emergency' : location.hasOnlineDoctor ? 'is-online' : 'is-regular';
  return `<span class="teleleaflet-marker ${tone} ${isSelected ? 'is-selected' : ''}" aria-label="${escapeHtml(location.name)}">
    <span class="teleleaflet-marker__pulse"></span>
    <span class="teleleaflet-marker__icon">${location.hasEmergency ? '✚' : location.type === 'Dokter' ? '👨‍⚕️' : '●'}</span>
  </span>`;
}

function LeafletIndonesiaMap({ locations }: { locations: MapLocation[] }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | undefined>(undefined);
  const markerLayerRef = useRef<LeafletLayerGroup | undefined>(undefined);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>();
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const setSelectedMarkerId = useSidebarMapStore((s) => s.setSelectedMarkerId);

  useEffect(() => {
    let retryTimer: number | undefined;
    let retryCount = 0;
    let cancelled = false;

    const bootLeaflet = () => {
      if (cancelled || mapRef.current || !mapElementRef.current) return;
      const leaflet = window.L;

      if (!leaflet) {
        retryCount += 1;
        if (retryCount > 30) {
          setMapError('Leaflet belum berhasil dimuat. Periksa koneksi ke CDN Leaflet.');
          return;
        }
        retryTimer = window.setTimeout(bootLeaflet, 150);
        return;
      }

      const map = leaflet.map(mapElementRef.current, {
        center: INDONESIA_CENTER,
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        maxBounds: INDONESIA_BOUNDS,
        maxBoundsViscosity: 0.85,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      leaflet.control.zoom({ position: 'bottomleft' }).addTo(map);
      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      mapRef.current = map;
      setIsMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 250);
    };

    bootLeaflet();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      mapRef.current?.remove();
      mapRef.current = undefined;
      markerLayerRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const leaflet = window.L;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!leaflet || !map || !markerLayer) return;

    markerLayer.clearLayers();
    locations.forEach((location) => {
      const isSelected = selectedMarkerId === location.id;
      leaflet
        .marker([location.latitude, location.longitude], {
          icon: leaflet.divIcon({
            className: 'teleleaflet-marker-shell',
            html: createMarkerHtml(location, isSelected),
            iconSize: [42, 42],
            iconAnchor: [21, 21],
          }),
          keyboard: true,
          title: location.name,
        })
        .on('click', () => setSelectedMarkerId(location.id))
        .bindTooltip(`${location.name} — ${location.city}`, { direction: 'top', offset: [0, -18] })
        .addTo(markerLayer);
    });

    const selected = locations.find((location) => location.id === selectedMarkerId);
    if (selected) {
      map.setView([selected.latitude, selected.longitude], Math.max(map.getZoom(), 9), { animate: true });
    } else if (locations.length > 1) {
      map.fitBounds(leaflet.latLngBounds(locations.map((location) => [location.latitude, location.longitude])), {
        animate: true,
        padding: [48, 48],
        maxZoom: 8,
      });
    }
  }, [locations, selectedMarkerId, setSelectedMarkerId]);

  return (
    <>
      <div ref={mapElementRef} className="absolute inset-0 z-0 bg-sky-100" aria-label="Peta Leaflet Indonesia" />
      {!isMapReady && (
        <div className="absolute inset-0 z-[1] grid place-items-center bg-sky-50/90 text-center">
          <div className="rounded-3xl border bg-white/95 p-5 shadow-lg">
            <Layers className="mx-auto h-8 w-8 animate-pulse text-skyforce" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Memuat peta Indonesia dengan Leaflet...</p>
            {mapError && <p className="mt-2 max-w-xs text-xs text-red-600">{mapError}</p>}
          </div>
        </div>
      )}
    </>
  );
}

function MapView({ onOpenChat, onRequestAccess }: { onOpenChat: () => void; onRequestAccess: () => void }) {
  const locations = useFilteredMapLocations();
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const setSelectedMarkerId = useSidebarMapStore((s) => s.setSelectedMarkerId);
  const setSidebarMode = useSidebarMapStore((s) => s.setSidebarMode);
  const setShowOnlyEmergencyFacilities = useSidebarMapStore((s) => s.setShowOnlyEmergencyFacilities);
  const selected = mapLocations.find((location) => location.id === selectedMarkerId) ?? locations[0];
  const emergencyFacilities = useMemo(() => locations.filter((location) => location.hasEmergency).slice(0, 4), [locations]);

  return (
    <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-[2rem] border bg-sky-100 shadow-sm lg:min-h-[calc(100vh-9rem)]">
      <LeafletIndonesiaMap locations={locations} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(15,23,42,.06),transparent_22%,transparent_76%,rgba(15,23,42,.08))]" />
      <div className="absolute left-5 top-5 z-10 max-w-sm rounded-3xl border bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-2"><Badge>Leaflet Indonesia</Badge><Badge variant="secondary">{locations.length} marker aktif</Badge></div>
        <h1 className="mt-2 text-2xl font-bold">Telehealth AU Maps</h1>
        <p className="text-sm text-slate-600">Peta Indonesia memakai Leaflet + OpenStreetMap. Marker ikut terfilter dari sidebar dan bisa diklik untuk membuka Selected Location Panel.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="destructive" onClick={() => { setShowOnlyEmergencyFacilities(true); setSidebarMode('emergency'); setSelectedMarkerId(emergencyFacilities[0]?.id); }}><Ambulance className="h-4 w-4" /> Darurat</Button>
          <Button size="sm" variant="outline" onClick={() => selected && setSelectedMarkerId(selected.id)}><LocateFixed className="h-4 w-4" /> Fokus</Button>
        </div>
      </div>

      {selected && (
        <aside className="absolute bottom-5 right-5 z-10 w-[min(26rem,calc(100%-2.5rem))] rounded-3xl border bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-skyforce"><Building2 className="h-6 w-6" /></div><div><h2 className="font-bold">{selected.name}</h2><p className="text-sm text-slate-500">{selected.type} · {selected.city}, {selected.province}</p></div></div>
            <Badge variant={selected.hasEmergency ? 'destructive' : 'default'}>{selected.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">{selected.address}</p>
          <div className="mt-3 flex flex-wrap gap-2"><Badge>{selected.kotama}</Badge><Badge variant="secondary">{selected.staffOnline} petugas online</Badge><Badge variant="outline">{selected.accessBadge}</Badge></div>
          <div className="mt-4 grid grid-cols-3 gap-2"><Button size="sm" onClick={() => setSidebarMode('location-detail')}>Detail</Button><Button size="sm" variant="outline" onClick={() => { setSidebarMode('chat-preview'); onOpenChat(); }}><MessageSquare className="h-4 w-4" /> Chat</Button><Button size="sm" variant="outline" onClick={() => { setSidebarMode('access-request'); onRequestAccess(); }}><ShieldCheck className="h-4 w-4" /> Akses</Button></div>
        </aside>
      )}

      <div className="absolute bottom-5 left-5 z-10 hidden rounded-2xl border bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-lg backdrop-blur md:block">
        <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-skyforce" /> Cakupan: Indonesia · Tile: OpenStreetMap</div>
      </div>
    </section>
  );
}

export function MapsPage() {
  const [toast, setToast] = useState<string>();
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const selected = mapLocations.find((location) => location.id === selectedMarkerId);
  const showNotice = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(undefined), 2400);
  };

  return (
    <div className="space-y-4 pb-64 lg:pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-skyforce">Command center</p>
          <h1 className="text-2xl font-bold">Maps Sidebar</h1>
          <p className="text-sm text-slate-500">Peta Indonesia berbasis Leaflet terintegrasi dengan search, filter, chat preview, dan akses sidebar.</p>
        </div>
        {selected && <Badge className="w-fit">Marker aktif: {selected.name}</Badge>}
      </div>
      <MapView onOpenChat={() => showNotice('ChatPanel simulasi dibuka dari sidebar.')} onRequestAccess={() => showNotice('AccessRequestModal simulasi dibuka dari sidebar.')} />
      <MobileMapsBottomSheet onOpenChat={() => showNotice('Chat mobile dibuka sebagai bottom sheet.')} onRequestAccess={() => showNotice('Request akses mobile dibuka.')} />
      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-night px-4 py-2 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
}
