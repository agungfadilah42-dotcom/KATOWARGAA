import React, { useState } from 'react';
import { ReportItem, ReportReview, OfficialReply } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CATEGORIES } from '../data/categories';
import { ComplaintReviewSection } from '../components/ComplaintReviewSection';
import { X, MapPin, Calendar, User, ThumbsUp, CheckCircle, ArrowRight, ShieldAlert, Share2, Check, Building2 } from 'lucide-react';

interface ReportDetailModalProps {
  report: ReportItem | null;
  review?: ReportReview | null;
  isAdmin?: boolean;
  onClose: () => void;
  onUpvote?: (id: string) => void;
  onTrackTicket?: (ticket: string) => void;
  onAddReview?: (data: { rating: number; comment: string; reviewerName: string }) => void;
  onReplyReview?: (reviewId: string, reply: OfficialReply) => void;
  onModerateReview?: (reviewId: string, isModerated: boolean, reason?: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  review = null,
  isAdmin = false,
  onClose,
  onUpvote,
  onTrackTicket,
  onAddReview,
  onReplyReview,
  onModerateReview
}) => {
  const [copied, setCopied] = useState(false);
  if (!report) return null;

  const categoryInfo = CATEGORIES.find(c => c.id === report.category);

  const formattedDate = new Date(report.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `KATO WARGA - Tiket ${report.ticketNumber}: ${report.title} (${report.kecamatan})`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b-2 border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-amber-50/40">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-xs text-teal-950 bg-teal-100/90 px-3 py-1 rounded-xl border border-teal-300 shadow-2xs">
              {report.ticketNumber}
            </span>
            <StatusBadge status={report.status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                copied
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'text-teal-800 hover:text-teal-950 hover:bg-white border border-transparent hover:border-emerald-200'
              }`}
              title="Salin info tiket"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span className="text-[11px] font-bold">Tersalin!</span>
                </>
              ) : (
                <Share2 className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              aria-label="Tutup detail"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Title & Category & Dinas */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-black text-teal-800 uppercase tracking-wider">
                {categoryInfo?.name || report.category}
              </span>
              {report.assignedDinas && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-teal-600" />
                    {report.assignedDinas}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {report.title}
            </h3>
          </div>

          {/* Photo if present */}
          {report.imageUrl && (
            <div className="rounded-2xl overflow-hidden border-2 border-emerald-200/80 bg-slate-100 max-h-72 shadow-inner">
              <img
                src={report.imageUrl}
                alt={report.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-4.5 border-2 border-slate-200/80">
            <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider mb-2">
              Deskripsi Masalah
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {report.description}
            </p>
          </div>

          {/* Location & Metadata Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl border-2 border-emerald-200/70 bg-emerald-50/40">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <span className="font-black text-teal-950 block mb-0.5">Wilayah & Lokasi</span>
                <span className="text-slate-700 font-medium block">{report.addressDetails}</span>
                <span className="text-teal-800 font-black block mt-1">Kecamatan {report.kecamatan}</span>
                <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                  ({report.latitude.toFixed(5)}, {report.longitude.toFixed(5)})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl border-2 border-amber-200/70 bg-amber-50/40">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <span className="font-black text-amber-950 block mb-0.5">Waktu & Pelapor</span>
                <span className="text-slate-700 font-medium block">{formattedDate}</span>
                <div className="flex items-center gap-1.5 mt-1 text-slate-800 font-bold">
                  <User className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                  <span>
                    {report.isAnonymous ? 'Warga Anonim (Identitas Dirahasiakan)' : (report.reporterName || 'Warga Jambi')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Officer Notes if available */}
          {report.officerNotes && (
            <div className="p-4.5 rounded-2xl border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-emerald-50/70">
              <div className="flex items-center gap-2 mb-1.5 text-teal-950 font-black text-xs">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 stroke-[2.5]" />
                <span>Tindak Lanjut Petugas Pemerintah Kota Jambi</span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed font-semibold">
                {report.officerNotes}
              </p>
            </div>
          )}

          {/* History Timeline */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Riwayat Penanganan
            </h4>
            <div className="space-y-3 relative pl-4 border-l-2 border-teal-300 ml-2">
              {report.history.map((h, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white shadow-xs" />
                  <div className="text-xs text-slate-600">
                    {new Date(h.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} · <strong className="text-teal-950 font-black">{h.actor}</strong>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">{h.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FITUR 1: COMPLAINT REVIEW SECTION */}
          {onAddReview && (
            <div className="pt-2">
              <ComplaintReviewSection
                report={report}
                review={review || null}
                isAdmin={isAdmin}
                onAddReview={onAddReview}
                onReplyReview={onReplyReview}
                onModerateReview={onModerateReview}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 border-t-2 border-emerald-100 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpvote && onUpvote(report.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-950 bg-white hover:bg-teal-50 border-2 border-teal-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
              <span>Dukung Laporan ({report.upvotes || 0})</span>
            </button>
            <span className="text-[11px] text-slate-500 font-semibold">· Data simulasi tervalidasi</span>
          </div>

          <div className="flex items-center gap-2">
            {onTrackTicket && (
              <button
                onClick={() => {
                  onClose();
                  onTrackTicket(report.ticketNumber);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 hover:from-emerald-300 hover:to-amber-200 rounded-xl transition-all cursor-pointer shadow-md shadow-teal-500/20 hover:scale-102"
              >
                <span>Lihat di Pelacak Tiket</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border-2 border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
