import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarMode =
  | 'navigation'
  | 'search'
  | 'filter'
  | 'location-detail'
  | 'chat-preview'
  | 'access-request'
  | 'emergency';

export type SidebarMapState = {
  isCollapsed: boolean;
  activeTab: string;
  searchQuery: string;
  selectedKotama: string;
  selectedLocationType: string;
  selectedAccessStatus: string;
  selectedService: string;
  selectedMarkerId?: string;
  showOnlyOnlineStaff: boolean;
  showOnlyEmergencyFacilities: boolean;
  sidebarMode: SidebarMode;
  setCollapsed: (value: boolean) => void;
  setActiveTab: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSelectedKotama: (value: string) => void;
  setSelectedLocationType: (value: string) => void;
  setSelectedAccessStatus: (value: string) => void;
  setSelectedService: (value: string) => void;
  setSelectedMarkerId: (value?: string) => void;
  setShowOnlyOnlineStaff: (value: boolean) => void;
  setShowOnlyEmergencyFacilities: (value: boolean) => void;
  setSidebarMode: (value: SidebarMode) => void;
  resetFilters: () => void;
};

const defaults = {
  isCollapsed: false,
  activeTab: 'Maps',
  searchQuery: '',
  selectedKotama: 'Semua kotama',
  selectedLocationType: 'Semua lokasi',
  selectedAccessStatus: 'Semua akses',
  selectedService: 'Semua layanan',
  selectedMarkerId: undefined,
  showOnlyOnlineStaff: false,
  showOnlyEmergencyFacilities: false,
  sidebarMode: 'navigation' as SidebarMode,
};

export const useSidebarMapStore = create<SidebarMapState>()(
  persist(
    (set) => ({
      ...defaults,
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setSearchQuery: (searchQuery) => set({ searchQuery, sidebarMode: searchQuery ? 'search' : 'navigation' }),
      setSelectedKotama: (selectedKotama) => set({ selectedKotama, sidebarMode: 'filter' }),
      setSelectedLocationType: (selectedLocationType) => set({ selectedLocationType, sidebarMode: 'filter' }),
      setSelectedAccessStatus: (selectedAccessStatus) => set({ selectedAccessStatus, sidebarMode: 'filter' }),
      setSelectedService: (selectedService) => set({ selectedService, sidebarMode: 'filter' }),
      setSelectedMarkerId: (selectedMarkerId) =>
        set({ selectedMarkerId, sidebarMode: selectedMarkerId ? 'location-detail' : 'navigation' }),
      setShowOnlyOnlineStaff: (showOnlyOnlineStaff) => set({ showOnlyOnlineStaff, sidebarMode: 'filter' }),
      setShowOnlyEmergencyFacilities: (showOnlyEmergencyFacilities) =>
        set({ showOnlyEmergencyFacilities, sidebarMode: showOnlyEmergencyFacilities ? 'emergency' : 'filter' }),
      setSidebarMode: (sidebarMode) => set({ sidebarMode }),
      resetFilters: () =>
        set({
          searchQuery: defaults.searchQuery,
          selectedKotama: defaults.selectedKotama,
          selectedLocationType: defaults.selectedLocationType,
          selectedAccessStatus: defaults.selectedAccessStatus,
          selectedService: defaults.selectedService,
          showOnlyOnlineStaff: defaults.showOnlyOnlineStaff,
          showOnlyEmergencyFacilities: defaults.showOnlyEmergencyFacilities,
          sidebarMode: defaults.sidebarMode,
        }),
    }),
    { name: 'telehealth-au-sidebar-map' },
  ),
);
