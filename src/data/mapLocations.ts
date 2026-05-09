import { facilities, units, users } from '@/data/mockData';
import type { TriagePriority } from '@/types';

export type AccessBadge = 'Terbuka' | 'Butuh Akses' | 'Akses Diberikan' | 'Khusus Admin' | 'Darurat';
export type LocationStatus = 'Aktif' | 'Offline' | 'Darurat' | 'Dokter Online';
export type MapLocationType = 'Lanud' | 'RSAU' | 'RSPAU' | 'Klinik' | 'Dokter' | 'Admin' | 'Satuan';

export type MapLocation = {
  id: string;
  name: string;
  type: MapLocationType;
  city: string;
  province: string;
  kotama: string;
  address: string;
  operationalHours: string;
  services: string[];
  staffOnline: number;
  queueEstimate: string;
  status: LocationStatus;
  accessBadge: AccessBadge;
  priority: TriagePriority;
  hasEmergency: boolean;
  hasOnlineDoctor: boolean;
  adminAvailable: boolean;
  latitude: number;
  longitude: number;
  relatedPerson?: string;
  searchText: string;
};

const cityCoordinates: Record<string, [number, number]> = {
  Jakarta: [-6.2, 106.82],
  Bogor: [-6.6, 106.8],
  Medan: [3.59, 98.67],
  Pekanbaru: [0.51, 101.44],
  Bandung: [-6.91, 107.61],
  Subang: [-6.57, 107.76],
  Pontianak: [-0.03, 109.34],
  Sabang: [5.89, 95.32],
  Aceh: [5.55, 95.32],
  Tanjungpinang: [0.92, 104.45],
  Palembang: [-2.99, 104.76],
  Natuna: [3.95, 108.38],
  Padang: [-0.95, 100.35],
  Belitung: [-2.74, 107.63],
  Tasikmalaya: [-7.35, 108.22],
  Lampung: [-5.45, 105.26],
  Majalengka: [-6.84, 108.22],
  Bengkayang: [0.82, 109.47],
  Batam: [1.13, 104.05],
  Madiun: [-7.63, 111.52],
  Malang: [-7.98, 112.63],
  Makassar: [-5.14, 119.41],
  Surabaya: [-7.25, 112.75],
  Balikpapan: [-1.24, 116.85],
  Banjarmasin: [-3.32, 114.59],
  Manado: [1.47, 124.84],
  Bali: [-8.67, 115.21],
  Lombok: [-8.58, 116.1],
  Kupang: [-10.17, 123.6],
  Jayapura: [-2.53, 140.72],
  Biak: [-1.18, 136.08],
  Merauke: [-8.49, 140.4],
  Ambon: [-3.7, 128.18],
  Morotai: [2.04, 128.32],
  Timika: [-4.55, 136.89],
};

const priorities: TriagePriority[] = ['hijau', 'kuning', 'merah'];
const accessBadges: AccessBadge[] = ['Terbuka', 'Butuh Akses', 'Akses Diberikan', 'Khusus Admin', 'Darurat'];

function inferType(name: string, fallback: string): MapLocationType {
  if (name.startsWith('RSPAU')) return 'RSPAU';
  if (name.startsWith('RSAU')) return 'RSAU';
  if (name.includes('Lanud')) return 'Lanud';
  if (name.includes('Klinik') || name.includes('Puskesau') || fallback.includes('Kesehatan')) return 'Klinik';
  return fallback.includes('Satuan') || fallback.includes('Depohar') ? 'Satuan' : 'Klinik';
}

function coordinate(city: string, index: number): [number, number] {
  const base = cityCoordinates[city] ?? [-2.5, 118];
  const offset = (index % 5) * 0.045;
  return [base[0] + offset, base[1] - offset];
}

const baseLocations: MapLocation[] = [...facilities, ...units.slice(0, 42)].map((item, index) => {
  const [latitude, longitude] = item.latitude && item.longitude ? [item.latitude, item.longitude] : coordinate(item.kota, index);
  const type = inferType(item.nama, item.jenis);
  const priority = priorities[index % priorities.length];
  const accessBadge = index % 9 === 0 ? 'Darurat' : accessBadges[index % accessBadges.length];
  const hasEmergency = item.layananKesehatan.some((service) => service.toLowerCase().includes('igd')) || accessBadge === 'Darurat';
  const staffOnline = 'dokterTersedia' in item && typeof item.dokterTersedia === 'number' ? item.dokterTersedia : (index % 4) + 1;
  const status: LocationStatus = hasEmergency
    ? 'Darurat'
    : staffOnline > 2
      ? 'Dokter Online'
      : index % 7 === 0
        ? 'Offline'
        : 'Aktif';

  return {
    id: `loc-${item.id}`,
    name: item.nama,
    type,
    city: item.kota,
    province: item.provinsi,
    kotama: item.kotamaInduk,
    address: item.alamat,
    operationalHours: item.jamOperasional,
    services: item.layananKesehatan,
    staffOnline,
    queueEstimate: `${10 + (index % 6) * 5}-${20 + (index % 6) * 6} menit`,
    status,
    accessBadge,
    priority,
    hasEmergency,
    hasOnlineDoctor: staffOnline > 0,
    adminAvailable: index % 3 !== 0,
    latitude,
    longitude,
    searchText: `${item.nama} ${item.jenis} ${item.kota} ${item.provinsi} ${item.kotamaInduk} ${item.layananKesehatan.join(' ')}`.toLowerCase(),
  };
});

const peopleLocations: MapLocation[] = users.map((user, index) => {
  const facility = facilities[index % facilities.length];
  const [latitude, longitude] = coordinate(facility.kota, index + 60);
  const isAdmin = user.role.includes('Admin');
  return {
    id: `person-${user.id}`,
    name: user.name,
    type: isAdmin ? 'Admin' : 'Dokter',
    city: facility.kota,
    province: facility.provinsi,
    kotama: facility.kotamaInduk,
    address: facility.alamat,
    operationalHours: 'Online simulasi 08.00-20.00',
    services: isAdmin ? ['Persetujuan akses', 'Chat admin', 'Koordinasi faskes'] : ['Konsultasi dokter', 'Triase lanjutan', 'Resep simulasi'],
    staffOnline: 1,
    queueEstimate: isAdmin ? 'Respon 5 menit' : 'Antrean 2 pasien',
    status: 'Dokter Online',
    accessBadge: index === 0 ? 'Butuh Akses' : 'Akses Diberikan',
    priority: 'hijau',
    hasEmergency: false,
    hasOnlineDoctor: true,
    adminAvailable: isAdmin,
    latitude,
    longitude,
    relatedPerson: user.role,
    searchText: `${user.name} ${user.role} ${facility.nama} ${facility.kota} ${facility.kotamaInduk}`.toLowerCase(),
  };
});

export const mapLocations = [...baseLocations, ...peopleLocations];
