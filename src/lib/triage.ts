import type { PatientNeedType, TriageResult } from '@/types';

const redKeywords = [
  'nyeri dada',
  'sesak napas berat',
  'penurunan kesadaran',
  'kejang',
  'perdarahan hebat',
  'cedera berat',
  'stroke',
  'alergi berat',
  'bunuh diri',
  'menyakiti diri',
  'kehamilan perdarahan',
];

const yellowKeywords = [
  'demam tinggi',
  'nyeri',
  'muntah berulang',
  'lebih dari 3 hari',
  'penyakit kronis',
  'rujukan cepat',
  'lansia',
  'anak',
  'hasil lab abnormal',
  'rontgen',
];

export function evaluateTriage(type: PatientNeedType, answers: Record<string, string | boolean>, facilityId?: string): TriageResult {
  const text = Object.values(answers).join(' ').toLowerCase();
  const hasRedFlag =
    type === 'Pertolongan darurat' ||
    redKeywords.some((keyword) => text.includes(keyword)) ||
    answers.nyeriDada === true ||
    answers.sesakNapas === true ||
    answers.penurunanKesadaran === true;

  if (hasRedFlag) {
    return {
      priority: 'merah',
      reason: 'Terdapat tanda bahaya yang berpotensi darurat.',
      recommendation: 'Segera menuju IGD/faskes TNI AU terdekat atau hubungi bantuan darurat. Chat pendampingan dibuka.',
      facilityId,
    };
  }

  const needsPriority =
    type === 'Rujukan ke faskes/RSAU/RSPAU' ||
    type === 'Keluhan mendadak' ||
    type === 'Konsultasi psikologi/mental' ||
    type === 'Upload hasil lab/radiologi' ||
    yellowKeywords.some((keyword) => text.includes(keyword)) ||
    answers.demam === true ||
    answers.riwayatBerat === true;

  if (needsPriority) {
    return {
      priority: 'kuning',
      reason: 'Keluhan membutuhkan prioritas dan evaluasi tenaga kesehatan.',
      recommendation: 'Tetap di lokasi aman, siapkan dokumen medis, dan lanjutkan chat prioritas.',
      facilityId,
    };
  }

  return {
    priority: 'hijau',
    reason: 'Keluhan masuk kategori ringan/terjadwal tanpa tanda bahaya.',
    recommendation: 'Lanjutkan konsultasi online, kontrol sesuai jadwal, dan pantau gejala.',
    facilityId,
  };
}

export const autoReply = (priority: 'merah' | 'kuning' | 'hijau') =>
  priority === 'merah'
    ? 'Kondisi Anda berpotensi darurat. Segera menuju faskes/IGD terdekat. Kami tetap membuka chat pendampingan.'
    : priority === 'kuning'
      ? 'Keluhan Anda memerlukan prioritas. Mohon jelaskan kondisi terakhir Anda secara detail.'
      : 'Terima kasih, keluhan Anda sudah kami terima. Dokter akan membantu melalui chat ini.';
