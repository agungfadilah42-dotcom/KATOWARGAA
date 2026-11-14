import React, { useState } from 'react';
import { ReportItem, ReportReview, OfficialReply } from '../types';
import { StarRating } from './StarRating';
import { 
  Star, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  CornerDownRight, 
  Edit3, 
  EyeOff, 
  Clock, 
  Building2 
} from 'lucide-react';

interface ComplaintReviewSectionProps {
  report: ReportItem;
  review: ReportReview | null;
  isAdmin?: boolean;
  onAddReview: (data: { rating: number; comment: string; reviewerName: string }) => void;
  onReplyReview?: (reviewId: string, reply: OfficialReply) => void;
  onModerateReview?: (reviewId: string, isModerated: boolean, reason?: string) => void;
}

export const ComplaintReviewSection: React.FC<ComplaintReviewSectionProps> = ({
  report,
  review,
  isAdmin = false,
  onAddReview,
  onReplyReview,
  onModerateReview
}) => {
  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>(
    report.isAnonymous ? '' : (report.reporterName || '')
  );
  const [isLegitimateReporter, setIsLegitimateReporter] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Official reply form state (for admin/dinas)
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [responderName, setResponderName] = useState<string>('Pejabat Pengelola Aduan Dinas');
  const [responderDinas, setResponderDinas] = useState<string>(
    report.assignedDinas || 'Dinas Teknis Pemkot Jambi'
  );

  // Moderation state (for admin)
  const [isModeratingModal, setIsModeratingModal] = useState<boolean>(false);
  const [moderationReason, setModerationReason] = useState<string>(
    'Memuat kata tidak pantas / spam yang melanggar norma komunikasi publik.'
  );

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (report.status !== 'selesai') {
      setFormError('Penilaian hanya dapat diberikan setelah pengaduan selesai ditangani.');
      return;
    }

    if (!reviewerName.trim()) {
      setFormError('Silakan masukkan nama Anda sebagai pelapor.');
      return;
    }

    if (!isLegitimateReporter) {
      setFormError('Harap centang konfirmasi bahwa Anda adalah pelapor sah dari tiket ini.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setFormError('Harap tuliskan ulasan singkat mengenai hasil penanganan petugas (minimal 5 karakter).');
      return;
    }

    onAddReview({
      rating,
      comment: comment.trim(),
      reviewerName: reviewerName.trim()
    });

    setComment('');
  };

  const handleSendOfficialReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review || !onReplyReview) return;
    if (!replyMessage.trim()) return;

    onReplyReview(review.id, {
      responderName: responderName.trim(),
      responderDinas: responderDinas.trim(),
      message: replyMessage.trim(),
      repliedAt: new Date().toISOString()
    });

    setIsReplying(false);
    setReplyMessage('');
  };

  const handleConfirmModeration = (shouldModerate: boolean) => {
    if (!review || !onModerateReview) return;
    onModerateReview(
      review.id,
      shouldModerate,
      shouldModerate ? moderationReason : undefined
    );
    setIsModeratingModal(false);
  };

  const isCompleted = report.status === 'selesai';

  return (
    <div className="bg-gradient-to-br from-amber-50/50 via-white to-teal-50/40 rounded-3xl border-2 border-emerald-200/90 p-5 sm:p-6 shadow-md space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shadow-2xs">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Rating & Ulasan Penanganan Pengaduan
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Evaluasi transparansi pelayanan publik warga terhadap kinerja dinas teknis.
            </p>
          </div>
        </div>

        {review && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            <span className="text-xs font-black text-amber-900">Rating:</span>
            <StarRating value={review.rating} readOnly size="sm" />
            <span className="font-mono text-xs font-black text-amber-950">({review.rating}/5)</span>
          </div>
        )}
      </div>

      {/* Case 1: Status NOT finished yet */}
      {!isCompleted && !review && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 text-xs text-slate-600">
          <Clock className="w-5 h-5 text-teal-600 shrink-0 stroke-[2.5]" />
          <div>
            <span className="font-bold text-slate-800 block">Tiket Masih Dalam Proses Penanganan</span>
            <span className="text-[11px] text-slate-500">
              Form pemberian rating bintang 1–5 dan ulasan akan terbuka secara otomatis setelah petugas dinas menyelesaikan perbaikan (Status: Selesai).
            </span>
          </div>
        </div>
      )}

      {/* Case 2: Status Finished and Review already submitted */}
      {review && (
        <div className="space-y-4">
          {/* Moderation Banner if flagged */}
          {review.isModerated && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 text-rose-800 font-black">
                <AlertTriangle className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                <span>Ulasan Ini Sedang Dimoderasi</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Alasan: {review.moderationReason || 'Konten ditinjau ulang oleh tim pengawas layanan.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleConfirmModeration(false)}
                  className="mt-1 px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg border border-rose-300 cursor-pointer"
                >
                  Pulihkan Tampilan Ulasan
                </button>
              )}
            </div>
          )}

          {/* Citizen Review Bubble */}
          {(!review.isModerated || isAdmin) && (
            <div className="p-4.5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-2xs">
                    {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block leading-tight">
                      {review.reviewerName}
                    </span>
                    <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      Pelapor Terverifikasi
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <StarRating value={review.rating} readOnly size="sm" />
                  <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-amber-50/30 p-3 rounded-xl border border-amber-100">
                “{review.comment}”
              </p>

              {/* Admin Moderation Button */}
              {isAdmin && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  {!review.officialReply && !isReplying && (
                    <button
                      onClick={() => setIsReplying(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Beri Tanggapan Resmi Dinas</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsModeratingModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>{review.isModerated ? 'Ubah Moderasi' : 'Moderasi Ulasan'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Official Agency Reply Card */}
          {review.officialReply && (
            <div className="ml-4 sm:ml-8 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/70 to-sky-50 border-2 border-teal-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-700 shrink-0 stroke-[2.5]" />
                  <div>
                    <span className="text-xs font-black text-teal-950 block">
                      Tanggapan Resmi {review.officialReply.responderDinas}
                    </span>
                    <span className="text-[10px] text-teal-800 font-bold">
                      Oleh: {review.officialReply.responderName}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-teal-700 font-medium">
                  {new Date(review.officialReply.repliedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-teal-900 font-semibold leading-relaxed pl-6 border-l-2 border-teal-300">
                {review.officialReply.message}
              </p>
            </div>
          )}

          {/* Inline Reply Form for Admin */}
          {isReplying && (
            <form onSubmit={handleSendOfficialReply} className="ml-4 sm:ml-8 p-4 bg-teal-50/80 border-2 border-teal-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-teal-950">
                <span>Formulir Tanggapan Resmi Kedinasan</span>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nama Pejabat / Petugas</label>
                  <input
                    type="text"
                    value={responderName}
                    onChange={(e) => setResponderName(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Instansi Penanggung Jawab</label>
                  <input
                    type="text"
                    value={responderDinas}
                    onChange={(e) => setResponderDinas(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Pesan Tanggapan Resmi</label>
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tuliskan ucapan terima kasih atau klarifikasi resmi dinas terkait..."
                  className="w-full bg-white border border-teal-200 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer hover:scale-102"
                >
                  Kirim Tanggapan Resmi
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Case 3: Status Selesai and NO review yet -> Show Citizen Form */}
      {isCompleted && !review && (
        <form onSubmit={handleSubmitReview} className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-emerald-300 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-black text-teal-900 block mb-1">
              Beri Penilaian Anda Terhadap Hasil Penanganan Tiket Ini
            </span>
            <p className="text-[11px] text-slate-600 font-medium">
              Sesuai ketentuan, hanya pelapor yang berhak memberikan satu ulasan aktif untuk setiap tiket yang telah selesai.
            </p>
          </div>

          {/* Star Input */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">Tingkat Kepuasan Pelayanan:</span>
            <StarRating
              value={rating}
              onChange={(v) => setRating(v)}
              size="lg"
              showLabel={true}
            />
          </div>

          {/* Reporter verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                Nama Lengkap Pelapor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:border-teal-500"
              />
            </div>

            <div className="flex items-center pt-2 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-bold">
                <input
                  type="checkbox"
                  checked={isLegitimateReporter}
                  onChange={(e) => setIsLegitimateReporter(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Saya adalah pelapor sah tiket {report.ticketNumber}</span>
              </label>
            </div>
          </div>

          {/* Comment text */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 mb-1">
              Ulasan & Masukan Penanganan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan apakah perbaikan sudah tuntas, kecepatan tim lapangan, dan kualitas hasilnya..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:bg-white focus:border-teal-500"
            />
          </div>

          {formError && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
            </p>
          )}

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              *Ulasan akan tercatat secara permanen pada papan transparansi dinas.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Kirim Penilaian & Ulasan</span>
            </button>
          </div>
        </form>
      )}

      {/* Moderation Modal for Admin */}
      {isModeratingModal && review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-rose-300 p-6 max-w-md w-full space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-rose-600" />
              <span>Moderasi Ulasan Warga</span>
            </h4>
            <p className="text-xs text-slate-600">
              Moderasi digunakan jika ulasan mengandung ujaran kebencian, kata kasar, atau spam. Kritik yang sah terhadap kinerja dinas tetap diperbolehkan.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Alasan Penandaan Moderasi
              </label>
              <textarea
                rows={3}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModeratingModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleConfirmModeration(true)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Terapkan Moderasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
