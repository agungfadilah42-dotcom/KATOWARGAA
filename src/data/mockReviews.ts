import { ReportReview } from '../types';

export const INITIAL_MOCK_REVIEWS: ReportReview[] = [
  {
    id: 'rev-001',
    reportId: 'rep-002',
    ticketNumber: 'KJ-2026-0102',
    rating: 5,
    comment: 'Luar biasa respon cepatnya! Baru lapor lusa kemarin, tim teknisi Dishub Kota Jambi langsung turun ganti MCB dan bohlam LED. Sekarang jalan depan RSUD Raden Mattaher sudah terang benderang kembali di malam hari.',
    reviewerName: 'Warga Telanaipura',
    createdAt: '2026-10-13T14:20:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Ir. Hendra Saputra (Kabid Lalu Lintas & PJU)',
      responderDinas: 'Dinas Perhubungan (Dishub) Kota Jambi',
      message: 'Terima kasih atas apresiasi dan partisipasi aktif Saudara. Keselamatan dan kenyamanan pengguna jalan di Kota Jambi adalah prioritas utama kami. Tetap laporkan jika ada lampu padam di wilayah lain.',
      repliedAt: '2026-10-13T16:05:00.000Z'
    }
  },
  {
    id: 'rev-002',
    reportId: 'rep-003',
    ticketNumber: 'KJ-2026-0103',
    rating: 5,
    comment: 'Drainase di tikungan Jl. Gatot Subroto sudah dikeruk bersih. Kemarin sempat hujan lebat siang hari dan air tidak meluap ke aspal lagi. Salut untuk regu SDA PUPR Kota Jambi.',
    reviewerName: 'Siti Aminah',
    createdAt: '2026-10-17T15:40:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Ahmad Fauzi, ST (Koordinator URC Drainase)',
      responderDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
      message: 'Alhamdulillah, terima kasih Bu Siti Aminah atas konfirmasinya. Mohon bantuan masyarakat sekitar ruko untuk bersama-sama tidak membuang sampah sisa dagangan ke gorong-gorong.',
      repliedAt: '2026-10-17T17:10:00.000Z'
    }
  },
  {
    id: 'rev-003',
    reportId: 'rep-004',
    ticketNumber: 'KJ-2026-0104',
    rating: 4,
    comment: 'Tumpukan sampah liar di lahan kosong Jelutung sudah diangkut tuntas pakai 2 truk DLH dan dipasang papan perda larangan. Sedikit saran agar ada patroli rutin satpol PP di malam hari agar oknum tidak buang lagi.',
    reviewerName: 'Bambang Kusuma',
    createdAt: '2026-10-14T08:30:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'H. Sudirman, S.Sos (Kasi Pengelolaan Sampah)',
      responderDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
      message: 'Terima kasih atas ulasan dan masukan konstruktifnya Pak Bambang. Kami telah berkoordinasi dengan Satpol PP dan Lurah Cempaka Putih untuk jadwal patroli terpadu.',
      repliedAt: '2026-10-14T10:45:00.000Z'
    }
  },
  {
    id: 'rev-004',
    reportId: 'rep-005',
    ticketNumber: 'KJ-2026-0105',
    rating: 5,
    comment: 'Ayunan anak dan bangku santai Danau Sipin sudah diperbaiki dan dicat rapi kembali. Anak-anak warga sekitar sekarang bisa bermain aman lagi di sore hari. Terima kasih DLH Kota Jambi!',
    reviewerName: 'Dewi Lestari',
    createdAt: '2026-10-18T16:00:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Rina Marlina (Pengawas RTH)',
      responderDinas: 'Dinas Lingkungan Hidup (DLH) Kota Jambi',
      message: 'Sama-sama Bu Dewi. Mari kita jaga bersama sarana publik di Danau Sipin agar tetap terawat dan memberi manfaat jangka panjang bagi warga Kota Jambi.',
      repliedAt: '2026-10-18T17:30:00.000Z'
    }
  },
  {
    id: 'rev-005',
    reportId: 'rep-007',
    ticketNumber: 'KJ-2026-0107',
    rating: 4,
    comment: 'Paving block depan SMPN 1 sudah rapi dan tidak ambles lagi. Pengerjaan cepat sekitar 2 hari kerja. Terima kasih Pemkot Jambi dan dinas terkait.',
    reviewerName: 'Rian Pratama',
    createdAt: '2026-10-21T08:00:00.000Z',
    isModerated: false,
    officialReply: {
      responderName: 'Bina Marga Pelayanan Warga',
      responderDinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
      message: 'Terima kasih atas laporan dan penilaian dari Saudara Rian. Kualitas jalur pejalan kaki di zona sekolah merupakan atensi keselamatan kami.',
      repliedAt: '2026-10-21T09:15:00.000Z'
    }
  }
];
