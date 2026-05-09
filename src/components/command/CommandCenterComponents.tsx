import { useMemo } from 'react';
import { AlertTriangle, BookOpen, Clock, FileText, Lock, Route, ShieldCheck, Video, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { facilityCapabilities, medicalRecordSummaries, referralPlans, teleconferenceSessions, trainingModules, caseDiscussions } from '@/data/commandCenterData';
import { mapLocations, type MapLocation } from '@/data/mapLocations';
import { useCommandCenterStore } from '@/stores/commandCenterStore';
import type { AccessClassification, ConnectionStatus, FacilityCapability, MedicalRecordSummary, ReferralPlan, TriagePriority } from '@/types';

const classificationLabel: Record<AccessClassification, string> = {
  PUBLIC_HEALTH_INFO: 'Informasi Umum', UNIT_HEALTH_INFO: 'Info Kesehatan Satuan', PATIENT_PRIVATE: 'Data Pasien', MEDICAL_STAFF_ONLY: 'Khusus Tenaga Medis', REFERRAL_TEAM_ONLY: 'Khusus Tim Rujukan', ADMIN_FASKES_ONLY: 'Khusus Admin', DISKESAU_ONLY: 'Diskesau/Puskesau', EMERGENCY_ACCESS: 'Emergency Access', MILITARY_RESTRICTED: 'Data Terbatas Militer',
};

const classificationClass: Record<AccessClassification, string> = {
  PUBLIC_HEALTH_INFO: 'bg-sky-100 text-sky-700', UNIT_HEALTH_INFO: 'bg-blue-100 text-blue-700', PATIENT_PRIVATE: 'bg-emerald-100 text-emerald-700', MEDICAL_STAFF_ONLY: 'bg-violet-100 text-violet-700', REFERRAL_TEAM_ONLY: 'bg-orange-100 text-orange-700', ADMIN_FASKES_ONLY: 'bg-slate-100 text-slate-700', DISKESAU_ONLY: 'bg-indigo-100 text-indigo-700', EMERGENCY_ACCESS: 'bg-red-100 text-red-700', MILITARY_RESTRICTED: 'bg-zinc-900 text-white',
};

function getCapability(location?: MapLocation) {
  const rawId = location?.id.replace('loc-', '');
  return facilityCapabilities.find((capability) => capability.facilityId === rawId) ?? facilityCapabilities[0];
}

function capabilityScore(capability: FacilityCapability) {
  const checks = [capability.hasGeneralDoctor, capability.hasDentist, capability.hasNurse, capability.hasSpecialist, capability.hasEmergencyUnit, capability.hasAmbulance, capability.hasPharmacy, capability.hasLaboratory, capability.hasRadiology, capability.hasCTScan, capability.hasMRI, capability.hasUSG, capability.hasEKG, capability.canReceiveReferral];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function SecurityBadge({ classification }: { classification: AccessClassification }) {
  return <Badge className={classificationClass[classification]}><ShieldCheck className="h-3 w-3" /> {classificationLabel[classification]}</Badge>;
}

export function AccessControlNotice({ classification = 'MEDICAL_STAFF_ONLY', hasAccess }: { classification?: AccessClassification; hasAccess: boolean }) {
  return <div className={`rounded-2xl border p-3 text-sm ${hasAccess ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}><div className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" /> {hasAccess ? 'Akses klinis aktif' : 'Anda tidak memiliki akses untuk melihat data medis ini.'}</div><p className="mt-1">Klasifikasi: <SecurityBadge classification={classification} /> Semua akses data medis dicatat dalam audit log simulasi.</p></div>;
}

export function SensitiveDataMask({ value, hasAccess }: { value: string; hasAccess: boolean }) {
  return <span>{hasAccess ? value : '•••••••• (masked)'}</span>;
}

export function EmergencyAccessBanner() {
  const enabled = useCommandCenterStore((s) => s.emergencyAccess);
  const setEmergencyAccess = useCommandCenterStore((s) => s.setEmergencyAccess);
  if (!enabled) return null;
  return <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex items-center justify-between gap-3"><b className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Emergency access minimal aktif</b><Button size="sm" variant="outline" onClick={() => setEmergencyAccess(false)}>Nonaktifkan</Button></div><p className="mt-1">Akses dibatasi pada data yang dibutuhkan untuk menyelamatkan pasien dan dicatat sebagai audit darurat.</p></div>;
}

export function ConsentModal() {
  return <Dialog><DialogTrigger asChild><Button size="sm" variant="outline"><ShieldCheck className="h-4 w-4" /> Consent konsultasi</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Persetujuan Konsultasi Simulasi</DialogTitle><DialogDescription>Dengan melanjutkan, pasien memahami bahwa percakapan klinis, lampiran, dan ringkasan konsultasi disimpan sebagai riwayat konsultasi simulasi.</DialogDescription></DialogHeader><div className="space-y-2 text-sm"><p>Data medis hanya dapat diakses oleh pihak yang berwenang sesuai role, konteks pelayanan, dan kebutuhan rujukan.</p><p className="rounded-2xl bg-amber-50 p-3 text-amber-800">Prototype ini tidak menggantikan penanganan IGD langsung.</p><Button>Saya mengerti dan setuju</Button></div></DialogContent></Dialog>;
}

export function AuditTrailPreview() {
  const logs = useCommandCenterStore((s) => s.auditLogs);
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Audit Trail Simulasi</h3><Badge>{logs.length} akses</Badge></div><div className="mt-3 space-y-2">{logs.slice(0, 5).map((log) => <div key={log.id} className="rounded-2xl bg-slate-50 p-3 text-xs"><div className="flex items-center justify-between gap-2"><b>{log.action}</b><SecurityBadge classification={log.accessClassification} /></div><p>{log.actorRole} · {log.reason} · {new Date(log.createdAt).toLocaleString('id-ID')}</p><p>Mode: {log.isEmergencyAccess ? 'emergency' : 'normal'} · Target: {log.targetType}/{log.targetId}</p></div>)}</div></section>;
}

export function CapabilityBadge({ label, available }: { label: string; available: boolean }) { return <Badge variant={available ? 'default' : 'outline'} className={available ? 'bg-emerald-600' : 'text-slate-500'}>{available ? '✓' : '–'} {label}</Badge>; }

export function FacilityCapabilityPanel({ location }: { location?: MapLocation }) {
  const capability = getCapability(location);
  const score = capabilityScore(capability);
  const labels = ['Dokter umum', 'Dokter gigi', 'Perawat/paramedis', 'Spesialis', 'IGD', 'Ambulans', 'Farmasi', 'Laboratorium', 'Radiologi', 'CT Scan', 'MRI', 'USG', 'EKG', 'Rujukan'];
  const values = [capability.hasGeneralDoctor, capability.hasDentist, capability.hasNurse, capability.hasSpecialist, capability.hasEmergencyUnit, capability.hasAmbulance, capability.hasPharmacy, capability.hasLaboratory, capability.hasRadiology, capability.hasCTScan, capability.hasMRI, capability.hasUSG, capability.hasEKG, capability.canReceiveReferral];
  const available = labels.filter((_, i) => values[i]);
  const unavailable = labels.filter((_, i) => !values[i]);
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="font-bold">Faskes Capability Layer</h3><p className="text-xs text-slate-500">{location?.name ?? 'Faskes rekomendasi'} · update {new Date(capability.lastUpdated).toLocaleString('id-ID')}</p></div><Badge className="bg-emerald-600">Score {score}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><CapabilityBadge label="IGD" available={capability.hasEmergencyUnit} /><CapabilityBadge label="Ambulans" available={capability.hasAmbulance} /><CapabilityBadge label="Lab" available={capability.hasLaboratory} /><CapabilityBadge label="Radiologi" available={capability.hasRadiology} /><CapabilityBadge label="Rujukan" available={capability.canReceiveReferral} /><Badge variant="secondary">Bed {capability.availableBeds}</Badge></div><div className="mt-3 grid gap-3 md:grid-cols-2"><div><b className="text-sm">Layanan tersedia</b><p className="mt-1 text-xs text-slate-600">{available.join(' · ')}</p></div><div><b className="text-sm">Belum tersedia</b><p className="mt-1 text-xs text-slate-600">{unavailable.join(' · ') || 'Lengkap'}</p></div></div><p className="mt-3 text-xs"><b>Spesialis:</b> {capability.specialistTypes.join(', ') || 'Tidak tersedia'} · <b>Estimasi antrean:</b> 15-25 menit · <b>Status rujukan:</b> {capability.canReceiveReferral ? 'Menerima' : 'Penuh/terbatas'}</p><div className="mt-3 grid grid-cols-2 gap-2"><Button size="sm">Konsultasi</Button><Button size="sm" variant="outline">Chat admin</Button><Button size="sm" variant="outline">Rujuk</Button><Button size="sm" variant="outline">Teleconference</Button></div></section>;
}

export function AllergyAlertCard({ record }: { record: MedicalRecordSummary }) { return <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800"><b className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Allergy Alert</b><p>{record.allergies.join(', ') || 'Tidak ada alergi tercatat'}</p></div>; }

export function MedicalTimeline({ record }: { record: MedicalRecordSummary }) {
  const items = [...record.periodicCheckups, ...record.aviationMedicalCheckups, ...record.referralHistory, ...record.prescriptionHistory].slice(0, 6);
  return <div className="space-y-2">{items.map((item, index) => <div key={item} className="flex gap-3 text-sm"><span className="mt-1 h-2 w-2 rounded-full bg-skyforce" /><p><b>2026-{String(index + 1).padStart(2, '0')}</b> · {item}</p></div>)}</div>;
}

export function RmeSummaryPanel({ hasAccess = true, record = medicalRecordSummaries[0] }: { hasAccess?: boolean; record?: MedicalRecordSummary }) {
  if (!hasAccess) return <AccessControlNotice hasAccess={false} classification="PATIENT_PRIVATE" />;
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">RME Ringkas</h3><p className="text-xs text-slate-500">Prajurit · Satuan Udara · Kotama simulasi · Faskes pilihan RSAU</p></div><SecurityBadge classification="MEDICAL_STAFF_ONLY" /></div><div className="mt-3 grid gap-3 md:grid-cols-2"><AllergyAlertCard record={record} /><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Identitas & risiko</b><p>Gol. darah <SensitiveDataMask value={record.bloodType} hasAccess={hasAccess} /> · {record.riskFlags.join(', ')}</p><p>Riwayat penyakit: {record.chronicDiseases.join(', ')}</p></div></div><div className="mt-3 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Lab terbaru</b><p>{record.labResults.join(' · ')}</p></div><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Radiologi</b><p>{record.radiologyResults.join(' · ')}</p></div><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Odontogram</b><p>{record.odontogram}</p></div></div><div className="mt-4"><h4 className="mb-2 font-semibold">Timeline Rekam Medis</h4><MedicalTimeline record={record} /></div></section>;
}

export function ClinicalContextHeader({ priority = 'kuning' }: { priority?: TriagePriority }) {
  const hasAccess = priority !== 'merah';
  return <div className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">Clinical Chat Context</h3><p className="text-sm text-slate-500">Pasien Serka Bima · RSAU dr. Esnawan · Keluhan: kontrol/rujukan · Lokasi pasien tercatat</p></div><Badge variant={priority === 'merah' ? 'destructive' : 'default'}>Triase {priority}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><SecurityBadge classification="MEDICAL_STAFF_ONLY" /><Badge variant="secondary">Lampiran medis aktif</Badge><Badge variant="secondary">SOAP ready</Badge><Badge variant="secondary">Status rujukan: draft</Badge></div><AccessControlNotice hasAccess={hasAccess} classification={hasAccess ? 'MEDICAL_STAFF_ONLY' : 'EMERGENCY_ACCESS'} /></div>;
}

export function SoapNoteDrawer() { return <Dialog><DialogTrigger asChild><Button size="sm" variant="outline"><FileText className="h-4 w-4" /> Buat Catatan SOAP</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>SOAP Note Simulasi</DialogTitle><DialogDescription>Ringkasan otomatis dari clinical chat yang dapat masuk ke riwayat konsultasi mock.</DialogDescription></DialogHeader><Textarea defaultValue={'S: Pasien mengeluh sesak ringan\nO: Tanda vital belum lengkap\nA: Observasi keluhan respirasi\nP: Edukasi, upload hasil pemeriksaan, pertimbangkan rujukan bila memburuk'} /></DialogContent></Dialog>; }

export function ClinicalChatPanel() {
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><ClinicalContextHeader /><div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm"><p><b>Trust:</b> Anda terhubung dengan tenaga kesehatan terverifikasi.</p><p>Percakapan ini disimpan sebagai bagian dari riwayat konsultasi simulasi.</p><p>Data medis hanya dapat diakses oleh pihak yang berwenang.</p></div><div className="mt-3 flex flex-wrap gap-2"><SoapNoteDrawer /><Button size="sm" variant="outline">Buat Resep Simulasi</Button><Button size="sm" variant="outline">Buat Rujukan</Button><Button size="sm" variant="outline">Jadwalkan Follow-up</Button><Button size="sm" variant="outline">Minta Teleconference Spesialis</Button><Button size="sm" variant="destructive">Tandai Darurat</Button><Button size="sm">Tutup Konsultasi</Button></div></section>;
}

export function SpecialistTeleconferenceModal() {
  const session = teleconferenceSessions[0];
  return <Dialog><DialogTrigger asChild><Button variant="outline"><Video className="h-4 w-4" /> Teleconference Spesialis</Button></DialogTrigger><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Teleconference Spesialis</DialogTitle><DialogDescription>Ruang video placeholder untuk konsultasi tenaga medis daerah operasi dengan spesialis TNI AU.</DialogDescription></DialogHeader><div className="grid gap-4 md:grid-cols-[1.4fr_.8fr]"><div className="grid min-h-64 place-items-center rounded-3xl bg-slate-900 text-white"><div className="text-center"><Video className="mx-auto h-12 w-12" /><b>Video call simulasi</b><p className="text-sm text-slate-300">Fallback audio/chat saat Field Mode bandwidth rendah.</p></div></div><div className="space-y-3 text-sm"><Badge className="bg-violet-600">{session.requestedSpecialty}</Badge><p><b>Peserta:</b> {session.participants.join(' · ')}</p><p><b>Dokumen kasus:</b> RME ringkas, lab/radiologi, foto keluhan.</p><p><b>Rekomendasi:</b> {session.recommendation}</p><Textarea placeholder="Catatan rekomendasi spesialis..." /></div></div></DialogContent></Dialog>;
}

export function ReferralRouteMapLayer({ referral = referralPlans[0] }: { referral?: ReferralPlan }) { return <div className={`rounded-3xl border p-4 text-sm ${referral.triageLevel === 'merah' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}><b className="flex items-center gap-2"><Route className="h-4 w-4" /> Referral route mock</b><p>Origin biru → destination oranye{referral.triageLevel === 'merah' ? '/merah emergency' : ''}. Polyline: {referral.routePolylineMock.map((point) => point.join(',')).join(' → ')}</p></div>; }

export function ReferralPlanningPanel() {
  const referral = referralPlans[0];
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Referral Planning</h3><Badge className="bg-orange-500">{referral.status}</Badge></div><p className="mt-2 text-sm text-slate-600">Sistem merekomendasikan faskes tujuan berdasarkan lokasi, spesialis {referral.requiredSpecialty}, alat {referral.requiredEquipment.join(', ')}, IGD, antrean rendah, dan status menerima rujukan.</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Data referral</b><p>No: {referral.id}</p><p>Diagnosis awal: {referral.preliminaryDiagnosis}</p><p>Dokumen: {referral.documents.join(', ')}</p></div><ReferralRouteMapLayer referral={referral} /></div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm">Ajukan Referral Request</Button><Button size="sm" variant="outline">Buka Chat Koordinasi</Button><Button size="sm" variant="outline">Ubah Status</Button></div></section>;
}

export function GoldenHourChecklist() {
  const items = ['Pastikan pasien aman', 'Hubungi faskes/IGD', 'Catat lokasi pasien', 'Catat tanda vital jika ada', 'Upload foto/dokumen jika aman', 'Siapkan rujukan', 'Hubungi admin/dokter jaga'];
  return <div className="grid gap-2">{items.map((item) => <label key={item} className="flex items-center gap-2 text-sm"><input type="checkbox" /> {item}</label>)}</div>;
}

export function GoldenHourBanner() {
  const setEmergencyAccess = useCommandCenterStore((s) => s.setEmergencyAccess);
  return <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4" /> Golden Hour Mode — 60:00</h3><p className="text-sm">Aktif untuk kasus prioritas merah: IGD terdekat, ambulans tersedia, admin online, chat darurat, dan referral cepat.</p></div><Button variant="destructive" onClick={() => setEmergencyAccess(true)}>Aktifkan emergency access</Button></div><div className="mt-3 grid gap-3 md:grid-cols-2"><GoldenHourChecklist /><p className="rounded-2xl bg-white p-3 text-sm">Disclaimer: aplikasi tidak menggantikan penanganan IGD langsung. Hubungi fasilitas gawat darurat sesuai SOP satuan.</p></div></section>;
}

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) { const offline = status === 'Offline simulasi'; return <Badge className={offline ? 'bg-slate-600' : status === 'Buruk' ? 'bg-red-600' : status === 'Terbatas' ? 'bg-amber-500' : 'bg-emerald-600'}>{offline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />} {status}</Badge>; }

export function FieldModeToggle() {
  const fieldMode = useCommandCenterStore((s) => s.fieldMode);
  const setFieldMode = useCommandCenterStore((s) => s.setFieldMode);
  const status = useCommandCenterStore((s) => s.connectionStatus);
  const setConnectionStatus = useCommandCenterStore((s) => s.setConnectionStatus);
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">Field Mode / Low Bandwidth</h3><p className="text-sm text-slate-500">UI ringan, daftar lokasi fallback, chat teks prioritas, kompresi upload simulasi, draft lokal, dan sync ulang saat online.</p></div><Button variant={fieldMode ? 'default' : 'outline'} onClick={() => setFieldMode(!fieldMode)}>{fieldMode ? 'Field Mode aktif' : 'Aktifkan Field Mode'}</Button></div><div className="mt-3 flex flex-wrap items-center gap-2"><ConnectionStatusBadge status={status} /><Select className="max-w-48" value={status} onChange={(event) => setConnectionStatus(event.target.value as ConnectionStatus)}><option>Stabil</option><option>Terbatas</option><option>Buruk</option><option>Offline simulasi</option></Select><Badge variant="secondary">Cache RME tersedia</Badge><Badge variant="secondary">Draft lokal tersimpan</Badge></div></section>;
}

export function SatuSehatSyncSimulation() {
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><h3 className="font-bold">Interoperability & RME Sync</h3><p className="mt-1 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Integrasi data kesehatan nasional harus tetap memperhatikan kerahasiaan data personel militer dan kebijakan akses yang berlaku.</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Status sinkronisasi</b><p>RME lokal: tersinkron 86%</p><p>SatuSehat simulasi: siap preview</p><p>Konflik data: 2 item butuh verifikasi</p></div><div className="rounded-2xl bg-slate-50 p-3 text-sm"><b>Data sharing</b><p>Boleh: demografi minimal, alergi, obat, rujukan umum.</p><p>Dibatasi: kesiapan tugas, catatan operasi, data terbatas militer.</p></div></div><div className="mt-3 flex gap-2"><Button size="sm" variant="outline">Preview Data Sharing</Button><Button size="sm">Sync Simulasi</Button></div></section>;
}

export function TrainingModuleList() {
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold">Pendidikan Berkelanjutan</h3><BookOpen className="h-5 w-5 text-skyforce" /></div><div className="mt-3 grid gap-3 md:grid-cols-3">{trainingModules.map((module) => <article key={module.id} className="rounded-2xl bg-slate-50 p-3 text-sm"><Badge>{module.category}</Badge><h4 className="mt-2 font-semibold">{module.title}</h4><p className="text-xs text-slate-500">{module.schedule}</p><p className="mt-2">{module.description}</p><Badge variant="secondary" className="mt-2">{module.certificateAvailable ? 'Sertifikat simulasi' : module.status}</Badge></article>)}</div></section>;
}

export function CaseDiscussionPanel() {
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><h3 className="font-bold">Diskusi Kasus Antar Dokter</h3><div className="mt-3 grid gap-2">{caseDiscussions.map((discussion) => <div key={discussion.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm"><div><b>{discussion.title}</b><p>{discussion.specialty} · {discussion.status}</p></div><Badge>{discussion.replies} balasan</Badge></div>)}</div></section>;
}

export function DiskesauCommandDashboard() {
  const active = mapLocations.filter((location) => location.status !== 'Offline').length;
  const offline = mapLocations.length - active;
  const red = mapLocations.filter((location) => location.priority === 'merah').length;
  const yellow = mapLocations.filter((location) => location.priority === 'kuning').length;
  const green = mapLocations.filter((location) => location.priority === 'hijau').length;
  const stats = [{ label: 'Faskes aktif', value: active }, { label: 'Faskes offline', value: offline }, { label: 'Kasus merah', value: red }, { label: 'Kasus kuning', value: yellow }, { label: 'Kasus hijau', value: green }, { label: 'Rujukan aktif', value: referralPlans.length }, { label: 'Teleconference aktif', value: teleconferenceSessions.length }, { label: 'Dokter online', value: mapLocations.filter((location) => location.hasOnlineDoctor).length }];
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">Dashboard Diskesau / Puskesau</h3><p className="text-sm text-slate-500">Dashboard pusat berbasis maps untuk kesiapan layanan kesehatan nasional.</p></div><div className="flex flex-wrap gap-2"><Select className="w-32"><option>Kotama</option></Select><Select className="w-32"><option>Triase</option></Select><Select className="w-32"><option>Tanggal</option></Select></div></div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{stat.label}</p><b className="text-2xl">{stat.value}</b></div>)}</div><div className="mt-3 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-red-50 p-3 text-sm"><b>Heatmap emergency</b><p>Jakarta, Papua, Natuna prioritas pantau.</p></div><div className="rounded-2xl bg-orange-50 p-3 text-sm"><b>Heatmap rujukan</b><p>Rute RSAU/RSPAU tinggi dan antrean sedang.</p></div><div className="rounded-2xl bg-sky-50 p-3 text-sm"><b>Statistik respons</b><p>Median chat klinis 6 menit · referral 18 menit.</p></div></div></section>;
}

export function HealthCommandMap({ selectedLocation }: { selectedLocation?: MapLocation }) {
  const mode = useCommandCenterStore((s) => s.healthCommandMode);
  const setMode = useCommandCenterStore((s) => s.setHealthCommandMode);
  const markerSummary = useMemo(() => ({ units: mapLocations.filter((location) => ['Lanud', 'Satuan'].includes(location.type)).length, facilities: mapLocations.filter((location) => ['RSAU', 'RSPAU', 'Klinik'].includes(location.type)).length, doctors: mapLocations.filter((location) => location.type === 'Dokter').length, emergency: mapLocations.filter((location) => location.hasEmergency).length, referrals: referralPlans.length }), []);
  return <section className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-skyforce">Mode peta</p><h3 className="font-bold">Health Command Map</h3><p className="text-sm text-slate-500">Military Health Command Map: Lanud, RSAU/RSPAU, klinik, tenaga medis, spesialis, admin satuan, kasus aktif, emergency, rujukan, daerah operasi, dan capability layer.</p></div><Button variant={mode ? 'default' : 'outline'} onClick={() => setMode(!mode)}>{mode ? 'Command mode aktif' : 'Aktifkan'}</Button></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-5"><Badge className="bg-blue-600">Biru satuan {markerSummary.units}</Badge><Badge className="bg-emerald-600">Hijau faskes {markerSummary.facilities}</Badge><Badge className="bg-red-600">Merah emergency {markerSummary.emergency}</Badge><Badge className="bg-violet-600">Ungu spesialis {markerSummary.doctors}</Badge><Badge className="bg-orange-500">Oranye rujukan {markerSummary.referrals}</Badge></div>{selectedLocation && <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm"><b>Marker terpilih:</b> {selectedLocation.name} · {selectedLocation.status} · {selectedLocation.services.join(' · ')}</div>}</section>;
}

export function MilitaryHealthCommandStack({ selectedLocation }: { selectedLocation?: MapLocation }) {
  return <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><div className="space-y-4"><HealthCommandMap selectedLocation={selectedLocation} /><FacilityCapabilityPanel location={selectedLocation} /><GoldenHourBanner /><ReferralPlanningPanel /></div><div className="space-y-4"><EmergencyAccessBanner /><RmeSummaryPanel /><ClinicalChatPanel /><SpecialistTeleconferenceModal /><FieldModeToggle /><SatuSehatSyncSimulation /><AuditTrailPreview /></div></div>;
}
