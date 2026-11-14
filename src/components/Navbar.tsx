import React, { useState } from 'react';
import { Menu, X, PlusCircle, User, ShieldCheck, LogIn, ChevronDown } from 'lucide-react';
import { KatoEmblemSvg } from './KatoLogo';
import { CitizenUser } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminAuthenticated: boolean;
  currentCitizen?: CitizenUser | null;
  onOpenAuthModal: (initialTab?: 'warga' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdminAuthenticated,
  currentCitizen,
  onOpenAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Base public navigation links
  const baseNavLinks = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'peta', label: 'Peta Aduan' },
    { id: 'lacak', label: 'Lacak Laporan' },
    { id: 'kinerja', label: 'Kinerja SLA' },
    { id: 'program', label: 'Program Pemkot' },
    { id: 'tentang', label: 'Tentang Kami' }
  ];

  // If Admin is authenticated, add Dashboard Admin directly to navigation
  const navLinks = isAdminAuthenticated 
    ? [...baseNavLinks, { id: 'admin', label: 'Dashboard Admin' }]
    : baseNavLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-emerald-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Official KATO WARGA Logo */}
          <button
            onClick={() => {
              onNavigate('beranda');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left focus-visible:outline-hidden group whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="shrink-0 transition-transform group-hover:scale-108 duration-200">
              <KatoEmblemSvg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#0F3B56] leading-none">
                  <span className="text-[#16A34A]">K</span>ATO <span className="text-[#00796B]">WARGA</span>
                </span>
                <span className="hidden sm:inline-block bg-amber-100/90 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded-md border border-amber-300">
                  SMART CITY
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-tight leading-tight hidden xs:block">
                Kanal Aspirasi dan Tanggapan Online Warga
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-3.5 lg:gap-5 text-xs lg:text-sm font-semibold text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              const isAdminLink = link.id === 'admin';
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-teal-700 font-extrabold'
                      : isAdminLink
                      ? 'text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200'
                      : 'hover:text-teal-600 text-slate-600'
                  }`}
                >
                  {isAdminLink && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  )}
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Unified Account Portal + Primary Action */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* If Admin is Logged In */}
            {isAdminAuthenticated ? (
              <button
                onClick={() => onOpenAuthModal('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Kelola Sesi Administrator Pemkot"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                <span className="font-extrabold">Admin Pemkot</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-md hidden lg:inline">
                  Verifikator
                </span>
              </button>
            ) : currentCitizen ? (
              /* If Warga is Logged In */
              <button
                onClick={() => onOpenAuthModal('warga')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black text-teal-950 bg-teal-50/90 hover:bg-teal-100 border-2 border-teal-300/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Lihat Profil Akun Warga"
              >
                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden">
                  {currentCitizen.avatarUrl ? (
                    <img src={currentCitizen.avatarUrl} alt={currentCitizen.name} className="w-full h-full object-cover" />
                  ) : (
                    currentCitizen.name.charAt(0)
                  )}
                </div>
                <span className="max-w-[95px] truncate">{currentCitizen.name.split(' ')[0]}</span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.2 rounded-md hidden lg:inline">
                  Warga
                </span>
              </button>
            ) : (
              /* If GUEST (Neither Logged In): Unified Single Login Entry Point */
              <button
                onClick={() => onOpenAuthModal('warga')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Masuk sebagai Warga atau Petugas/Admin Pemkot"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-600" />
                <span>Masuk / Akun</span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate('buat-laporan')}
              className="inline-flex items-center gap-2 px-3.5 lg:px-4 py-2 text-xs lg:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer hover:scale-102"
            >
              <PlusCircle className="w-4 h-4 shrink-0 text-slate-950 stroke-[2.5]" />
              <span>Laporkan Masalah</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-emerald-50 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b-2 border-emerald-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {/* Mobile Unified Account status */}
          <div className="pb-2 border-b border-slate-100">
            {isAdminAuthenticated ? (
              <button
                onClick={() => {
                  onOpenAuthModal('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold"
              >
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="truncate">Sesi Admin Pemkot Aktif</span>
                </div>
                <span className="text-[10px] text-emerald-800 underline font-semibold shrink-0">Kelola</span>
              </button>
            ) : currentCitizen ? (
              <button
                onClick={() => {
                  onOpenAuthModal('warga');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {currentCitizen.name.charAt(0)}
                  </div>
                  <span className="truncate">{currentCitizen.name} (Warga)</span>
                </div>
                <span className="text-[10px] text-teal-700 underline font-semibold shrink-0">Profil</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal('warga');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 text-slate-700 text-xs font-bold"
              >
                <LogIn className="w-4 h-4 text-teal-600" />
                <span>Masuk / Akun (Warga & Admin)</span>
              </button>
            )}
          </div>

          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            const isAdminLink = link.id === 'admin';
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-800 font-bold border-l-4 border-l-teal-500'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                {isAdminLink && (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                )}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                onNavigate('buat-laporan');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Laporkan Masalah</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
