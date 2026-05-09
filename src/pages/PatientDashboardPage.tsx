import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { facilities } from '@/data/mockData';
import { useConsultationStore } from '@/stores/consultationStore';
import { EmergencyButton } from '@/components/patient/EmergencyButton';
import { ConsultationCard } from '@/components/patient/ConsultationCard';
import { FacilityCard } from '@/components/directory/FacilityCard';

export function PatientDashboardPage() {
  const cs = useConsultationStore((s) => s.consultations);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-skyforce to-sky-800 p-4 text-white sm:p-6">
        <p className="text-sky-100">Selamat datang</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Serka Bima Pratama</h1>
        <p className="mt-2 max-w-2xl text-sm text-sky-50 sm:text-base">Sampaikan kebutuhan kesehatan, dapatkan triase awal, dan terhubung dengan faskes TNI AU secara simulasi.</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Apa kebutuhan Anda hari ini?</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:flex sm:flex-wrap">
            <Button asChild className="w-full sm:w-auto"><Link to="/app/needs">Mulai wizard kebutuhan</Link></Button>
            <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/app/units">Cari faskes TNI AU</Link></Button>
          </CardContent>
        </Card>
        <EmergencyButton />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Status kesehatan</p><p className="mt-2 text-2xl font-bold text-emerald-600">Stabil</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Konsultasi aktif</p><p className="mt-2 text-2xl font-bold">{cs.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Dokter tersedia</p><p className="mt-2 text-2xl font-bold">18</p></CardContent></Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3"><h2 className="text-xl font-semibold">Konsultasi aktif</h2>{cs.slice(0, 3).map((c) => <ConsultationCard key={c.id} c={c} />)}</div>
        <div className="space-y-3"><h2 className="text-xl font-semibold">Faskes terdekat</h2>{facilities.slice(0, 2).map((f) => <FacilityCard key={f.id} f={f} />)}</div>
      </div>
    </div>
  );
}
