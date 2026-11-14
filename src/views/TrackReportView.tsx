import React, { useState, useEffect } from 'react';
import { ReportItem, ReportStatus, ReportReview, OfficialReply, CitizenUser } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../data/categories';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintReviewSection } from '../components/ComplaintReviewSection';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CornerDownRight,
  Building2,
  User
} from 'lucide-react';

interface TrackReportViewProps {
  initialTicket?: string;
  reviews?: ReportReview[];
  isAdmin?: boolean;
  currentCitizen?: CitizenUser | null;
  myReports?: ReportItem[];
  onSearchTicket: (ticket: string) => ReportItem | null;
  onNavigateToCreate: () => void;
  recentTickets: string[];
  onAddReview?: (data: { rating: number; comment: string; reviewerName: string }) => void;
  onReplyReview?: (reviewId: string, reply: OfficialReply) => void;
  onModerateReview?: (reviewId: string, isModerated: boolean, reason?: string) => void;
}

export const TrackReportView: React.FC<TrackReportViewProps> = ({
  initialTicket = '',
  reviews = [],
  isAdmin = false,
  currentCitizen,
  myReports = [],
  onSearchTicket,
  onNavigateToCreate,
  recentTickets,
  onAddReview,
  onReplyReview,
  onModerateReview
}) => {
  const [searchInput, setSearchInput] = useState(initialTicket);
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialTicket) {
      setSearchInput(initialTicket);
      const found = onSearchTicket(initialTicket);
      setActiveReport(found);
      setHasSearched(true);
    }
  }, [initialTicket, onSearchTicket]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    const found = onSearchTicket(searchInput.trim());
    setActiveReport(found);
    setHasSearched(true);
  };

  const handleQuickSelectTicket = (t: string) => {
    setSearchInput(t);
    const found = onSearchTicket(t);
    setActiveReport(found);
    setHasSearched(true);
  };

  // 5 Canonical Stages
  const stages: { key: string; label: string; desc: string }[] = [
    { key: 'dikirim', label: 'Laporan Dikirim', desc: 'Diterima sistem KATO WARGA' },
    { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi', desc: 'Validasi kelayakan data' },
    { key: 'terverifikasi', label: 'Terverifikasi', desc: 'Diteruskan ke dinas teknis' },
    { key: 'sedang_ditangani', label: 'Sedang Ditangani', desc: 'Tim lapangan bekerja' },
    { key: 'selesai', label: 'Selesai', desc: 'Perbaikan rampung & tuntas' }
  ];

  // Helper to determine stage state
  const getStageIndex = (status: ReportStatus): number => {
    switch (status) {
      case 'menunggu_verifikasi': return 1;
      case 'terverifikasi': return 2;
      case 'sedang_ditangani': return 3;
      case 'selesai': return 4;
      default: return 0;
    }
  };

  const currentStageIdx = activeReport ? getStageIndex(activeReport.status) : 0;
  const categoryMeta = activeReport ? CATEGORIES.find(c => c.id === activeReport.category) : null;
  const activeReview = activeReport
    ? reviews.find(r => r.ticketNumber.toUpperCase() === activeReport.ticketNumber.toUpperCase()) || null
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-teal-950 border-2 border-emerald-300 text-xs font-black mb-2 shadow-xs">
          <Search className="w-3.5 h-3.5 text-teal-700 stroke-[2.5]" />
          <span>Sistem Pelacakan Tiket Terbuka</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Lacak Perkembangan Laporan Anda
        </h1>
        <p className="text-sm text-slate-700 mt-2 font-medium">
          Masukkan kode tiket aduan untuk melihat posisi penanganan, timeline verifikasi dinas, catatan teknis lapangan, dan beri penilaian setelah tuntas.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-4 sm:p-7 shadow-lg mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Masukkan nomor tiket, contoh: KJ-2026-0102"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30 transition-all font-mono uppercase font-bold text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-7 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md shadow-teal-500/25 hover:shadow-xl hover:shadow-amber-500/30 cursor-pointer hover:scale-102"
          >
            Lacak Laporan
          </button>
        </form>

        {/* Citizen's Reports if Logged In */}
        {currentCitizen && myReports && myReports.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-emerald-200 bg-emerald-50/70 p-3 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-950 font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                Laporan Terdaftar atas Akun {currentCitizen.name}:
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                {myReports.length} Laporan
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {myReports.map((r) => (
                <button
                  key={r.ticketNumber}
                  type="button"
                  onClick={() => handleQuickSelectTicket(r.ticketNumber)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 hover:border-emerald-500 font-mono text-[11px] rounded-lg transition-all cursor-pointer font-bold shadow-2xs flex items-center gap-1.5"
                >
                  <span className="font-black text-teal-800">{r.ticketNumber}</span>
                  <span className="text-slate-600 truncate max-w-[130px] font-sans">
                    {r.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold">Contoh tiket demo:</span>
          {recentTickets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleQuickSelectTicket(t)}
              className="px-3 py-1 bg-white hover:bg-teal-50 text-teal-900 border-2 border-teal-200 hover:border-teal-400 font-mono text-[11px] rounded-lg transition-all cursor-pointer font-black shadow-2xs"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Result Section */}
      {hasSearched && (
        <>
          {activeReport ? (
            <div className="space-y-6">
              {/* Overview Card */}
              <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-6 sm:p-8 shadow-lg space-y-6">
                
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 flex-wrap">
                      <span className="font-mono font-black text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                        {activeReport.ticketNumber}
                      </span>
                      <span className="text-amber-400 font-bold">·</span>
                      <span className="text-teal-900 font-black">{categoryMeta?.name}</span>
                      {activeReport.assignedDinas && (
                        <>
                          <span className="text-amber-400 font-bold">·</span>
                          <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-teal-600" />
                            {activeReport.assignedDinas}
                          </span>
                        </>
                      )}
                      <span className="text-amber-400 font-bold">·</span>
                      <span className="font-semibold text-slate-700">Kecamatan {activeReport.kecamatan}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">
                      {activeReport.title}
                    </h2>
                  </div>

                  <div className="self-start sm:self-center">
                    <StatusBadge status={activeReport.status} />
                  </div>
                </div>

                {/* 5-Stage Visual Progress Bar */}
                <div className="py-2">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Alur Status Penanganan
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                    {stages.map((st, idx) => {
                      const isCompleted = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                              isCurrent
                                ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-teal-500 text-slate-950 ring-4 ring-amber-200 shadow-lg shadow-amber-400/30'
                                : isCompleted
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                          </div>
                          <span className={`text-[11px] font-black leading-tight ${
                            isCurrent ? 'text-amber-700' : isCompleted ? 'text-teal-900' : 'text-slate-400'
                          }`}>
                            {st.label}
                          </span>
                          <span className="hidden sm:block text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Report Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t-2 border-slate-100">
                  <div className="space-y-3">
                    <div className="p-4 bg-teal-50/50 rounded-2xl border-2 border-teal-200/80">
                      <span className="font-black text-teal-950 block mb-1">Rincian Lokasi</span>
                      <p className="text-slate-800 leading-relaxed font-semibold">{activeReport.addressDetails}</p>
                      <span className="text-[11px] font-mono text-teal-800 font-bold block mt-1.5">
                        Koordinat: {activeReport.latitude.toFixed(5)}, {activeReport.longitude.toFixed(5)}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                      <span className="font-black text-slate-800 block mb-1">Deskripsi Permasalahan</span>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">{activeReport.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeReport.imageUrl ? (
                      <div className="rounded-2xl overflow-hidden border-2 border-teal-300 h-44 bg-slate-900 shadow-xs">
                        <img
                          src={activeReport.imageUrl}
                          alt={activeReport.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-44 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-xs bg-slate-50">
                        Tidak ada foto bukti terlampir
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 font-semibold">
                      <span>Waktu Laporan: {new Date(activeReport.createdAt).toLocaleString('id-ID')}</span>
                      <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">Identitas Terlindungi</span>
                    </div>
                  </div>
                </div>

                {/* Officer Follow-up Notes */}
                {activeReport.officerNotes && (
                  <div className="p-4.5 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                      <Wrench className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.5]" />
                      <span>Catatan Tindak Lanjut dari Petugas Lapangan</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                      “{activeReport.officerNotes}”
                    </p>
                  </div>
                )}

                {/* Detailed Action Timeline */}
                <div className="pt-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Catatan Riwayat Verifikasi & Penanganan
                  </h3>

                  <div className="space-y-4 relative pl-5 border-l-2 border-teal-400 ml-2">
                    {activeReport.history.map((hist, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-100" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-black text-slate-900">
                            {hist.actor}
                          </span>
                          <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded">
                            {new Date(hist.timestamp).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                          {hist.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FITUR 1: COMPLAINT REVIEW SECTION IN TRACK VIEW */}
                {onAddReview && (
                  <div className="pt-4 border-t-2 border-slate-100">
                    <ComplaintReviewSection
                      report={activeReport}
                      review={activeReview}
                      isAdmin={isAdmin}
                      onAddReview={onAddReview}
                      onReplyReview={onReplyReview}
                      onModerateReview={onModerateReview}
                    />
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Not Found State */
            <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 text-center space-y-4 shadow-md">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Tiket Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                Nomor tiket <strong>"{searchInput}"</strong> tidak terdaftar dalam basis data simulasi kami. Pastikan format tiket sesuai (misal: <code>KJ-2026-0102</code>) dan tidak terdapat kesalahan ketik.
              </p>
              <div className="pt-2">
                <button
                  onClick={onNavigateToCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer hover:scale-102"
                >
                  <span>Buat Laporan Baru Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
