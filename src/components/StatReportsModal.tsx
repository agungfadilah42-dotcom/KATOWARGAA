import React, { useState, useMemo, useEffect } from 'react';
import { ReportItem, ReportCategory, KecamatanJambi } from '../types';
import { CATEGORIES } from '../data/categories';
import { StatusBadge } from './StatusBadge';
import { 
  X, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  FileCheck2, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpDown,
  ExternalLink,
  ThumbsUp,
  Image as ImageIcon,
  Copy,
  Check
} from 'lucide-react';

export type StatFilterType = 'all' | 'menunggu_verifikasi' | 'sedang_ditangani' | 'selesai';

interface StatReportsModalProps {
  isOpen: boolean;
  initialFilter: StatFilterType;
  reports: ReportItem[];
  onClose: () => void;
  onSelectReport: (report: ReportItem) => void;
  onNavigateToMap?: (category?: string, status?: string) => void;
  onTrackTicket?: (ticket: string) => void;
}

const KECAMATAN_LIST: KecamatanJambi[] = [
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
];

export const StatReportsModal: React.FC<StatReportsModalProps> = ({
  isOpen,
  initialFilter,
  reports,
  onClose,
  onSelectReport,
  onNavigateToMap,
  onTrackTicket
}) => {
  const [activeTab, setActiveTab] = useState<StatFilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'upvotes'>('newest');
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // Sync active tab when initialFilter changes upon opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialFilter);
      setSearchQuery('');
      setSelectedKecamatan('all');
      setSelectedCategory('all');
    }
  }, [isOpen, initialFilter]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Counts for each tab
  const totalCount = reports.length;
  const pendingCount = reports.filter(r => r.status === 'menunggu_verifikasi').length;
  const inProgressCount = reports.filter(r => r.status === 'sedang_ditangani' || r.status === 'terverifikasi').length;
  const resolvedCount = reports.filter(r => r.status === 'selesai').length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports
      .filter(report => {
        // Tab Status Filter
        if (activeTab === 'menunggu_verifikasi') {
          if (report.status !== 'menunggu_verifikasi') return false;
        } else if (activeTab === 'sedang_ditangani') {
          if (report.status !== 'sedang_ditangani' && report.status !== 'terverifikasi') return false;
        } else if (activeTab === 'selesai') {
          if (report.status !== 'selesai') return false;
        }

        // Kecamatan Filter
        if (selectedKecamatan !== 'all' && report.kecamatan !== selectedKecamatan) {
          return false;
        }

        // Category Filter
        if (selectedCategory !== 'all' && report.category !== selectedCategory) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = report.title.toLowerCase().includes(q);
          const matchesTicket = report.ticketNumber.toLowerCase().includes(q);
          const matchesDesc = report.description.toLowerCase().includes(q);
          const matchesAddress = report.addressDetails.toLowerCase().includes(q);
          const matchesKecamatan = report.kecamatan.toLowerCase().includes(q);
          if (!matchesTitle && !matchesTicket && !matchesDesc && !matchesAddress && !matchesKecamatan) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else {
          return (b.upvotes || 0) - (a.upvotes || 0);
        }
      });
  }, [reports, activeTab, selectedKecamatan, selectedCategory, searchQuery, sortBy]);

  const handleCopyTicket = (e: React.MouseEvent, ticketNumber: string) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticketNumber);
      setCopiedTicket(ticketNumber);
      setTimeout(() => setCopiedTicket(null), 2000);
    }
  };

  if (!isOpen) return null;

  // Current tab metadata
  const tabConfig = {
    all: {
      title: 'Total Seluruh Laporan Warga',
      subtitle: 'Daftar akumulasi seluruh aduan fasilitas umum di Kota Jambi',
      accentColor: 'indigo',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      icon: <FileCheck2 className="w-5 h-5 text-indigo-600" />
    },
    menunggu_verifikasi: {
      title: 'Laporan Masuk (Menunggu Verifikasi)',
      subtitle: 'Aduan warga yang baru masuk dan sedang menunggu validasi tim verifikator dinas',
      accentColor: 'amber',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <Clock className="w-5 h-5 text-amber-600" />
    },
    sedang_ditangani: {
      title: 'Laporan Sedang Ditangani',
      subtitle: 'Aduan terverifikasi yang saat ini dalam pengerjaan tim teknis dinas terkait',
      accentColor: 'cyan',
      badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      icon: <TrendingUp className="w-5 h-5 text-cyan-600" />
    },
    selesai: {
      title: 'Laporan Selesai Ditangani',
      subtitle: 'Fasilitas umum yang telah tuntas diperbaiki dan selesai ditangani',
      accentColor: 'emerald',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    }
  }[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl border border-black/[0.08] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-8 py-5 border-b border-[#00796B]/15 bg-[#E6F4EA]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white shadow-2xs border border-[#00796B]/15 shrink-0">
                {tabConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {tabConfig.title}
                  </h3>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${tabConfig.badgeBg}`}>
                    {filteredReports.length} Laporan
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium line-clamp-1 sm:line-clamp-none">
                  {tabConfig.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#00796B] hover:text-[#005B54] rounded-full hover:bg-white/80 border border-transparent hover:border-[#00796B]/20 transition-all cursor-pointer shrink-0"
              title="Tutup (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Interactive Status Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                activeTab === 'all'
                  ? 'bg-[#00796B] text-white border-[#00796B] shadow-md scale-[1.02]'
                  : 'bg-white/90 text-slate-700 hover:bg-white border-[#00796B]/15 hover:border-[#00796B]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Total Laporan</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                activeTab === 'all' ? 'bg-[#005B54] text-white' : 'bg-[#E6F4EA] text-[#00796B]'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('menunggu_verifikasi')}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                activeTab === 'menunggu_verifikasi'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]'
                  : 'bg-white/90 text-slate-700 hover:bg-white border-amber-200 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="truncate">Laporan Masuk</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                activeTab === 'menunggu_verifikasi' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sedang_ditangani')}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                activeTab === 'sedang_ditangani'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md scale-[1.02]'
                  : 'bg-white/90 text-slate-700 hover:bg-white border-sky-200 hover:border-sky-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="truncate">Sedang Ditangani</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                activeTab === 'sedang_ditangani' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-900'
              }`}>
                {inProgressCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('selesai')}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                activeTab === 'selesai'
                  ? 'bg-[#10B981] text-white border-[#10B981] shadow-md scale-[1.02]'
                  : 'bg-white/90 text-slate-700 hover:bg-white border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Selesai Ditangani</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                activeTab === 'selesai' ? 'bg-[#059669] text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {resolvedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:px-8 border-b border-black/[0.04] bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul, tiket, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F1F3EE] border border-black/[0.04] rounded-full text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 transition-all text-stone-900 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Kecamatan Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="w-full px-3 py-2 bg-[#F1F3EE] border border-black/[0.04] rounded-full text-xs sm:text-sm font-medium text-stone-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 transition-all cursor-pointer"
              >
                <option value="all">Semua Kecamatan ({KECAMATAN_LIST.length})</option>
                {KECAMATAN_LIST.map((kec) => (
                  <option key={kec} value={kec}>
                    Kec. {kec}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#F1F3EE] border border-black/[0.04] rounded-full text-xs sm:text-sm font-medium text-stone-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400 transition-all cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              >
                <option value="newest">Terbaru</option>
                <option value="upvotes">Dukungan Terbanyak</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:px-8 space-y-3.5 bg-slate-50/60">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Tidak ada laporan yang sesuai
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 font-medium">
                Coba sesuaikan kata kunci pencarian, pilihan kecamatan, atau filter status laporan di atas.
              </p>
              {(searchQuery || selectedKecamatan !== 'all' || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedKecamatan('all');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((report) => {
              const catInfo = CATEGORIES.find(c => c.id === report.category);
              const formattedDate = new Date(report.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={report.id}
                  onClick={() => {
                    onSelectReport(report);
                  }}
                  className="group bg-white rounded-[22px] p-4 sm:p-5 border border-black/[0.06] hover:border-stone-400 hover:shadow-md transition-all cursor-pointer relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Photo Thumbnail or Fallback */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group-hover:scale-105 transition-transform duration-300">
                        {report.imageUrl ? (
                          <img
                            src={report.imageUrl}
                            alt={report.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // If image fails, replace with icon placeholder
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        {(!report.imageUrl) && (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-100">
                            <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                            <span className="text-[9px] font-bold leading-tight">Foto Dok</span>
                          </div>
                        )}
                        {report.upvotes && report.upvotes > 0 ? (
                          <div className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <ThumbsUp className="w-2.5 h-2.5 text-amber-300" />
                            <span>{report.upvotes}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Info & Title */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Ticket Number with Copy */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyTicket(e, report.ticketNumber)}
                            className="inline-flex items-center gap-1 font-mono font-black text-[11px] text-teal-950 bg-teal-100/90 px-2.5 py-0.5 rounded-lg border border-teal-300 hover:bg-teal-200 transition-colors"
                            title="Klik untuk salin nomor tiket"
                          >
                            <span>{report.ticketNumber}</span>
                            {copiedTicket === report.ticketNumber ? (
                              <Check className="w-3 h-3 text-emerald-700" />
                            ) : (
                              <Copy className="w-3 h-3 text-teal-700" />
                            )}
                          </button>

                          {/* Category Tag */}
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {catInfo?.name || report.category}
                          </span>

                          {/* Kecamatan Badge */}
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            Kec. {report.kecamatan}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2">
                          {report.title}
                        </h4>

                        {/* Excerpt */}
                        <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                          {report.description}
                        </p>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">{report.addressDetails}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formattedDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status badge & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <StatusBadge status={report.status} />

                      <div className="flex items-center gap-2">
                        {onTrackTicket && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onTrackTicket(report.ticketNumber);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                            title="Lacak status tiket ini"
                          >
                            Lacak
                          </button>
                        )}

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:text-teal-900 group-hover:translate-x-0.5 transition-all">
                          <span>Detail</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Menampilkan <strong>{filteredReports.length}</strong> dari <strong>{reports.length}</strong> total aduan terdaftar</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onNavigateToMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToMap(selectedCategory !== 'all' ? selectedCategory : undefined, activeTab !== 'all' ? activeTab : undefined);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 font-bold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Lihat di Peta Interaktif</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
