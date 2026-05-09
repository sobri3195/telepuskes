import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { securityAuditLogs } from '@/data/commandCenterData';
import type { ConnectionStatus, SecurityAuditLog } from '@/types';

type CommandCenterState = {
  healthCommandMode: boolean;
  fieldMode: boolean;
  connectionStatus: ConnectionStatus;
  emergencyAccess: boolean;
  auditLogs: SecurityAuditLog[];
  setHealthCommandMode: (value: boolean) => void;
  setFieldMode: (value: boolean) => void;
  setConnectionStatus: (value: ConnectionStatus) => void;
  setEmergencyAccess: (value: boolean) => void;
  addAuditLog: (log: SecurityAuditLog) => void;
};

export const useCommandCenterStore = create<CommandCenterState>()(
  persist(
    (set) => ({
      healthCommandMode: true,
      fieldMode: false,
      connectionStatus: 'Stabil',
      emergencyAccess: false,
      auditLogs: securityAuditLogs,
      setHealthCommandMode: (healthCommandMode) => set({ healthCommandMode }),
      setFieldMode: (fieldMode) => set({ fieldMode, connectionStatus: fieldMode ? 'Terbatas' : 'Stabil' }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setEmergencyAccess: (emergencyAccess) => set({ emergencyAccess }),
      addAuditLog: (log) => set((state) => ({ auditLogs: [log, ...state.auditLogs].slice(0, 30) })),
    }),
    { name: 'telehealth-au-command-center' },
  ),
);
