import { 
  ReportItem, 
  ReportStatus, 
  ReportReview, 
  GovernmentProgram, 
  ProgramReview, 
  OfficialReply, 
  DinasSlaMetrics,
  Conversation,
  ChatMessage,
  ConversationStatus,
  CitizenUser,
  KecamatanJambi
} from '../types';
import { INITIAL_MOCK_REPORTS } from '../data/mockReports';
import { INITIAL_MOCK_REVIEWS } from '../data/mockReviews';
import { INITIAL_MOCK_PROGRAMS, INITIAL_MOCK_PROGRAM_REVIEWS } from '../data/mockPrograms';
import { DINAS_LIST, getDinasForCategory } from '../data/dinasData';

const STORAGE_KEY_REPORTS = 'kato_jambi_reports_v1';
const COUNTER_KEY = 'kato_jambi_ticket_counter_v1';
const STORAGE_KEY_REVIEWS = 'kato_jambi_reviews_v1';
const STORAGE_KEY_PROGRAMS = 'kato_jambi_programs_v1';
const STORAGE_KEY_PROGRAM_REVIEWS = 'kato_jambi_prog_reviews_v1';
const STORAGE_KEY_UPVOTES = 'kato_jambi_user_upvotes_v1';
const STORAGE_KEY_CONVERSATIONS = 'kato_jambi_cs_conversations_v1';
const STORAGE_KEY_ACTIVE_CONV = 'kato_jambi_active_conv_id_v1';
const STORAGE_KEY_ACTIVE_CITIZEN = 'kato_jambi_active_citizen_v1';
const STORAGE_KEY_CITIZENS_LIST = 'kato_jambi_citizens_list_v1';

// Initial Seed Conversations for CS Dashboard
export const INITIAL_MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    userId: 'user-warga-01',
    userName: 'Ahmad Faisal (Warga Telanaipura)',
    userPhone: '0812-7489-xxxx',
    status: 'menunggu_petugas',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    waitingSince: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    topic: 'Jadwal Pengerukan Normalisasi Drainase Telanaipura',
    unreadCountForUser: 0,
    unreadCountForOfficer: 1,
    messages: [
      {
        id: 'msg-101',
        sender: 'user',
        senderName: 'Ahmad Faisal',
        message: 'Halo, saya ingin menanyakan jadwal tim pengeruk lumpur drainase di sekitar Jl. Arif Rahman Hakim Telanaipura.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-102',
        sender: 'ai',
        senderName: 'Asisten AI KATO WARGA',
        message: 'Halo Pak Ahmad Faisal! Terkait drainase, Dinas PUPR Kota Jambi saat ini memiliki Program Normalisasi Drainase Utama. Untuk ruas jalan protokol, pengerukan dijadwalkan berkala setiap hari kerja oleh Regu URC SDA PUPR. Apakah Bapak memerlukan jadwal spesifik atau ingin berbicara langsung dengan petugas dinas terkait?',
        timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-103',
        sender: 'user',
        senderName: 'Ahmad Faisal',
        message: 'Boleh minta sambungkan ke petugas dinas PUPR? Karena kemarin ada pipa air yang sempat tersenggol beko pengeruk.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-104',
        sender: 'ai',
        senderName: 'Sistem KATO WARGA',
        message: 'Permintaan bantuan Anda telah dialihkan ke antrean Petugas Customer Service Diskominfo/PUPR Kota Jambi. Mohon menunggu sejenak, petugas kami akan segera bergabung dalam percakapan.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ],
    internalNotes: [
      'Pelapor mengeluhkan pipa air tersenggol saat pengerukan di Telanaipura. Koordinasikan dengan pengawas lapangan PUPR SDA.'
    ]
  },
  {
    id: 'conv-002',
    userId: 'user-warga-02',
    userName: 'Rini Anggraini (Warga Kotabaru)',
    userPhone: '0852-6632-xxxx',
    status: 'petugas_melayani',
    assignedOfficerName: 'Rahmat Hidayat, S.Kom',
    assignedOfficerDinas: 'Diskominfo Kota Jambi',
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    topic: 'Cek Status Laporan PJU Padam KJ-2026-0102',
    unreadCountForUser: 1,
    unreadCountForOfficer: 0,
    messages: [
      {
        id: 'msg-201',
        sender: 'user',
        senderName: 'Rini Anggraini',
        message: 'Selamat siang, apakah tiket KJ-2026-0102 sudah selesai dikerjakan?',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-202',
        sender: 'ai',
        senderName: 'Asisten AI KATO WARGA',
        message: 'Selamat siang Bu Rini. Berdasarkan basis data resmi KATO WARGA, tiket KJ-2026-0102 dengan judul "Penerangan Jalan Umum (PJU) Padam 5 Tiang Beruntun" telah berstatus SELESAI oleh Teknisi Dishub Kota Jambi pada 13 Oktober. Penggantian MCB dan bohlam LED 120W telah rampung.',
        timestamp: new Date(Date.now() - 59 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-203',
        sender: 'user',
        senderName: 'Rini Anggraini',
        message: 'Terima kasih informasinya. Apakah boleh saya minta bukti foto penyelesaiannya?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-204',
        sender: 'officer',
        senderName: 'Rahmat Hidayat, S.Kom',
        senderRole: 'Petugas CS Diskominfo',
        message: 'Selamat siang Bu Rini, saya Rahmat dari Helpdesk KATO WARGA. Dokumentasi hasil pengerjaan malam hari telah diunggah oleh regu Dishub di sistem internal dan lampu telah menyala normal 100%. Ibu juga dapat memberikan rating bintang serta ulasan langsung pada menu Lacak Laporan.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      }
    ],
    internalNotes: [
      'PJU depan RSUD Mattaher tuntas diverifikasi Dishub. Pelapor mengonfirmasi via chat.'
    ]
  }
];

// ==========================================
// 1. REPORTS STORAGE
// ==========================================

export function getStoredReports(): ReportItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_MOCK_REPORTS));
      localStorage.setItem(COUNTER_KEY, '108');
      return INITIAL_MOCK_REPORTS;
    }
    const parsed: ReportItem[] = JSON.parse(raw);
    let hasMigration = false;
    const sanitized = parsed.map(item => {
      let updatedItem = { ...item };
      if (!updatedItem.assignedDinas) {
        hasMigration = true;
        updatedItem.assignedDinas = getDinasForCategory(updatedItem.category).name;
      }
      if (updatedItem.imageUrl && updatedItem.imageUrl.includes('/src/assets/images/')) {
        hasMigration = true;
        updatedItem.imageUrl = updatedItem.imageUrl.replace('/src/assets/images/', '/images/');
      }
      return updatedItem;
    });
    if (hasMigration) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (e) {
    console.error('Failed reading reports from localStorage:', e);
    return INITIAL_MOCK_REPORTS;
  }
}

export function saveStoredReports(reports: ReportItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed saving reports to localStorage:', e);
  }
}

export function generateNextTicketNumber(): string {
  try {
    const current = parseInt(localStorage.getItem(COUNTER_KEY) || '108', 10);
    const next = current + 1;
    localStorage.setItem(COUNTER_KEY, next.toString());
    const padded = current.toString().padStart(4, '0');
    return `KJ-2026-${padded}`;
  } catch {
    const fallback = Math.floor(1000 + Math.random() * 9000);
    return `KJ-2026-${fallback}`;
  }
}

export function addNewReport(newReportData: Omit<ReportItem, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'history' | 'isSimulated' | 'assignedDinas'>): ReportItem {
  const reports = getStoredReports();
  const ticket = generateNextTicketNumber();
  const now = new Date().toISOString();
  const dinas = getDinasForCategory(newReportData.category);

  const completeReport: ReportItem = {
    ...newReportData,
    id: `rep-${Date.now()}`,
    ticketNumber: ticket,
    createdAt: now,
    updatedAt: now,
    assignedDinas: dinas.name,
    isSimulated: true,
    upvotes: 1,
    history: [
      {
        status: 'menunggu_verifikasi',
        timestamp: now,
        note: 'Laporan berhasil dibuat dan masuk antrean sistem KATO WARGA.',
        actor: newReportData.isAnonymous ? 'Warga Jambi (Anonim)' : (newReportData.reporterName || 'Pelapor')
      }
    ]
  };

  const updatedReports = [completeReport, ...reports];
  saveStoredReports(updatedReports);
  return completeReport;
}

export function updateReportStatus(
  ticketNumber: string,
  newStatus: ReportStatus,
  officerNote: string,
  officerName: string
): ReportItem | null {
  const reports = getStoredReports();
  const index = reports.findIndex(r => r.ticketNumber.toUpperCase() === ticketNumber.toUpperCase());
  if (index === -1) return null;

  const now = new Date().toISOString();
  const target = reports[index];

  const newHistoryItem = {
    status: newStatus,
    timestamp: now,
    note: officerNote || `Status diperbarui menjadi ${newStatus.replace('_', ' ')}.`,
    actor: officerName || 'Petugas Verifikator Pemkot Jambi'
  };

  const updated: ReportItem = {
    ...target,
    status: newStatus,
    updatedAt: now,
    officerNotes: officerNote ? officerNote : target.officerNotes,
    history: [...target.history, newHistoryItem]
  };

  reports[index] = updated;
  saveStoredReports(reports);
  return updated;
}

export function getReportByTicket(ticketNumber: string): ReportItem | null {
  if (!ticketNumber) return null;
  const reports = getStoredReports();
  const normalized = ticketNumber.trim().toUpperCase();
  return reports.find(r => r.ticketNumber.toUpperCase() === normalized) || null;
}

// ----------------------------------------------------
// ENHANCED UPVOTE SYSTEM (FITUR 3: SMART DUPLICATE & UPVOTE)
// ----------------------------------------------------
export function getUserUpvotedReports(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPVOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasUserUpvoted(reportId: string): boolean {
  const upvotedList = getUserUpvotedReports();
  return upvotedList.includes(reportId);
}

export function toggleUserUpvote(reportId: string): { upvotes: number; hasUpvoted: boolean } {
  const reports = getStoredReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index === -1) return { upvotes: 0, hasUpvoted: false };

  const upvotedList = getUserUpvotedReports();
  const alreadyUpvoted = upvotedList.includes(reportId);
  let currentVotes = reports[index].upvotes || 0;

  let newUpvotedList: string[];
  let newStatus: boolean;

  if (alreadyUpvoted) {
    // Cancel upvote
    currentVotes = Math.max(0, currentVotes - 1);
    newUpvotedList = upvotedList.filter(id => id !== reportId);
    newStatus = false;
  } else {
    // Add upvote
    currentVotes = currentVotes + 1;
    newUpvotedList = [...upvotedList, reportId];
    newStatus = true;
  }

  reports[index].upvotes = currentVotes;
  saveStoredReports(reports);
  localStorage.setItem(STORAGE_KEY_UPVOTES, JSON.stringify(newUpvotedList));

  return { upvotes: currentVotes, hasUpvoted: newStatus };
}

export function toggleUpvote(reportId: string): number {
  return toggleUserUpvote(reportId).upvotes;
}

// ==========================================
// 2. COMPLAINT REVIEWS STORAGE (Fitur 1)
// ==========================================

export function getReportReviews(): ReportReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_MOCK_REVIEWS));
      return INITIAL_MOCK_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading reviews from localStorage:', e);
    return INITIAL_MOCK_REVIEWS;
  }
}

export function saveReportReviews(reviews: ReportReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed saving reviews to localStorage:', e);
  }
}

export function getReviewByTicket(ticketNumber: string): ReportReview | null {
  const reviews = getReportReviews();
  const normalized = ticketNumber.trim().toUpperCase();
  return reviews.find(r => r.ticketNumber.toUpperCase() === normalized) || null;
}

export function addReportReview(data: {
  reportId: string;
  ticketNumber: string;
  rating: number;
  comment: string;
  reviewerName: string;
}): { success: boolean; message: string; review?: ReportReview } {
  const reports = getStoredReports();
  const report = reports.find(r => r.ticketNumber.toUpperCase() === data.ticketNumber.toUpperCase());

  if (!report) {
    return { success: false, message: 'Tiket pengaduan tidak ditemukan.' };
  }

  if (report.status !== 'selesai') {
    return { 
      success: false, 
      message: 'Ulasan hanya dapat diberikan setelah pengaduan selesai ditangani oleh dinas.' 
    };
  }

  const existingReviews = getReportReviews();
  const alreadyReviewed = existingReviews.some(
    r => r.ticketNumber.toUpperCase() === data.ticketNumber.toUpperCase()
  );

  if (alreadyReviewed) {
    return { 
      success: false, 
      message: 'Setiap tiket pengaduan hanya memiliki satu ulasan aktif dari pelapor.' 
    };
  }

  const newReview: ReportReview = {
    id: `rev-${Date.now()}`,
    reportId: report.id,
    ticketNumber: report.ticketNumber,
    rating: Math.max(1, Math.min(5, Math.round(data.rating))),
    comment: data.comment.trim(),
    reviewerName: data.reviewerName.trim() || 'Pelapor Warga',
    createdAt: new Date().toISOString(),
    isModerated: false
  };

  saveReportReviews([newReview, ...existingReviews]);
  return { 
    success: true, 
    message: 'Penilaian dan ulasan Anda berhasil dikirim!', 
    review: newReview 
  };
}

export function replyToReportReview(reviewId: string, reply: OfficialReply): boolean {
  const reviews = getReportReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return false;

  reviews[idx].officialReply = reply;
  saveReportReviews(reviews);
  return true;
}

export function moderateReportReview(
  reviewId: string, 
  isModerated: boolean, 
  reason?: string,
  moderatorName?: string
): boolean {
  const reviews = getReportReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return false;

  reviews[idx].isModerated = isModerated;
  reviews[idx].moderationReason = reason;
  reviews[idx].moderatedAt = new Date().toISOString();
  reviews[idx].moderatedBy = moderatorName || 'Tim Moderasi Pemkot Jambi';
  saveReportReviews(reviews);
  return true;
}

// ==========================================
// 3. GOVERNMENT PROGRAMS STORAGE (Fitur 3)
// ==========================================

export function getGovernmentPrograms(): GovernmentProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(INITIAL_MOCK_PROGRAMS));
      return INITIAL_MOCK_PROGRAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading programs from localStorage:', e);
    return INITIAL_MOCK_PROGRAMS;
  }
}

export function saveGovernmentPrograms(programs: GovernmentProgram[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(programs));
  } catch (e) {
    console.error('Failed saving programs to localStorage:', e);
  }
}

export function addGovernmentProgram(data: Omit<GovernmentProgram, 'id' | 'createdAt' | 'updatedAt'>): GovernmentProgram {
  const programs = getGovernmentPrograms();
  const now = new Date().toISOString();

  const newProgram: GovernmentProgram = {
    ...data,
    id: `prog-${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };

  saveGovernmentPrograms([newProgram, ...programs]);
  return newProgram;
}

export function updateGovernmentProgram(id: string, updates: Partial<GovernmentProgram>): GovernmentProgram | null {
  const programs = getGovernmentPrograms();
  const idx = programs.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const updated: GovernmentProgram = {
    ...programs[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  programs[idx] = updated;
  saveGovernmentPrograms(programs);
  return updated;
}

export function deleteGovernmentProgram(id: string): boolean {
  const programs = getGovernmentPrograms();
  const filtered = programs.filter(p => p.id !== id);
  if (filtered.length === programs.length) return false;
  saveGovernmentPrograms(filtered);
  return true;
}

// ==========================================
// 4. PROGRAM REVIEWS STORAGE (Fitur 3)
// ==========================================

export function getProgramReviews(): ProgramReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRAM_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROGRAM_REVIEWS, JSON.stringify(INITIAL_MOCK_PROGRAM_REVIEWS));
      return INITIAL_MOCK_PROGRAM_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading program reviews from localStorage:', e);
    return INITIAL_MOCK_PROGRAM_REVIEWS;
  }
}

export function saveProgramReviews(reviews: ProgramReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRAM_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed saving program reviews to localStorage:', e);
  }
}

export function addProgramReview(data: Omit<ProgramReview, 'id' | 'createdAt'>): ProgramReview {
  const reviews = getProgramReviews();
  const newRev: ProgramReview = {
    ...data,
    id: `prev-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isModerated: false
  };

  saveProgramReviews([newRev, ...reviews]);
  return newRev;
}

export function replyToProgramReview(reviewId: string, reply: OfficialReply): boolean {
  const reviews = getProgramReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return false;

  reviews[idx].officialReply = reply;
  saveProgramReviews(reviews);
  return true;
}

export function moderateProgramReview(
  reviewId: string, 
  isModerated: boolean, 
  reason?: string,
  moderatorName?: string
): boolean {
  const reviews = getProgramReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx === -1) return false;

  reviews[idx].isModerated = isModerated;
  reviews[idx].moderationReason = reason;
  reviews[idx].moderatedAt = new Date().toISOString();
  reviews[idx].moderatedBy = moderatorName || 'Tim Pengawas Layanan Publik';
  saveProgramReviews(reviews);
  return true;
}

// =========================================================================
// 5. HYBRID CUSTOMER SERVICE & AI CONVERSATIONS STORAGE
// =========================================================================

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(INITIAL_MOCK_CONVERSATIONS));
      return INITIAL_MOCK_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading conversations from localStorage:', e);
    return INITIAL_MOCK_CONVERSATIONS;
  }
}

export function saveStoredConversations(convs: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
  } catch (e) {
    console.error('Failed saving conversations to localStorage:', e);
  }
}

export function getActiveUserConversation(): Conversation {
  const convs = getStoredConversations();
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_CONV);

  if (activeId) {
    const found = convs.find(c => c.id === activeId);
    if (found && found.status !== 'selesai') {
      return found;
    }
  }

  // Create new conversation for citizen
  const now = new Date().toISOString();
  const newConv: Conversation = {
    id: `conv-${Date.now()}`,
    userId: `warga-${Math.floor(1000 + Math.random() * 9000)}`,
    userName: 'Warga Jambi',
    status: 'ai_melayani',
    startedAt: now,
    updatedAt: now,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        senderName: 'Asisten AI KATO WARGA',
        senderRole: 'Virtual Assistant',
        message: 'Halo! Selamat datang di Pusat Layanan & Bantuan KATO WARGA Kota Jambi. Saya Asisten AI siap membantu Anda memeriksa status tiket, info program pembangunan kota, atau panduan pengaduan. Ada yang bisa saya bantu hari ini?',
        timestamp: now
      }
    ],
    internalNotes: [],
    unreadCountForUser: 0,
    unreadCountForOfficer: 0
  };

  saveStoredConversations([newConv, ...convs]);
  localStorage.setItem(STORAGE_KEY_ACTIVE_CONV, newConv.id);
  return newConv;
}

export function sendMessageToConversation(
  convId: string, 
  messageData: Omit<ChatMessage, 'id' | 'timestamp'>
): Conversation {
  const convs = getStoredConversations();
  const idx = convs.findIndex(c => c.id === convId);
  const now = new Date().toISOString();

  const newMsg: ChatMessage = {
    ...messageData,
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now
  };

  if (idx === -1) {
    // If not found, create new
    const created: Conversation = {
      id: convId,
      userId: 'warga-session',
      userName: messageData.sender === 'user' ? messageData.senderName : 'Warga Jambi',
      status: 'ai_melayani',
      startedAt: now,
      updatedAt: now,
      messages: [newMsg],
      internalNotes: [],
      unreadCountForUser: messageData.sender !== 'user' ? 1 : 0,
      unreadCountForOfficer: messageData.sender === 'user' ? 1 : 0
    };
    saveStoredConversations([created, ...convs]);
    return created;
  }

  const target = convs[idx];
  const updatedMessages = [...target.messages, newMsg];

  const updated: Conversation = {
    ...target,
    messages: updatedMessages,
    updatedAt: now,
    unreadCountForUser: messageData.sender !== 'user' ? target.unreadCountForUser + 1 : target.unreadCountForUser,
    unreadCountForOfficer: messageData.sender === 'user' ? target.unreadCountForOfficer + 1 : target.unreadCountForOfficer
  };

  convs[idx] = updated;
  saveStoredConversations(convs);
  return updated;
}

export const addMessageToConversation = sendMessageToConversation;

export function switchConversationToHumanQueue(convId: string, userNote?: string): Conversation {
  const convs = getStoredConversations();
  const idx = convs.findIndex(c => c.id === convId);
  const now = new Date().toISOString();

  const sysMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    senderName: 'Sistem KATO WARGA',
    senderRole: 'Sistem Pengalihan',
    message: 'Permintaan bantuan Anda telah diteruskan ke antrean Petugas Customer Service Pemkot Jambi. Mohon menunggu sejenak, petugas manusia akan segera mengambil alih percakapan ini.',
    timestamp: now
  };

  if (idx === -1) return getActiveUserConversation();

  const updated: Conversation = {
    ...convs[idx],
    status: 'menunggu_petugas',
    waitingSince: now,
    updatedAt: now,
    messages: [...convs[idx].messages, sysMsg],
    unreadCountForOfficer: convs[idx].unreadCountForOfficer + 1,
    topic: userNote || convs[idx].topic || 'Permintaan Bantuan Petugas Manusia'
  };

  convs[idx] = updated;
  saveStoredConversations(convs);
  return updated;
}

export function officerTakeoverConversation(
  convId: string, 
  officerName: string, 
  officerDinas: string
): Conversation {
  const convs = getStoredConversations();
  const idx = convs.findIndex(c => c.id === convId);
  const now = new Date().toISOString();

  if (idx === -1) return getActiveUserConversation();

  const takeoverMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'officer',
    senderName: officerName,
    senderRole: `Petugas CS ${officerDinas}`,
    message: `Halo, saya ${officerName} dari ${officerDinas}. Saya telah mengambil alih percakapan ini dan siap membantu permasalahan atau kebutuhan informasi Anda secara langsung.`,
    timestamp: now
  };

  const updated: Conversation = {
    ...convs[idx],
    status: 'petugas_melayani',
    assignedOfficerName: officerName,
    assignedOfficerDinas: officerDinas,
    updatedAt: now,
    messages: [...convs[idx].messages, takeoverMsg],
    unreadCountForOfficer: 0
  };

  convs[idx] = updated;
  saveStoredConversations(convs);
  return updated;
}

export function officerSendMessage(
  convId: string, 
  text: string, 
  officerName: string
): Conversation {
  const convs = getStoredConversations();
  const idx = convs.findIndex(c => c.id === convId);
  const now = new Date().toISOString();

  if (idx === -1) return getActiveUserConversation();

  const officerMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'officer',
    senderName: officerName,
    senderRole: convs[idx].assignedOfficerDinas || 'Petugas CS Pemkot Jambi',
    message: text.trim(),
    timestamp: now
  };

  const updated: Conversation = {
    ...convs[idx],
    status: 'petugas_melayani',
    updatedAt: now,
    messages: [...convs[idx].messages, officerMsg],
    unreadCountForUser: convs[idx].unreadCountForUser + 1
  };

  convs[idx] = updated;
  saveStoredConversations(convs);
  return updated;
}

export function officerAddInternalNote(
  convId: string, 
  note: string, 
  officerName: string
): Conversation {
  const convs = getStoredConversations();
  const idx = convs.findIndex(c => c.id === convId);
  const now = new Date().toISOString();

  if (idx === -1) return getActiveUserConversation();

  const noteEntry = `[${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}] ${officerName}: ${note.trim()}`;
  const updated: Conversation = {
    ...convs[idx],
    updatedAt: now,
    internalNotes: [...(convs[idx].internalNotes || []), noteEntry]
  };

  convs[idx] = updated;
  saveStoredConversations(convs);
  return updated;
}

export function closeConversation(convId: string, officerName?: string): Conversation {
  const convs = getStoredConversations();
  const idx = convs.findIndex(c => c.id === convId);
  const now = new Date().toISOString();

  if (idx === -1) return getActiveUserConversation();

  const closeMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'officer',
    senderName: officerName || 'Petugas CS Pemkot Jambi',
    senderRole: 'Sistem Layanan',
    message: 'Sesi konsultasi Customer Service telah ditandai Selesai. Terima kasih telah menghubungi layanan KATO WARGA Pemerintah Kota Jambi. Anda dapat memulai sesi baru kapan saja.',
    timestamp: now
  };

  const updated: Conversation = {
    ...convs[idx],
    status: 'selesai',
    updatedAt: now,
    messages: [...convs[idx].messages, closeMsg]
  };

  convs[idx] = updated;
  saveStoredConversations(convs);
  return updated;
}

// ==========================================
// 6. ACTUAL SLA CALCULATIONS (Fitur 2)
// ==========================================

export function calculateSlaMetrics(
  reports: ReportItem[],
  reviews: ReportReview[],
  options?: { period?: 'all' | '7d' | '30d' | '90d' | '2026'; dinasId?: string }
): {
  overall: DinasSlaMetrics;
  perDinas: DinasSlaMetrics[];
} {
  const now = new Date().getTime();
  const period = options?.period || 'all';

  const filteredReports = reports.filter(r => {
    if (period === 'all') return true;
    const createdAtTime = new Date(r.createdAt).getTime();
    if (period === '7d') return now - createdAtTime <= 7 * 24 * 60 * 60 * 1000;
    if (period === '30d') return now - createdAtTime <= 30 * 24 * 60 * 60 * 1000;
    if (period === '90d') return now - createdAtTime <= 90 * 24 * 60 * 60 * 1000;
    if (period === '2026') return new Date(r.createdAt).getFullYear() === 2026;
    return true;
  });

  const getReportDinas = (r: ReportItem) => {
    if (r.assignedDinas) {
      const match = DINAS_LIST.find(d => 
        r.assignedDinas?.toLowerCase().includes(d.code.toLowerCase()) || 
        r.assignedDinas?.toLowerCase().includes(d.shortName.toLowerCase()) ||
        d.name.toLowerCase().includes(r.assignedDinas?.toLowerCase() || '')
      );
      if (match) return match;
    }
    return getDinasForCategory(r.category);
  };

  const computeMetricForSubset = (
    dinasDef: { id: string; name: string; shortName: string; slaHoursInitial: number; slaHoursResolution: number },
    subsetReports: ReportItem[],
    subsetReviews: ReportReview[]
  ): DinasSlaMetrics => {
    const totalIncoming = subsetReports.length;
    const resolvedReports = subsetReports.filter(r => r.status === 'selesai');
    const totalResolved = resolvedReports.length;
    const inProgressCount = subsetReports.filter(r => r.status === 'sedang_ditangani' || r.status === 'terverifikasi').length;
    const pendingCount = subsetReports.filter(r => r.status === 'menunggu_verifikasi').length;
    const resolutionRate = totalIncoming > 0 ? Math.round((totalResolved / totalIncoming) * 1000) / 10 : 0;

    const initialResponseHoursList: number[] = [];
    subsetReports.forEach(r => {
      if (r.history && r.history.length > 1) {
        const firstResponseItem = r.history.find(h => h.status !== 'menunggu_verifikasi');
        if (firstResponseItem) {
          const diff = (new Date(firstResponseItem.timestamp).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
          if (diff >= 0) initialResponseHoursList.push(diff);
        }
      }
    });

    const avgInitialResponseHours = initialResponseHoursList.length > 0
      ? Math.round((initialResponseHoursList.reduce((a, b) => a + b, 0) / initialResponseHoursList.length) * 10) / 10
      : null;

    const resolutionHoursList: number[] = [];
    resolvedReports.forEach(r => {
      const finishItem = r.history.find(h => h.status === 'selesai');
      const finishTime = finishItem ? new Date(finishItem.timestamp).getTime() : new Date(r.updatedAt).getTime();
      const diff = (finishTime - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
      if (diff >= 0) resolutionHoursList.push(diff);
    });

    const avgResolutionHours = resolutionHoursList.length > 0
      ? Math.round((resolutionHoursList.reduce((a, b) => a + b, 0) / resolutionHoursList.length) * 10) / 10
      : null;

    let compliantCount = 0;
    if (resolvedReports.length > 0) {
      resolvedReports.forEach(r => {
        const firstResponseItem = r.history.find(h => h.status !== 'menunggu_verifikasi');
        const finishItem = r.history.find(h => h.status === 'selesai');
        
        let initialOk = true;
        let resolutionOk = true;

        if (firstResponseItem) {
          const initDiff = (new Date(firstResponseItem.timestamp).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
          initialOk = initDiff <= dinasDef.slaHoursInitial;
        }

        if (finishItem) {
          const resDiff = (new Date(finishItem.timestamp).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
          resolutionOk = resDiff <= dinasDef.slaHoursResolution;
        }

        if (initialOk && resolutionOk) {
          compliantCount++;
        }
      });
    }

    const slaComplianceRate = resolvedReports.length > 0
      ? Math.round((compliantCount / resolvedReports.length) * 1000) / 10
      : null;

    const validReviews = subsetReviews.filter(rv => !rv.isModerated);
    const totalReviews = validReviews.length;
    const avgCitizenRating = totalReviews > 0
      ? Math.round((validReviews.reduce((sum, rv) => sum + rv.rating, 0) / totalReviews) * 10) / 10
      : null;

    return {
      dinasId: dinasDef.id,
      dinasName: dinasDef.name,
      dinasShortName: dinasDef.shortName,
      totalIncoming,
      totalResolved,
      inProgressCount,
      pendingCount,
      resolutionRate,
      avgInitialResponseHours,
      avgResolutionHours,
      slaComplianceRate,
      avgCitizenRating,
      totalReviews
    };
  };

  const reviewsByReportTicket = new Map<string, ReportReview>();
  reviews.forEach(rv => {
    reviewsByReportTicket.set(rv.ticketNumber.toUpperCase(), rv);
  });

  const perDinasList: DinasSlaMetrics[] = DINAS_LIST.map(dinas => {
    const dinasReports = filteredReports.filter(r => getReportDinas(r).id === dinas.id);
    const dinasReviews = dinasReports
      .map(r => reviewsByReportTicket.get(r.ticketNumber.toUpperCase()))
      .filter((rv): rv is ReportReview => rv !== undefined);

    return computeMetricForSubset(dinas, dinasReports, dinasReviews);
  });

  const overallDef = {
    id: 'overall',
    name: 'Pemerintah Kota Jambi (Seluruh Dinas Teknis)',
    shortName: 'Semua Dinas',
    slaHoursInitial: 24,
    slaHoursResolution: 72
  };

  const allReviews = filteredReports
    .map(r => reviewsByReportTicket.get(r.ticketNumber.toUpperCase()))
    .filter((rv): rv is ReportReview => rv !== undefined);

  const overall = computeMetricForSubset(overallDef, filteredReports, allReviews);

  return {
    overall,
    perDinas: perDinasList
  };
}

// ==========================================
// 7. RESET DEMO DATA
// ==========================================

export function resetToDemoData(): {
  reports: ReportItem[];
  reviews: ReportReview[];
  programs: GovernmentProgram[];
  programReviews: ProgramReview[];
  conversations: Conversation[];
} {
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_MOCK_REPORTS));
  localStorage.setItem(COUNTER_KEY, '108');
  localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_MOCK_REVIEWS));
  localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(INITIAL_MOCK_PROGRAMS));
  localStorage.setItem(STORAGE_KEY_PROGRAM_REVIEWS, JSON.stringify(INITIAL_MOCK_PROGRAM_REVIEWS));
  localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(INITIAL_MOCK_CONVERSATIONS));
  localStorage.removeItem(STORAGE_KEY_UPVOTES);
  localStorage.removeItem(STORAGE_KEY_ACTIVE_CONV);
  localStorage.removeItem(STORAGE_KEY_ACTIVE_CITIZEN);
  localStorage.setItem(STORAGE_KEY_CITIZENS_LIST, JSON.stringify(INITIAL_MOCK_CITIZENS));

  return {
    reports: INITIAL_MOCK_REPORTS,
    reviews: INITIAL_MOCK_REVIEWS,
    programs: INITIAL_MOCK_PROGRAMS,
    programReviews: INITIAL_MOCK_PROGRAM_REVIEWS,
    conversations: INITIAL_MOCK_CONVERSATIONS
  };
}

// ==========================================
// 8. CITIZEN (MASYARAKAT) AUTH & MANAGEMENT
// ==========================================

export const INITIAL_MOCK_CITIZENS: CitizenUser[] = [
  {
    id: 'warga-001',
    nik: '1571011204850001',
    name: 'Budi Santoso',
    phone: '0812-7489-3321',
    email: 'budi.santoso@warga.jambi.id',
    kecamatan: 'Telanaipura',
    address: 'Jl. Arif Rahman Hakim No. 14, Telanaipura, Kota Jambi',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'warga-002',
    nik: '1571025508920002',
    name: 'Siti Rahmawati',
    phone: '0852-6632-8819',
    email: 'siti.rahma@warga.jambi.id',
    kecamatan: 'Kotabaru',
    address: 'Jl. Basuki Rahmat No. 25, Paal Lima, Kotabaru, Kota Jambi',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-02-14T09:30:00.000Z'
  },
  {
    id: 'warga-003',
    nik: '1571031903900003',
    name: 'Rudi Hartono',
    phone: '0821-8899-7711',
    email: 'rudi.hartono@warga.jambi.id',
    kecamatan: 'Danau Sipin',
    address: 'Jl. Slamet Riyadi No. 8, Danau Sipin, Kota Jambi',
    createdAt: '2026-03-01T10:15:00.000Z'
  }
];

export function getAllCitizenUsers(): CitizenUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CITIZENS_LIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CITIZENS_LIST, JSON.stringify(INITIAL_MOCK_CITIZENS));
      return INITIAL_MOCK_CITIZENS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_CITIZENS;
  }
}

export function getStoredCitizen(): CitizenUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_CITIZEN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredCitizen(user: CitizenUser): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CITIZEN, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving active citizen', e);
  }
}

export function clearStoredCitizen(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_CITIZEN);
  } catch (e) {
    console.error('Error clearing active citizen', e);
  }
}

export function registerCitizen(data: {
  nik: string;
  name: string;
  phone: string;
  email?: string;
  kecamatan: KecamatanJambi;
  address?: string;
}): { success: boolean; user?: CitizenUser; message: string } {
  const cleanNik = data.nik.replace(/\D/g, '');
  if (cleanNik.length !== 16) {
    return { success: false, message: 'Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit angka.' };
  }
  if (!data.name.trim()) {
    return { success: false, message: 'Nama lengkap wajib diisi sesuai KTP.' };
  }
  if (!data.phone.trim()) {
    return { success: false, message: 'Nomor WhatsApp / HP aktif wajib diisi untuk verifikasi laporan.' };
  }

  const citizens = getAllCitizenUsers();
  const existing = citizens.find(c => c.nik === cleanNik);
  if (existing) {
    return { success: false, message: 'NIK sudah terdaftar dalam sistem KATO WARGA Kota Jambi. Silakan masuk.' };
  }

  const newUser: CitizenUser = {
    id: `warga-${Date.now().toString().slice(-6)}`,
    nik: cleanNik,
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    kecamatan: data.kecamatan,
    address: data.address?.trim() || undefined,
    createdAt: new Date().toISOString()
  };

  citizens.push(newUser);
  localStorage.setItem(STORAGE_KEY_CITIZENS_LIST, JSON.stringify(citizens));
  setStoredCitizen(newUser);

  return {
    success: true,
    user: newUser,
    message: `Pendaftaran berhasil! Selamat datang di KATO WARGA Kota Jambi, ${newUser.name}.`
  };
}

export function loginCitizen(identifier: string): { success: boolean; user?: CitizenUser; message: string } {
  const clean = identifier.trim().toLowerCase();
  if (!clean) {
    return { success: false, message: 'Masukkan NIK (16 digit), No. HP, atau Email Anda.' };
  }

  const citizens = getAllCitizenUsers();
  const cleanNumeric = clean.replace(/\D/g, '');

  const user = citizens.find(c => {
    if (cleanNumeric.length >= 10 && (c.nik === cleanNumeric || c.phone.replace(/\D/g, '').includes(cleanNumeric))) {
      return true;
    }
    if (c.email && c.email.toLowerCase() === clean) {
      return true;
    }
    if (c.name.toLowerCase() === clean) {
      return true;
    }
    return false;
  });

  if (!user) {
    // If entered a valid 16-digit NIK that isn't registered yet, offer instant quick onboarding or registration
    return {
      success: false,
      message: 'Akun warga tidak ditemukan. Pastikan NIK / No. HP sudah benar, atau gunakan menu "Daftar Akun Baru".'
    };
  }

  setStoredCitizen(user);
  return {
    success: true,
    user,
    message: `Selamat datang kembali, ${user.name}!`
  };
}
