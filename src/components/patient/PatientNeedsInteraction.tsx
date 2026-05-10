import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { facilities, needTypes } from '@/data/mockData';
import { autoReply, evaluateTriage } from '@/lib/triage';
import { useChatStore } from '@/stores/chatStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { usePatientNeedStore } from '@/stores/patientNeedStore';
import type { PatientNeedType } from '@/types';
import { AdaptiveQuestionnaire, getMissingRequiredFields } from './AdaptiveQuestionnaire';
import { NeedSelectionCard } from './NeedSelectionCard';
import { TriageResultCard } from './TriageResultCard';

export function PatientNeedsInteraction() {
  const [params] = useSearchParams();
  const [type, setType] = useState<PatientNeedType>();
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [attachments, setAttachments] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string>();
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof evaluateTriage>>();
  const hasSubmittedEmergency = useRef(false);
  const addNeed = usePatientNeedStore((s) => s.addNeed);
  const addConsultation = useConsultationStore((s) => s.addConsultation);
  const upsertChat = useChatStore((s) => s.upsertChat);
  const navigate = useNavigate();

  useEffect(() => {
    if (params.get('emergency')) setType('Pertolongan darurat');
  }, [params]);

  useEffect(() => {
    if (type === 'Pertolongan darurat' && !hasSubmittedEmergency.current) {
      hasSubmittedEmergency.current = true;
      submit('Pertolongan darurat');
    }
  }, [type]);

  function submit(force?: PatientNeedType) {
    const selected = force || type;
    if (!selected) return;

    const missingFields = selected === 'Pertolongan darurat' ? [] : getMissingRequiredFields(selected, answers);
    if (missingFields.length > 0) {
      setError(`Lengkapi terlebih dahulu: ${missingFields.join(', ')}.`);
      return;
    }

    setError('');
    const selectedFacilityId = typeof answers.faskesTujuan === 'string' && answers.faskesTujuan ? answers.faskesTujuan : facilities[0].id;
    const triage = evaluateTriage(selected, answers, selectedFacilityId);
    const id = crypto.randomUUID();
    const need = {
      id: `need-${id}`,
      type: selected,
      answers,
      attachments,
      triage,
      createdAt: new Date().toISOString(),
      facilityId: triage.facilityId,
    };
    const consultation = {
      id: `kons-${id}`,
      needId: need.id,
      patientName: 'Serka Bima Pratama',
      doctorName: triage.priority === 'merah' ? 'Tim IGD RSAU' : 'dr. Maya Anggraini, Sp.PD',
      title: selected,
      priority: triage.priority,
      status: triage.priority === 'merah' ? 'Darurat' : 'Menunggu',
      createdAt: need.createdAt,
      summary: triage.reason,
    } as const;
    const chat = {
      id: `chat-${id}`,
      consultationId: consultation.id,
      title: `Chat ${selected}`,
      participants: ['Pasien', consultation.doctorName],
      priority: triage.priority,
      messages: [{
        id: `msg-${id}`,
        chatId: `chat-${id}`,
        sender: 'system' as const,
        text: autoReply(triage.priority),
        timestamp: new Date().toISOString(),
        status: 'dibaca' as const,
      }],
    };

    addNeed(need);
    addConsultation(consultation);
    upsertChat(chat);
    setResult(triage);
    setChatId(chat.id);
    if (selected === 'Pertolongan darurat') setTimeout(() => navigate(`/app/messages/${chat.id}`), 900);
  }

  return (
    <div className="space-y-5">
      {!type && (
        <>
          <div>
            <h2 className="text-2xl font-bold">Apa kebutuhan Anda hari ini?</h2>
            <p className="text-muted-foreground">Pilih kebutuhan untuk memulai pertanyaan adaptif dan triase awal.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {needTypes.map((need) => <NeedSelectionCard key={need} type={need} onSelect={setType} />)}
          </div>
        </>
      )}

      {type === 'Pertolongan darurat' && !result && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex gap-2 text-red-700"><AlertTriangle /> Peringatan darurat</CardTitle>
          </CardHeader>
          <CardContent>Hubungi faskes terdekat dan menuju IGD. Membuat konsultasi prioritas merah...</CardContent>
        </Card>
      )}

      {type && type !== 'Pertolongan darurat' && !result && (
        <Card>
          <CardHeader><CardTitle>{type}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <AdaptiveQuestionnaire
              type={type}
              answers={answers}
              setAnswer={(key, value) => setAnswers((current) => ({ ...current, [key]: value }))}
              attachments={attachments}
              setAttachments={setAttachments}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setType(undefined)}>Kembali</Button>
              <Button onClick={() => submit()}>Lihat hasil triase</Button>
            </div>
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </CardContent>
        </Card>
      )}

      {result && <TriageResultCard result={result} chatId={chatId} />}
    </div>
  );
}
