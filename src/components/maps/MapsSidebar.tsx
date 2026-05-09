import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  Map,
  MessageSquare,
  RadioTower,
  Route,
  Search,
  Settings,
  Star,
  Stethoscope,
  User,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { FacilityCapabilityPanel, FieldModeToggle, SecurityBadge } from '@/components/command/CommandCenterComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { mapLocations, type AccessBadge, type MapLocation } from '@/data/mapLocations';
import { organizationRoots } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarMapStore } from '@/stores/sidebarMapStore';
import type { Role } from '@/types';

const filterOptions = [
  'Semua lokasi',
  'Lanud/Satuan',
  'Faskes aktif',
  'Faskes dengan IGD/darurat',
  'Dokter online',
  'Admin faskes tersedia',
  'Butuh akses',
  'Akses tersedia',
  'Kasus darurat',
  'Prioritas merah',
  'Prioritas kuning',
  'Prioritas hijau',
  'Faskes dengan dokter spesialis',
  'Faskes dengan ambulans',
  'Faskes dengan farmasi',
  'Faskes dengan radiologi',
  'Faskes dengan laboratorium',
  'Faskes bisa menerima rujukan',
  'Faskes cocok untuk kasus pasien',
];

const accessClass: Record<AccessBadge, string> = {
  Terbuka: 'bg-sky-100 text-sky-700',
  'Butuh Akses': 'bg-amber-100 text-amber-700',
  'Akses Diberikan': 'bg-emerald-100 text-emerald-700',
  'Khusus Admin': 'bg-violet-100 text-violet-700',
  Darurat: 'bg-red-100 text-red-700',
};

function applyFilter(locations: MapLocation[]) {
  const state = useSidebarMapStore.getState();
  const query = state.searchQuery.trim().toLowerCase();
  return locations.filter((location) => {
    const matchesQuery = !query || location.searchText.includes(query);
    const matchesKotama = state.selectedKotama === 'Semua kotama' || location.kotama === state.selectedKotama;
    const matchesAccess = state.selectedAccessStatus === 'Semua akses' || location.accessBadge === state.selectedAccessStatus;
    const matchesService =
      state.selectedService === 'Semua layanan' || location.services.some((service) => service === state.selectedService);
    const matchesOnline = !state.showOnlyOnlineStaff || location.hasOnlineDoctor;
    const matchesEmergency = !state.showOnlyEmergencyFacilities || location.hasEmergency;
    const selectedType = state.selectedLocationType;
    const matchesType =
      selectedType === 'Semua lokasi' ||
      (selectedType === 'Lanud/Satuan' && ['Lanud', 'Satuan'].includes(location.type)) ||
      (selectedType === 'Faskes aktif' && ['RSAU', 'RSPAU', 'Klinik'].includes(location.type) && location.status !== 'Offline') ||
      (selectedType === 'Faskes dengan IGD/darurat' && location.hasEmergency) ||
      (selectedType === 'Dokter online' && location.hasOnlineDoctor) ||
      (selectedType === 'Admin faskes tersedia' && location.adminAvailable) ||
      (selectedType === 'Butuh akses' && location.accessBadge === 'Butuh Akses') ||
      (selectedType === 'Akses tersedia' && ['Terbuka', 'Akses Diberikan'].includes(location.accessBadge)) ||
      (selectedType === 'Kasus darurat' && location.hasEmergency) ||
      (selectedType === 'Prioritas merah' && location.priority === 'merah') ||
      (selectedType === 'Prioritas kuning' && location.priority === 'kuning') ||
      (selectedType === 'Prioritas hijau' && location.priority === 'hijau') ||
      (selectedType === 'Faskes dengan dokter spesialis' && location.hasOnlineDoctor) ||
      (selectedType === 'Faskes dengan ambulans' && location.services.some((service) => service.toLowerCase().includes('ambulans'))) ||
      (selectedType === 'Faskes dengan farmasi' && location.services.some((service) => service.toLowerCase().includes('farmasi'))) ||
      (selectedType === 'Faskes dengan radiologi' && location.services.some((service) => service.toLowerCase().includes('radiologi'))) ||
      (selectedType === 'Faskes dengan laboratorium' && location.services.some((service) => service.toLowerCase().includes('lab'))) ||
      (selectedType === 'Faskes bisa menerima rujukan' && location.services.some((service) => service.toLowerCase().includes('rujukan'))) ||
      (selectedType === 'Faskes cocok untuk kasus pasien' && location.priority !== 'hijau');
    return matchesQuery && matchesKotama && matchesAccess && matchesService && matchesOnline && matchesEmergency && matchesType;
  });
}

export function useFilteredMapLocations() {
  const state = useSidebarMapStore();
  return useMemo(() => applyFilter(mapLocations), [
    state.searchQuery,
    state.selectedKotama,
    state.selectedLocationType,
    state.selectedAccessStatus,
    state.selectedService,
    state.showOnlyOnlineStaff,
    state.showOnlyEmergencyFacilities,
  ]);
}

export function MapsSidebar() {
  const user = useAuthStore((state) => state.user);
  const isCollapsed = useSidebarMapStore((state) => state.isCollapsed);

  if (isCollapsed) {
    return (
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col border-r border-sky-100 bg-white text-slate-700 shadow-sm lg:flex">
        <div className="flex flex-col items-center gap-4 p-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-skyforce text-white"><RadioTower className="h-5 w-5" /></div>
          <SidebarCollapseButton />
          <CollapsedNav />
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-sky-100 bg-white text-slate-900 shadow-sm lg:flex">
      <div className="flex min-h-0 flex-1 flex-col">
        <SidebarBrand role={user?.role ?? 'Pasien'} online />
        <SidebarNavigation />
      </div>
    </aside>
  );
}

function SidebarBrand({ role, online }: { role: Role; online: boolean }) {
  return (
    <div className="bg-gradient-to-br from-night to-skyforce p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><RadioTower className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-100">Logo aplikasi</p>
            <h2 className="text-lg font-bold">Telehealth AU</h2>
          </div>
        </div>
        <SidebarCollapseButton />
      </div>
      <div className="mt-4 grid gap-2 text-xs">
        <div className="rounded-xl bg-white/10 p-3"><p className="text-sky-100">Role aktif</p><b>{role}</b></div>
        <div className="rounded-xl bg-white/10 p-3"><p className="text-sky-100">Status koneksi</p><b className="inline-flex items-center gap-1">{online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {online ? 'Online' : 'Offline'}</b></div>
      </div>
    </div>
  );
}

export function SidebarSearch({ locations }: { locations: MapLocation[] }) {
  const query = useSidebarMapStore((s) => s.searchQuery);
  const setSearchQuery = useSidebarMapStore((s) => s.setSearchQuery);
  const setSelectedMarkerId = useSidebarMapStore((s) => s.setSelectedMarkerId);
  const results = query ? locations.slice(0, 5) : [];
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input className="pl-9" placeholder="Cari Lanud, RSAU/RSPAU, dokter, kota, kotama..." value={query} onChange={(event) => setSearchQuery(event.target.value)} />
      </div>
      {results.length > 0 && (
        <div className="rounded-2xl border bg-white p-2 shadow-sm">
          {results.map((location) => (
            <button key={location.id} className="flex w-full items-start gap-2 rounded-xl p-2 text-left hover:bg-sky-50" onClick={() => setSelectedMarkerId(location.id)}>
              <Map className="mt-0.5 h-4 w-4 text-skyforce" />
              <span><b className="block text-sm">{location.name}</b><span className="text-xs text-slate-500">{location.type} · {location.city} · {location.kotama}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarFilter() {
  const state = useSidebarMapStore();
  const allServices = Array.from(new Set(mapLocations.flatMap((location) => location.services))).slice(0, 12);
  return (
    <section className="mb-4 space-y-3 rounded-3xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Filter Maps</h3><Button size="sm" variant="ghost" onClick={state.resetFilters}>Reset</Button></div>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button key={option} onClick={() => state.setSelectedLocationType(option)} className={`rounded-full px-3 py-1 text-xs font-semibold ${state.selectedLocationType === option ? 'bg-skyforce text-white' : 'bg-slate-100 text-slate-600'}`}>{option}</button>
        ))}
      </div>
      <Select value={state.selectedKotama} onChange={(event) => state.setSelectedKotama(event.target.value)}>
        <option>Semua kotama</option>
        {organizationRoots.map((root) => <option key={root}>{root}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Select value={state.selectedAccessStatus} onChange={(event) => state.setSelectedAccessStatus(event.target.value)}>
          <option>Semua akses</option><option>Terbuka</option><option>Butuh Akses</option><option>Akses Diberikan</option><option>Khusus Admin</option><option>Darurat</option>
        </Select>
        <Select value={state.selectedService} onChange={(event) => state.setSelectedService(event.target.value)}>
          <option>Semua layanan</option>{allServices.map((service) => <option key={service}>{service}</option>)}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.showOnlyOnlineStaff} onChange={(event) => state.setShowOnlyOnlineStaff(event.target.checked)} /> Dokter/petugas online</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.showOnlyEmergencyFacilities} onChange={(event) => state.setShowOnlyEmergencyFacilities(event.target.checked)} /> Faskes IGD/darurat</label>
      <FieldModeToggle />
    </section>
  );
}

export function SidebarLocationList({ locations, onOpenChat, onRequestAccess }: { locations: MapLocation[]; onOpenChat?: () => void; onRequestAccess?: () => void }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Daftar Lokasi/Faskes</h3><Badge>{locations.length} hasil</Badge></div>
      {locations.slice(0, 12).map((location) => <SidebarLocationItem key={location.id} location={location} onOpenChat={onOpenChat} onRequestAccess={onRequestAccess} />)}
    </section>
  );
}

export function SidebarLocationItem({ location, onOpenChat, onRequestAccess }: { location: MapLocation; onOpenChat?: () => void; onRequestAccess?: () => void }) {
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const setSelectedMarkerId = useSidebarMapStore((s) => s.setSelectedMarkerId);
  const setSidebarMode = useSidebarMapStore((s) => s.setSidebarMode);
  const isSelected = selectedMarkerId === location.id;
  return (
    <article className={`rounded-3xl border bg-white p-3 shadow-sm ${isSelected ? 'border-skyforce ring-2 ring-sky-100' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <div><h4 className="text-sm font-bold">{location.name}</h4><p className="text-xs text-slate-500">{location.type} · {location.city}, {location.province}</p></div>
        <Badge className={accessClass[location.accessBadge]}>{location.accessBadge}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs"><Badge variant="secondary">{location.status}</Badge><Badge variant={location.priority === 'merah' ? 'destructive' : 'outline'}>Prioritas {location.priority}</Badge></div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        <Button size="sm" variant="outline" onClick={() => setSelectedMarkerId(location.id)}>Peta</Button>
        <Button size="sm" variant="outline" onClick={() => { setSelectedMarkerId(location.id); setSidebarMode('location-detail'); }}>Detail</Button>
        <Button size="sm" variant="outline" onClick={() => { setSelectedMarkerId(location.id); setSidebarMode('chat-preview'); onOpenChat?.(); }}>Chat</Button>
        <Button size="sm" variant="outline" onClick={() => { setSelectedMarkerId(location.id); setSidebarMode('access-request'); onRequestAccess?.(); }}>Akses</Button>
      </div>
    </article>
  );
}

export function SidebarSelectedLocationPanel({ location, onOpenChat, onRequestAccess }: { location: MapLocation; onOpenChat?: () => void; onRequestAccess?: () => void }) {
  const setSidebarMode = useSidebarMapStore((s) => s.setSidebarMode);
  return (
    <section className="mb-4 overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className={`p-4 text-white ${location.hasEmergency ? 'bg-red-600' : 'bg-skyforce'}`}>
        <div className="flex items-start gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20"><Building2 className="h-7 w-7" /></div><div><h3 className="font-bold">{location.name}</h3><p className="text-sm text-white/80">{location.type} · {location.kotama}</p></div></div>
      </div>
      <div className="space-y-3 p-4 text-sm">
        <p>{location.address}</p>
        <p><b>Jam:</b> {location.operationalHours}</p>
        <p><b>Layanan:</b> {location.services.join(' · ')}</p>
        <div className="grid grid-cols-2 gap-2"><Badge>{location.staffOnline} petugas online</Badge><Badge variant="secondary">Antrean {location.queueEstimate}</Badge></div>
        <div className="flex flex-wrap gap-2"><Badge className={accessClass[location.accessBadge]}>Status akses: {location.accessBadge}</Badge><SecurityBadge classification={location.hasEmergency ? 'EMERGENCY_ACCESS' : 'MEDICAL_STAFF_ONLY'} /></div>
        <FacilityCapabilityPanel location={location} />
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm">Mulai Konsultasi</Button><Button size="sm" variant="outline" onClick={() => { setSidebarMode('chat-preview'); onOpenChat?.(); }}>Chat Admin</Button><Button size="sm" variant="outline">Rujuk</Button><Button size="sm" variant="outline">Teleconference</Button><Button size="sm" variant="outline" onClick={() => { setSidebarMode('access-request'); onRequestAccess?.(); }}>Minta Akses</Button><Button size="sm" variant="outline"><Route className="h-4 w-4" /> Rute</Button><Button size="sm" variant="outline" className="col-span-2"><Star className="h-4 w-4" /> Tandai Favorit</Button>
        </div>
      </div>
    </section>
  );
}

export function SidebarAccessStatus() {
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const location = mapLocations.find((item) => item.id === selectedMarkerId);
  const status = location?.accessBadge === 'Darurat' ? 'Emergency access aktif' : location?.accessBadge === 'Akses Diberikan' ? 'Disetujui' : location?.accessBadge === 'Butuh Akses' ? 'Menunggu persetujuan' : 'Belum diajukan';
  return (
    <section className="mb-4 rounded-3xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Status Akses</h3><Badge className={status.includes('Emergency') ? 'bg-red-100 text-red-700' : status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{status}</Badge></div>
      {status === 'Menunggu persetujuan' && <p className="mt-2 text-xs text-slate-500">Diajukan 10 menit lalu untuk alasan konsultasi lanjutan ke admin {location?.name}.</p>}
    </section>
  );
}

export function SidebarChatPreview({ onRequestAccess }: { onRequestAccess?: () => void }) {
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const location = mapLocations.find((item) => item.id === selectedMarkerId) ?? mapLocations[0];
  const hasAccess = location.accessBadge !== 'Butuh Akses' && location.accessBadge !== 'Khusus Admin';
  return (
    <section className="mb-4 rounded-3xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><div><h3 className="font-semibold">Clinical Chat · {location.relatedPerson ?? 'Admin Faskes'}</h3><p className="text-xs text-slate-500">{location.name} · {location.status} · konteks pasien/faskes/triase</p></div><Badge>{hasAccess ? 'Online' : 'Terkunci'}</Badge></div>
      {hasAccess ? <div className="mt-3 space-y-2 text-sm"><p className="rounded-2xl bg-slate-100 p-2">Halo, ada yang bisa kami bantu?</p><p className="rounded-2xl bg-sky-100 p-2">Saya ingin konsultasi layanan.</p><p className="rounded-2xl bg-slate-100 p-2">Silakan pilih jadwal terdekat.</p><div className="rounded-2xl bg-emerald-50 p-2 text-xs text-emerald-800">Anda terhubung dengan tenaga kesehatan terverifikasi. Percakapan disimpan sebagai riwayat konsultasi simulasi.</div><Input placeholder="Tulis pesan klinis..." /><Button size="sm" className="w-full">Buka clinical chat penuh</Button></div> : <div className="mt-3 space-y-2"><p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Anda belum memiliki akses untuk menghubungi petugas ini.</p><div className="grid gap-2"><Button size="sm" onClick={onRequestAccess}>Minta Akses</Button><Button size="sm" variant="outline">Buat Konsultasi</Button><Button size="sm" variant="outline">Pilih Faskes Lain</Button></div></div>}
    </section>
  );
}

export function SidebarAccessRequestList() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.includes('Admin');
  const requests = [{ patient: 'Serka Bima Pratama', facility: 'RSAU dr. Esnawan Antariksa', reason: 'Kontrol tekanan darah', status: 'Menunggu persetujuan' }, { patient: 'Pratu Andi Saputra', facility: 'IGD RSPAU', reason: 'Demam tinggi dan lemas', status: 'Emergency access aktif' }];
  return (
    <section className="mb-4 rounded-3xl border bg-white p-4 shadow-sm">
      <h3 className="font-semibold">Access Request</h3>
      {!isAdmin && <p className="mt-2 text-sm text-slate-500">Permintaan akses Anda tampil langsung di halaman Maps.</p>}
      {requests.map((request) => <div key={request.patient} className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm"><b>{request.patient}</b><p className="text-xs text-slate-500">{request.facility} · {request.reason}</p><Badge className={request.status.includes('Emergency') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>{request.status}</Badge>{isAdmin && <div className="mt-2 grid grid-cols-2 gap-2"><Button size="sm">Setujui</Button><Button size="sm" variant="outline">Tolak</Button><Button size="sm" variant="outline">Detail pasien</Button><Button size="sm" variant="outline">Buka chat</Button></div>}</div>)}
    </section>
  );
}

const navItems = [
  { to: '/app/maps', label: 'Maps', icon: Map },
  { to: '/app/consultations', label: 'Konsultasi', icon: Stethoscope },
  { to: '/app/messages', label: 'Pesan', icon: MessageSquare },
  { to: '/app/units', label: 'Jajaran & Faskes', icon: Building2 },
  { to: '/app/profile', label: 'Profil', icon: User },
  { to: '/doctor/dashboard', label: 'Dashboard Dokter', icon: Activity },
  { to: '/app/profile', label: 'Pengaturan', icon: Settings },
] satisfies { to: string; label: string; icon: typeof Map }[];

export function SidebarNavigation() {
  return <nav className="flex-1 overflow-y-auto p-3"><div className="grid gap-1">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={label} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-skyforce text-white' : 'text-slate-600 hover:bg-sky-50'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</div></nav>;
}

function CollapsedNav() {
  return <nav className="flex flex-col gap-2">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={label} to={to} title={label} className={({ isActive }) => `grid h-11 w-11 place-items-center rounded-2xl ${isActive ? 'bg-skyforce text-white' : 'text-slate-500 hover:bg-sky-50'}`}><Icon className="h-5 w-5" /></NavLink>)}</nav>;
}

export function SidebarCollapseButton() {
  const isCollapsed = useSidebarMapStore((s) => s.isCollapsed);
  const setCollapsed = useSidebarMapStore((s) => s.setCollapsed);
  return <Button aria-label="Toggle sidebar" variant="outline" size="icon" className="h-9 w-9 bg-white/90 text-slate-700" onClick={() => setCollapsed(!isCollapsed)}>{isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button>;
}

export function MobileMapsBottomSheet({ onOpenChat, onRequestAccess }: { onOpenChat?: () => void; onRequestAccess?: () => void }) {
  const sidebarMode = useSidebarMapStore((s) => s.sidebarMode);
  const setSidebarMode = useSidebarMapStore((s) => s.setSidebarMode);
  const selectedMarkerId = useSidebarMapStore((s) => s.selectedMarkerId);
  const locations = useFilteredMapLocations();
  const selected = mapLocations.find((location) => location.id === selectedMarkerId);
  return (
    <div className="fixed inset-x-0 bottom-14 z-30 rounded-t-3xl border bg-white p-4 shadow-2xl lg:hidden">
      <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />
      <div className="mb-3 flex items-center justify-between"><b>Command Center Maps</b><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setSidebarMode('search')}><Search className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => setSidebarMode('filter')}>Filter</Button><Button size="sm" variant="ghost" onClick={() => setSidebarMode('navigation')}><X className="h-4 w-4" /></Button></div></div>
      {sidebarMode === 'filter' && <SidebarFilter />}
      {selected && sidebarMode === 'location-detail' && <SidebarSelectedLocationPanel location={selected} onOpenChat={onOpenChat} onRequestAccess={onRequestAccess} />}
      {(sidebarMode === 'search' || sidebarMode === 'navigation' || sidebarMode === 'emergency') && <><SidebarSearch locations={locations} /><div className="mt-3 max-h-[42vh] overflow-auto"><SidebarLocationList locations={locations} onOpenChat={onOpenChat} onRequestAccess={onRequestAccess} /></div></>}
    </div>
  );
}
