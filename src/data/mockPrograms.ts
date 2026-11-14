import { GovernmentProgram, ProgramReview } from '../types';

export const INITIAL_MOCK_PROGRAMS: GovernmentProgram[] = [
  {
    id: 'prog-001',
    title: 'Normalisasi Drainase Utama & Pompanisasi Anti-Genangan Kawasan Pasar Jambi & Jelutung',
    imageUrl: '/images/city_infrastructure_jambi_1792244147077.jpg',
    description: 'Pengerukan sedimentasi lumpur tebal dan pelebaran saluran drainase primer sepanjang 3,8 kilometer melintasi sentra perdagangan Pasar Jambi menuju hilir Danau Sipin dan Sungai Batanghari. Dilengkapi pembangunan 2 unit rumah pompa otomatis kapasitas 1.500 liter/detik untuk mencegah banjir rob musiman.',
    objective: 'Menuntaskan titik rawan genangan air di sentra ekonomi Kota Jambi, mengurangi waktu surut genangan air pasca hujan lebat dari 2 jam menjadi kurang dari 20 menit.',
    responsibleDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
    category: 'infrastruktur',
    location: 'Kecamatan Pasar Jambi & Jelutung (Jl. Gatot Subroto - Jl. Hayam Wuruk)',
    startDate: '2026-06-01',
    endDate: '2026-12-15',
    status: 'berlangsung',
    progressPercentage: 68,
    documentationImages: [
      '/images/city_infrastructure_jambi_1792244147077.jpg',
      '/images/jalan-rusak-jambi.jpg'
    ],
    createdAt: '2026-05-15T08:00:00.000Z',
    updatedAt: '2026-10-22T10:30:00.000Z'
  },
  {
    id: 'prog-002',
    title: 'Pengembangan Jaringan Smart PJU Hemat Energi & Pemantauan IoT 1.200 Titik',
    imageUrl: '/images/hero-smart-city.jpg',
    description: 'Konversi lampu penerangan jalan konvensional menjadi lampu LED hemat energi berspesifikasi 120W yang terhubung dengan modul IoT (Internet of Things) dan sensor fotosel pintar. Dilengkapi sistem pendeteksi padam otomatis yang langsung terhubung ke Command Center Kota Jambi.',
    objective: 'Mewujudkan efisiensi konsumsi listrik PJU perkotaan hingga 42%, meningkatkan visibilitas keselamatan berkendara di malam hari, dan merespons gangguan lampu padam kurang dari 24 jam.',
    responsibleDinas: 'Dinas Perhubungan (Dishub) Kota Jambi',
    category: 'transportasi',
    location: 'Ruas Jalan Arteri & Kolektor 11 Kecamatan se-Kota Jambi',
    startDate: '2026-01-10',
    endDate: '2026-09-30',
    status: 'selesai',
    progressPercentage: 100,
    documentationImages: [
      '/images/hero-smart-city.jpg',
      '/images/hero_smart_city_jambi_1792244146207.jpg'
    ],
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-10-01T15:00:00.000Z'
  },
  {
    id: 'prog-003',
    title: 'Revitalisasi Fasilitas Ramah Anak & Jalur Jogging Wisata Danau Sipin',
    imageUrl: '/images/hero_smart_city_jambi_1792244146207.jpg',
    description: 'Peningkatan estetika dan keselamatan ruang terbuka hijau di tepian Danau Sipin meliputi perbaikan jogging track sepanjang 1,2 km, penambahan 20 unit bangku taman ergonomis, penerangan solar-cell ramah lingkungan, peremajaan arena bermain anak (playground), dan tempat sampah pilah 3 warna.',
    objective: 'Menyediakan ruang publik inklusif, sehat, dan aman bagi keluarga serta mendukung Danau Sipin sebagai destinasi sport-tourism unggulan Kota Jambi.',
    responsibleDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
    category: 'taman_tata_kota',
    location: 'Kawasan Wisata Danau Sipin, Kelurahan Legok, Kec. Danau Sipin',
    startDate: '2026-04-01',
    endDate: '2026-11-20',
    status: 'berlangsung',
    progressPercentage: 82,
    documentationImages: [
      '/images/hero_smart_city_jambi_1792244146207.jpg'
    ],
    createdAt: '2026-03-20T10:00:00.000Z',
    updatedAt: '2026-10-18T16:00:00.000Z'
  },
  {
    id: 'prog-004',
    title: 'Optimalisasi TPST-RDF Talang Gulo & Edukasi Bank Sampah Berbasis Komunitas',
    imageUrl: '/images/smart_governance_civic_1792244147893.jpg',
    description: 'Pemanfaatan teknologi pemilahan sampah modern di Tempat Pengolahan Sampah Terpadu (TPST) Talang Gulo menjadi Refuse Derived Fuel (RDF) sebagai substitusi bahan bakar pabrik semen, disertai pembentukan 45 Bank Sampah Unit baru di tingkat RT/RW dan kelurahan se-Kota Jambi.',
    objective: 'Mengurangi timbulan sampah harian yang masuk ke landfill TPA hingga 35%, serta memberdayakan ekonomi sirkular warga melalui tabungan emas sampah.',
    responsibleDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
    category: 'kebersihan_lingkungan',
    location: 'Kawasan TPA/TPST Talang Gulo, Kec. Kotabaru & 62 Kelurahan',
    startDate: '2026-02-15',
    endDate: '2026-12-30',
    status: 'berlangsung',
    progressPercentage: 74,
    documentationImages: [
      '/images/smart_governance_civic_1792244147893.jpg'
    ],
    createdAt: '2026-02-01T11:30:00.000Z',
    updatedAt: '2026-10-20T14:10:00.000Z'
  },
  {
    id: 'prog-005',
    title: 'Pembangunan Koridor Trotoar Ramah Disabilitas Simpang Tugu Keris Siginjai',
    imageUrl: '/images/jalan-rusak-jambi.jpg',
    description: 'Penataan ulang pedestrian sepanjang 1,8 kilometer di sekitar bundaran ikonik Tugu Keris Siginjai. Menggunakan ubin pemandu difabel (guiding block tuna netra), ramp kursi roda landai, bollard pengaman anti-sepeda motor, serta kanopi peneduh pohon pule dan tabebuya.',
    objective: 'Mewujudkan pedestrian walk yang berkeselamatan, aksesibel bagi kaum lansia dan penyandang disabilitas, serta memperkuat identitas kota cerdas humanis.',
    responsibleDinas: 'Dinas Perumahan Rakyat & Kawasan Permukiman (Perkim)',
    category: 'infrastruktur',
    location: 'Kawasan Perkantoran Walikota & Tugu Keris Siginjai, Kec. Kotabaru',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    status: 'selesai',
    progressPercentage: 100,
    documentationImages: [
      '/images/jalan-rusak-jambi.jpg',
      '/images/smart-governance.jpg'
    ],
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z'
  },
  {
    id: 'prog-006',
    title: 'Pengembangan Jambi Super-App & Wifi Publik Terbuka 50 Titik Fasilitas Umum',
    imageUrl: '/images/smart-governance.jpg',
    description: 'Integrasi seluruh layanan publik kedinasan ke dalam satu portal digital terpadu (KATO WARGA, SIPADE, perizinan OSS, info antrean RSUD Abdul Manap) didukung penyediaan akses internet nirkabel pita lebar berkecepatan tinggi gratis di 50 titik strategis taman, halte, dan puskesmas kelurahan.',
    objective: 'Memangkas birokrasi, mempercepat layanan dokumen kependudukan dalam genggaman, dan memperkecil kesenjangan literasi digital masyarakat Kota Jambi.',
    responsibleDinas: 'Dinas Komunikasi dan Informatika (Diskominfo)',
    category: 'digitalisasi_pelayanan',
    location: 'Seluruh Wilayah Kota Jambi (Fasilitas Publik & Gedung Pelayanan)',
    startDate: '2026-07-01',
    endDate: '2027-02-28',
    status: 'direncanakan',
    progressPercentage: 25,
    documentationImages: [
      '/images/smart-governance.jpg'
    ],
    createdAt: '2026-06-10T13:00:00.000Z',
    updatedAt: '2026-10-24T09:00:00.000Z'
  }
];

export const INITIAL_MOCK_PROGRAM_REVIEWS: ProgramReview[] = [
  {
    id: 'prev-001',
    programId: 'prog-001',
    rating: 5,
    comment: 'Pengerukan drainase di Jl. Gatot Subroto sangat terasa dampaknya. Kemarin hujan deras hampir 1 jam, biasanya jalanan depan toko kami tergenang semata kaki, sekarang alirannya cepat turun ke saluran primer. Semoga pengerjaan rumah pompa cepat rampung sebelum puncak musim hujan November.',
    reviewerName: 'H. Rusli Thamrin',
    reviewerRole: 'Pelaku Usaha Toko Pasar Jambi',
    feedbackType: 'masukan_pelaksanaan',
    createdAt: '2026-10-20T11:30:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Ir. Ridwan, M.Eng (Pejabat Pembuat Komitmen PUPR)',
      responderDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
      message: 'Terima kasih atas masukannya Pak H. Rusli. Dua unit mesin pompa saat ini sedang dalam tahap instalasi elektrikal dan ditargetkan uji coba operasional pada minggu pertama November 2026.',
      repliedAt: '2026-10-21T09:15:00.000Z'
    }
  },
  {
    id: 'prev-002',
    programId: 'prog-002',
    rating: 5,
    comment: 'Hasil penggantian lampu PJU Smart LED sangat memuaskan. Jalur Telanaipura menuju Simpang Rimbo yang dulunya remang-remang sekarang terang merata dengan cahaya putih yang tidak menyilaukan mata pengendara. Kinerja Dishub Kota Jambi mantap!',
    reviewerName: 'Dimas Aditya',
    reviewerRole: 'Pengguna Jalan Harian & Driver Online',
    feedbackType: 'evaluasi_hasil',
    createdAt: '2026-10-15T20:10:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Bidang Sarana dan Prasarana Dishub',
      responderDinas: 'Dinas Perhubungan (Dishub) Kota Jambi',
      message: 'Apresiasi yang tinggi untuk Saudara Dimas. Pemantauan realtime melalui dashboard IoT kami terus berjalan 24 jam untuk menjamin keandalan setiap tiang lampu.',
      repliedAt: '2026-10-16T08:45:00.000Z'
    }
  },
  {
    id: 'prev-003',
    programId: 'prog-003',
    rating: 4,
    comment: 'Kawasan Danau Sipin sekarang jauh lebih indah dan tertata. Bangku taman dan lampu solar cell membuat suasana sore nyaman untuk jalan santai bersama keluarga. Masukan sedikit: mohon ditambah tong sampah khusus puntung rokok dan botol plastik di dekat dermaga barat.',
    reviewerName: 'Nurhaliza Rahmawati',
    reviewerRole: 'Warga Kelurahan Legok',
    feedbackType: 'masukan_pelaksanaan',
    createdAt: '2026-10-19T17:40:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Unit Pelaksana Teknis RTH DLH',
      responderDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
      message: 'Terima kasih banyak atas sarannya Bu Nurhaliza. Sebanyak 10 set tempat sampah pilah tambahan telah masuk dalam rencana pengadaan termin akhir bulan ini.',
      repliedAt: '2026-10-20T10:00:00.000Z'
    }
  },
  {
    id: 'prev-004',
    programId: 'prog-005',
    rating: 5,
    comment: 'Sebagai penyandang disabilitas tunanetra, guiding block ubin kuning di sekitar pedestrian Tugu Keris Siginjai sangat membantu orientasi langkah saya. Bollard pengamannya juga efektif menahan motor agar tidak menyerobot trotoar. Terima kasih atas perhatian Pemkot Jambi terhadap kaum disabilitas.',
    reviewerName: 'Sulaiman Lubis',
    reviewerRole: 'Aktivis Sahabat Difabel Jambi',
    feedbackType: 'evaluasi_hasil',
    createdAt: '2026-09-25T14:20:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Kasi Perencanaan PSU Dinas Perkim',
      responderDinas: 'Dinas Perumahan Rakyat & Kawasan Permukiman (Perkim)',
      message: 'Kami sangat bersyukur fasilitas ini bermanfaat langsung bagi Pak Sulaiman dan rekan-rekan disabilitas. Standar aksesibilitas universal ini akan kami terapkan pada seluruh proyek trotoar kota ke depan.',
      repliedAt: '2026-09-26T09:30:00.000Z'
    }
  }
];
