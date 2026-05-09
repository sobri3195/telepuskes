import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Facility } from '@/types';

export function FacilityCard({ f }: { f: Facility }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <b className="min-w-0 break-words">{f.nama}</b>
          <Badge className="w-fit shrink-0">{f.jenis}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{f.alamat}, {f.kota}</p>
        <p className="break-words text-sm">{f.layananKesehatan.join(' · ')}</p>
        <p className="text-xs">{f.jarakKm.toFixed(1)} km · {f.dokterTersedia} dokter tersedia · {f.nomorKontak}</p>
      </CardContent>
    </Card>
  );
}
