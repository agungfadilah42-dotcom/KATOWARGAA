import React, { useState } from 'react';
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
  User
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

interface CitizenAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCitizen: CitizenUser | null;
  onCitizenChange: (citizen: CitizenUser | null) => void;
  onOpenMyReports?: () => void;
  showToast: (msg: string) => void;
}

export const CitizenAuthModal: React.FC<CitizenAuthModalProps> = ({
  isOpen,
  onClose,
  currentCitizen,
  onCitizenChange,
  onOpenMyReports,
  showToast
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regKecamatan, setRegKecamatan] = useState<KecamatanJambi>('Telanaipura');
  const [regAddress, setRegAddress] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  // Handle Quick Demo Login
  const handleQuickDemo = (demoUser: CitizenUser) => {
    setStoredCitizen(demoUser);
    onCitizenChange(demoUser);
    showToast(`Berhasil masuk sebagai ${demoUser.name} (${demoUser.kecamatan})`);
    onClose();
  };

  // Handle Standard Login
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('Masukkan NIK (16 digit), No. HP, atau Nama Anda.');
      return;
    }

    const res = loginCitizen(loginIdentifier);
    if (res.success && res.user) {
      onCitizenChange(res.user);
      showToast(res.message);
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  // Handle Register
  const handleSubmitRegister = (e: React.FormEvent) => {
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
      onCitizenChange(res.user);
      showToast(res.message);
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearStoredCitizen();
    onCitizenChange(null);
    showToast('Anda telah keluar dari akun warga.');
    onClose();
  };

  // MASKED NIK helper
  const maskNik = (nik: string) => {
    if (nik.length < 16) return nik;
    return `${nik.slice(0, 6)}******${nik.slice(12)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-emerald-300 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-700 to-[#0F3B56] p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-emerald-200">
              <KatoEmblemSvg className="w-12 h-12" />
            </div>
          </div>

          <h2 className="text-xl font-black tracking-tight">
            {currentCitizen ? 'Profil Akun Warga Kota Jambi' : 'Layanan Akun Warga Kota Jambi'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            {currentCitizen 
              ? 'Identitas digital warga resmi terintegrasi dalam sistem KATO WARGA' 
              : 'Masuk untuk mempermudah pelaporan, melacak aduan, dan memberikan evaluasi program'}
          </p>
        </div>

        {/* IF ALREADY LOGGED IN: SHOW CITIZEN PROFILE */}
        {currentCitizen ? (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 border-2 border-emerald-300 overflow-hidden">
                  {currentCitizen.avatarUrl ? (
                    <img 
                      src={currentCitizen.avatarUrl} 
                      alt={currentCitizen.name}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{currentCitizen.name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 truncate">
                      {currentCitizen.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700 stroke-[3]" />
                      Warga Terverifikasi
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    NIK: <span className="font-bold text-slate-800">{maskNik(currentCitizen.nik)}</span>
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-teal-800">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      Kec. {currentCitizen.kecamatan}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {currentCitizen.phone}
                    </span>
                  </div>

                  {currentCitizen.address && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                      📍 {currentCitizen.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for Logged in citizen */}
            <div className="space-y-3">
              {onOpenMyReports && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyReports();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-teal-50 text-teal-800 border-2 border-teal-200 hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>Lihat Riwayat & Laporan Saya</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-rose-50 text-rose-700 border-2 border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Keluar dari Akun Warga</span>
              </button>
            </div>
          </div>
        ) : (
          /* IF NOT LOGGED IN: TABS FOR LOGIN / REGISTER & QUICK DEMO */
          <div className="p-6 space-y-6">
            {/* Quick Demo Citizen Card */}
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs mb-2">
                <Sparkles className="w-4 h-4 text-amber-600 stroke-[2.5]" />
                <span>Masuk Cepat Uji Coba Akun Warga:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INITIAL_MOCK_CITIZENS.slice(0, 2).map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickDemo(demo)}
                    className="p-2.5 rounded-xl bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-100/60 text-left transition-all flex items-center gap-2.5 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {demo.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate group-hover:text-teal-800">
                        {demo.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold truncate">
                        Kec. {demo.kecamatan}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'login'
                    ? 'border-emerald-600 text-emerald-800 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun Warga</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'register'
                    ? 'border-emerald-600 text-emerald-800 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Baru</span>
              </button>
            </div>

            {/* TAB: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleSubmitLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    NIK (16 Digit) / Nomor WhatsApp / Email
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Contoh: 1571011204850001 atau 0812-7489-xxxx"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    Kata Sandi / PIN
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun warga"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Untuk mode prototipe, Anda dapat langsung menekan tombol Masuk.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-600 to-[#0F3B56] hover:from-emerald-400 hover:to-[#0A273A] text-white shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun Warga</span>
                </button>
              </form>
            )}

            {/* TAB: REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleSubmitRegister} className="space-y-3.5">
                {regError && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nama Lengkap (sesuai KTP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Firdaus"
                    className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      NIK (16 Digit) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={regNik}
                      onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="1571xxxxxxxxxxxx"
                      className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-mono text-slate-800 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      No. WhatsApp / HP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Kecamatan Domisili Kota Jambi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regKecamatan}
                      onChange={(e) => setRegKecamatan(e.target.value as KecamatanJambi)}
                      className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                    >
                      {KECAMATAN_LIST.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="warga@email.com"
                      className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Alamat Lengkap / Kelurahan
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Contoh: Jl. Kolonel Abunjani No. 12, Kel. Selamat"
                    className="w-full px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-600 to-[#0F3B56] hover:from-emerald-400 hover:to-[#0A273A] text-white shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Akun Warga</span>
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Data NIK & kependudukan dijamin kerahasiaannya oleh Pemkot Jambi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
