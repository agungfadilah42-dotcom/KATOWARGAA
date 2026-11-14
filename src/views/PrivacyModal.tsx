import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-[#00796B]/20 overflow-hidden my-8 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#00796B]/15 bg-[#E6F4EA]">
          <div className="flex items-center gap-2 text-teal-950">
            <ShieldCheck className="w-5 h-5 text-[#00796B] stroke-[2.5]" />
            <h3 className="font-black text-base text-slate-900">Kebijakan Privasi & Perlindungan Data Warga</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 leading-relaxed font-medium">
          <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 text-teal-950">
            <strong className="font-black text-teal-950">Komitmen KATO WARGA:</strong> Platform ini dirancang untuk memastikan setiap suara masyarakat Kota Jambi didengar tanpa mengorbankan privasi, keamanan data pribadi, dan rasa aman pelapor.
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-black">
              <EyeOff className="w-4 h-4 text-[#00796B] stroke-[2.5]" />
              <span>1. Hak Pelaporan Anonim</span>
            </div>
            <p className="text-slate-600">
              Masyarakat memiliki opsi penuh untuk mengirimkan laporan secara anonim. Jika opsi anonim dipilih, nama atau identitas pelapor tidak akan disimpan dalam rekaman publik maupun antarmuka penelusuran tiket.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-black">
              <Lock className="w-4 h-4 text-[#00796B] stroke-[2.5]" />
              <span>2. Perlindungan Kontak dan Data Sensitif</span>
            </div>
            <p className="text-slate-600">
              Nomor telepon, email, atau rincian identitas tidak pernah dipublikasikan di halaman umum atau peta aduan. Hanya verifikator berwenang di lingkungan Pemkot Jambi yang dapat mengakses kontak verifikasi jika dibutuhkan konfirmasi mendesak.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-black">
              <FileText className="w-4 h-4 text-[#00796B] stroke-[2.5]" />
              <span>3. Pemanfaatan Data Lokasi dan Foto</span>
            </div>
            <p className="text-slate-600">
              Data koordinat dan foto fasilitas umum yang dilaporkan digunakan semata-mata untuk penanganan perbaikan fisik oleh dinas terkait (Dinas PUPR, DLH, Dishub) serta analisis titik rawan pada inisiatif Smart City Kota Jambi.
            </p>
          </div>

          <div className="pt-2 text-slate-500 border-t border-slate-100 text-[11px] font-semibold">
            Diperbarui untuk Jambi Smart City Application Challenge 2026. Standar kepatuhan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#00796B]/15 bg-[#E6F4EA]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black text-white bg-[#00796B] hover:bg-[#005B54] rounded-full transition-all cursor-pointer shadow-md hover:scale-102"
          >
            Saya Memahami
          </button>
        </div>
      </div>
    </div>
  );
};
