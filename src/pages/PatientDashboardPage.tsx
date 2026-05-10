import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { facilities } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { EmergencyButton } from '@/components/patient/EmergencyButton';
import { ConsultationCard } from '@/components/patient/ConsultationCard';
import { FacilityCard } from '@/components/directory/FacilityCard';

export function PatientDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const consultations = useConsultationStore((s) => s.consultations);
  const activeConsultations = consultations.filter((consultation) => consultation.status !== 'Selesai');
  const emergencyCount = consultations.filter((consultation) => consultation.priority === 'merah').length;
  const availableDoctors = facilities.reduce((total, facility) => total + facility.dokterTersedia, 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-skyforce to-sky-800 text-white">
        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.5fr_.8fr]">
          <div>
            <p className="text-sky-100">Selamat datang</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{user?.name ?? 'Personel TNI AU'}</h1>
            <p className="mt-2 max-w-2xl text-sm text-sky-50 sm:text-base">
              Sampaikan kebutuhan kesehatan, dapatkan triase awal, dan terhubung dengan faskes TNI AU secara simulasi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1">{user?.status ?? user?.role ?? 'Pasien'}</span>
              {user?.phone && <span className="rounded-full bg-white/15 px-3 py-1">Kontak: {user.phone}</span>}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-sky-100">Ringkasan hari ini</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><b className="block text-2xl">{activeConsultations.length}</b>Konsultasi aktif</div>
              <div><b className="block text-2xl">{availableDoctors}</b>Dokter tersedia</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Apa kebutuhan Anda hari ini?</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:flex sm:flex-wrap">
            <Button asChild className="w-full sm:w-auto"><Link to="/app/needs"><ClipboardList className="h-4 w-4" /> Mulai wizard kebutuhan</Link></Button>
            <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/app/units"><MapPin className="h-4 w-4" /> Cari faskes TNI AU</Link></Button>
            <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/app/messages"><MessageSquare className="h-4 w-4" /> Lanjutkan chat</Link></Button>
          </CardContent>
        </Card>
        <EmergencyButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Status kesehatan</p><p className="mt-2 text-2xl font-bold text-emerald-600">Stabil</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Konsultasi aktif</p><p className="mt-2 text-2xl font-bold">{activeConsultations.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Prioritas merah</p><p className="mt-2 flex items-center gap-2 text-2xl font-bold text-red-600"><AlertTriangle className="h-5 w-5" /> {emergencyCount}</p></CardContent></Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Konsultasi aktif</h2>
          {activeConsultations.length > 0 ? activeConsultations.slice(0, 3).map((consultation) => <ConsultationCard key={consultation.id} c={consultation} />) : (
            <Card><CardContent className="pt-5 text-sm text-muted-foreground">Belum ada konsultasi aktif. Mulai wizard kebutuhan untuk membuat triase baru.</CardContent></Card>
          )}
        </div>
        <div className="space-y-3"><h2 className="text-xl font-semibold">Faskes terdekat</h2>{facilities.slice(0, 2).map((facility) => <FacilityCard key={facility.id} f={facility} />)}</div>
      </div>
    </div>
  );
}
