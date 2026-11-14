import React, { useState, useMemo } from 'react';
import { ReportItem, ReportReview } from '../types';
import { calculateSlaMetrics } from '../services/storage';
import { DINAS_LIST } from '../data/dinasData';
import { StarRating } from '../components/StarRating';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Award, 
  Star, 
  HelpCircle, 
  Filter, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  Calendar, 
  ArrowUpRight, 
  Layers, 
  AlertCircle,
  Building2,
  X
} from 'lucide-react';

interface PublicSlaDashboardViewProps {
  reports: ReportItem[];
  reviews: ReportReview[];
  onSelectReport?: (report: ReportItem) => void;
  onNavigateToTrack?: () => void;
}

export const PublicSlaDashboardView: React.FC<PublicSlaDashboardViewProps> = ({
  reports,
  reviews,
  onSelectReport,
  onNavigateToTrack
}) => {
  const [selectedDinasId, setSelectedDinasId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '7d' | '30d' | '90d' | '2026'>('all');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Calculate actual SLA metrics based on active filters
  const metricsData = useMemo(() => {
    return calculateSlaMetrics(reports, reviews, {
      period: selectedPeriod,
      dinasId: selectedDinasId !== 'all' ? selectedDinasId : undefined
    });
  }, [reports, reviews, selectedPeriod, selectedDinasId]);

  // Selected agency metric or overall
  const currentMetric = useMemo(() => {
    if (selectedDinasId === 'all') {
      return metricsData.overall;
    }
    const found = metricsData.perDinas.find(d => d.dinasId === selectedDinasId);
    return found || metricsData.overall;
  }, [metricsData, selectedDinasId]);

  const periodLabels: Record<string, string> = {
    all: 'Seluruh Riwayat Data Tercatat',
    '7d': '7 Hari Terakhir',
    '30d': '30 Hari Terakhir',
    '90d': '90 Hari Terakhir',
    '2026': 'Tahun Berjalan 2026'
  };

  // Helper to format hours into human readable
  const formatHours = (hours: number | null): string => {
    if (hours === null) return 'Data belum tersedia';
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} Menit`;
    }
    if (hours < 24) {
      return `${hours} Jam`;
    }
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} Hari (${hours} Jam)`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-[#0F3B56] via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300 shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Papan Transparansi Publik Terbuka Kota Jambi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Transparansi Kinerja & Standar Pelayanan (SLA)
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 font-medium leading-relaxed">
            Pantau akuntabilitas penanganan aduan masyarakat antar-dinas teknis secara aktual dan objektif. Seluruh data dihitung dari rekaman waktu penanganan sistem dan penilaian warga.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/25 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Info className="w-3.5 h-3.5 text-amber-300" />
              <span>Metodologi & Definisi Indikator</span>
            </button>
            <span className="text-[11px] text-teal-200/80 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Periode Pengukuran: <strong className="text-white">{periodLabels[selectedPeriod]}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-700 stroke-[2.5]" />
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Filter Kinerja Dinas & Periode
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 md:max-w-xl">
          {/* Dinas Filter */}
          <div>
            <select
              value={selectedDinasId}
              onChange={(e) => setSelectedDinasId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30"
            >
              <option value="all">Semua Dinas Teknis Pemkot Jambi</option>
              {DINAS_LIST.map((dinas) => (
                <option key={dinas.id} value={dinas.id}>
                  {dinas.name} ({dinas.code})
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30"
            >
              <option value="all">Semua Periode Data</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="90d">90 Hari Terakhir</option>
              <option value="2026">Tahun Berjalan 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (7 Required Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Pengaduan Masuk & Selesai */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50 p-5 rounded-3xl border-t-4 border-t-indigo-600 border-x border-b border-indigo-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-indigo-900">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Aduan Masuk</span>
            <Layers className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-950 tabular-nums">
              {currentMetric.totalIncoming}
            </span>
            <span className="text-xs text-indigo-800 font-bold">
              / {currentMetric.totalResolved} Selesai
            </span>
          </div>
          <div className="pt-1 border-t border-indigo-100 flex items-center justify-between text-[11px] font-bold text-indigo-800">
            <span>Tingkat Penyelesaian:</span>
            <span className="font-black text-indigo-950">{currentMetric.resolutionRate}%</span>
          </div>
        </div>

        {/* Card 2: Rata-rata Waktu Respons Awal */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-5 rounded-3xl border-t-4 border-t-amber-500 border-x border-b border-amber-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[11px] font-black uppercase tracking-wider">Rata-Rata Respons Awal</span>
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-amber-950">
            {formatHours(currentMetric.avgInitialResponseHours)}
          </div>
          <div className="pt-1 border-t border-amber-100 text-[11px] text-amber-800 font-semibold">
            {currentMetric.avgInitialResponseHours !== null ? (
              <span>Standar SLA verifikasi maksimal 24 jam.</span>
            ) : (
              <span className="italic text-slate-500">Data belum tersedia</span>
            )}
          </div>
        </div>

        {/* Card 3: Rata-rata Waktu Penyelesaian */}
        <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-5 rounded-3xl border-t-4 border-t-teal-600 border-x border-b border-teal-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-teal-900">
            <span className="text-[11px] font-black uppercase tracking-wider">Rata-Rata Penyelesaian</span>
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black text-teal-950">
            {formatHours(currentMetric.avgResolutionHours)}
          </div>
          <div className="pt-1 border-t border-teal-100 text-[11px] text-teal-800 font-semibold">
            {currentMetric.avgResolutionHours !== null ? (
              <span>Dihitung dari tiket dibuat hingga tuntas.</span>
            ) : (
              <span className="italic text-slate-500">Data belum tersedia</span>
            )}
          </div>
        </div>

        {/* Card 4: Kepatuhan SLA & Rating Warga */}
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-yellow-50/60 p-5 rounded-3xl border-t-4 border-t-amber-400 border-x border-b border-amber-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[11px] font-black uppercase tracking-wider">Rating & Kepatuhan SLA</span>
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {currentMetric.avgCitizenRating !== null ? (
                  <span className="flex items-center gap-1">
                    <span>{currentMetric.avgCitizenRating}</span>
                    <span className="text-xs text-slate-400 font-normal">/5.0</span>
                  </span>
                ) : (
                  <span className="text-sm font-bold text-slate-500">Data belum tersedia</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {currentMetric.totalReviews} ulasan diterima
              </span>
            </div>

            <div className="text-right">
              <span className="text-base font-black text-emerald-700 block">
                {currentMetric.slaComplianceRate !== null
                  ? `${currentMetric.slaComplianceRate}%`
                  : '-'}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold">
                Kepatuhan SLA
              </span>
            </div>
          </div>
          <div className="pt-1 border-t border-amber-100 flex items-center justify-between text-[11px]">
            {currentMetric.avgCitizenRating !== null && (
              <StarRating value={currentMetric.avgCitizenRating} readOnly size="sm" />
            )}
            <span className="text-[10px] text-slate-600 font-bold">Ulasan Warga Sah</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Performance Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border-2 border-emerald-200/90 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                <span>Persentase Penyelesaian Pengaduan per Dinas</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Rasio laporan yang berhasil diselesaikan dibandingkan total aduan masuk dinas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {metricsData.perDinas.map((dinas) => {
              const def = DINAS_LIST.find(d => d.id === dinas.dinasId);
              return (
                <div key={dinas.dinasId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: def?.color || '#0d9488' }} />
                      <span className="font-black text-slate-900">{dinas.dinasShortName}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({dinas.totalResolved} dari {dinas.totalIncoming} tuntas)
                      </span>
                    </div>
                    <span className="font-mono font-black text-slate-800">
                      {dinas.totalIncoming > 0 ? `${dinas.resolutionRate}%` : 'Data belum tersedia'}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${dinas.resolutionRate}%`,
                        backgroundColor: def?.color || '#0d9488'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA & Rating Radar/Cards (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border-2 border-emerald-200/90 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                <span>Indeks Kepuasan & Ulasan Terbanyak</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Dinas teknis dengan rating dan responsivitas terbaik.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {metricsData.perDinas.map((dinas) => {
              const def = DINAS_LIST.find(d => d.id === dinas.dinasId);
              return (
                <div 
                  key={dinas.dinasId}
                  className="p-3.5 rounded-2xl border-2 border-slate-100 hover:border-teal-200 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-2xs"
                      style={{ backgroundColor: def?.color || '#0d9488' }}
                    >
                      {def?.code.slice(0, 3)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        {dinas.dinasShortName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {dinas.totalReviews > 0 ? `${dinas.totalReviews} Ulasan Warga` : 'Belum ada ulasan'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {dinas.avgCitizenRating !== null ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-black text-xs text-slate-900">
                          {dinas.avgCitizenRating}
                        </span>
                        <span className="text-[10px] text-slate-400">/5</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Data belum tersedia</span>
                    )}

                    <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                      {dinas.slaComplianceRate !== null ? `SLA: ${dinas.slaComplianceRate}%` : 'SLA: -'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Comprehensive SLA Comparison Table */}
      <div className="bg-white rounded-3xl border-2 border-emerald-200/90 shadow-lg overflow-hidden space-y-0">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Tabel Matriks Kinerja Antar-Dinas Teknis Kota Jambi
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Perbandingan objektif seluruh indikator SLA dan kepuasan warga.
            </p>
          </div>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 self-start sm:self-auto">
            Terverifikasi Sistem KATO WARGA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-teal-50/80 text-teal-950 uppercase font-black text-[11px] border-b-2 border-emerald-100">
              <tr>
                <th className="px-5 py-3.5">Dinas Teknis</th>
                <th className="px-5 py-3.5 text-center">Masuk / Tuntas</th>
                <th className="px-5 py-3.5 text-center">Penyelesaian</th>
                <th className="px-5 py-3.5">Rata-rata Respon Awal</th>
                <th className="px-5 py-3.5">Rata-rata Tuntas</th>
                <th className="px-5 py-3.5 text-center">Kepatuhan SLA</th>
                <th className="px-5 py-3.5 text-right">Rating & Ulasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metricsData.perDinas.map((dinas) => {
                const def = DINAS_LIST.find(d => d.id === dinas.dinasId);

                return (
                  <tr key={dinas.dinasId} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: def?.color || '#0d9488' }} 
                        />
                        <div>
                          <span className="font-black text-slate-900 block leading-tight">
                            {dinas.dinasName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Target SLA: {def?.slaHoursInitial}j respon / {def?.slaHoursResolution}j tuntas
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center font-bold font-mono text-slate-900">
                      {dinas.totalIncoming} <span className="text-slate-400">/</span> {dinas.totalResolved}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-teal-50 text-teal-900 border border-teal-200">
                        {dinas.totalIncoming > 0 ? `${dinas.resolutionRate}%` : 'Data belum tersedia'}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {dinas.avgInitialResponseHours !== null ? (
                        formatHours(dinas.avgInitialResponseHours)
                      ) : (
                        <span className="text-slate-400 italic">Data belum tersedia</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {dinas.avgResolutionHours !== null ? (
                        formatHours(dinas.avgResolutionHours)
                      ) : (
                        <span className="text-slate-400 italic">Data belum tersedia</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center font-black">
                      {dinas.slaComplianceRate !== null ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs ${
                          dinas.slaComplianceRate >= 80 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {dinas.slaComplianceRate}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">Data belum tersedia</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {dinas.avgCitizenRating !== null ? (
                        <div>
                          <div className="flex items-center justify-end gap-1 font-black text-slate-900 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{dinas.avgCitizenRating}</span>
                            <span className="text-slate-400 text-[10px]">/5.0</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            {dinas.totalReviews} ulasan sah
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Data belum tersedia</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology & Definition Explanation Modal */}
      {isMethodologyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 stroke-[2.5]" />
                <h3 className="font-black text-base text-slate-900">
                  Definisi Indikator & Metodologi Perhitungan Transparan
                </h3>
              </div>
              <button
                onClick={() => setIsMethodologyOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[65vh] pr-1">
              <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200">
                <strong className="text-teal-950 font-black block mb-1">
                  1. Sumber Data Aktual Tanpa Angka Fiktif
                </strong>
                <p>
                  Seluruh angka statistik dihitung langsung dari log riwayat timestamp penanganan tiket aduan dan formulir ulasan resmi warga di sistem KATO WARGA. Jika suatu dinas belum memiliki rekaman aduan atau ulasan pada periode tertentu, sistem secara jujur menampilkan label <em>"Data belum tersedia"</em>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-black block">
                  2. Rata-Rata Waktu Respons Awal
                </strong>
                <p>
                  Dihitung dari selisih waktu antara tiket pertama kali dibuat oleh warga (<code>createdAt</code>) hingga status laporan diverifikasi atau ditindaklanjuti pertama kali oleh petugas dinas teknis (<code>terverifikasi</code> / <code>sedang_ditangani</code>). Target SOP standar adalah kurang dari 24 jam.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-black block">
                  3. Rata-Rata Waktu Penyelesaian
                </strong>
                <p>
                  Dihitung dari waktu tiket dibuat hingga tercapai status <code>selesai</code> yang disertai catatan perbaikan tuntas oleh petugas teknis lapangan di lokasi.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-black block">
                  4. Persentase Penyelesaian Sesuai SLA
                </strong>
                <p>
                  Rasio tiket selesai yang memenuhi kedua kriteria waktu standar: respons awal &le; target SLA awal dinas DAN waktu penyelesaian &le; target SLA penyelesaian teknis dinas (contoh: Dishub 48 jam, PUPR 72 jam, DLH 36 jam).
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                <strong className="text-amber-950 font-black block">
                  5. Rata-Rata Rating & Ulasan Warga
                </strong>
                <p>
                  Diperoleh dari nilai bintang 1–5 yang diberikan oleh pelapor sah setelah tiket berstatus selesai. Setiap tiket hanya memiliki satu ulasan aktif untuk menjamin objektivitas dan integritas skor kepuasan.
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setIsMethodologyOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
