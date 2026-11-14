import React, { useState } from 'react';
import { 
  ReportItem, 
  ReportStatus, 
  ReportCategory, 
  KecamatanJambi, 
  ReportReview, 
  GovernmentProgram, 
  ProgramReview, 
  OfficialReply, 
  ProgramStatus,
  Conversation,
  ChatMessage
} from '../types';
import { CATEGORIES, KECAMATAN_LIST, STATUS_CONFIG } from '../data/categories';
import { DINAS_LIST } from '../data/dinasData';
import { 
  getStoredConversations, 
  officerTakeoverConversation, 
  officerSendMessage, 
  officerAddInternalNote, 
  closeConversation 
} from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import { StarRating } from '../components/StarRating';
import { KatoEmblemSvg } from '../components/KatoLogo';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle,
  Eye, 
  Edit3, 
  BarChart2, 
  FileSpreadsheet, 
  Download, 
  Save, 
  X, 
  ExternalLink, 
  RefreshCw, 
  MessageSquare, 
  Star, 
  EyeOff, 
  CornerDownRight, 
  Building2, 
  PlusCircle, 
  Sparkles,
  Layers,
  Headphones,
  Send,
  User,
  Bot,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface AdminDashboardViewProps {
  reports: ReportItem[];
  reviews: ReportReview[];
  programs: GovernmentProgram[];
  programReviews: ProgramReview[];
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onUpdateStatus: (ticketNumber: string, newStatus: ReportStatus, officerNotes: string, officerName: string) => void;
  onResetData: () => void;
  onSelectReport: (report: ReportItem) => void;
  onReplyComplaintReview?: (reviewId: string, reply: OfficialReply) => void;
  onModerateComplaintReview?: (reviewId: string, isModerated: boolean, reason?: string) => void;
  onAddProgram?: (data: Omit<GovernmentProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProgram?: (id: string, updates: Partial<GovernmentProgram>) => void;
  onReplyProgramReview?: (reviewId: string, reply: OfficialReply) => void;
  onModerateProgramReview?: (reviewId: string, isModerated: boolean, reason?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reports,
  reviews,
  programs,
  programReviews,
  isAuthenticated,
  onLogin,
  onLogout,
  onUpdateStatus,
  onResetData,
  onSelectReport,
  onReplyComplaintReview,
  onModerateComplaintReview,
  onAddProgram,
  onUpdateProgram,
  onReplyProgramReview,
  onModerateProgramReview
}) => {
  // Navigation tabs in admin
  const [adminTab, setAdminTab] = useState<'aduan' | 'ulasan' | 'program' | 'cs'>('aduan');

  // Customer Service State (Modul CS Hybrid & AI Copilot)
  const [conversations, setConversations] = useState<Conversation[]>(() => getStoredConversations());
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [csFilter, setCsFilter] = useState<'all' | 'menunggu_petugas' | 'petugas_melayani' | 'selesai'>('all');
  const [officerReplyText, setOfficerReplyText] = useState('');
  const [officerInternalNoteText, setOfficerInternalNoteText] = useState('');
  const [showInternalNotes, setShowInternalNotes] = useState(true);
  const [isGeneratingCopilotDraft, setIsGeneratingCopilotDraft] = useState(false);
  const [copilotDraft, setCopilotDraft] = useState<string | null>(null);
  const [activeOfficerName, setActiveOfficerName] = useState('Budi Santoso, S.Kom');
  const [activeOfficerDinas, setActiveOfficerDinas] = useState('Diskominfo / CS Terpadu Kota Jambi');

  // Refresh conversations helper
  const refreshConversations = () => {
    const list = getStoredConversations();
    setConversations(list);
  };

  // Auto-select first conversation if none selected
  const activeConversation = conversations.find(c => c.id === selectedConvId) || conversations[0] || null;

  // Officer take over action
  const handleOfficerTakeover = (convId: string) => {
    const updated = officerTakeoverConversation(convId, activeOfficerName, activeOfficerDinas);
    refreshConversations();
    setSelectedConvId(updated.id);
  };

  // Officer send message action
  const handleOfficerSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !officerReplyText.trim()) return;

    officerSendMessage(activeConversation.id, officerReplyText.trim(), activeOfficerName);
    setOfficerReplyText('');
    setCopilotDraft(null);
    refreshConversations();
  };

  // Officer add private internal note
  const handleOfficerAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !officerInternalNoteText.trim()) return;

    officerAddInternalNote(activeConversation.id, officerInternalNoteText.trim(), activeOfficerName);
    setOfficerInternalNoteText('');
    refreshConversations();
  };

  // Officer close conversation
  const handleOfficerCloseConversation = (convId: string) => {
    closeConversation(convId, activeOfficerName);
    refreshConversations();
  };

  // Generate AI Copilot Draft for Officer
  const handleGenerateCopilotDraft = async () => {
    if (!activeConversation) return;
    setIsGeneratingCopilotDraft(true);
    setCopilotDraft(null);

    // Find the last citizen message
    const lastUserMsg = [...activeConversation.messages].reverse().find(m => m.sender === 'user')?.message || 'Pertanyaan seputar layanan pengaduan Kota Jambi';

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lastUserMsg,
          conversationHistory: activeConversation.messages.slice(-6),
          isOfficerDraft: true,
          ticketsContext: reports,
          programsContext: programs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCopilotDraft(data.reply);
      } else {
        setCopilotDraft('Selamat siang Bapak/Ibu, laporan dan permohonan informasi Anda telah kami catat dalam sistem dinas teknis Pemkot Jambi. Kami segera menindaklanjuti ke lapangan.');
      }
    } catch {
      setCopilotDraft('Selamat siang Bapak/Ibu, laporan dan permohonan informasi Anda telah kami catat dalam sistem dinas teknis Pemkot Jambi. Kami segera menindaklanjuti ke lapangan.');
    } finally {
      setIsGeneratingCopilotDraft(false);
    }
  };

  const handleApplyCopilotDraft = () => {
    if (copilotDraft) {
      setOfficerReplyText(copilotDraft);
      setCopilotDraft(null);
    }
  };

  // Login form states
  const [username, setUsername] = useState('verifikator@jambikota.go.id');
  const [password, setPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState('');

  // Admin filter states (reports)
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('all');
  const [adminStatus, setAdminStatus] = useState('all');
  const [adminKecamatan, setAdminKecamatan] = useState('all');

  // Status edit modal state
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [editStatus, setEditStatus] = useState<ReportStatus>('menunggu_verifikasi');
  const [editNotes, setEditNotes] = useState('');
  const [editOfficerName, setEditOfficerName] = useState('Tim Terpadu Diskominfo & PUPR Kota Jambi');

  // Reply Modal state for Complaint Reviews
  const [replyingReview, setReplyingReview] = useState<ReportReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [responderOfficer, setResponderOfficer] = useState('Humas Pelayanan Publik Pemkot Jambi');
  const [responderDinas, setResponderDinas] = useState('Dinas Teknis Terkait');

  // Reply Modal state for Program Reviews
  const [replyingProgReview, setReplyingProgReview] = useState<ProgramReview | null>(null);
  const [progReplyText, setProgReplyText] = useState('');
  const [progResponderOfficer, setProgResponderOfficer] = useState('Tim Pengawas Program Pembangunan');

  // Handle Mock Login
  const handlePerformLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setLoginError('Masukkan email atau username kedinasan.');
      return;
    }
    setLoginError('');
    onLogin();
  };

  // Open Edit Modal
  const openEditModal = (report: ReportItem) => {
    setEditingReport(report);
    setEditStatus(report.status);
    setEditNotes(report.officerNotes || '');
  };

  // Save Status Change
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    onUpdateStatus(
      editingReport.ticketNumber,
      editStatus,
      editNotes.trim(),
      editOfficerName.trim()
    );

    setEditingReport(null);
  };

  // Handle Reply to Complaint Review
  const handleSendComplaintReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim() || !onReplyComplaintReview) return;

    onReplyComplaintReview(replyingReview.id, {
      responderName: responderOfficer.trim(),
      responderDinas: responderDinas.trim(),
      message: replyText.trim(),
      repliedAt: new Date().toISOString()
    });

    setReplyingReview(null);
    setReplyText('');
  };

  // Handle Reply to Program Review
  const handleSendProgramReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingProgReview || !progReplyText.trim() || !onReplyProgramReview) return;

    const prog = programs.find(p => p.id === replyingProgReview.programId);

    onReplyProgramReview(replyingProgReview.id, {
      responderName: progResponderOfficer.trim(),
      responderDinas: prog?.responsibleDinas || 'Pemerintah Kota Jambi',
      message: progReplyText.trim(),
      repliedAt: new Date().toISOString()
    });

    setReplyingProgReview(null);
    setProgReplyText('');
  };

  // Filtered reports in admin
  const filteredAdminReports = reports.filter((r) => {
    const matchCat = adminCategory === 'all' || r.category === adminCategory;
    const matchStat = adminStatus === 'all' || r.status === adminStatus;
    const matchKec = adminKecamatan === 'all' || r.kecamatan === adminKecamatan;
    const matchSearch =
      !adminSearch ||
      r.ticketNumber.toLowerCase().includes(adminSearch.toLowerCase()) ||
      r.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
      r.addressDetails.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(adminSearch.toLowerCase()));

    return matchCat && matchStat && matchKec && matchSearch;
  });

  // Calculate Breakdown Stats
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'menunggu_verifikasi').length;
  const verifiedReports = reports.filter(r => r.status === 'terverifikasi').length;
  const handlingReports = reports.filter(r => r.status === 'sedang_ditangani').length;
  const resolvedReports = reports.filter(r => r.status === 'selesai').length;

  // Category counts
  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: reports.filter(r => r.category === cat.id).length
  }));

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Nomor Tiket', 'Judul', 'Kategori', 'Dinas', 'Kecamatan', 'Alamat', 'Status', 'Tanggal Dibuat', 'Pelapor'];
    const rows = filteredAdminReports.map(r => [
      r.ticketNumber,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      `"${(r.assignedDinas || '').replace(/"/g, '""')}"`,
      r.kecamatan,
      `"${r.addressDetails.replace(/"/g, '""')}"`,
      r.status,
      r.createdAt,
      r.isAnonymous ? 'Anonim' : (r.reporterName || 'Warga')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_laporan_kato_jambi_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // Login Gate if not authenticated
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <KatoEmblemSvg className="w-20 h-20 drop-shadow-md transition-transform hover:scale-105 duration-300" />
            </div>
            <h1 className="text-xl font-black text-slate-900">
              Portal Administrator & Dinas Teknis
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Akses khusus verifikator Pemkot Jambi untuk pengelolaan aduan, tanggapan resmi, moderasi ulasan, dan pembaruan program kerja.
            </p>
          </div>

          <div className="p-4 bg-teal-50/70 border-2 border-teal-200 rounded-2xl text-xs text-teal-950 space-y-1 shadow-xs">
            <div className="font-black flex items-center gap-1.5 text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-700 stroke-[2.5]" />
              <span>Akses Demonstrasi Cepat:</span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed font-semibold">
              Klik tombol di bawah untuk langsung masuk menggunakan hak akses simulasi Verifikator Diskominfo / Dinas PUPR Kota Jambi.
            </p>
          </div>

          <form onSubmit={handlePerformLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Akun Kedinasan
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-amber-500/30 cursor-pointer hover:scale-102"
            >
              Masuk sebagai Admin Pengelola
            </button>
          </form>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-500 font-semibold">
              *Autentikasi simulasi prototipe Smart City 2026
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated Admin Dashboard
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar with Admin Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-2 border-emerald-200/90 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
            <h1 className="text-lg font-black text-slate-900">
              Pusat Kendali Administrator & Dinas Teknis
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Operator: <strong className="text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Tim Terpadu Diskominfo / Dinas PUPR Kota Jambi</strong> · Level: Verifikator Utama
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            title="Reset data demo ke awal"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl transition-colors cursor-pointer font-bold shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>

      {/* Admin Feature Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-emerald-200/60 pb-1">
        <button
          onClick={() => setAdminTab('aduan')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            adminTab === 'aduan'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Verifikasi & SLA Aduan ({reports.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('ulasan')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            adminTab === 'ulasan'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Moderasi & Tanggapan Ulasan ({reviews.length + programReviews.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('program')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            adminTab === 'program'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Program Pemerintah ({programs.length})</span>
        </button>

        <button
          onClick={() => {
            setAdminTab('cs');
            refreshConversations();
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 relative ${
            adminTab === 'cs'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Customer Service & Live Chat</span>
          {conversations.filter(c => c.status === 'menunggu_petugas').length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
          )}
          <span className="bg-slate-100 text-slate-900 border border-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {conversations.length}
          </span>
        </button>
      </div>

      {/* TAB 1: VERIFIKASI ADUAN */}
      {adminTab === 'aduan' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            <div className="bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/60 p-5 rounded-2xl border-t-4 border-t-indigo-500 border-x border-b border-indigo-200/80 shadow-md">
              <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wide block mb-1">
                Semua Laporan
              </span>
              <div className="text-3xl font-black text-indigo-950 tabular-nums">{totalReports}</div>
              <span className="text-[10px] text-indigo-700 font-semibold">Total aduan masuk</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 p-5 rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-amber-200/80 shadow-md">
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wide block mb-1">
                Menunggu Verifikasi
              </span>
              <div className="text-3xl font-black text-amber-600 tabular-nums">{pendingReports}</div>
              <span className="text-[10px] text-amber-800 font-semibold">Perlu ditinjau</span>
            </div>

            <div className="bg-gradient-to-br from-sky-50/90 via-white to-blue-50/60 p-5 rounded-2xl border-t-4 border-t-sky-500 border-x border-b border-sky-200/80 shadow-md">
              <span className="text-[11px] font-black text-sky-900 uppercase tracking-wide block mb-1">
                Terverifikasi
              </span>
              <div className="text-3xl font-black text-sky-700 tabular-nums">{verifiedReports}</div>
              <span className="text-[10px] text-sky-800 font-semibold">Siap disposisi dinas</span>
            </div>

            <div className="bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/60 p-5 rounded-2xl border-t-4 border-t-cyan-500 border-x border-b border-cyan-200/80 shadow-md">
              <span className="text-[11px] font-black text-cyan-900 uppercase tracking-wide block mb-1">
                Sedang Ditangani
              </span>
              <div className="text-3xl font-black text-cyan-800 tabular-nums">{handlingReports}</div>
              <span className="text-[10px] text-cyan-700 font-semibold">Tim lapangan aktif</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/90 via-white to-lime-50/60 p-5 rounded-2xl border-t-4 border-t-emerald-500 border-x border-b border-emerald-200/80 shadow-md col-span-2 lg:col-span-1">
              <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wide block mb-1">
                Selesai Ditangani
              </span>
              <div className="text-3xl font-black text-emerald-700 tabular-nums">{resolvedReports}</div>
              <span className="text-[10px] text-emerald-800 font-semibold">Perbaikan rampung</span>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200/90 shadow-lg overflow-hidden">
            <div className="p-5 sm:p-6 border-b-2 border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Manajemen Data Seluruh Laporan
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    Ditemukan {filteredAdminReports.length} dari {totalReports} laporan dalam sistem
                  </span>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ekspor Rekap CSV</span>
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-teal-600 absolute left-3 top-3 stroke-[2.5]" />
                  <input
                    type="text"
                    placeholder="Cari tiket, judul, pelapor..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white text-slate-900 font-bold"
                  />
                </div>

                <select
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-teal-500"
                >
                  <option value="all">Semua Kategori</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={adminKecamatan}
                  onChange={(e) => setAdminKecamatan(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-teal-500"
                >
                  <option value="all">Semua Kecamatan</option>
                  {KECAMATAN_LIST.map(k => (
                    <option key={k} value={k}>Kec. {k}</option>
                  ))}
                </select>

                <select
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-teal-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                  <option value="terverifikasi">Terverifikasi</option>
                  <option value="sedang_ditangani">Sedang Ditangani</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-950 uppercase font-black text-[11px] border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-5 py-3.5">No. Tiket</th>
                    <th className="px-5 py-3.5">Judul & Lokasi</th>
                    <th className="px-5 py-3.5">Kategori & Dinas</th>
                    <th className="px-5 py-3.5">Pelapor</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminReports.map((report) => {
                    const cat = CATEGORIES.find(c => c.id === report.category);

                    return (
                      <tr key={report.id} className="hover:bg-teal-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-black text-teal-900 whitespace-nowrap">
                          <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{report.ticketNumber}</span>
                        </td>

                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{report.title}</div>
                          <div className="text-[11px] text-slate-500 truncate font-medium">
                            {report.addressDetails} (Kec. {report.kecamatan})
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-slate-800 font-bold block">{cat?.name}</span>
                          <span className="text-[10px] text-teal-800 font-semibold">{report.assignedDinas}</span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {report.isAnonymous ? (
                            <span className="text-slate-400 italic">Anonim</span>
                          ) : (
                            <span className="text-slate-800 font-bold">{report.reporterName || 'Warga'}</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={report.status} size="sm" />
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onSelectReport(report)}
                              className="p-1.5 text-slate-600 hover:text-teal-900 rounded-lg hover:bg-teal-50 cursor-pointer"
                              title="Lihat Pratinjau Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <button
                              onClick={() => openEditModal(report)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs hover:scale-102"
                            >
                              <Edit3 className="w-3 h-3 stroke-[2.5]" />
                              <span>Ubah Status</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERASI & TANGGAPAN RESMI ULASAN (FITUR 1 & 3) */}
      {adminTab === 'ulasan' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <span>Ulasan Penanganan Pengaduan Selesai ({reviews.length})</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Beri tanggapan resmi kedinasan dan moderasi konten yang melanggar ketentuan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((rev) => {
                const report = reports.find(r => r.ticketNumber === rev.ticketNumber);

                return (
                  <div 
                    key={rev.id}
                    className={`p-4.5 rounded-2xl border-2 transition-all space-y-3 ${
                      rev.isModerated ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-mono font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mr-2">
                          {rev.ticketNumber}
                        </span>
                        <strong className="text-slate-900">{report?.title || 'Pengaduan Warga'}</strong>
                        <span className="text-slate-500 ml-2">oleh <strong>{rev.reviewerName}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <StarRating value={rev.rating} readOnly size="sm" />
                        <span className="text-[11px] font-bold text-amber-900">({rev.rating}/5)</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                      “{rev.comment}”
                    </p>

                    {/* Moderation status */}
                    {rev.isModerated && (
                      <div className="p-2 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Dimoderasi: {rev.moderationReason || 'Melanggar ketentuan norma'}</span>
                      </div>
                    )}

                    {/* Official Reply Display */}
                    {rev.officialReply && (
                      <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs space-y-1">
                        <span className="font-black text-teal-950 block">
                          Tanggapan Resmi {rev.officialReply.responderDinas} ({rev.officialReply.responderName}):
                        </span>
                        <p className="text-[11px] text-teal-900 font-semibold">{rev.officialReply.message}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {!rev.officialReply && (
                        <button
                          onClick={() => {
                            setReplyingReview(rev);
                            setResponderDinas(report?.assignedDinas || 'Dinas Teknis Pemkot Jambi');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200 cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Tanggapi Resmi Dinas</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onModerateComplaintReview) {
                            onModerateComplaintReview(
                              rev.id, 
                              !rev.isModerated, 
                              !rev.isModerated ? 'Memuat kata tidak pantas / spam' : undefined
                            );
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer transition-colors ${
                          rev.isModerated
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{rev.isModerated ? 'Batalkan Moderasi' : 'Moderasi Ulasan'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program Reviews section */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-6 shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                <span>Ulasan & Evaluasi Program Pemerintah ({programReviews.length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tanggapi masukan pelaksanaan dan hasil evaluasi warga terhadap program dinas.
              </p>
            </div>

            <div className="space-y-4">
              {programReviews.map((prev) => {
                const prog = programs.find(p => p.id === prev.programId);

                return (
                  <div key={prev.id} className="p-4.5 rounded-2xl bg-slate-50/60 border-2 border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div>
                        <strong className="text-slate-900">{prog?.title || 'Program Pemkot'}</strong>
                        <span className="text-slate-500 ml-2">oleh <strong>{prev.reviewerName}</strong> ({prev.reviewerRole})</span>
                      </div>
                      <StarRating value={prev.rating} readOnly size="sm" />
                    </div>

                    <p className="text-xs text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200">
                      “{prev.comment}”
                    </p>

                    {prev.officialReply && (
                      <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs">
                        <span className="font-bold text-teal-950 block">Tanggapan Resmi {prev.officialReply.responderDinas}:</span>
                        <p className="text-[11px] text-teal-900 font-semibold mt-0.5">{prev.officialReply.message}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {!prev.officialReply && (
                        <button
                          onClick={() => setReplyingProgReview(prev)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200 cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Tanggapi Resmi Dinas</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onModerateProgramReview) {
                            onModerateProgramReview(
                              prev.id,
                              !prev.isModerated,
                              !prev.isModerated ? 'Spam atau melanggar ketentuan norma' : undefined
                            );
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-200 cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{prev.isModerated ? 'Pulihkan' : 'Moderasi'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGELOLAAN PROGRAM PEMERINTAH (FITUR 3) */}
      {adminTab === 'program' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-emerald-200/90 p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Daftar Program Publikasi Pemerintah Kota Jambi
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Kelola status, progres fisik pekerjaan, dan dokumentasi program.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-950 uppercase font-black text-[11px] border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-5 py-3.5">Nama Program</th>
                    <th className="px-5 py-3.5">Dinas Pelaksana</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Progres Fisik</th>
                    <th className="px-5 py-3.5 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map((prog) => (
                    <tr key={prog.id} className="hover:bg-teal-50/40">
                      <td className="px-5 py-3.5 font-bold text-slate-900 max-w-xs">
                        <div className="truncate">{prog.title}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{prog.location}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{prog.responsibleDinas}</td>
                      <td className="px-5 py-3.5 font-bold capitalize text-teal-900">
                        <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{prog.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-black text-slate-900">
                        {prog.progressPercentage}%
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const newStatus: ProgramStatus = prog.status === 'berlangsung' ? 'selesai' : 'berlangsung';
                              const newProg = newStatus === 'selesai' ? 100 : 75;
                              if (onUpdateProgram) onUpdateProgram(prog.id, { status: newStatus, progressPercentage: newProg });
                            }}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg font-bold border border-teal-200 text-[11px] cursor-pointer"
                          >
                            Tandai {prog.status === 'berlangsung' ? 'Selesai' : 'Berlangsung'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CUSTOMER SERVICE & LIVE CHAT HYBRID (MODUL CS)     */}
      {/* ======================================================== */}
      {adminTab === 'cs' && (
        <div className="space-y-6">
          {/* CS KPI Header Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                Total Sesi Konsultasi
              </span>
              <div className="text-3xl font-black text-slate-900 tabular-nums">
                {conversations.length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Semua percakapan masuk</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border-2 border-amber-300 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                  Menunggu Petugas
                </span>
                {conversations.filter(c => c.status === 'menunggu_petugas').length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <div className="text-3xl font-black text-amber-700 tabular-nums">
                {conversations.filter(c => c.status === 'menunggu_petugas').length}
              </div>
              <span className="text-[10px] text-amber-800 font-bold">Perlu penanganan manusia segera</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border-2 border-emerald-300 shadow-sm">
              <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block mb-1">
                Sedang Dilayani Petugas
              </span>
              <div className="text-3xl font-black text-teal-800 tabular-nums">
                {conversations.filter(c => c.status === 'petugas_melayani').length}
              </div>
              <span className="text-[10px] text-teal-800 font-bold">Interaksi aktif petugas</span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                Selesai / Terbantu AI
              </span>
              <div className="text-3xl font-black text-slate-800 tabular-nums">
                {conversations.filter(c => c.status === 'selesai' || c.status === 'ai_melayani').length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Tiket terselesaikan</span>
            </div>
          </div>

          {/* Active Officer Status Bar */}
          <div className="bg-teal-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-800 flex items-center justify-center border border-teal-700">
                <Headphones className="w-5 h-5 text-[#C8F135]" />
              </div>
              <div>
                <span className="text-[11px] text-teal-300 font-bold uppercase tracking-wider block">
                  Petugas Bertugas Saat Ini
                </span>
                <span className="text-sm font-black">
                  {activeOfficerName} ({activeOfficerDinas})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Siaga Terhubung
              </span>
            </div>
          </div>

          {/* CS Console: Left list & Right workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Conversation Queue (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-700" />
                  <span>Antrean Percakapan Warga</span>
                </h3>
                <button
                  onClick={refreshConversations}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Segarkan Antrean"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'menunggu_petugas', label: 'Antrean Petugas' },
                  { id: 'petugas_melayani', label: 'Sedang Dilayani' },
                  { id: 'selesai', label: 'Selesai' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCsFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer text-[11px] ${
                      csFilter === f.id
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Conversation List */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {conversations
                  .filter((c) => {
                    if (csFilter === 'all') return true;
                    return c.status === csFilter;
                  })
                  .map((conv) => {
                    const isSelected = activeConversation?.id === conv.id;
                    const lastMsg = conv.messages[conv.messages.length - 1];

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConvId(conv.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-2 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/60 shadow-md ring-2 ring-teal-400/20'
                            : conv.status === 'menunggu_petugas'
                            ? 'border-amber-400 bg-amber-50/40 hover:bg-amber-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                              <span>{conv.userName}</span>
                              {conv.status === 'menunggu_petugas' && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-black border border-amber-300">
                                  Menunggu
                                </span>
                              )}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {conv.id}
                            </span>
                          </div>

                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            conv.status === 'petugas_melayani' ? 'bg-emerald-100 text-emerald-900' :
                            conv.status === 'menunggu_petugas' ? 'bg-amber-100 text-amber-900' :
                            conv.status === 'selesai' ? 'bg-slate-100 text-slate-700' :
                            'bg-blue-100 text-blue-900'
                          }`}>
                            {conv.status === 'petugas_melayani' ? 'Dilayani' :
                             conv.status === 'menunggu_petugas' ? 'Antrean CS' :
                             conv.status === 'selesai' ? 'Selesai' : 'Mode AI'}
                          </span>
                        </div>

                        {conv.topic && (
                          <div className="text-[11px] font-bold text-teal-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 truncate">
                            Topik: {conv.topic}
                          </div>
                        )}

                        <p className="text-xs text-slate-600 truncate">
                          {lastMsg ? `${lastMsg.senderName}: ${lastMsg.message}` : 'Belum ada pesan'}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{new Date(conv.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{conv.messages.length} Pesan</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column: Chat Workspace & AI Copilot (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {activeConversation ? (
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  {/* Active Chat Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-slate-900">
                          {activeConversation.userName}
                        </h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          activeConversation.status === 'petugas_melayani' ? 'bg-emerald-100 text-emerald-900' :
                          activeConversation.status === 'menunggu_petugas' ? 'bg-amber-100 text-amber-900' :
                          activeConversation.status === 'selesai' ? 'bg-slate-100 text-slate-700' :
                          'bg-blue-100 text-blue-900'
                        }`}>
                          {activeConversation.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {activeConversation.assignedOfficerName ? (
                          <>Ditangani oleh: <strong>{activeConversation.assignedOfficerName}</strong></>
                        ) : (
                          'Belum diambil alih petugas'
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeConversation.status !== 'petugas_melayani' && activeConversation.status !== 'selesai' && (
                        <button
                          onClick={() => handleOfficerTakeover(activeConversation.id)}
                          className="px-4 py-2 bg-[#00796B] hover:bg-[#005B54] text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Ambil Alih Percakapan</span>
                        </button>
                      )}

                      {activeConversation.status === 'petugas_melayani' && (
                        <button
                          onClick={() => handleOfficerCloseConversation(activeConversation.id)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="p-4.5 max-h-[380px] overflow-y-auto space-y-3.5 bg-slate-50/50">
                    {activeConversation.messages.map((m) => {
                      const isUser = m.sender === 'user';
                      const isOfficer = m.sender === 'officer';

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-600">
                              {m.senderName} ({m.senderRole || m.sender})
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                              isUser
                                ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs font-medium'
                                : isOfficer
                                ? 'bg-emerald-700 text-white rounded-tr-xs font-medium'
                                : 'bg-teal-50 text-teal-950 border border-teal-200 rounded-tr-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{m.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Copilot Suggestion Box for Officer */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-t border-b border-teal-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-700" />
                        <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                          AI Copilot untuk Petugas CS
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateCopilotDraft}
                        disabled={isGeneratingCopilotDraft}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCopilotDraft ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingCopilotDraft ? 'Menyusun Draf...' : '✨ Buat Draf Balasan AI'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium">
                      Gunakan AI Copilot untuk merumuskan balasan kedinasan yang santun dan akurat berdasarkan pertanyaan warga.
                    </p>

                    {copilotDraft && (
                      <div className="bg-white p-3.5 rounded-xl border-2 border-teal-400 space-y-2 shadow-xs">
                        <span className="text-[10px] text-teal-800 uppercase font-black block">
                          Rekomendasi Draf Tanggapan:
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {copilotDraft}
                        </p>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setCopilotDraft(null)}
                            className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-bold cursor-pointer"
                          >
                            Abaikan
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyCopilotDraft}
                            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
                          >
                            Gunakan Draf Ini di Kolom Balasan →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Officer Reply Form */}
                  <form onSubmit={handleOfficerSendMessage} className="p-4 bg-white space-y-2.5">
                    <textarea
                      rows={3}
                      placeholder={
                        activeConversation.status === 'petugas_melayani'
                          ? 'Tulis tanggapan atau informasi resmi untuk warga...'
                          : 'Klik "Ambil Alih Percakapan" terlebih dahulu untuk membalas...'
                      }
                      disabled={activeConversation.status === 'selesai'}
                      value={officerReplyText}
                      onChange={(e) => setOfficerReplyText(e.target.value)}
                      className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-teal-500 rounded-xl p-3 text-slate-900 font-medium focus:outline-hidden leading-relaxed"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Pesan akan langsung terkirim ke widget obrolan warga.
                      </span>

                      <button
                        type="submit"
                        disabled={!officerReplyText.trim() || activeConversation.status === 'selesai'}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#00796B] hover:bg-[#005B54] disabled:bg-slate-300 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pesan Resmi</span>
                      </button>
                    </div>
                  </form>

                  {/* Collapsible Private Internal Notes (Confidential for Officers) */}
                  <div className="p-4 bg-slate-100 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => setShowInternalNotes(!showInternalNotes)}
                        className="flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-slate-950 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Catatan Internal Petugas (Rahasia) ({activeConversation.internalNotes?.length || 0})</span>
                        {showInternalNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Hanya terlihat oleh petugas verifikator & CS
                      </span>
                    </div>

                    {showInternalNotes && (
                      <div className="space-y-3 pt-2">
                        {activeConversation.internalNotes && activeConversation.internalNotes.length > 0 ? (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {activeConversation.internalNotes.map((n, idx) => (
                              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                                {n}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            Belum ada catatan internal untuk percakapan ini.
                          </p>
                        )}

                        <form onSubmit={handleOfficerAddNote} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tulis catatan internal antar-petugas (misal: koordinasi dinas bina marga)..."
                            value={officerInternalNoteText}
                            onChange={(e) => setOfficerInternalNoteText(e.target.value)}
                            className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-hidden"
                          />
                          <button
                            type="submit"
                            disabled={!officerInternalNoteText.trim()}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Simpan Catatan
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-sm">Pilih percakapan dari daftar antrean di sebelah kiri</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Edit Status Modal (Report) */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider block">
                  Perbarui Status Tiket
                </span>
                <h3 className="font-black text-base text-slate-900">
                  {editingReport.ticketNumber} — {editingReport.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  Pilih Status Baru
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditStatus('menunggu_verifikasi')}
                    className={`p-3 rounded-xl border-2 text-left font-black transition-all cursor-pointer ${
                      editStatus === 'menunggu_verifikasi'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400/50 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    1. Menunggu Verifikasi
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('terverifikasi')}
                    className={`p-3 rounded-xl border-2 text-left font-black transition-all cursor-pointer ${
                      editStatus === 'terverifikasi'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-400/50 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    2. Terverifikasi
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('sedang_ditangani')}
                    className={`p-3 rounded-xl border-2 text-left font-black transition-all cursor-pointer ${
                      editStatus === 'sedang_ditangani'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-400/50 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    3. Sedang Ditangani
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('selesai')}
                    className={`p-3 rounded-xl border-2 text-left font-black transition-all cursor-pointer ${
                      editStatus === 'selesai'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/50 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    4. Selesai Ditangani
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Petugas / Unit Pelaksana
                </label>
                <input
                  type="text"
                  value={editOfficerName}
                  onChange={(e) => setEditOfficerName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Tindak Lanjut Petugas
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan penanganan untuk pelapor..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium leading-relaxed focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
                >
                  <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Reply Modal for Complaint Reviews */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900">
                Tanggapi Resmi Ulasan Tiket {replyingReview.ticketNumber}
              </h3>
              <button onClick={() => setReplyingReview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendComplaintReply} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Pejabat Penjawab</label>
                <input
                  type="text"
                  value={responderOfficer}
                  onChange={(e) => setResponderOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Dinas Penanggung Jawab</label>
                <input
                  type="text"
                  value={responderDinas}
                  onChange={(e) => setResponderDinas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Pesan Tanggapan Resmi</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ketikkan apresiasi dan tindak lanjut dinas..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl cursor-pointer"
                >
                  Kirim Tanggapan Resmi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Reply Modal for Program Reviews */}
      {replyingProgReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900">
                Tanggapi Resmi Evaluasi Program
              </h3>
              <button onClick={() => setReplyingProgReview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProgramReply} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Pejabat / Perwakilan</label>
                <input
                  type="text"
                  value={progResponderOfficer}
                  onChange={(e) => setProgResponderOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Pesan Tanggapan Resmi</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ketikkan klarifikasi atau tindak lanjut pelaksanaan..."
                  value={progReplyText}
                  onChange={(e) => setProgReplyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingProgReview(null)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl cursor-pointer"
                >
                  Kirim Tanggapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
