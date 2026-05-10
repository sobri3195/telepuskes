import { useMemo } from 'react';
import type { PatientNeedType } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { facilities, units } from '@/data/mockData';

type FieldType = 'textarea' | 'text' | 'bool' | 'unit' | 'facility' | 'date';
type QuestionField = { key: string; label: string; type: FieldType; required?: boolean };

const base: QuestionField[] = [
  { key: 'keluhan', label: 'Keluhan utama apa?', type: 'textarea', required: true },
  { key: 'sejak', label: 'Sejak kapan?', type: 'text', required: true },
];

export function getQuestionFields(type: PatientNeedType): QuestionField[] {
  if (type === 'Keluhan mendadak') {
    return [
      ...base,
      { key: 'demam', label: 'Apakah ada demam?', type: 'bool' },
      { key: 'sesakNapas', label: 'Apakah ada sesak napas?', type: 'bool' },
      { key: 'nyeriDada', label: 'Apakah ada nyeri dada?', type: 'bool' },
      { key: 'penurunanKesadaran', label: 'Apakah ada penurunan kesadaran?', type: 'bool' },
      { key: 'riwayatBerat', label: 'Apakah ada riwayat penyakit berat?', type: 'bool' },
      { key: 'lokasi', label: 'Lokasi pasien saat ini di satuan/Lanud mana?', type: 'unit', required: true },
    ];
  }

  if (type === 'Resep ulang') {
    return [
      { key: 'obat', label: 'Nama obat', type: 'text', required: true },
      { key: 'dokter', label: 'Dokter sebelumnya', type: 'text' },
      { key: 'tanggalKontrol', label: 'Tanggal kontrol terakhir', type: 'date' },
      { key: 'efekSamping', label: 'Ada efek samping?', type: 'bool' },
    ];
  }

  if (type === 'Rujukan ke faskes/RSAU/RSPAU') {
    return [
      { key: 'asalRujukan', label: 'Rujukan dari mana?', type: 'text', required: true },
      { key: 'tujuanRujukan', label: 'Tujuan rujukan', type: 'text', required: true },
      { key: 'diagnosis', label: 'Keluhan/diagnosis', type: 'textarea', required: true },
      { key: 'faskesTujuan', label: 'Faskes tujuan', type: 'facility', required: true },
    ];
  }

  if (type === 'Cari fasilitas kesehatan TNI AU') {
    return [
      { key: 'lokasi', label: 'Lokasi pasien saat ini di satuan/Lanud mana?', type: 'unit', required: true },
      { key: 'tujuan', label: 'Layanan/faskes yang dicari', type: 'textarea', required: true },
    ];
  }

  return [...base, { key: 'tujuan', label: 'Apa harapan layanan Anda?', type: 'textarea' }];
}

export function getMissingRequiredFields(type: PatientNeedType, answers: Record<string, string | boolean>) {
  return getQuestionFields(type).filter((field) => field.required && !String(answers[field.key] ?? '').trim()).map((field) => field.label);
}

export function AdaptiveQuestionnaire({
  type,
  answers,
  setAnswer,
  attachments,
  setAttachments,
}: {
  type: PatientNeedType;
  answers: Record<string, string | boolean>;
  setAnswer: (k: string, v: string | boolean) => void;
  attachments: string[];
  setAttachments: (a: string[]) => void;
}) {
  const fields = useMemo(() => getQuestionFields(type), [type]);

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <label key={field.key} className="block space-y-2">
          <span className="text-sm font-medium">{field.label}{field.required && <span className="text-red-600"> *</span>}</span>
          {field.type === 'textarea' ? (
            <Textarea value={String(answers[field.key] ?? '')} onChange={(event) => setAnswer(field.key, event.target.value)} />
          ) : field.type === 'bool' ? (
            <Select value={String(answers[field.key] ?? 'false')} onChange={(event) => setAnswer(field.key, event.target.value === 'true')}>
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </Select>
          ) : field.type === 'unit' ? (
            <Select value={String(answers[field.key] ?? '')} onChange={(event) => setAnswer(field.key, event.target.value)}>
              <option value="">Pilih satuan/Lanud</option>
              {units.slice(0, 20).map((unit) => <option key={unit.id}>{unit.nama}</option>)}
            </Select>
          ) : field.type === 'facility' ? (
            <Select value={String(answers[field.key] ?? '')} onChange={(event) => setAnswer(field.key, event.target.value)}>
              <option value="">Pilih faskes tujuan</option>
              {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.nama}</option>)}
            </Select>
          ) : (
            <Input type={field.type === 'date' ? 'date' : 'text'} value={String(answers[field.key] ?? '')} onChange={(event) => setAnswer(field.key, event.target.value)} />
          )}
        </label>
      ))}
      <label className="block space-y-2">
        <span className="text-sm font-medium">Upload dokumen simulasi</span>
        <Input type="file" multiple onChange={(event) => setAttachments([...attachments, ...Array.from(event.target.files ?? []).map((file) => file.name)])} />
        {attachments.length > 0 && <p className="text-xs text-muted-foreground">Lampiran: {attachments.join(', ')}</p>}
      </label>
    </div>
  );
}
