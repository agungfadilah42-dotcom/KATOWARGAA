import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  CreditCard, 
  Phone, 
  MapPin, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  FileText,
  Building,
  User,
  Lock,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CitizenUser, KecamatanJambi } from '../types';
import { KECAMATAN_LIST } from '../data/categories';
import { 
  loginCitizen, 
  registerCitizen, 
  INITIAL_MOCK_CITIZENS, 
  setStoredCitizen, 
  clearStoredCitizen 
} from '../services/storage';
import { KatoEmblemSvg } from './KatoLogo';

export type AuthTabType = 'warga' | 'admin';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTabType;
  currentCitizen: CitizenUser | null;
  isAdminAuthenticated: boolean;
  onCitizenLogin: (citizen: CitizenUser) => void;
  onCitizenLogout: () => void;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenMyReports?: () => void;
  onNavigateToAdminDashboard?: () => void;
  showToast: (msg: string) => void;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'warga',
  currentCitizen,
  isAdminAuthenticated,
  onCitizenLogin,
  onCitizenLogout,
  onAdminLogin,
  onAdminLogout,
  onOpenMyReports,
  onNavigateToAdminDashboard,
  showToast
}) => {
  // Main role tab: 'warga' vs 'admin'
  const [activeRole, setActiveRole] = useState<AuthTabType>(initialTab);

  // Warga sub-tab: 'login' vs 'register'
  const [wargaTab, setWargaTab] = useState<'login' | 'register'>('login');

  // Warga login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [wargaLoginError, setWargaLoginError] = useState('');

  // Warga register form state
  const [regName, setRegName] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regKecamatan, setRegKecamatan] = useState<KecamatanJambi>('Telanaipura');
  const [regAddress, setRegAddress] = useState('');
  const [regError, setRegError] = useState('');

  // Admin login form state
  const [adminUsername, setAdminUsername] = useState('verifikator@jambikota.go.id');
  const [adminPassword, setAdminPassword] = useState('••••••••');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialTab);
      setWargaLoginError('');
      setAdminLoginError('');
      setRegError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // WARGA ACTIONS
  // ----------------------------------------------------
  const handleQuickCitizenDemo = (demoUser: CitizenUser) => {
    setStoredCitizen(demoUser);
    onCitizenLogin(demoUser);
    showToast(`Selamat datang, ${demoUser.name}! Masuk sebagai Warga (${demoUser.kecamatan}).`);
    onClose();
  };

  const handleSubmitWargaLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setWargaLoginError('');

    if (!loginIdentifier.trim()) {
      setWargaLoginError('Masukkan NIK (16 digit), No. HP/WhatsApp, atau Nama terdaftar.');
      return;
    }

    const res = loginCitizen(loginIdentifier);
    if (res.success && res.user) {
      onCitizenLogin(res.user);
      showToast(`Selamat datang kembali, ${res.user.name}! Masuk sebagai Warga.`);
      onClose();
    } else {
      setWargaLoginError(res.message);
    }
  };

  const handleSubmitWargaRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const res = registerCitizen({
      nik: regNik,
      name: regName,
      phone: regPhone,
      email: regEmail,
      kecamatan: regKecamatan,
      address: regAddress
    });

    if (res.success && res.user) {
      onCitizenLogin(res.user);
      showToast(res.message);
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  const handleWargaLogout = () => {
    clearStoredCitizen();
    onCitizenLogout();
    showToast('Sesi akun warga telah diakhiri.');
  };

  // ----------------------------------------------------
  // ADMIN ACTIONS
  // ----------------------------------------------------
  const handlePerformAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    if (!adminUsername.trim()) {
      setAdminLoginError('Masukkan email atau username kedinasan.');
      return;
    }

    // Call onAdminLogin which triggers isAdminAuthenticated = true
    // and automatically redirects to the Admin Dashboard!
    onAdminLogin();
    showToast('Berhasil masuk sebagai Verifikator Diskominfo / Dinas PUPR Kota Jambi. Mengalihkan ke Dashboard Admin...');
    onClose();
  };

  const handleQuickAdminDemo = () => {
    onAdminLogin();
    showToast('Akses Cepat: Masuk sebagai Tim Verifikator Pemkot Jambi. Mengalihkan ke Dashboard Admin...');
    onClose();
  };

  const handleAdminLogoutAction = () => {
    onAdminLogout();
    showToast('Sesi administrator telah diakhiri.');
  };

  const maskNik = (nik: string) => {
    if (nik.length < 16) return nik;
    return `${nik.slice(0, 6)}******${nik.slice(12)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-[28px] sm:rounded-3xl max-w-lg w-full shadow-2xl border-2 border-emerald-300 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Kato Logo */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-700 to-[#0F3B56] p-5 sm:p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-emerald-200">
              <KatoEmblemSvg className="w-11 h-11" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Portal Masuk KATO WARGA
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto font-medium">
            Satu pintu akses layanan untuk Masyarakat Kota Jambi dan Petugas / Administrator Pemkot
          </p>

          {/* Unified Role Selector Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-1.5 p-1 bg-black/25 backdrop-blur-xs rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setActiveRole('warga')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeRole === 'warga'
                  ? 'bg-white text-teal-950 shadow-md scale-101'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Masyarakat (Warga)</span>
              {currentCitizen && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-white text-[#0F3B56] shadow-md scale-101'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Petugas / Admin</span>
              {isAdminAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ROLE 1: MASYARAKAT (WARGA) */}
        {/* ======================================================== */}
        {activeRole === 'warga' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* If Citizen is ALREADY LOGGED IN */}
            {currentCitizen ? (
              <div className="space-y-4">
                {/* Digital KTP / Citizen Card */}
                <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-[#0F3B56] rounded-2xl p-5 text-white shadow-xl overflow-hidden border-2 border-emerald-300">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-emerald-200 font-black">
                        Kartu Identitas Digital Warga
                      </span>
                      <h3 className="text-lg font-black tracking-tight">{currentCitizen.name}</h3>
                      <p className="text-xs text-emerald-100 font-mono mt-0.5">
                        NIK: {maskNik(currentCitizen.nik)}
                      </p>
                    </div>
                    <div className="bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-300/40 text-[10px] font-black text-emerald-200 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-300" />
                      <span>Terverifikasi</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-200 block font-semibold">Wilayah Kecamatan:</span>
                      <span className="font-bold">{currentCitizen.kecamatan}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200 block font-semibold">Kontak Terdaftar:</span>
                      <span className="font-bold truncate block">{currentCitizen.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Info Note: Citizen stays on public site */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Status Akun Warga Aktif.</strong> Anda tetap berada di portal publik untuk membuat aduan baru, memberi dukungan (upvote), melacak tiket, dan menilai program Pemkot.
                  </p>
                </div>

                {/* Citizen Quick Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {onOpenMyReports && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMyReports();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-black transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-700" />
                      <span>Lihat Aduan Saya</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleWargaLogout}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Keluar Akun Warga</span>
                  </button>
                </div>

                {/* Switch to Admin link */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveRole('admin')}
                    className="text-xs text-slate-500 hover:text-teal-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Anda petugas dinas? Masuk ke Portal Admin ➔</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Citizen is NOT LOGGED IN */
              <div className="space-y-4">
                {/* Warga Sub Tabs: Masuk vs Daftar */}
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setWargaTab('login')}
                    className={`flex-1 py-2 text-xs font-black border-b-2 text-center transition-colors cursor-pointer ${
                      wargaTab === 'login'
                        ? 'border-teal-600 text-teal-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Masuk Akun Warga
                  </button>
                  <button
                    type="button"
                    onClick={() => setWargaTab('register')}
                    className={`flex-1 py-2 text-xs font-black border-b-2 text-center transition-colors cursor-pointer ${
                      wargaTab === 'register'
                        ? 'border-teal-600 text-teal-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Daftar Akun Baru
                  </button>
                </div>

                {/* Warga Sub Tab: LOGIN */}
                {wargaTab === 'login' && (
                  <div className="space-y-4">
                    {/* Quick Demo Citizens */}
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/40 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-teal-950 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Pilih Akun Demo Warga Cepat:</span>
                        </span>
                        <span className="text-[10px] text-teal-700 font-bold">1-Klik Langsung</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {INITIAL_MOCK_CITIZENS.map((demo) => (
                          <button
                            key={demo.id}
                            type="button"
                            onClick={() => handleQuickCitizenDemo(demo)}
                            className="text-left p-2.5 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 hover:border-emerald-400 transition-all text-xs cursor-pointer shadow-2xs hover:scale-101"
                          >
                            <p className="font-black text-slate-900 leading-tight truncate">{demo.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Kec. {demo.kecamatan}</p>
                            <span className="mt-1 inline-block text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              {demo.totalReports ?? 2} Laporan Aktif
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-black">atau masuk mandiri</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Warga Login Form */}
                    <form onSubmit={handleSubmitWargaLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          NIK / No. HP / Nama Warga
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 1571012304890001 atau Budi Santoso"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30"
                        />
                      </div>

                      {wargaLoginError && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {wargaLoginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-[#0F3B56] hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-teal-600/25 cursor-pointer hover:scale-102 flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Masuk sebagai Warga</span>
                      </button>

                      <p className="text-[11px] text-slate-500 text-center font-medium">
                        *Sebagai warga, Anda akan tetap berada di halaman publik tanpa dialihkan ke dashboard admin.
                      </p>
                    </form>
                  </div>
                )}

                {/* Warga Sub Tab: REGISTER */}
                {wargaTab === 'register' && (
                  <form onSubmit={handleSubmitWargaRegister} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ahmad Syukri"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          NIK (16 Digit) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="1571xxxxxxxxxxxx"
                          value={regNik}
                          onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          No. HP / WhatsApp <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0812xxxxxxxx"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Kecamatan Domisili <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={regKecamatan}
                          onChange={(e) => setRegKecamatan(e.target.value as KecamatanJambi)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white"
                        >
                          {KECAMATAN_LIST.map((kec) => (
                            <option key={kec} value={kec}>{kec}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          placeholder="warga@email.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Alamat Domisili Detail
                      </label>
                      <input
                        type="text"
                        placeholder="Nama jalan, RT/RW, Kelurahan"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    {regError && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {regError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-[#0F3B56] hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-teal-600/25 cursor-pointer hover:scale-102 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Daftar & Terbitkan Akun Warga</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 2: PETUGAS & ADMIN PEMKOT */}
        {/* ======================================================== */}
        {activeRole === 'admin' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* If Admin is ALREADY LOGGED IN */}
            {isAdminAuthenticated ? (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50/90 border-2 border-teal-300 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-teal-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Sesi Administrator Aktif</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Verifikator Utama
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    Operator: <strong>Tim Terpadu Diskominfo / Dinas PUPR Kota Jambi</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {onNavigateToAdminDashboard && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToAdminDashboard();
                      }}
                      className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-[#0F3B56] text-white text-xs font-black shadow-md shadow-teal-600/20 cursor-pointer hover:scale-102"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Buka Dashboard Admin</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAdminLogoutAction}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Keluar dari Admin</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Admin is NOT LOGGED IN */
              <div className="space-y-4">
                {/* Notice: Admin will be redirected to dashboard */}
                <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                  <div className="font-black flex items-center gap-1 text-amber-900">
                    <Building className="w-3.5 h-3.5 text-amber-700" />
                    <span>Akses Khusus Dinas Teknis & Verifikator</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed font-semibold">
                    Setelah login, sistem akan <strong>langsung mengarahkan Anda ke Dashboard Admin</strong> untuk verifikasi aduan, disposisi dinas, dan tanggapan resmi.
                  </p>
                </div>

                {/* 1-Click Demo Button for Admin */}
                <button
                  type="button"
                  onClick={handleQuickAdminDemo}
                  className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-300 hover:border-emerald-400 text-emerald-950 flex items-center justify-between transition-all cursor-pointer shadow-xs hover:scale-101"
                >
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-teal-950">Masuk Cepat Demo Admin</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Diskominfo & Dinas PUPR Kota Jambi</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-teal-700 flex items-center gap-1">
                    <span>Masuk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-black">atau kredensial manual</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Admin Login Form */}
                <form onSubmit={handlePerformAdminLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Username / Email Kedinasan
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="verifikator@jambikota.go.id"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-8 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30"
                      />
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Kata Sandi Kedinasan
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-8 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {adminLoginError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {adminLoginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-[#0F3B56] hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-teal-600/25 cursor-pointer hover:scale-102 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk ke Dashboard Admin ➔</span>
                  </button>
                </form>

                <p className="text-[11px] text-slate-400 text-center font-medium">
                  *Autentikasi terpusat Smart City Pemerintah Kota Jambi 2026
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
