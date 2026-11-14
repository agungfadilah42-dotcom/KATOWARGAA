import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Leaf, 
  Home, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight,
  Workflow,
  Sparkles,
  Award
} from 'lucide-react';
import { KatoLogo, KatoEmblemSvg } from '../components/KatoLogo';

interface AboutViewProps {
  onNavigateToCreate: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateToCreate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero Header with Official Brand Identity */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-stone-800 border border-black/[0.06] text-xs font-bold tracking-wide shadow-2xs">
          <Award className="w-4 h-4 text-amber-500 stroke-[2.2]" />
          <span>Inovasi Jambi Smart City Application Challenge 2026</span>
        </div>

        {/* Official Vector Logo Component */}
        <div className="flex justify-center py-2">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.03)] inline-block">
            <KatoLogo variant="full" size="lg" className="justify-center" />
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium max-w-2xl mx-auto">
          Kanal Aspirasi dan Tanggapan Online Jambi — Menjembatani aspirasi masyarakat dan tata kelola pemerintah demi Kota Jambi yang lebih nyaman, aman, dan berdaya saing tinggi.
        </p>
      </div>

      {/* Showcase Image Banner */}
      <div className="rounded-[32px] overflow-hidden border border-black/[0.06] shadow-md relative bg-slate-950">
        <img
          src="/images/smart_governance_civic_1792244147893.jpg"
          alt="Operasional Smart City Command Center"
          className="w-full h-72 sm:h-96 object-cover opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex items-end p-6 sm:p-8">
          <div className="text-white max-w-xl">
            <span className="text-xs uppercase tracking-wider text-[#C8F135] font-black block mb-1">
              Kolaborasi Publik & Pemerintah
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              Respons Cepat Berbasis Data Spasial Real-Time
            </h2>
            <p className="text-xs text-stone-300 mt-1 font-medium">
              Setiap laporan warga diverifikasi dan dipetakan secara akurat untuk memandu prioritas penanganan dinas teknis di lapangan.
            </p>
          </div>
        </div>
      </div>

      {/* Latar Belakang & Tujuan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
          <div className="w-11 h-11 rounded-full bg-[#00796B] text-white flex items-center justify-center font-black text-sm shadow-sm">
            01
          </div>
          <h2 className="text-lg font-black text-stone-900">
            Latar Belakang Permasalahan
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed font-semibold">
            Sebagai ibu kota provinsi yang terus tumbuh, Kota Jambi memiliki bentang jalan dan fasilitas publik yang luas. Seringkali kerusakan aspal, PJU padam, atau drainase tersumbat membutuhkan waktu lama terdeteksi karena kanal pengaduan warga sebelumnya masih tercecer di media sosial atau grup obrolan informal tanpa pelacakan nomor tiket yang pasti.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
          <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-sm shadow-sm">
            02
          </div>
          <h2 className="text-lg font-black text-stone-900">
            Visi dan Tujuan Platform
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed font-semibold">
            KATO WARGA hadir sebagai portal terpusat, transparan, dan terstruktur. Tujuannya adalah mempercepat waktu tanggap penanganan (Response Time), menjamin hak masyarakat untuk mengetahui nasib aduannya secara live, serta menyajikan basis data spasial titik rawan fasilitas untuk perencanaan anggaran kota yang lebih tepat sasaran.
          </p>
        </div>
      </div>

      {/* 4 Dimensi Smart City yang Didukung */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-black text-teal-800 uppercase tracking-wider bg-teal-100/80 px-3 py-1 rounded-full border border-teal-300">
            Pilar Transformasi Digital
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            4 Dimensi Smart City yang Didukung
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Dimension 1 */}
          <div className="bg-white p-6 rounded-[26px] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">Smart Governance</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Penyederhanaan birokrasi disposisi laporan antar-OPD secara terintegrasi, transparan, dan terukur melalui nomor tiket.
            </p>
          </div>

          {/* Dimension 2 */}
          <div className="bg-white p-6 rounded-[26px] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Home className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">Smart Living</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Mewujudkan kenyamanan dan keselamatan warga melalui jalan yang mulus, penerangan jalan umum yang terang, dan fasilitas ramah anak.
            </p>
          </div>

          {/* Dimension 3 */}
          <div className="bg-white p-6 rounded-[26px] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">Smart Environment</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Penanganan cepat tumpukan sampah liar, normalisasi drainase pencegah banjir genangan, dan pelestarian taman ruang terbuka hijau.
            </p>
          </div>

          {/* Dimension 4 */}
          <div className="bg-white p-6 rounded-[26px] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">Smart Society</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Menumbuhkan budaya gotong royong digital warga Jambi untuk aktif peduli dan berpartisipasi menjaga fasilitas lingkungan bersama.
            </p>
          </div>
        </div>
      </div>

      {/* Rencana Pengembangan & Kolaborasi OPD */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-teal-700 stroke-[2.2]" />
          <span>Rencana Integrasi dan Kolaborasi Lintas Sektor</span>
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed font-semibold">
          Pada fase implementasi tingkat produksi berikutnya, KATO WARGA dirancang untuk terhubung dengan:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-black/[0.03]">
            <strong className="text-stone-900 font-black block mb-1">Diskominfo Kota Jambi</strong>
            <span className="text-stone-600 font-medium">Pusat integrasi server Smart City dan verifikasi data pelapor.</span>
          </div>

          <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-black/[0.03]">
            <strong className="text-stone-900 font-black block mb-1">Dinas PUPR & Dishub</strong>
            <span className="text-stone-600 font-medium">Penerima disposisi perbaikan jalan aspal, jembatan, dan lampu jalan.</span>
          </div>

          <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-black/[0.03]">
            <strong className="text-stone-900 font-black block mb-1">DLH & Satpol PP</strong>
            <span className="text-stone-600 font-medium">Pengangkutan sampah liar, penataan taman kota, dan penegakan ketertiban umum.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 font-medium italic">
          *Catatan Transparansi: Efektivitas penanganan teknis fisik bergantung pada integrasi resmi dengan Organisasi Perangkat Daerah (OPD) terkait dan ketersediaan anggaran perbaikan lapangan.
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onNavigateToCreate}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00796B] hover:bg-[#005B54] text-white rounded-full text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer hover:scale-102"
        >
          <span>Mulai Buat Laporan Pengaduan</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
