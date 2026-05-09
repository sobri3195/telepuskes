import { Table, Td, Th } from '@/components/ui/table';
import { facilities, units } from '@/data/mockData';
import { useConsultationStore } from '@/stores/consultationStore';
import { AdminStatsCard } from './AdminStatsCard';
import { ReportFilter } from './ReportFilter';

export function AdminDashboard() {
  const consultations = useConsultationStore((s) => s.consultations);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatsCard label="Konsultasi" value={consultations.length} />
        <AdminStatsCard label="Merah" value={consultations.filter((c) => c.priority === 'merah').length} tone="red" />
        <AdminStatsCard label="Kuning" value={consultations.filter((c) => c.priority === 'kuning').length} tone="amber" />
        <AdminStatsCard label="Satuan" value={units.length} />
        <AdminStatsCard label="Faskes" value={facilities.length} />
      </div>
      <ReportFilter />
      <Table>
        <thead>
          <tr>
            <Th>Master data</Th>
            <Th>Kotama</Th>
            <Th>Kota</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {[...units.slice(0, 8), ...facilities].map((unit) => (
            <tr key={unit.id}>
              <Td>{unit.nama}</Td>
              <Td>{unit.kotamaInduk}</Td>
              <Td>{unit.kota}</Td>
              <Td>{unit.status}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
