import { ReportCategory } from '../types';

export interface CategoryInfo {
  id: ReportCategory;
  name: string;
  shortDesc: string;
  color: string;
  iconName: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'jalan_rusak',
    name: 'Jalan Rusak & Berlubang',
    shortDesc: 'Aspal amblas, lubang jalan membahayakan, trotoar rusak atau paving copot.',
    color: '#f97316', // Bright Orange
    iconName: 'AlertTriangle'
  },
  {
    id: 'lampu_jalan',
    name: 'Lampu Jalan Mati',
    shortDesc: 'Penerangan jalan umum (PJU) padam, tiang miring, atau kabel terkelupas.',
    color: '#f59e0b', // Vibrant Amber Gold
    iconName: 'Lightbulb'
  },
  {
    id: 'drainase_banjir',
    name: 'Drainase & Genangan Air',
    shortDesc: 'Saluran air mampet sedimen sampah, gorong-gorong rusak, atau potensi banjir.',
    color: '#0284c7', // Bright Sky Blue
    iconName: 'Droplets'
  },
  {
    id: 'sampah_kebersihan',
    name: 'Sampah & Kebersihan',
    shortDesc: 'Tumpukan sampah liar, TPS meluber, dahan pohon tumbang yang mengganggu.',
    color: '#10b981', // Vivid Emerald Green
    iconName: 'Trash2'
  },
  {
    id: 'fasilitas_publik',
    name: 'Fasilitas Publik Rusak',
    shortDesc: 'Halte bus, rambu lalu lintas, jembatan penyeberangan, atau toilet umum.',
    color: '#8b5cf6', // Electric Purple
    iconName: 'Building2'
  },
  {
    id: 'taman_ruang_terbuka',
    name: 'Taman & Ruang Terbuka',
    shortDesc: 'Fasilitas bermain ramah anak rusak, bangku taman patah, tanaman mati.',
    color: '#22c55e', // Fresh Lime Green
    iconName: 'Trees'
  },
  {
    id: 'lainnya',
    name: 'Fasilitas Umum Lainnya',
    shortDesc: 'Kendala prasarana perkotaan lainnya yang butuh perhatian pemerintah daerah.',
    color: '#6366f1', // Indigo Accent
    iconName: 'HelpCircle'
  }
];

export const KECAMATAN_LIST = [
  'Telanaipura',
  'Danau Sipin',
  'Danau Teluk',
  'Pasar Jambi',
  'Jambi Timur',
  'Jambi Selatan',
  'Jelutung',
  'Kotabaru',
  'Alam Barajo',
  'Paal Merah',
  'Pelayangan'
] as const;

export const STATUS_CONFIG = {
  menunggu_verifikasi: {
    label: 'Menunggu Verifikasi',
    description: 'Laporan baru masuk dalam sistem antrean dan sedang diperiksa oleh tim verifikator.',
    colorClass: 'text-amber-700 bg-amber-50 border-amber-300 ring-1 ring-amber-200/50',
    dotColor: '#f59e0b',
    stepNumber: 2
  },
  terverifikasi: {
    label: 'Terverifikasi',
    description: 'Laporan telah divalidasi kebenarannya dan diteruskan ke dinas teknis terkait.',
    colorClass: 'text-blue-700 bg-blue-50 border-blue-300 ring-1 ring-blue-200/50',
    dotColor: '#0284c7',
    stepNumber: 3
  },
  sedang_ditangani: {
    label: 'Sedang Ditangani',
    description: 'Tim lapangan dinas teknis telah berada di lokasi untuk pengerjaan perbaikan.',
    colorClass: 'text-cyan-800 bg-cyan-50 border-cyan-300 ring-1 ring-cyan-200/50',
    dotColor: '#06b6d4',
    stepNumber: 4
  },
  selesai: {
    label: 'Selesai',
    description: 'Pekerjaan perbaikan fasilitas umum telah rampung dan diverifikasi tuntas.',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200/50',
    dotColor: '#10b981',
    stepNumber: 5
  }
} as const;
