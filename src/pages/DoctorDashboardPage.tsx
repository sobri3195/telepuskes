import { CaseDiscussionPanel, RmeSummaryPanel, SpecialistTeleconferenceModal, TrainingModuleList } from '@/components/command/CommandCenterComponents';
import { DoctorQueue } from '@/components/doctor/DoctorQueue';

export function DoctorDashboardPage(){return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-skyforce">Dashboard Tenaga Kesehatan</p><h1 className="text-2xl font-bold">Dashboard Dokter</h1><p className="text-sm text-slate-500">Antrian klinis, RME ringkas, teleconference spesialis, diskusi kasus, dan pendidikan berkelanjutan.</p></div><SpecialistTeleconferenceModal/></div><DoctorQueue/><RmeSummaryPanel/><CaseDiscussionPanel/><TrainingModuleList/></div>}
