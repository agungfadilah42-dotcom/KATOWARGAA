import React, { useState, useMemo } from 'react';
import { 
  GovernmentProgram, 
  ProgramReview, 
  ProgramStatus, 
  ProgramCategory, 
  OfficialReply 
} from '../types';
import { DINAS_LIST } from '../data/dinasData';
import { StarRating } from '../components/StarRating';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Building2, 
  Star, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  EyeOff, 
  X, 
  ChevronRight, 
  Layers, 
  Image as ImageIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface GovernmentProgramsViewProps {
  programs: GovernmentProgram[];
  reviews: ProgramReview[];
  isAdmin: boolean;
  onAddProgram: (data: Omit<GovernmentProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddReview: (data: Omit<ProgramReview, 'id' | 'createdAt'>) => void;
  onReplyReview: (reviewId: string, reply: OfficialReply) => void;
  onModerateReview: (reviewId: string, isModerated: boolean, reason?: string) => void;
}

export const GovernmentProgramsView: React.FC<GovernmentProgramsViewProps> = ({
  programs,
  reviews,
  isAdmin,
  onAddProgram,
  onAddReview,
  onReplyReview,
  onModerateReview
}) => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDinas, setSelectedDinas] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Detail Modal state
  const [selectedProgram, setSelectedProgram] = useState<GovernmentProgram | null>(null);

  // Add Program Modal state (Admin)
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);

  // Citizen Review Form inside Detail Modal
  const [formRating, setFormRating] = useState<number>(5);
  const [formComment, setFormComment] = useState<string>('');
  const [formReviewerName, setFormReviewerName] = useState<string>('');
  const [formReviewerRole, setFormReviewerRole] = useState<string>('Warga Kota Jambi');
  const [formFeedbackType, setFormFeedbackType] = useState<'masukan_pelaksanaan' | 'evaluasi_hasil' | 'saran_umum'>('masukan_pelaksanaan');
  const [formError, setFormError] = useState<string>('');

  // Official Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [responderName, setResponderName] = useState<string>('Pejabat Pengawas Teknis Program');

  // Add Program Form State (Admin)
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newResponsibleDinas, setNewResponsibleDinas] = useState(DINAS_LIST[0].name);
  const [newCategory, setNewCategory] = useState<ProgramCategory>('infrastruktur');
  const [newLocation, setNewLocation] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState('');
  const [newStatus, setNewStatus] = useState<ProgramStatus>('berlangsung');
  const [newProgress, setNewProgress] = useState<number>(50);
  const [newImageUrl, setNewImageUrl] = useState('/images/hero-smart-city.jpg');

  // Category Configuration
  const categoryLabels: Record<ProgramCategory, { label: string; color: string }> = {
    infrastruktur: { label: 'Infrastruktur Perkotaan', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    kebersihan_lingkungan: { label: 'Kebersihan & Lingkungan', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    transportasi: { label: 'Transportasi & Mobilitas', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    digitalisasi_pelayanan: { label: 'Digitalisasi & SPBE', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    sosial_ekonomi: { label: 'Pemberdayaan Ekonomi', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    taman_tata_kota: { label: 'Ruang Terbuka & Taman', color: 'bg-teal-50 text-teal-800 border-teal-200' }
  };

  const statusConfigs: Record<ProgramStatus, { label: string; colorClass: string; icon: any }> = {
    direncanakan: {
      label: 'Direncanakan',
      colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-1 ring-indigo-200',
      icon: Clock
    },
    berlangsung: {
      label: 'Sedang Berlangsung',
      colorClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300',
      icon: Sparkles
    },
    selesai: {
      label: 'Selesai Tuntas',
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300',
      icon: CheckCircle2
    },
    ditunda: {
      label: 'Ditunda',
      colorClass: 'bg-slate-100 text-slate-700 border-slate-300 ring-1 ring-slate-200',
      icon: PauseCircle
    }
  };

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchDinas = selectedDinas === 'all' || p.responsibleDinas.toLowerCase().includes(selectedDinas.toLowerCase());
      const matchStat = selectedStatus === 'all' || p.status === selectedStatus;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.responsibleDinas.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchDinas && matchStat && matchSearch;
    });
  }, [programs, selectedCategory, selectedDinas, selectedStatus, searchQuery]);

  // Compute rating for a program
  const getProgramRatingSummary = (programId: string) => {
    const progReviews = reviews.filter(r => r.programId === programId && !r.isModerated);
    if (progReviews.length === 0) return { avg: null, count: 0 };
    const sum = progReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Math.round((sum / progReviews.length) * 10) / 10;
    return { avg, count: progReviews.length };
  };

  // Submit review for selected program
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setFormError('');

    if (!formReviewerName.trim()) {
      setFormError('Silakan masukkan nama Anda.');
      return;
    }

    if (!formComment.trim() || formComment.trim().length < 5) {
      setFormError('Harap tuliskan ulasan atau masukan evaluasi minimal 5 karakter.');
      return;
    }

    onAddReview({
      programId: selectedProgram.id,
      rating: formRating,
      comment: formComment.trim(),
      reviewerName: formReviewerName.trim(),
      reviewerRole: formReviewerRole.trim(),
      feedbackType: formFeedbackType
    });

    setFormComment('');
    setFormReviewerName('');
  };

  // Submit reply
  const handleReplySubmit = (reviewId: string) => {
    if (!replyMessage.trim() || !selectedProgram) return;

    onReplyReview(reviewId, {
      responderName: responderName.trim(),
      responderDinas: selectedProgram.responsibleDinas,
      message: replyMessage.trim(),
      repliedAt: new Date().toISOString()
    });

    setReplyingReviewId(null);
    setReplyMessage('');
  };

  // Submit new program
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newObjective.trim()) return;

    onAddProgram({
      title: newTitle.trim(),
      description: newDescription.trim(),
      objective: newObjective.trim(),
      responsibleDinas: newResponsibleDinas,
      category: newCategory,
      location: newLocation.trim() || 'Kota Jambi',
      startDate: newStartDate,
      endDate: newEndDate || undefined,
      status: newStatus,
      progressPercentage: Number(newProgress),
      imageUrl: newImageUrl,
      documentationImages: [newImageUrl]
    });

    setIsAddProgramOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewObjective('');
    setNewLocation('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0F3B56] via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300">
            <Building2 className="w-4 h-4 stroke-[2.5]" />
            <span>Portal Keterbukaan Program Pembangunan Kota Jambi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Program Pemerintah Kota Jambi
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 font-medium leading-relaxed">
            Ketahui agenda strategis, progres proyek fisik, dan inisiatif pelayanan Pemkot Jambi. Sampaikan masukan pelaksanaan untuk program berjalan serta evaluasi hasil untuk program yang telah tuntas.
          </p>

          {isAdmin && (
            <div className="pt-2">
              <button
                onClick={() => setIsAddProgramOpen(true)}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 hover:from-emerald-300 hover:to-amber-200 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-teal-500/30 transition-all cursor-pointer hover:scale-102"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Publikasikan Program Baru (Admin/Dinas)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Cari nama program, lokasi, dinas, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30 font-bold text-slate-900"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="infrastruktur">Infrastruktur Perkotaan</option>
              <option value="kebersihan_lingkungan">Kebersihan & Lingkungan</option>
              <option value="transportasi">Transportasi & Mobilitas</option>
              <option value="digitalisasi_pelayanan">Digitalisasi & Pelayanan</option>
              <option value="taman_tata_kota">Ruang Terbuka & Taman</option>
              <option value="sosial_ekonomi">Sosial & Ekonomi</option>
            </select>

            <select
              value={selectedDinas}
              onChange={(e) => setSelectedDinas(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">Semua Dinas</option>
              {DINAS_LIST.map(d => (
                <option key={d.id} value={d.shortName}>{d.shortName}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">Semua Status</option>
              <option value="direncanakan">Direncanakan</option>
              <option value="berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Selesai</option>
              <option value="ditunda">Ditunda</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-medium">
          <span>Menampilkan <strong>{filteredPrograms.length}</strong> program pemerintah</span>
          <span>Diperbarui secara berkala oleh masing-masing dinas teknis</span>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => {
            const ratingMeta = getProgramRatingSummary(program.id);
            const statusConfig = statusConfigs[program.status];
            const StatusIcon = statusConfig.icon;
            const categoryMeta = categoryLabels[program.category] || { label: program.category, color: 'bg-slate-100 text-slate-700' };

            return (
              <div 
                key={program.id}
                className="bg-white rounded-3xl border-2 border-emerald-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Image Cover */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Status Tag */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-xs ${statusConfig.colorClass}`}>
                      <StatusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>

                  {/* Progress Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-black text-slate-900 border border-slate-200 shadow-xs">
                    Progres {program.progressPercentage}%
                  </div>

                  {/* Category Pill on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold text-[11px] bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-400/40 backdrop-blur-xs truncate max-w-[200px]">
                      {program.responsibleDinas}
                    </span>
                    <span className="text-[10px] text-teal-200 font-mono">
                      {new Date(program.updatedAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${categoryMeta.color}`}>
                      {categoryMeta.label}
                    </span>

                    <h2 className="text-base font-black text-slate-900 leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                      {program.title}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
                      {program.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{program.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Pelaksanaan: {program.startDate} {program.endDate ? `s/d ${program.endDate}` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-600">Realisasi Progres</span>
                      <span className="font-mono text-teal-900 font-black">{program.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${program.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Rating & Review Summary Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {ratingMeta.avg !== null ? (
                        <>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black text-slate-900">{ratingMeta.avg}</span>
                          <span className="text-[10px] text-slate-500">({ratingMeta.count} ulasan)</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada ulasan</span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedProgram(program)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-black rounded-xl border border-teal-200 transition-all cursor-pointer group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white group-hover:border-transparent"
                    >
                      <span>Detail & Ulas</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-3xl border-2 border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Program Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada program yang sesuai dengan filter pencarian Anda. Coba ubah kategori atau bersihkan kata kunci.
            </p>
          </div>
        )}
      </div>

      {/* Program Detail & Citizen Feedback Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-amber-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-300">
                  {selectedProgram.responsibleDinas}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Diperbarui: {new Date(selectedProgram.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
              
              {/* Title & Status */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${statusConfigs[selectedProgram.status].colorClass}`}>
                    {statusConfigs[selectedProgram.status].label}
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${categoryLabels[selectedProgram.category]?.color}`}>
                    {categoryLabels[selectedProgram.category]?.label}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {selectedProgram.title}
                </h2>
              </div>

              {/* Main Image */}
              {selectedProgram.imageUrl && (
                <div className="rounded-2xl overflow-hidden border-2 border-emerald-200 max-h-72 bg-slate-100 shadow-inner">
                  <img
                    src={selectedProgram.imageUrl}
                    alt={selectedProgram.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Objective & Description */}
              <div className="space-y-4">
                <div className="p-4 bg-teal-50/60 rounded-2xl border-2 border-teal-200/80 space-y-1">
                  <strong className="text-xs font-black text-teal-950 uppercase tracking-wide block">
                    Tujuan & Target Program
                  </strong>
                  <p className="text-xs text-teal-900 font-semibold leading-relaxed">
                    {selectedProgram.objective}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <strong className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                    Deskripsi Lengkap Pelaksanaan
                  </strong>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedProgram.description}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Lokasi Pelaksanaan</span>
                    <span className="text-slate-600 font-medium">{selectedProgram.location}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Jadwal / Periode</span>
                    <span className="text-slate-600 font-medium">
                      Mulai {selectedProgram.startDate} {selectedProgram.endDate ? `s/d ${selectedProgram.endDate}` : '(Jangka Panjang)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progres Status Bar */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span>Realisasi Capaian Program</span>
                  <span className="text-emerald-700 text-sm">{selectedProgram.progressPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-emerald-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                    style={{ width: `${selectedProgram.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* CITIZEN RATING & EVALUATION SECTION */}
              <div className="pt-4 border-t-2 border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Evaluasi & Masukan Masyarakat</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedProgram.status === 'berlangsung'
                        ? 'Program sedang berjalan: Berikan masukan pelaksanaan dan saran perbaikan langsung.'
                        : selectedProgram.status === 'selesai'
                        ? 'Program telah selesai: Berikan evaluasi hasil dan manfaat nyata bagi lingkungan Anda.'
                        : 'Sampaikan aspirasi dan ekspektasi Anda terhadap perencanaan program ini.'}
                    </p>
                  </div>

                  {(() => {
                    const sm = getProgramRatingSummary(selectedProgram.id);
                    return sm.avg !== null ? (
                      <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-2 self-start sm:self-auto">
                        <StarRating value={sm.avg} readOnly size="sm" />
                        <span className="font-mono text-xs font-black text-amber-950">
                          {sm.avg} / 5 ({sm.count} ulasan)
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Citizen Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/40 to-emerald-50/30 rounded-2xl border-2 border-emerald-200/90 space-y-4">
                  <span className="text-xs font-black text-teal-950 block">
                    Tuliskan Pendapat, Saran, & Evaluasi Anda
                  </span>

                  {/* Rating Selector */}
                  <div className="p-3 bg-white rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">Rating Evaluasi Program:</span>
                    <StarRating
                      value={formRating}
                      onChange={(v) => setFormRating(v)}
                      size="lg"
                      showLabel={true}
                    />
                  </div>

                  {/* Feedback type & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Jenis Masukan / Evaluasi
                      </label>
                      <select
                        value={formFeedbackType}
                        onChange={(e) => setFormFeedbackType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      >
                        {selectedProgram.status === 'berlangsung' && (
                          <option value="masukan_pelaksanaan">Masukan Pelaksanaan (Sedang Berjalan)</option>
                        )}
                        {selectedProgram.status === 'selesai' && (
                          <option value="evaluasi_hasil">Evaluasi Hasil & Manfaat (Sudah Selesai)</option>
                        )}
                        <option value="saran_umum">Saran Umum & Gagasan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Profil Penilai / Peran
                      </label>
                      <select
                        value={formReviewerRole}
                        onChange={(e) => setFormReviewerRole(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      >
                        <option value="Warga Sekitar Lokasi">Warga Sekitar Lokasi</option>
                        <option value="Pengguna Layanan Harian">Pengguna Layanan Harian</option>
                        <option value="Pelaku UMKM / Usaha">Pelaku UMKM / Usaha</option>
                        <option value="Tokoh Masyarakat / RT">Tokoh Masyarakat / RT</option>
                        <option value="Pemerhati Kebijakan Publik">Pemerhati Kebijakan Publik</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Nama Lengkap Anda <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama Anda..."
                      value={formReviewerName}
                      onChange={(e) => setFormReviewerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Komentar / Ulasan Evaluasi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        selectedProgram.status === 'berlangsung'
                          ? 'Bagikan kondisi pengerjaan di lapangan, kendala debu/akses, atau saran percepatan...'
                          : 'Bagikan bagaimana hasil program ini bermanfaat bagi aktivitas harian Anda...'
                      }
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Kritik konstruktif dan masukan dilindungi hak berekspresi warga.
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer hover:scale-102"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Ulasan Program</span>
                    </button>
                  </div>
                </form>

                {/* List of Reviews for This Program */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Daftar Ulasan & Masukan Warga
                  </h4>

                  {reviews.filter(r => r.programId === selectedProgram.id).length > 0 ? (
                    reviews
                      .filter(r => r.programId === selectedProgram.id)
                      .map((rev) => {
                        return (
                          <div
                            key={rev.id}
                            className={`p-4.5 rounded-2xl border-2 transition-all space-y-3 ${
                              rev.isModerated
                                ? 'bg-rose-50/50 border-rose-200'
                                : 'bg-white border-slate-200 shadow-xs'
                            }`}
                          >
                            {/* Moderation banner if flagged */}
                            {rev.isModerated && (
                              <div className="p-2.5 bg-rose-100/70 border border-rose-300 rounded-xl text-[11px] text-rose-800 flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Ulasan dimoderasi: {rev.moderationReason || 'Melanggar ketentuan komunikasi'}
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => onModerateReview(rev.id, false)}
                                    className="font-black underline text-rose-900 cursor-pointer"
                                  >
                                    Pulihkan
                                  </button>
                                )}
                              </div>
                            )}

                            {(!rev.isModerated || isAdmin) && (
                              <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs">
                                      {rev.reviewerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-black text-slate-900">{rev.reviewerName}</span>
                                      {rev.reviewerRole && (
                                        <span className="text-[10px] text-teal-800 font-bold ml-1.5 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                          {rev.reviewerRole}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <StarRating value={rev.rating} readOnly size="sm" />
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  “{rev.comment}”
                                </p>

                                {/* Official Reply if any */}
                                {rev.officialReply && (
                                  <div className="ml-4 sm:ml-6 p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-black text-teal-950 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-teal-700" />
                                        Tanggapan Resmi {rev.officialReply.responderDinas}
                                      </span>
                                      <span className="text-[10px] text-teal-700">
                                        {new Date(rev.officialReply.repliedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-teal-900 leading-relaxed font-semibold pl-5 border-l-2 border-teal-300">
                                      {rev.officialReply.message}
                                    </p>
                                  </div>
                                )}

                                {/* Admin Action Bar */}
                                {isAdmin && (
                                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                    {!rev.officialReply && replyingReviewId !== rev.id && (
                                      <button
                                        onClick={() => setReplyingReviewId(rev.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 text-[11px] font-bold rounded-lg border border-teal-200 cursor-pointer"
                                      >
                                        <CornerDownRight className="w-3 h-3" />
                                        <span>Tanggapi Resmi Dinas</span>
                                      </button>
                                    )}

                                    {!rev.isModerated && (
                                      <button
                                        onClick={() => onModerateReview(rev.id, true, 'Melanggar ketentuan norma / spam')}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:bg-rose-50 text-[11px] font-bold rounded-lg border border-rose-200 cursor-pointer"
                                      >
                                        <EyeOff className="w-3 h-3" />
                                        <span>Tandai Spam / Moderasi</span>
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Inline reply form for admin */}
                                {isAdmin && replyingReviewId === rev.id && (
                                  <div className="ml-4 sm:ml-6 p-3.5 bg-teal-50 rounded-xl border border-teal-300 space-y-2 text-xs">
                                    <span className="font-black text-teal-950 block">Kirim Tanggapan Resmi Kedinasan:</span>
                                    <textarea
                                      rows={2}
                                      value={replyMessage}
                                      onChange={(e) => setReplyMessage(e.target.value)}
                                      placeholder="Tuliskan tindak lanjut atau apresiasi resmi dinas..."
                                      className="w-full bg-white border border-teal-200 rounded-lg p-2 font-medium"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setReplyingReviewId(null)}
                                        className="px-3 py-1 text-slate-500 font-bold hover:bg-slate-100 rounded-lg cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={() => handleReplySubmit(rev.id)}
                                        className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg cursor-pointer"
                                      >
                                        Kirim Tanggapan
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 font-medium">
                      Belum ada ulasan untuk program ini. Jadilah yang pertama memberikan masukan!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-2 border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-5 py-2 bg-white border-2 border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Publish New Program Modal */}
      {isAddProgramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-xl w-full my-8 p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600 stroke-[2.5]" />
                <h3 className="font-black text-base text-slate-900">
                  Publikasikan Program Pemerintah Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddProgramOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-800 mb-1">Judul Program <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembangunan Jembatan Penyeberangan Ramah Lansia..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dinas Penanggung Jawab</label>
                  <select
                    value={newResponsibleDinas}
                    onChange={(e) => setNewResponsibleDinas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    {DINAS_LIST.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kategori Program</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="infrastruktur">Infrastruktur Perkotaan</option>
                    <option value="kebersihan_lingkungan">Kebersihan & Lingkungan</option>
                    <option value="transportasi">Transportasi & Mobilitas</option>
                    <option value="digitalisasi_pelayanan">Digitalisasi & Pelayanan</option>
                    <option value="taman_tata_kota">Ruang Terbuka & Taman</option>
                    <option value="sosial_ekonomi">Sosial & Ekonomi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tujuan & Target Program <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Target manfaat yang akan dicapai bagi warga..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Deskripsi Lengkap <span className="text-rose-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Rincian teknis, ruang lingkup, dan latar belakang program..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lokasi Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kec. Danau Sipin"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Program</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="direncanakan">Direncanakan</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditunda">Ditunda</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Progres Fisik ({newProgress}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProgramOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl shadow-md cursor-pointer hover:scale-102"
                >
                  Simpan & Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
