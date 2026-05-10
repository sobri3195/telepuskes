import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConsultationCard } from '@/components/patient/ConsultationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { TriageBadge } from '@/components/patient/TriageBadge';

type Filter = 'Semua' | 'Aktif' | 'Selesai';

export function ConsultationsPage() {
  const { id } = useParams();
  const consultations = useConsultationStore((s) => s.consultations);
  const chats = useChatStore((s) => s.chats);
  const [filter, setFilter] = useState<Filter>('Semua');
  const consultation = consultations.find((item) => item.id === id);
  const filteredConsultations = useMemo(() => {
    if (filter === 'Aktif') return consultations.filter((item) => item.status !== 'Selesai');
    if (filter === 'Selesai') return consultations.filter((item) => item.status === 'Selesai');
    return consultations;
  }, [consultations, filter]);

  if (id && consultation) {
    const chatId = chats.find((chat) => chat.consultationId === consultation.id)?.id;
    return (
      <Card>
        <CardHeader><CardTitle className="flex justify-between">{consultation.title}<TriageBadge priority={consultation.priority} /></CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>{consultation.summary}</p>
          <p>Dokter: {consultation.doctorName}</p>
          <p>Status: {consultation.status}</p>
          <Button asChild><Link to={chatId ? `/app/messages/${chatId}` : '/app/messages'}>Lanjutkan chat</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Riwayat Konsultasi</h1>
      <div className="flex gap-2">
        {(['Semua', 'Aktif', 'Selesai'] as const).map((item) => (
          <Button key={item} variant={filter === item ? 'default' : 'outline'} onClick={() => setFilter(item)}>{item}</Button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filteredConsultations.length > 0 ? filteredConsultations.map((item) => <ConsultationCard key={item.id} c={item} />) : (
          <Card><CardContent className="pt-5 text-sm text-muted-foreground">Tidak ada konsultasi untuk filter {filter.toLowerCase()}.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
