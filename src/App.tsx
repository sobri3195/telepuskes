import { Navigate, Route, Routes } from 'react-router-dom';
import { WebAppShell } from '@/components/layout/WebAppShell';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ChatPage } from '@/pages/ChatPage';
import { ConsultationsPage } from '@/pages/ConsultationsPage';
import { DoctorDashboardPage } from '@/pages/DoctorDashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { MapsPage } from '@/pages/MapsPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PatientDashboardPage } from '@/pages/PatientDashboardPage';
import { PatientNeedsPage } from '@/pages/PatientNeedsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { UnitsDirectoryPage } from '@/pages/UnitsDirectoryPage';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types';

function Protected({ roles }: { roles?: Role[] }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />;

  return <WebAppShell />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Protected />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app/dashboard" element={<PatientDashboardPage />} />
        <Route path="/app/maps" element={<MapsPage />} />
        <Route path="/app/needs" element={<PatientNeedsPage />} />
        <Route path="/app/consultations" element={<ConsultationsPage />} />
        <Route path="/app/consultations/:id" element={<ConsultationsPage />} />
        <Route path="/app/messages" element={<ChatPage />} />
        <Route path="/app/messages/:id" element={<ChatPage />} />
        <Route path="/app/units" element={<UnitsDirectoryPage />} />
        <Route path="/app/units/:id" element={<UnitsDirectoryPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<Protected roles={['Dokter', 'Perawat/Tenaga Kesehatan']} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor/consultations/:id" element={<DoctorDashboardPage />} />
      </Route>

      <Route element={<Protected roles={['Admin Klinik/Satuan', 'Admin Puskesau/Pusat', 'Super Admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/units" element={<UnitsDirectoryPage />} />
        <Route path="/admin/facilities" element={<UnitsDirectoryPage />} />
        <Route path="/admin/reports" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}
