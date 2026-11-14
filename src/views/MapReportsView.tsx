import React, { useState } from 'react';
import { ReportItem, ReportCategory, KecamatanJambi } from '../types';
import { CATEGORIES, KECAMATAN_LIST, STATUS_CONFIG } from '../data/categories';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { 
  MapPin, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Layers, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface MapReportsViewProps {
  reports: ReportItem[];
  initialCategory?: ReportCategory;
  onSelectReport: (report: ReportItem) => void;
  onNavigateToCreate: () => void;
}

export const MapReportsView: React.FC<MapReportsViewProps> = ({
  reports,
  initialCategory,
  onSelectReport,
  onNavigateToCreate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReportOnMap, setActiveReportOnMap] = useState<ReportItem | null>(null);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchKecamatan = selectedKecamatan === 'all' || r.kecamatan === selectedKecamatan;
    const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.addressDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchKecamatan && matchStatus && matchSearch;
  });

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedKecamatan('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setActiveReportOnMap(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-teal-950 text-xs font-black mb-1 border-2 border-emerald-300 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-teal-700 stroke-[2.5]" />
            <span>Peta Spasial Kota Jambi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Peta Persebaran Aduan Fasilitas Umum
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
            Visualisasi titik kerusakan fisik, penerangan umum, dan drainase di seluruh 11 kecamatan Kota Jambi.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00796B] hover:bg-[#005B54] text-white text-xs font-bold rounded-full shadow-md transition-all self-start md:self-auto cursor-pointer hover:scale-102"
        >
          <span>+ Laporkan Masalah Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-teal-900 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-teal-600 stroke-[2.5]" />
            <span>Filter Data Spasial</span>
          </div>
          {(selectedCategory !== 'all' || selectedKecamatan !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-black cursor-pointer bg-rose-50 px-3 py-1 rounded-lg border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-teal-600 absolute left-3 top-3 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Cari kata kunci / tiket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30 transition-all font-semibold text-slate-900"
            />
          </div>

          {/* Kategori Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Kecamatan Filter */}
          <select
            value={selectedKecamatan}
            onChange={(e) => setSelectedKecamatan(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30"
          >
            <option value="all">Semua Kecamatan ({KECAMATAN_LIST.length})</option>
            {KECAMATAN_LIST.map((kec) => (
              <option key={kec} value={kec}>
                Kecamatan {kec}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30"
          >
            <option value="all">Semua Status Penanganan</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="sedang_ditangani">Sedang Ditangani</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Map + Side List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Panel (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden border border-black/[0.06] shadow-md">
            <LeafletMap
              reports={filteredReports}
              selectedReport={activeReportOnMap}
              onSelectReport={onSelectReport}
              height="580px"
              zoom={13}
            />

            {/* Float Badge Status Legend */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-black/[0.06] shadow-md flex flex-wrap items-center gap-3 text-xs text-stone-800 font-bold">
              <span className="font-black text-stone-900">Pin:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Verifikasi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Valid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                Diproses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Selesai
              </span>
            </div>
          </div>

          <div className="p-4 bg-white border border-black/[0.04] rounded-2xl text-xs text-stone-600 flex items-start gap-2.5 font-medium shadow-2xs">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5 stroke-[2.2]" />
            <span>
              <strong className="font-bold text-stone-800">Keterangan Simulasi:</strong> Seluruh titik koordinat pada peta di atas merupakan data contoh terstruktur yang disesuaikan dengan kondisi geografis wilayah Kota Jambi untuk keperluan demonstrasi Smart City 2026.
            </span>
          </div>
        </div>

        {/* Side List Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white rounded-[28px] sm:rounded-[32px] border border-black/[0.04] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 stroke-[2.5]" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Daftar Laporan Terfilter
              </h2>
            </div>
            <span className="text-xs font-mono font-black text-teal-900 bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-300">
              {filteredReports.length} Aduan
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredReports.length > 0 ? (
              filteredReports.map((item) => {
                const isSelected = activeReportOnMap?.id === item.id;
                const cat = CATEGORIES.find(c => c.id === item.category);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveReportOnMap(item)}
                    className={`p-3.5 rounded-2xl border-2 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00796B] bg-[#E6F4EA] shadow-md ring-2 ring-[#00796B]/20'
                        : 'border-slate-200/90 hover:border-[#00796B]/40 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span className="font-mono font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{item.ticketNumber}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <h3 className="font-black text-slate-900 mb-1 line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 font-medium">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-teal-800 font-bold">
                        Kec. {item.kecamatan}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(item);
                        }}
                        className="text-teal-700 hover:text-teal-950 font-black inline-flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                      >
                        <span>Detail</span>
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <p className="font-medium">Tidak ada laporan yang sesuai dengan filter yang dipilih.</p>
                <button
                  onClick={handleResetFilters}
                  className="text-teal-700 underline font-black cursor-pointer"
                >
                  Reset semua filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
