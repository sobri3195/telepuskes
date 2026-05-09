import { useMemo, useState } from 'react';
import { Ambulance, Building2, MessageSquare, Navigation, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mapLocations } from '@/data/mapLocations';
import { MobileMapsBottomSheet, SidebarMapMarker, useFilteredMapLocations } from '@/components/maps/MapsSidebar';
import { useSidebarMapStore } from '@/stores/sidebarMapStore';

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
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,165,233,.18),rgba(255,255,255,.45)),radial-gradient(circle_at_22%_35%,rgba(34,197,94,.35),transparent_18%),radial-gradient(circle_at_72%_55%,rgba(56,189,248,.35),transparent_21%),radial-gradient(circle_at_54%_78%,rgba(251,191,36,.28),transparent_14%)]" />
      <div className="absolute inset-6 rounded-[2rem] border border-white/60 bg-white/20 backdrop-blur-[1px]" />
      <div className="absolute left-5 top-5 z-10 max-w-sm rounded-3xl border bg-white/95 p-4 shadow-lg">
        <div className="flex items-center gap-2"><Badge>MapView simulasi</Badge><Badge variant="secondary">{locations.length} marker aktif</Badge></div>
        <h1 className="mt-2 text-2xl font-bold">Telehealth AU Maps</h1>
        <p className="text-sm text-slate-600">Marker ikut terfilter dari sidebar. Klik marker untuk mengaktifkan highlight dan membuka Selected Location Panel.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="destructive" onClick={() => { setShowOnlyEmergencyFacilities(true); setSidebarMode('emergency'); setSelectedMarkerId(emergencyFacilities[0]?.id); }}><Ambulance className="h-4 w-4" /> Darurat</Button>
          <Button size="sm" variant="outline" onClick={() => selected && setSelectedMarkerId(selected.id)}><Navigation className="h-4 w-4" /> Fokus</Button>
        </div>
      </div>

      {locations.slice(0, 32).map((location, index) => <SidebarMapMarker key={location.id} location={location} index={index} />)}

      {selected && (
        <aside className="absolute bottom-5 right-5 z-10 w-[min(26rem,calc(100%-2.5rem))] rounded-3xl border bg-white/95 p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-skyforce"><Building2 className="h-6 w-6" /></div><div><h2 className="font-bold">{selected.name}</h2><p className="text-sm text-slate-500">{selected.type} · {selected.city}, {selected.province}</p></div></div>
            <Badge variant={selected.hasEmergency ? 'destructive' : 'default'}>{selected.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">{selected.address}</p>
          <div className="mt-3 flex flex-wrap gap-2"><Badge>{selected.kotama}</Badge><Badge variant="secondary">{selected.staffOnline} petugas online</Badge><Badge variant="outline">{selected.accessBadge}</Badge></div>
          <div className="mt-4 grid grid-cols-3 gap-2"><Button size="sm" onClick={() => setSidebarMode('location-detail')}>Detail</Button><Button size="sm" variant="outline" onClick={() => { setSidebarMode('chat-preview'); onOpenChat(); }}><MessageSquare className="h-4 w-4" /> Chat</Button><Button size="sm" variant="outline" onClick={() => { setSidebarMode('access-request'); onRequestAccess(); }}><ShieldCheck className="h-4 w-4" /> Akses</Button></div>
        </aside>
      )}
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
          <p className="text-sm text-slate-500">Peta utama terintegrasi dengan search, filter, chat preview, dan akses sidebar.</p>
        </div>
        {selected && <Badge className="w-fit">Marker aktif: {selected.name}</Badge>}
      </div>
      <MapView onOpenChat={() => showNotice('ChatPanel simulasi dibuka dari sidebar.')} onRequestAccess={() => showNotice('AccessRequestModal simulasi dibuka dari sidebar.')} />
      <MobileMapsBottomSheet onOpenChat={() => showNotice('Chat mobile dibuka sebagai bottom sheet.')} onRequestAccess={() => showNotice('Request akses mobile dibuka.')} />
      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-night px-4 py-2 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
}
