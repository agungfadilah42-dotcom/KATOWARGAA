import React, { useState } from 'react';
import { ReportItem, ReportCategory } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../data/categories';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { KatoEmblemSvg } from '../components/KatoLogo';
import { StatReportsModal, StatFilterType } from '../components/StatReportsModal';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Droplets, 
  Trash2, 
  Building2, 
  Trees, 
  HelpCircle,
  Eye,
  FileCheck2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Search,
  BarChart2
} from 'lucide-react';

interface HomeViewProps {
  reports: ReportItem[];
  onNavigate: (view: string, extra?: { category?: ReportCategory; ticket?: string }) => void;
  onSelectReport: (report: ReportItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  reports,
  onNavigate,
  onSelectReport
}) => {
  const [mapCategoryFilter, setMapCategoryFilter] = useState<string>('all');
  const [mapStatusFilter, setMapStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatFilter, setSelectedStatFilter] = useState<StatFilterType | null>(null);

  // Calculate live statistics from stored reports
  const totalCount = reports.length;
  const pendingCount = reports.filter(r => r.status === 'menunggu_verifikasi').length;
  const inProgressCount = reports.filter(r => r.status === 'sedang_ditangani' || r.status === 'terverifikasi').length;
  const resolvedCount = reports.filter(r => r.status === 'selesai').length;

  // Filter reports for map preview
  const filteredMapReports = reports.filter(r => {
    const matchesCategory = mapCategoryFilter === 'all' || r.category === mapCategoryFilter;
    const matchesStatus = mapStatusFilter === 'all' || r.status === mapStatusFilter;
    const matchesSearch = !searchQuery || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.addressDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Recent 4 reports
  const recentReports = reports.slice(0, 4);

  const renderCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'Lightbulb': return <Lightbulb className={className} />;
      case 'Droplets': return <Droplets className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'Trees': return <Trees className={className} />;
      default: return <HelpCircle className={className} />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* A. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-100/90 via-emerald-50/70 to-amber-100/80 border-b-2 border-emerald-200/90 pt-10 pb-16 lg:pt-14 lg:pb-20">
        {/* Ambient Glowing Color Spots for visual radiance */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border-2 border-emerald-400/80 text-emerald-950 text-xs font-black tracking-wide shadow-md shadow-emerald-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Jambi Smart City Application Challenge 2026</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Suara Warga, Perubahan Nyata untuk <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-amber-500 bg-clip-text text-transparent">Kota Jambi.</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-medium">
                  Temukan, laporkan, dan pantau permasalahan fasilitas umum di sekitar Anda. Bersama KATO WARGA, setiap laporan menjadi langkah menuju kota yang lebih nyaman, cerdas, dan tertata.
                </p>
              </div>

              {/* Tagline highlight */}
              <div className="flex items-center gap-2 text-sm text-slate-900 font-extrabold bg-white/95 p-3.5 rounded-2xl border-2 border-amber-300 inline-block shadow-md shadow-amber-400/15">
                <span className="text-amber-600">“Suaro Warga, Solusi Bersamo.”</span>
                <span className="text-teal-800 font-bold">· Kanal Aspirasi & Tanggapan Online</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('buat-laporan')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-103 transition-all cursor-pointer"
                >
                  <span>Buat Laporan</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => onNavigate('peta')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-emerald-50/80 text-teal-900 font-extrabold text-sm border-2 border-teal-300 shadow-md shadow-teal-500/10 hover:border-teal-400 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                  <span>Jelajahi Peta Aduan</span>
                </button>
              </div>

              {/* Micro Trust Notice */}
              <div className="flex items-center gap-4 pt-2 text-xs text-slate-700 font-bold">
                <span className="flex items-center gap-1.5 text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Transparan & Terlacak
                </span>
                <span className="text-amber-400">·</span>
                <span className="flex items-center gap-1.5 text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Tersedia Opsi Anonim
                </span>
                <span className="text-amber-400">·</span>
                <span className="flex items-center gap-1.5 text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Tiket Resmi Terbit Instan
                </span>
              </div>
            </div>

            {/* Right: Smart City Visual Dashboard Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-900 group">
                <img
                  src="/images/hero_smart_city_jambi_1792244146207.jpg"
                  alt="Konsep Digital Smart City Kota Jambi"
                  className="w-full h-[370px] object-cover group-hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Floating overlay mockup card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-emerald-200 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider">
                      Sistem Pantau Lapangan Terintegrasi
                    </span>
                    <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0">
                        <KatoEmblemSvg className="w-9 h-9 drop-shadow-sm" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">Kota Jambi</div>
                        <div className="text-slate-500 text-[11px] font-medium">Koordinasi Dinas PUPR · DLH · Dishub Jambi</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('peta')}
                      className="text-teal-700 hover:text-teal-900 font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200"
                    >
                      Buka Peta <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* B. Statistik Laporan Section (Interaktif & Klik-untuk-Melihat Daftar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="text-xs font-black text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Rekapitulasi Partisipasi Publik
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Statistik Penanganan Fasilitas Kota
            </h2>
            <p className="text-xs sm:text-sm text-teal-900 font-bold mt-1.5 flex items-center gap-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[11px] font-black uppercase">Interaktif</span>
              Klik salah satu kartu di bawah untuk membuka daftar dan rincian laporannya
            </p>
          </div>
          <div className="text-xs text-teal-900 bg-white px-3.5 py-1.5 rounded-xl self-start sm:self-auto border-2 border-emerald-200 font-bold shadow-xs">
            *Data diperbarui secara real-time dari penyimpanan simulasi lokal
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total */}
          <button
            type="button"
            onClick={() => setSelectedStatFilter('all')}
            className="group text-left bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/60 rounded-2xl p-5 border-t-4 border-t-indigo-500 border-x border-b border-indigo-200/80 shadow-md hover:shadow-2xl shadow-indigo-500/10 transition-all hover:-translate-y-1.5 hover:border-indigo-400 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
            title="Klik untuk melihat seluruh daftar laporan fasilitas"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wide">Total Laporan</span>
                <span className="p-2 bg-indigo-500 group-hover:bg-indigo-600 text-white rounded-xl shadow-xs shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <FileCheck2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-950 tabular-nums">
                {totalCount}
              </div>
              <div className="text-xs text-indigo-700 mt-1 font-medium">
                Akumulasi aduan fasilitas umum
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-200/70 flex items-center justify-between text-xs font-black text-indigo-700 group-hover:text-indigo-950">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Lihat Semua Daftar
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Menunggu Verifikasi */}
          <button
            type="button"
            onClick={() => setSelectedStatFilter('menunggu_verifikasi')}
            className="group text-left bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 rounded-2xl p-5 border-t-4 border-t-amber-500 border-x border-b border-amber-200/80 shadow-md hover:shadow-2xl shadow-amber-500/10 transition-all hover:-translate-y-1.5 hover:border-amber-400 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
            title="Klik untuk melihat daftar laporan yang menunggu verifikasi"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wide">Laporan Masuk</span>
                <span className="p-2 bg-amber-500 group-hover:bg-amber-600 text-white rounded-xl shadow-xs shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-700 tabular-nums">
                {pendingCount}
              </div>
              <div className="text-xs text-amber-800 mt-1 font-medium">
                Menunggu validasi verifikator
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/70 flex items-center justify-between text-xs font-black text-amber-800 group-hover:text-amber-950">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Lihat Laporan Masuk
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Sedang Ditangani */}
          <button
            type="button"
            onClick={() => setSelectedStatFilter('sedang_ditangani')}
            className="group text-left bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/60 rounded-2xl p-5 border-t-4 border-t-cyan-500 border-x border-b border-cyan-200/80 shadow-md hover:shadow-2xl shadow-cyan-500/10 transition-all hover:-translate-y-1.5 hover:border-cyan-400 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
            title="Klik untuk melihat daftar laporan yang sedang dalam penanganan"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-cyan-900 uppercase tracking-wide">Sedang Ditangani</span>
                <span className="p-2 bg-cyan-500 group-hover:bg-cyan-600 text-white rounded-xl shadow-xs shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-cyan-800 tabular-nums">
                {inProgressCount}
              </div>
              <div className="text-xs text-cyan-700 mt-1 font-medium">
                Dalam pengerjaan tim dinas
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cyan-200/70 flex items-center justify-between text-xs font-black text-cyan-800 group-hover:text-cyan-950">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Lihat Sedang Ditangani
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Selesai */}
          <button
            type="button"
            onClick={() => setSelectedStatFilter('selesai')}
            className="group text-left bg-gradient-to-br from-emerald-50/90 via-white to-lime-50/60 rounded-2xl p-5 border-t-4 border-t-emerald-500 border-x border-b border-emerald-200/80 shadow-md hover:shadow-2xl shadow-emerald-500/10 transition-all hover:-translate-y-1.5 hover:border-emerald-400 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
            title="Klik untuk melihat daftar laporan yang telah tuntas selesai diperbaiki"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">Selesai Ditangani</span>
                <span className="p-2 bg-emerald-500 group-hover:bg-emerald-600 text-white rounded-xl shadow-xs shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 tabular-nums">
                {resolvedCount}
              </div>
              <div className="text-xs text-emerald-800 mt-1 font-medium">
                Fasilitas tuntas diperbaiki
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/70 flex items-center justify-between text-xs font-black text-emerald-800 group-hover:text-emerald-950">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Lihat Selesai Ditangani
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Featured Portals: Public SLA Dashboard & Government Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1: Public SLA Dashboard */}
          <div className="bg-gradient-to-br from-indigo-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black border border-white/20">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Transparansi Kinerja Kedinasan</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Papan Transparansi Kinerja & SLA Dinas
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-medium">
                Ketahui rata-rata waktu respons awal, durasi penyelesaian perbaikan, persentase pemenuhan SLA, dan skor kepuasan warga antar-dinas teknis Kota Jambi.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <button
                onClick={() => onNavigate('kinerja')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-teal-500/20 hover:scale-102 transition-all cursor-pointer"
              >
                <span>Buka Dashboard SLA Publik</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Feature 2: Government Programs & Citizen Evaluation */}
          <div className="bg-gradient-to-br from-teal-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black border border-white/20">
                <Building2 className="w-3.5 h-3.5" />
                <span>Partisipasi & Evaluasi Publik</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Program Pemerintah & Evaluasi Warga
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                Dapatkan informasi resmi agenda proyek infrastruktur, lingkungan, dan pelayanan publik. Berikan masukan pelaksanaan atau evaluasi hasil pembangunan.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <button
                onClick={() => onNavigate('program')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-102 transition-all cursor-pointer"
              >
                <span>Jelajahi Program Pemkot</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* C. Cara Kerja KATO WARGA (Bright & Luminous Version) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50/70 to-amber-50/70 rounded-3xl p-8 sm:p-12 border-2 border-emerald-200 shadow-md">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-black text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Alur Pelayanan Partisipatif
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Cara Kerja KATO WARGA
            </h2>
            <p className="text-slate-700 text-sm mt-2 font-medium">
              Proses pelaporan dirancang ringkas, transparan, dan dapat dipantau oleh siapa saja tanpa hambatan birokrasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-amber-200/70 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 text-white flex items-center justify-center font-black text-base mb-4 shadow-lg shadow-orange-500/30">
                  01
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Temukan Masalah
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Temukan kerusakan jalan, lampu mati, saluran mampet, atau sampah di lingkungan Kota Jambi.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-cyan-200/70 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500 text-white flex items-center justify-center font-black text-base mb-4 shadow-lg shadow-blue-500/30">
                  02
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Kirim Laporan & Foto
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Isi formulir singkat, sertakan foto bukti, dan tentukan titik koordinat langsung di peta interaktif.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-200/70 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-lg shadow-purple-500/30">
                  03
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Pantau Nomor Tiket
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Dapatkan kode tiket unik otomatis (cth: KJ-2026-0101) untuk memeriksa status verifikasi secara mandiri.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200/70 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-teal-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-lg shadow-teal-500/30">
                  04
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Tindak Lanjut & Tuntas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Petugas teknis dinas bergerak ke lokasi dan mencatat perkembangan hingga perbaikan selesai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. Kategori Laporan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-black text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Klasifikasi Layanan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kategori Permasalahan Fasilitas
            </h2>
          </div>
          <button
            onClick={() => onNavigate('buat-laporan')}
            className="text-xs font-black text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5 cursor-pointer bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs"
          >
            Punya keluhan lain? Laporkan sekarang <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('buat-laporan', { category: cat.id })}
              className="group bg-white rounded-2xl p-5.5 border-2 border-slate-200/80 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/15 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div 
                  className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-xs"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {renderCategoryIcon(cat.iconName, "w-6 h-6 stroke-[2.2]")}
                </div>
                <h3 className="font-black text-slate-900 text-base mb-1.5 group-hover:text-teal-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {cat.shortDesc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-extrabold">
                <span>Laporkan Kategori Ini</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* E. Peta Aduan Terbaru Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-6 sm:p-8 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-black text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Visual Spasial Wilayah
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Peta Sebaran Aduan Kota Jambi
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Jelajahi titik laporan aktif di 11 kecamatan Kota Jambi dengan marker berkode warna status.
              </p>
            </div>

            <button
              onClick={() => onNavigate('peta')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/25 cursor-pointer self-start lg:self-auto hover:scale-102"
            >
              <span>Buka Peta Penuh & Analisis</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
              <button
                onClick={() => setMapStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-black transition-colors cursor-pointer ${
                  mapStatusFilter === 'all' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Semua Status
              </button>
              <button
                onClick={() => setMapStatusFilter('menunggu_verifikasi')}
                className={`px-3 py-1.5 rounded-lg font-black transition-colors cursor-pointer ${
                  mapStatusFilter === 'menunggu_verifikasi' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:text-amber-800'
                }`}
              >
                Verifikasi
              </button>
              <button
                onClick={() => setMapStatusFilter('sedang_ditangani')}
                className={`px-3 py-1.5 rounded-lg font-black transition-colors cursor-pointer ${
                  mapStatusFilter === 'sedang_ditangani' ? 'bg-cyan-500 text-white shadow-xs' : 'text-slate-700 hover:text-cyan-800'
                }`}
              >
                Diproses
              </button>
              <button
                onClick={() => setMapStatusFilter('selesai')}
                className={`px-3 py-1.5 rounded-lg font-black transition-colors cursor-pointer ${
                  mapStatusFilter === 'selesai' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-700 hover:text-emerald-800'
                }`}
              >
                Selesai
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari lokasi, jalan, atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Interactive Map Component */}
          <LeafletMap
            reports={filteredMapReports}
            onSelectReport={onSelectReport}
            height="420px"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
                Menunggu Verifikasi
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-xs" />
                Terverifikasi
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-xs" />
                Sedang Ditangani
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                Selesai
              </span>
            </div>
            <span className="italic text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Menampilkan {filteredMapReports.length} titik aduan simulasi
            </span>
          </div>
        </div>
      </section>

      {/* F. Laporan Terbaru Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-black text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Aktivitas Partisipasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Laporan Warga Terbaru
            </h2>
          </div>
          <button
            onClick={() => onNavigate('peta')}
            className="text-xs font-black text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5 cursor-pointer bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs"
          >
            Lihat semua laporan di peta <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentReports.map((report) => {
            const cat = CATEGORIES.find(c => c.id === report.category);
            const dateStr = new Date(report.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:border-teal-400 hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Metadata unboxed line */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">{report.ticketNumber}</span>
                      <span className="text-amber-400 font-bold">·</span>
                      <span className="text-slate-900 font-extrabold">{cat?.name || report.category}</span>
                      <span className="text-amber-400 font-bold">·</span>
                      <span className="font-semibold text-slate-600">{report.kecamatan}</span>
                    </div>
                    <StatusBadge status={report.status} size="sm" />
                  </div>

                  <h3 className="font-black text-slate-900 text-base mb-2 line-clamp-1">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-medium">
                    {report.description}
                  </p>

                  {/* Address Snippet */}
                  <div className="flex items-center gap-1.5 text-xs text-teal-950 mb-4 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/70 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 stroke-[2.5]" />
                    <span className="truncate">{report.addressDetails}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Dilaporkan {dateStr} {report.isAnonymous ? '· Anonim' : ''}
                  </span>
                  <button
                    onClick={() => onSelectReport(report)}
                    className="inline-flex items-center gap-1.5 font-black text-teal-700 hover:text-teal-900 cursor-pointer bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
                  >
                    <span>Lihat Detail</span>
                    <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* G. Ajakan Berpartisipasi (Bright Radiant CTA Block) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-700 text-white rounded-3xl p-8 sm:p-12 shadow-2xl shadow-teal-700/25 relative overflow-hidden border-4 border-white/50">
          {/* Ambient luminous glow circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-300/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-amber-950 text-xs font-black uppercase tracking-wider bg-amber-300 px-3.5 py-1 rounded-full shadow-sm inline-block">
              Aspirasi Membangun Jambi
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              Kota yang Lebih Baik Dimulai dari Kepedulian Kito.
            </h2>
            <p className="text-sm text-emerald-50 leading-relaxed font-medium">
              Jangan biarkan masalah fasilitas umum terabaikan. Laporkan masalah di sekitar Anda dan pantau perkembangannya secara terbuka bersama KATO WARGA.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('buat-laporan')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 hover:from-amber-200 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/40 hover:scale-103 transition-all cursor-pointer"
              >
                <span>Mulai Buat Laporan</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Reports List Modal for 4 Statistics Cards */}
      <StatReportsModal
        isOpen={selectedStatFilter !== null}
        initialFilter={selectedStatFilter || 'all'}
        reports={reports}
        onClose={() => setSelectedStatFilter(null)}
        onSelectReport={onSelectReport}
        onNavigateToMap={(category, status) => {
          onNavigate('peta', { category: category as any });
        }}
        onTrackTicket={(ticket) => {
          onNavigate('lacak', { ticket });
        }}
      />
    </div>
  );
};
