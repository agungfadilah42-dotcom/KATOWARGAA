import { ReportItem } from '../types';

export const INITIAL_MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rep-001',
    ticketNumber: 'KJ-2026-0101',
    title: 'Lubang Aspal Cukup Dalam di Dekat Simpang Rimbo',
    category: 'jalan_rusak',
    description: 'Terdapat lubang jalan berdiameter sekitar 70 cm dan kedalaman 12 cm di lajur kiri mengarah ke gapura batas kota. Sudah ada pengendara motor yang hampir tergelincir saat hujan malam hari.',
    kecamatan: 'Alam Barajo',
    addressDetails: 'Jl. Pattimura, sebelum lampu merah Simpang Rimbo, Kelurahan Kenali Besar',
    latitude: -1.6284,
    longitude: 103.5592,
    imageUrl: '/images/city_infrastructure_jambi_1792244147077.jpg',
    isAnonymous: false,
    reporterName: 'Fajar Rahmadi',
    assignedDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
    status: 'sedang_ditangani',
    createdAt: '2026-10-14T08:30:00.000Z',
    updatedAt: '2026-10-16T14:15:00.000Z',
    officerNotes: 'Tim Unit Reaksi Cepat (URC) Dinas PUPR Kota Jambi telah menurunkan material agregat kelas A dan alat pemadat mini pada 16 Oktober. Penambalan hotmix dijadwalkan selesai sore ini.',
    isSimulated: true,
    upvotes: 24,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-14T08:30:00.000Z',
        note: 'Laporan berhasil dibuat oleh pelapor.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-14T11:20:00.000Z',
        note: 'Laporan diverifikasi valid. Lokasi berada di ruas jalan kota dan diteruskan ke Bidang Bina Marga Dinas PUPR Kota Jambi.',
        actor: 'Admin Diskominfo Kota Jambi'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-16T09:00:00.000Z',
        note: 'Pekerjaan perbaikan dasar dan pemadatan lubang sedang berlangsung di lapangan.',
        actor: 'Tim URC Dinas PUPR'
      }
    ]
  },
  {
    id: 'rep-002',
    ticketNumber: 'KJ-2026-0102',
    title: 'Penerangan Jalan Umum (PJU) Padam 5 Tiang Beruntun',
    category: 'lampu_jalan',
    description: 'Lampu PJU sepanjang 200 meter dari depan RSUD Raden Mattaher menuju Simpang Telanaipura padam total selama 3 malam berturut-turut, membuat area gelap dan rawan kecelakaan.',
    kecamatan: 'Telanaipura',
    addressDetails: 'Jl. Raden Mattaher, depan kawasan Rumah Sakit Umum Raden Mattaher',
    latitude: -1.6025,
    longitude: 103.5938,
    imageUrl: '',
    isAnonymous: true,
    reporterName: 'Warga Telanaipura',
    assignedDinas: 'Dinas Perhubungan (Dishub) Kota Jambi',
    status: 'selesai',
    createdAt: '2026-10-11T19:40:00.000Z',
    updatedAt: '2026-10-13T10:00:00.000Z',
    officerNotes: 'Pemeriksaan menemukan kerusakan pada panel Miniature Circuit Breaker (MCB) akibat korsleting cuaca lembap. Komponen telah diganti dan 5 titik lampu kini menyala normal.',
    isSimulated: true,
    upvotes: 18,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-11T19:40:00.000Z',
        note: 'Laporan dikirim secara anonim oleh warga.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-12T08:15:00.000Z',
        note: 'Diteruskan ke Seksi Penerangan Jalan Dinas Perhubungan Kota Jambi.',
        actor: 'Verifikator Diskominfo'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-12T15:30:00.000Z',
        note: 'Mobil hidrolik teknisi Dishub melakukan pengecekan kabel udara dan panel kontrol.',
        actor: 'Teknisi Dishub Kota Jambi'
      },
      {
        status: 'selesai',
        timestamp: '2026-10-13T10:00:00.000Z',
        note: 'Penggantian MCB dan bohlam LED 120W selesai. Pengujian malam hari berhasil menyala stabil.',
        actor: 'Teknisi Dishub Kota Jambi'
      }
    ]
  },
  {
    id: 'rep-003',
    ticketNumber: 'KJ-2026-0103',
    title: 'Saluran Drainase Mampet Picu Luapan Air Saat Hujan',
    category: 'drainase_banjir',
    description: 'Gorong-gorong di tikungan Jalan Gatot Subroto tersumbat tumpukan sedimen lumpur dan potongan kayu. Air meluap ke badan jalan setinggi mata kaki setiap hujan deras lebih dari 30 menit.',
    kecamatan: 'Pasar Jambi',
    addressDetails: 'Jl. Gatot Subroto No. 45, dekat deretan ruko elektronik Pasar Jambi',
    latitude: -1.5898,
    longitude: 103.6162,
    imageUrl: '',
    isAnonymous: false,
    reporterName: 'Siti Aminah',
    assignedDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
    status: 'selesai',
    createdAt: '2026-10-15T13:10:00.000Z',
    updatedAt: '2026-10-17T11:00:00.000Z',
    officerNotes: 'Pengerukan sedimen lumpur sepanjang 60 meter dan normalisasi gorong-gorong telah tuntas dikerjakan tim Bidang SDA Dinas PUPR Kota Jambi.',
    isSimulated: true,
    upvotes: 31,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-15T13:10:00.000Z',
        note: 'Laporan masyarakat terdaftar.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-15T16:30:00.000Z',
        note: 'Laporan tervalidasi. Koordinasi dengan tim drainase Dinas PUPR dan aparat Kelurahan Pasar Jambi.',
        actor: 'Tim Pelayanan Publik'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-16T08:30:00.000Z',
        note: 'Mobil penyedot lumpur dan regu manual mengangkat 4 m3 sedimen pasir dan sampah kayu.',
        actor: 'Regu SDA PUPR'
      },
      {
        status: 'selesai',
        timestamp: '2026-10-17T11:00:00.000Z',
        note: 'Aliran drainase lancar kembali, uji alir debit air lancar menuju muara Sungai Batanghari.',
        actor: 'Pengawas PUPR'
      }
    ]
  },
  {
    id: 'rep-004',
    ticketNumber: 'KJ-2026-0104',
    title: 'Tumpukan Sampah Liar di Pinggir Lahan Kosong Jelutung',
    category: 'sampah_kebersihan',
    description: 'Terjadi pembuangan sampah rumah tangga secara liar di pinggir lahan kosong dekat pemukiman warga. Menimbulkan bau menyengat dan lalat yang mengganggu warga sekitar.',
    kecamatan: 'Jelutung',
    addressDetails: 'Jl. Hayam Wuruk, Gang Mandiri II, Kelurahan Cempaka Putih',
    latitude: -1.6152,
    longitude: 103.6210,
    imageUrl: '',
    isAnonymous: false,
    reporterName: 'Bambang Kusuma',
    assignedDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
    status: 'selesai',
    createdAt: '2026-10-12T07:20:00.000Z',
    updatedAt: '2026-10-13T16:00:00.000Z',
    officerNotes: 'Dinas Lingkungan Hidup (DLH) Kota Jambi telah mengangkut 2 truk sampah dan memasang papan larangan membuang sampah berdasar Perda Kota Jambi No. 5.',
    isSimulated: true,
    upvotes: 42,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-12T07:20:00.000Z',
        note: 'Laporan masuk dari warga Jelutung.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-12T09:40:00.000Z',
        note: 'Disetujui untuk penanganan darurat DLH Kota Jambi.',
        actor: 'Admin KATO WARGA'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-13T08:00:00.000Z',
        note: 'Petugas kebersihan DLH dengan armada dump truck membersihkan lokasi.',
        actor: 'Tim Kebersihan DLH'
      },
      {
        status: 'selesai',
        timestamp: '2026-10-13T16:00:00.000Z',
        note: 'Area telah bersih. Spanduk himbauan dan pengawasan lingkungan dipasang.',
        actor: 'Tim Kebersihan DLH'
      }
    ]
  },
  {
    id: 'rep-005',
    ticketNumber: 'KJ-2026-0105',
    title: 'Bangku Taman dan Ayunan Anak Rusak di Kawasan Danau Sipin',
    category: 'taman_ruang_terbuka',
    description: 'Dua unit bangku besi taman patah di bagian sandaran dan rantai ayunan anak putus sebelah, berisiko melukai pengunjung dan anak-anak yang bermain di jogging track Danau Sipin.',
    kecamatan: 'Danau Sipin',
    addressDetails: 'Kawasan Wisata Danau Sipin, dekat dermaga perahu tradisional',
    latitude: -1.5975,
    longitude: 103.5880,
    imageUrl: '/images/hero_smart_city_jambi_1792244146207.jpg',
    isAnonymous: false,
    reporterName: 'Dewi Lestari',
    assignedDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
    status: 'selesai',
    createdAt: '2026-10-17T05:50:00.000Z',
    updatedAt: '2026-10-18T14:30:00.000Z',
    officerNotes: 'Pengelasan rangka bangku taman dan penggantian rantai ayunan galvanis telah selesai dikerjakan oleh regu pemeliharaan taman DLH.',
    isSimulated: true,
    upvotes: 9,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-17T05:50:00.000Z',
        note: 'Laporan baru diterima dan masuk ke antrean verifikasi.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-17T08:10:00.000Z',
        note: 'Diverifikasi oleh pengelola ruang terbuka hijau DLH.',
        actor: 'Verifikator DLH'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-18T09:00:00.000Z',
        note: 'Tim teknis taman mengganti rantai ayunan dan mengecat ulang bangku taman.',
        actor: 'Teknisi Taman DLH'
      },
      {
        status: 'selesai',
        timestamp: '2026-10-18T14:30:00.000Z',
        note: 'Fasilitas bermain dan bangku santai sudah aman digunakan kembali.',
        actor: 'Pengawas DLH'
      }
    ]
  },
  {
    id: 'rep-006',
    ticketNumber: 'KJ-2026-0106',
    title: 'Rambu Petunjuk Arah Roboh Tertabrak Kendaraan',
    category: 'fasilitas_publik',
    description: 'Papan rambu petunjuk jalan menuju Bandara Sultan Thaha dan Jembatan Gentala Arasy miring 45 derajat dan fondasi cornya lepas, membahayakan pejalan kaki.',
    kecamatan: 'Kotabaru',
    addressDetails: 'Jl. H. Agus Salim, persimpangan Tugu Keris Siginjai Kota Baru',
    latitude: -1.6360,
    longitude: 103.6045,
    imageUrl: '',
    isAnonymous: false,
    reporterName: 'M. Syukri',
    assignedDinas: 'Dinas Perumahan Rakyat & Kawasan Permukiman (Perkim)',
    status: 'sedang_ditangani',
    createdAt: '2026-10-16T11:00:00.000Z',
    updatedAt: '2026-10-17T06:10:00.000Z',
    officerNotes: 'Pondasi rambu sedang dibongkar untuk pengecoran ulang tiang baja oleh seksi perlengkapan jalan Dishub & Perkim.',
    isSimulated: true,
    upvotes: 14,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-16T11:00:00.000Z',
        note: 'Laporan warga tercatat.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-16T13:20:00.000Z',
        note: 'Diverifikasi langsung oleh petugas patroli dinas.',
        actor: 'Verifikator Dinas'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-17T06:10:00.000Z',
        note: 'Pemasangan barikade pengaman dan pengerjaan re-anchor pondasi.',
        actor: 'Regu Lapangan Perkim'
      }
    ]
  },
  {
    id: 'rep-007',
    ticketNumber: 'KJ-2026-0107',
    title: 'Paving Block Trotoar Ambles Dekat Halte SMPN 1 Jambi',
    category: 'jalan_rusak',
    description: 'Trotoar pejalan kaki sepanjang 4 meter ambles sedalam 20 cm tepat di depan akses halte bus sekolah. Berbahaya bagi siswa saat jam pulang sekolah.',
    kecamatan: 'Pasar Jambi',
    addressDetails: 'Jl. Sam Ratulangi No. 12, Kelurahan Pasar Jambi',
    latitude: -1.5942,
    longitude: 103.6120,
    imageUrl: '/images/jalan-rusak-jambi.jpg',
    isAnonymous: false,
    reporterName: 'Rian Pratama',
    assignedDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
    status: 'selesai',
    createdAt: '2026-10-18T08:15:00.000Z',
    updatedAt: '2026-10-20T15:20:00.000Z',
    officerNotes: 'Sub-base pasir dan urukan tanah dipadatkan ulang serta dipasang paving interlock baru kualitas K-300.',
    isSimulated: true,
    upvotes: 27,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-18T08:15:00.000Z',
        note: 'Laporan masuk sistem KATO WARGA.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-18T10:00:00.000Z',
        note: 'Verifikasi tim Bina Marga Dinas PUPR Kota Jambi.',
        actor: 'Verifikator PUPR'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-19T08:00:00.000Z',
        note: 'Bongkar pasang paving block dan pemadatan lapisan dasar.',
        actor: 'Tim URC Bina Marga'
      },
      {
        status: 'selesai',
        timestamp: '2026-10-20T15:20:00.000Z',
        note: 'Trotoar telah rapi, rata, dan aman untuk para siswa serta pejalan kaki.',
        actor: 'Pengawas PUPR'
      }
    ]
  },
  {
    id: 'rep-008',
    ticketNumber: 'KJ-2026-0108',
    title: 'Kendala Sinyal Akses Portal Layanan Publik Kelurahan',
    category: 'lainnya',
    description: 'Akses hotspot wifi publik dan pengurusan berkas administrasi kelurahan online sempat lambat di jam pelayanan pagi.',
    kecamatan: 'Jambi Selatan',
    addressDetails: 'Kantor Kelurahan Tambak Sari, Jl. Marsda Surya Dharma',
    latitude: -1.6310,
    longitude: 103.6280,
    imageUrl: '',
    isAnonymous: false,
    reporterName: 'Hendri Kurniawan',
    assignedDinas: 'Dinas Komunikasi dan Informatika (Diskominfo)',
    status: 'selesai',
    createdAt: '2026-10-19T09:30:00.000Z',
    updatedAt: '2026-10-20T11:45:00.000Z',
    officerNotes: 'Pembersihan cache router Mikrotik dan peningkatan alokasi bandwidth fiber optic ke kantor kelurahan telah dilakukan oleh Network Operation Center (NOC) Diskominfo.',
    isSimulated: true,
    upvotes: 11,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: '2026-10-19T09:30:00.000Z',
        note: 'Laporan terdaftar.',
        actor: 'Sistem KATO WARGA'
      },
      {
        status: 'terverifikasi',
        timestamp: '2026-10-19T10:15:00.000Z',
        note: 'Diteruskan ke Tim Infrastruktur Jaringan & SPBE Diskominfo.',
        actor: 'Operator Diskominfo'
      },
      {
        status: 'sedang_ditangani',
        timestamp: '2026-10-19T14:00:00.000Z',
        note: 'Teknisi NOC mengecek kestabilan jalur fiber optic dan konfigurasi DNS.',
        actor: 'Teknisi NOC Diskominfo'
      },
      {
        status: 'selesai',
        timestamp: '2026-10-20T11:45:00.000Z',
        note: 'Koneksi stabil di kecepatan 100 Mbps, sistem pelayanan kelurahan berjalan normal.',
        actor: 'Koordinator Jaringan Diskominfo'
      }
    ]
  }
];
