import { facilities, users } from '@/data/mockData';
import type { ClinicalChatContext, FacilityCapability, MedicalRecordSummary, ReferralPlan, SecurityAuditLog, TeleconferenceSession, TrainingModule } from '@/types';

const now = new Date().toISOString();
const facilityIds = facilities.map((facility) => facility.id);

export const facilityCapabilities: FacilityCapability[] = facilityIds.slice(0, 8).map((facilityId, index) => ({
  id: `cap-${facilityId}`,
  facilityId,
  hasGeneralDoctor: true,
  hasDentist: index % 2 === 0,
  hasNurse: true,
  hasSpecialist: index % 3 !== 1,
  specialistTypes: index % 3 === 0 ? ['Penyakit dalam', 'Bedah', 'Kedokteran penerbangan'] : index % 3 === 1 ? ['Gigi dan mulut'] : ['Jantung', 'Paru', 'Psikiatri/psikologi'],
  hasEmergencyUnit: index % 4 !== 1,
  hasAmbulance: index % 3 !== 2,
  hasPharmacy: true,
  hasLaboratory: index % 2 === 0,
  hasRadiology: index % 3 === 0,
  hasCTScan: index === 0 || index === 3,
  hasMRI: index === 0,
  hasUSG: index % 2 === 0,
  hasEKG: index % 2 !== 1,
  availableBeds: 4 + index * 3,
  canReceiveReferral: index % 4 !== 2,
  lastUpdated: now,
}));

export const medicalRecordSummaries: MedicalRecordSummary[] = [
  {
    id: 'rme-1', patientId: 'patient-1', bloodType: 'O+', allergies: ['Penisilin'], chronicDiseases: ['Hipertensi ringan'], routineMedications: ['Amlodipine 5 mg'], surgeryHistory: ['Appendektomi 2019'], hospitalizationHistory: ['Observasi dehidrasi 2023'], labResults: ['Hb 14.1 g/dL', 'Leukosit 8.200/uL', 'GDP 96 mg/dL'], radiologyResults: ['Thorax PA normal'], periodicCheckups: ['MCU tahunan: laik tugas terbatas simulasi'], aviationMedicalCheckups: ['Kesehatan penerbangan: perlu evaluasi tekanan darah'], odontogram: 'Odontogram awak pesawat: restorasi gigi 16, scaling 2026', referralHistory: ['Rujukan penyakit dalam RSAU dr. Esnawan Antariksa'], prescriptionHistory: ['Amlodipine 30 tablet', 'Paracetamol bila demam'], riskFlags: ['Monitoring tensi sebelum tugas operasi'],
  },
  {
    id: 'rme-2', patientId: 'patient-2', bloodType: 'A-', allergies: ['Debu/asma'], chronicDiseases: ['Asma intermiten'], routineMedications: ['Salbutamol inhaler PRN'], surgeryHistory: [], hospitalizationHistory: ['Serangan asma 2022'], labResults: ['SpO2 97%', 'Eosinofil meningkat ringan'], radiologyResults: ['Foto thorax: tidak tampak infiltrat'], periodicCheckups: ['Kesamaptaan: perlu kontrol paru'], aviationMedicalCheckups: ['Tidak berlaku'], odontogram: 'Kontrol gigi rutin, karies minor', referralHistory: ['Konsul paru RSPAU dr. S. Hardjolukito'], prescriptionHistory: ['Salbutamol inhaler', 'Cetirizine'], riskFlags: ['Hindari paparan asap pada daerah operasi'],
  },
];

export const clinicalChatContexts: ClinicalChatContext[] = [
  { id: 'ctx-chat-1', threadId: 'chat-1', consultationId: 'kons-1', patientId: 'patient-1', facilityId: facilityIds[0] ?? 'fac-1', triageLevel: 'hijau', needType: 'Kontrol ulang', accessClassification: 'MEDICAL_STAFF_ONLY', linkedMedicalRecordSummaryId: 'rme-1', isEmergency: false, isReferralRelated: false },
  { id: 'ctx-chat-2', threadId: 'chat-2', consultationId: 'kons-2', patientId: 'patient-2', facilityId: facilityIds[1] ?? 'fac-2', triageLevel: 'kuning', needType: 'Upload hasil lab/radiologi', accessClassification: 'REFERRAL_TEAM_ONLY', linkedMedicalRecordSummaryId: 'rme-2', isEmergency: false, isReferralRelated: true },
];

export const referralPlans: ReferralPlan[] = [
  { id: 'ref-001', patientId: 'patient-1', originFacilityId: facilityIds[2] ?? 'fac-3', destinationFacilityId: facilityIds[0] ?? 'fac-1', reason: 'Butuh evaluasi penyakit dalam dan EKG sebelum penugasan.', preliminaryDiagnosis: 'Hipertensi dengan nyeri dada atipikal', requiredSpecialty: 'Penyakit dalam', requiredEquipment: ['EKG', 'Laboratorium', 'Radiologi'], triageLevel: 'kuning', status: 'Menunggu konfirmasi', documents: ['RME ringkas', 'Hasil EKG simulasi', 'Surat rujukan simulasi'], routePolylineMock: [[-6.2, 106.82], [-6.57, 107.76]], createdAt: now, updatedAt: now },
  { id: 'ref-002', patientId: 'patient-2', originFacilityId: facilityIds[5] ?? 'fac-6', destinationFacilityId: facilityIds[3] ?? 'fac-4', reason: 'Serangan sesak prioritas merah membutuhkan IGD dan spesialis paru.', preliminaryDiagnosis: 'Eksaserbasi asma akut', requiredSpecialty: 'Paru', requiredEquipment: ['IGD', 'Ambulans', 'Oksigen', 'Radiologi'], triageLevel: 'merah', status: 'Dalam perjalanan', documents: ['Tanda vital', 'Foto obat inhaler'], routePolylineMock: [[-2.53, 140.72], [-4.55, 136.89]], createdAt: now, updatedAt: now },
];

export const teleconferenceSessions: TeleconferenceSession[] = [
  { id: 'tc-001', caseId: 'case-asma-papua', patientId: 'patient-2', requestingFacilityId: facilityIds[5] ?? 'fac-6', specialistFacilityId: facilityIds[0] ?? 'fac-1', requestedSpecialty: 'Paru', participants: ['dr. Maya - RSAU', 'Letda Kes Raka - Lanud daerah operasi', 'Admin rujukan'], status: 'Aktif', notes: ['RME ringkas dan foto inhaler sudah dikirim', 'Koneksi field mode: audio/chat prioritas'], recommendation: 'Stabilisasi jalan napas, nebulisasi sesuai SOP setempat, siapkan rujukan IGD bila tidak membaik.', startedAt: now },
];

export const securityAuditLogs: SecurityAuditLog[] = [
  { id: 'audit-001', actorUserId: users[0]?.id ?? 'user-1', actorRole: 'Dokter', action: 'Melihat RME Ringkas', targetType: 'MedicalRecordSummary', targetId: 'rme-1', accessClassification: 'MEDICAL_STAFF_ONLY', reason: 'Konsultasi aktif', isEmergencyAccess: false, createdAt: now },
  { id: 'audit-002', actorUserId: users[1]?.id ?? 'user-2', actorRole: 'Perawat/Tenaga Kesehatan', action: 'Emergency access minimal', targetType: 'MedicalRecordSummary', targetId: 'rme-2', accessClassification: 'EMERGENCY_ACCESS', reason: 'Golden hour kasus merah', isEmergencyAccess: true, createdAt: now },
];

export const trainingModules: TrainingModule[] = [
  { id: 'train-1', title: 'Webinar Kedokteran Penerbangan: Fitness to Fly', category: 'Webinar kedokteran penerbangan', targetRoles: ['Dokter', 'Perawat/Tenaga Kesehatan'], description: 'Penyegaran pemeriksaan berkala awak pesawat dan catatan risiko tugas.', schedule: 'Senin, 11 Mei 2026 09.00 WIB', status: 'Terjadwal', certificateAvailable: true },
  { id: 'train-2', title: 'Workshop Telemedicine & SOAP Note Militer', category: 'Workshop telemedicine', targetRoles: ['Dokter', 'Perawat/Tenaga Kesehatan', 'Admin Klinik/Satuan'], description: 'Standarisasi clinical chat, lampiran medis, ringkasan konsultasi, dan audit akses.', schedule: 'Rabu, 13 Mei 2026 13.00 WIB', status: 'Terjadwal', certificateAvailable: true },
  { id: 'train-3', title: 'Pelatihan Keamanan Data Medis Militer', category: 'Pelatihan keamanan data', targetRoles: ['Admin Puskesau/Pusat', 'Super Admin', 'Admin Klinik/Satuan'], description: 'Klasifikasi akses, emergency access, masking data, dan interoperabilitas RME.', schedule: 'Jumat, 15 Mei 2026 08.30 WIB', status: 'Berjalan', certificateAvailable: false },
];

export const caseDiscussions = [
  { id: 'case-1', title: 'Nyeri dada saat latihan operasi', specialty: 'Jantung', status: 'Menunggu opini spesialis', replies: 4 },
  { id: 'case-2', title: 'Gangguan cemas pra-penugasan', specialty: 'Psikiatri/psikologi', status: 'Rekomendasi edukasi siap', replies: 7 },
];
