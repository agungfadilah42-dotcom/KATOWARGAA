import { DinasDefinition, ReportCategory } from '../types';

export const DINAS_LIST: DinasDefinition[] = [
  {
    id: 'dinas_pupr',
    name: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
    shortName: 'Dinas PUPR',
    code: 'PUPR',
    categoryIds: ['jalan_rusak', 'drainase_banjir'],
    slaHoursInitial: 24, // 1 x 24 jam
    slaHoursResolution: 72, // 3 x 24 jam (target tanggap darurat jalan/drainase)
    color: '#f97316', // Orange
    address: 'Jl. H. Zainir Haviz No. 1, Kota Jambi',
    contact: '(0741) 40822'
  },
  {
    id: 'dinas_dishub',
    name: 'Dinas Perhubungan (Dishub) Kota Jambi',
    shortName: 'Dinas Perhubungan',
    code: 'DISHUB',
    categoryIds: ['lampu_jalan'],
    slaHoursInitial: 24,
    slaHoursResolution: 48, // 2 x 24 jam untuk perbaikan PJU / kabel
    color: '#f59e0b', // Amber
    address: 'Jl. H. Agus Salim No. 04, Kota Baru, Jambi',
    contact: '(0741) 41258'
  },
  {
    id: 'dinas_dlh',
    name: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
    shortName: 'Dinas LH (DLH)',
    code: 'DLH',
    categoryIds: ['sampah_kebersihan', 'taman_ruang_terbuka'],
    slaHoursInitial: 12, // 12 jam respons cepat sampah
    slaHoursResolution: 36, // 1.5 hari pembersihan & pengangkutan
    color: '#10b981', // Emerald Green
    address: 'Jl. Arif Rahman Hakim No. 12, Telanaipura, Jambi',
    contact: '(0741) 60412'
  },
  {
    id: 'dinas_perkim',
    name: 'Dinas Perumahan Rakyat & Kawasan Permukiman (Perkim)',
    shortName: 'Dinas Perkim',
    code: 'PERKIM',
    categoryIds: ['fasilitas_publik'],
    slaHoursInitial: 24,
    slaHoursResolution: 96, // 4 hari penanganan fasilitas fisik
    color: '#8b5cf6', // Purple
    address: 'Jl. Basuki Rahmat No. 02, Kota Baru, Jambi',
    contact: '(0741) 42109'
  },
  {
    id: 'dinas_diskominfo',
    name: 'Dinas Komunikasi dan Informatika (Diskominfo)',
    shortName: 'Diskominfo',
    code: 'KOMINFO',
    categoryIds: ['lainnya'],
    slaHoursInitial: 12,
    slaHoursResolution: 48,
    color: '#06b6d4', // Cyan
    address: 'Gedung Kantor Walikota Jambi Lantai 3',
    contact: '(0741) 667822'
  },
  {
    id: 'satpol_pp',
    name: 'Satuan Polisi Pamong Praja (Satpol PP) Kota Jambi',
    shortName: 'Satpol PP',
    code: 'SATPOL-PP',
    categoryIds: [],
    slaHoursInitial: 12,
    slaHoursResolution: 24,
    color: '#ef4444', // Red
    address: 'Jl. H. Agus Salim, Kota Baru, Jambi',
    contact: '(0741) 40223'
  }
];

export function getDinasForCategory(category: ReportCategory): DinasDefinition {
  const found = DINAS_LIST.find(d => d.categoryIds.includes(category));
  return found || DINAS_LIST[4]; // Default to Diskominfo if not matched
}

export function getDinasById(id: string): DinasDefinition | undefined {
  return DINAS_LIST.find(d => d.id === id);
}

export function getDinasByName(name: string): DinasDefinition | undefined {
  const norm = name.toLowerCase();
  return DINAS_LIST.find(d => 
    norm.includes(d.code.toLowerCase()) || 
    norm.includes(d.shortName.toLowerCase()) ||
    d.name.toLowerCase().includes(norm)
  );
}
