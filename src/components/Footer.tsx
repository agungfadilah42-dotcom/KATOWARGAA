import React from 'react';
import { Phone, MapPin, ExternalLink, ShieldCheck, BarChart2, Building2 } from 'lucide-react';
import { KatoEmblemSvg } from './KatoLogo';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy }) => {
  return (
    <footer className="bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-950 text-emerald-100 border-t-4 border-t-amber-400 text-sm shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="shrink-0">
                <KatoEmblemSvg className="w-10 h-10 drop-shadow-md" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl text-white tracking-tight">
                  <span className="text-emerald-400">K</span>ATO <span className="text-teal-300">WARGA</span>
                </span>
                <span className="text-[10px] text-emerald-300/80 font-bold tracking-tight mt-0.5">
                  Kanal Aspirasi & Tanggapan Online Warga
                </span>
              </div>
            </div>
            <p className="text-xs text-amber-300 font-extrabold tracking-wide">“Suaro Warga, Solusi Bersamo.”</p>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
              Kanal Aspirasi dan Tanggapan Online Warga Kota Jambi — Platform digital inovatif Smart City untuk pelaporan, pemantauan, evaluasi program, dan transparansi SLA dinas teknis.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-200 border border-amber-400/40 rounded-xl px-3 py-1 bg-amber-400/10 font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Jambi Smart City Challenge 2026</span>
            </div>
          </div>

          {/* Column 2: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => onNavigate('beranda')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  Beranda Utama
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('buat-laporan')} className="hover:text-amber-300 transition-colors cursor-pointer text-emerald-300 font-bold">
                  + Buat Laporan Baru
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('kinerja')} className="hover:text-amber-300 transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Papan Kinerja SLA Dinas</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('program')} className="hover:text-amber-300 transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Program Pemerintah Kota</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('peta')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  Peta Spasial Aduan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('lacak')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  Lacak Tiket & Beri Ulasan
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Hotline Layanan Masyarakat */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Kontak Cepat Pemkot</h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/90 font-medium">
              <li className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span>Call Center Darurat: <strong className="text-white font-extrabold bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-300">112 (Bebas Pulsa)</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span>Posko URC PUPR: (0741) 62881</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span>Pengaduan DLH: (0741) 63990</span>
              </li>
              <li className="flex items-start gap-2 pt-0.5">
                <span className="p-1 rounded-md bg-amber-400/20 text-amber-300 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span>Kawasan Perkantoran Pemkot Jambi, Kota Baru, Jambi</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Keterangan Simulasi & Kebijakan */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Transparansi Prototipe</h4>
            <p className="text-xs text-emerald-150 leading-relaxed font-medium">
              Aplikasi ini adalah media demonstrasi inovasi smart governance. Data indikator dihitung dari riwayat penanganan sistem dan penilaian warga secara transparan.
            </p>
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <button
                onClick={onOpenPrivacy}
                className="text-left text-amber-300 hover:text-amber-200 underline underline-offset-2 cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>Kebijakan Privasi & Data Warga</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="text-left text-emerald-300 hover:text-white transition-colors cursor-pointer font-bold inline-flex items-center gap-1.5"
              >
                <span>Portal Masuk Administrator &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-10 pt-6 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200">
          <div>
            &copy; 2026 KATO WARGA. Hak Cipta Dilindungi. Pemerintah Kota Jambi Smart City 2026.
          </div>
          <div className="flex items-center gap-4 text-xs text-amber-300 font-bold">
            <span>Kota Jambi, Provinsi Jambi</span>
            <span>·</span>
            <span>v1.2 (Fitur Lengkap)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
