import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AuditTrailPreview, DiskesauCommandDashboard, SatuSehatSyncSimulation } from '@/components/command/CommandCenterComponents';

export function AdminDashboardPage(){return <div className="space-y-4"><div><p className="text-sm font-semibold text-skyforce">Diskesau / Puskesau Command Center</p><h1 className="text-2xl font-bold">Dashboard Admin</h1><p className="text-sm text-slate-500">Pantau faskes aktif, kasus triase, referral, teleconference, keterbatasan layanan, keamanan data, dan interoperabilitas RME.</p></div><DiskesauCommandDashboard/><AdminDashboard/><SatuSehatSyncSimulation/><AuditTrailPreview/></div>}
