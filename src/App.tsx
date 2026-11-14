import React, { useState, useEffect } from 'react';
import { 
  ReportItem, 
  ReportCategory, 
  ReportStatus, 
  KecamatanJambi, 
  ReportReview, 
  GovernmentProgram, 
  ProgramReview, 
  OfficialReply,
  CitizenUser 
} from './types';
import { 
  getStoredReports, 
  addNewReport, 
  updateReportStatus, 
  getReportByTicket, 
  toggleUpvote, 
  resetToDemoData,
  getReportReviews,
  addReportReview,
  replyToReportReview,
  moderateReportReview,
  getGovernmentPrograms,
  addGovernmentProgram,
  updateGovernmentProgram,
  getProgramReviews,
  addProgramReview,
  replyToProgramReview,
  moderateProgramReview,
  getStoredCitizen,
  clearStoredCitizen
} from './services/storage';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CreateReportView } from './views/CreateReportView';
import { MapReportsView } from './views/MapReportsView';
import { TrackReportView } from './views/TrackReportView';
import { PublicSlaDashboardView } from './views/PublicSlaDashboardView';
import { GovernmentProgramsView } from './views/GovernmentProgramsView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AboutView } from './views/AboutView';
import { ReportDetailModal } from './views/ReportDetailModal';
import { PrivacyModal } from './views/PrivacyModal';
import { CustomerServiceWidget } from './components/CustomerServiceWidget';
import { UnifiedAuthModal, AuthTabType } from './components/UnifiedAuthModal';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('beranda');
  const [preselectedCategory, setPreselectedCategory] = useState<ReportCategory | undefined>(undefined);
  const [trackSearchTicket, setTrackSearchTicket] = useState<string>('');

  // Main Data States
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reviews, setReviews] = useState<ReportReview[]>([]);
  const [programs, setPrograms] = useState<GovernmentProgram[]>([]);
  const [programReviews, setProgramReviews] = useState<ProgramReview[]>([]);

  const [selectedReportForModal, setSelectedReportForModal] = useState<ReportItem | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Citizen (Masyarakat) Auth State
  const [currentCitizen, setCurrentCitizen] = useState<CitizenUser | null>(null);

  // Unified Auth Modal State (Warga & Admin digabung)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTabType>('warga');

  // Open Unified Auth Modal helper
  const handleOpenAuthModal = (tab: AuthTabType = 'warga') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  // Admin Login Handler: Always redirects directly to Admin Dashboard
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin'); // Admin langsung ke dashboard admin
    setIsAuthModalOpen(false);
    showToast('Berhasil masuk ke Dashboard Admin Pemkot Jambi.');
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    if (currentView === 'admin') {
      setCurrentView('beranda');
    }
    setIsAuthModalOpen(false);
    showToast('Sesi administrator telah diakhiri.');
  };

  // Citizen (Masyarakat) Login Handler: Citizen stays on public/citizen view
  const handleCitizenLogin = (citizen: CitizenUser) => {
    setCurrentCitizen(citizen);
    setIsAuthModalOpen(false);
    // Warga tetap di halaman saat ini ("kalo warga tetap warga")
    showToast(`Selamat datang, ${citizen.name}! Masuk sebagai warga Kota Jambi.`);
  };

  // Citizen Logout Handler
  const handleCitizenLogout = () => {
    setCurrentCitizen(null);
    clearStoredCitizen();
    showToast('Anda telah keluar dari akun warga.');
  };

  // Load Initial Data on Mount
  useEffect(() => {
    setReports(getStoredReports());
    setReviews(getReportReviews());
    setPrograms(getGovernmentPrograms());
    setProgramReviews(getProgramReviews());
    setCurrentCitizen(getStoredCitizen());
  }, []);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Navigation Handler
  const handleNavigate = (view: string, extra?: { category?: ReportCategory; ticket?: string }) => {
    setCurrentView(view);
    if (extra?.category) {
      setPreselectedCategory(extra.category);
    }
    if (extra?.ticket) {
      setTrackSearchTicket(extra.ticket);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit New Report Handler
  const handleAddNewReport = (data: {
    title: string;
    category: ReportCategory;
    description: string;
    kecamatan: KecamatanJambi;
    addressDetails: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    isAnonymous: boolean;
    reporterName?: string;
    status: 'menunggu_verifikasi';
  }) => {
    const created = addNewReport(data);
    const updated = getStoredReports();
    setReports(updated);
    showToast(`Laporan berhasil dikirim dengan Nomor Tiket ${created.ticketNumber}!`);
    return created;
  };

  // Update Report Status Handler (Admin)
  const handleUpdateReportStatus = (
    ticketNumber: string,
    newStatus: ReportStatus,
    officerNotes: string,
    officerName: string
  ) => {
    const updated = updateReportStatus(ticketNumber, newStatus, officerNotes, officerName);
    if (updated) {
      const refreshed = getStoredReports();
      setReports(refreshed);
      showToast(`Status tiket ${ticketNumber} berhasil diperbarui.`);
      if (selectedReportForModal?.ticketNumber === ticketNumber) {
        setSelectedReportForModal(updated);
      }
    }
  };

  // Upvote Handler
  const handleUpvote = (id: string) => {
    toggleUpvote(id);
    const refreshed = getStoredReports();
    setReports(refreshed);
    if (selectedReportForModal?.id === id) {
      const updatedItem = refreshed.find(r => r.id === id);
      if (updatedItem) setSelectedReportForModal(updatedItem);
    }
    showToast('Dukungan aspirasi Anda berhasil dicatat.');
  };

  // -----------------------------------------------------------
  // FITUR 1: COMPLAINT REVIEW HANDLERS
  // -----------------------------------------------------------
  const handleAddReportReview = (data: { rating: number; comment: string; reviewerName: string }) => {
    if (!selectedReportForModal && !trackSearchTicket) return;
    const targetReport = selectedReportForModal || getReportByTicket(trackSearchTicket);
    if (!targetReport) return;

    const result = addReportReview({
      reportId: targetReport.id,
      ticketNumber: targetReport.ticketNumber,
      rating: data.rating,
      comment: data.comment,
      reviewerName: data.reviewerName
    });

    if (result.success) {
      setReviews(getReportReviews());
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  const handleReplyComplaintReview = (reviewId: string, reply: OfficialReply) => {
    const success = replyToReportReview(reviewId, reply);
    if (success) {
      setReviews(getReportReviews());
      showToast('Tanggapan resmi dinas berhasil dikirim dan dipublikasikan.');
    }
  };

  const handleModerateComplaintReview = (reviewId: string, isModerated: boolean, reason?: string) => {
    const success = moderateReportReview(reviewId, isModerated, reason);
    if (success) {
      setReviews(getReportReviews());
      showToast(isModerated ? 'Ulasan telah ditandai moderasi.' : 'Ulasan telah dipulihkan.');
    }
  };

  // -----------------------------------------------------------
  // FITUR 3: GOVERNMENT PROGRAM HANDLERS
  // -----------------------------------------------------------
  const handleAddGovernmentProgram = (data: Omit<GovernmentProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = addGovernmentProgram(data);
    setPrograms(getGovernmentPrograms());
    showToast(`Program "${created.title}" berhasil dipublikasikan.`);
  };

  const handleUpdateGovernmentProgram = (id: string, updates: Partial<GovernmentProgram>) => {
    const updated = updateGovernmentProgram(id, updates);
    if (updated) {
      setPrograms(getGovernmentPrograms());
      showToast('Informasi program berhasil diperbarui.');
    }
  };

  const handleAddProgramReview = (data: Omit<ProgramReview, 'id' | 'createdAt'>) => {
    addProgramReview(data);
    setProgramReviews(getProgramReviews());
    showToast('Evaluasi dan masukan Anda terhadap program berhasil dikirim!');
  };

  const handleReplyProgramReview = (reviewId: string, reply: OfficialReply) => {
    const success = replyToProgramReview(reviewId, reply);
    if (success) {
      setProgramReviews(getProgramReviews());
      showToast('Tanggapan resmi dinas terhadap evaluasi warga berhasil dikirim.');
    }
  };

  const handleModerateProgramReview = (reviewId: string, isModerated: boolean, reason?: string) => {
    const success = moderateProgramReview(reviewId, isModerated, reason);
    if (success) {
      setProgramReviews(getProgramReviews());
      showToast(isModerated ? 'Evaluasi warga dimoderasi.' : 'Evaluasi warga dipulihkan.');
    }
  };

  // Reset Demo Data Handler
  const handleResetDemoData = () => {
    const reset = resetToDemoData();
    setReports(reset.reports);
    setReviews(reset.reviews);
    setPrograms(reset.programs);
    setProgramReviews(reset.programReviews);
    setCurrentCitizen(null);
    showToast('Seluruh data demo berhasil di-reset ke kondisi awal.');
  };

  // Extract recent ticket numbers for suggestions
  const recentTicketNumbers = reports.slice(0, 5).map(r => r.ticketNumber);

  // Filter reports submitted by current citizen if logged in
  const myCitizenReports = currentCitizen 
    ? reports.filter(r => 
        (r.reporterName && r.reporterName.toLowerCase().includes(currentCitizen.name.toLowerCase())) ||
        (r.reporterPhone && r.reporterPhone.replace(/\D/g, '') === currentCitizen.phone.replace(/\D/g, ''))
      ) 
    : [];

  // Review for active modal
  const selectedReportReview = selectedReportForModal
    ? reviews.find(r => r.ticketNumber.toUpperCase() === selectedReportForModal.ticketNumber.toUpperCase()) || null
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-amber-50/30 text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-teal-500/30 border border-emerald-300/60 text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-xs" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminAuthenticated={isAdminAuthenticated}
        currentCitizen={currentCitizen}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'beranda' && (
          <HomeView
            reports={reports}
            onNavigate={handleNavigate}
            onSelectReport={(report) => setSelectedReportForModal(report)}
          />
        )}

        {currentView === 'buat-laporan' && (
          <CreateReportView
            initialCategory={preselectedCategory}
            reports={reports}
            currentCitizen={currentCitizen}
            onOpenCitizenLogin={() => handleOpenAuthModal('warga')}
            onSubmitReport={handleAddNewReport}
            onNavigateToTrack={(t) => handleNavigate('lacak', { ticket: t })}
            onNavigateToMap={() => handleNavigate('peta')}
            onUpvoteReport={handleUpvote}
          />
        )}

        {currentView === 'peta' && (
          <MapReportsView
            reports={reports}
            initialCategory={preselectedCategory}
            onSelectReport={(report) => setSelectedReportForModal(report)}
            onNavigateToCreate={() => handleNavigate('buat-laporan')}
          />
        )}

        {currentView === 'lacak' && (
          <TrackReportView
            initialTicket={trackSearchTicket}
            reviews={reviews}
            isAdmin={isAdminAuthenticated}
            currentCitizen={currentCitizen}
            myReports={myCitizenReports}
            onSearchTicket={(t) => getReportByTicket(t)}
            onNavigateToCreate={() => handleNavigate('buat-laporan')}
            recentTickets={recentTicketNumbers}
            onAddReview={(d) => {
              const targetReport = getReportByTicket(trackSearchTicket);
              if (targetReport) {
                const res = addReportReview({
                  reportId: targetReport.id,
                  ticketNumber: targetReport.ticketNumber,
                  rating: d.rating,
                  comment: d.comment,
                  reviewerName: d.reviewerName
                });
                if (res.success) {
                  setReviews(getReportReviews());
                  showToast(res.message);
                } else {
                  showToast(res.message);
                }
              }
            }}
            onReplyReview={handleReplyComplaintReview}
            onModerateReview={handleModerateComplaintReview}
          />
        )}

        {/* FITUR 2: PUBLIC SLA DASHBOARD */}
        {currentView === 'kinerja' && (
          <PublicSlaDashboardView
            reports={reports}
            reviews={reviews}
            onSelectReport={(report) => setSelectedReportForModal(report)}
            onNavigateToTrack={() => handleNavigate('lacak')}
          />
        )}

        {/* FITUR 3: PROGRAM PEMERINTAH & EVALUASI WARGA */}
        {currentView === 'program' && (
          <GovernmentProgramsView
            programs={programs}
            reviews={programReviews}
            isAdmin={isAdminAuthenticated}
            onAddProgram={handleAddGovernmentProgram}
            onAddReview={handleAddProgramReview}
            onReplyReview={handleReplyProgramReview}
            onModerateReview={handleModerateProgramReview}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            reports={reports}
            reviews={reviews}
            programs={programs}
            programReviews={programReviews}
            isAuthenticated={isAdminAuthenticated}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            onUpdateStatus={handleUpdateReportStatus}
            onResetData={handleResetDemoData}
            onSelectReport={(report) => setSelectedReportForModal(report)}
            onReplyComplaintReview={handleReplyComplaintReview}
            onModerateComplaintReview={handleModerateComplaintReview}
            onAddProgram={handleAddGovernmentProgram}
            onUpdateProgram={handleUpdateGovernmentProgram}
            onReplyProgramReview={handleReplyProgramReview}
            onModerateProgramReview={handleModerateProgramReview}
          />
        )}

        {currentView === 'tentang' && (
          <AboutView
            onNavigateToCreate={() => handleNavigate('buat-laporan')}
          />
        )}
      </main>

      {/* Detail Modal with Complaint Review Integration */}
      <ReportDetailModal
        report={selectedReportForModal}
        review={selectedReportReview}
        isAdmin={isAdminAuthenticated}
        onClose={() => setSelectedReportForModal(null)}
        onUpvote={handleUpvote}
        onTrackTicket={(ticket) => handleNavigate('lacak', { ticket })}
        onAddReview={handleAddReportReview}
        onReplyReview={handleReplyComplaintReview}
        onModerateReview={handleModerateComplaintReview}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Unified Authentication & Account Modal (Warga & Admin digabung) */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        currentCitizen={currentCitizen}
        isAdminAuthenticated={isAdminAuthenticated}
        onCitizenLogin={handleCitizenLogin}
        onCitizenLogout={handleCitizenLogout}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
        onOpenMyReports={() => handleNavigate('lacak')}
        onNavigateToAdminDashboard={() => handleNavigate('admin')}
        showToast={showToast}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* FITUR 2 & MODUL CS: Customer Service Widget (AI Assistant & Live Chat) */}
      <CustomerServiceWidget
        reports={reports}
        programs={programs}
        onNavigateToTrack={(ticket) => handleNavigate('lacak', { ticket })}
        onNavigateToPrograms={() => handleNavigate('program')}
        onNavigateToCreate={() => handleNavigate('buat-laporan')}
      />
    </div>
  );
}
