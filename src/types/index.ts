export type ReportStatus = 
  | 'menunggu_verifikasi'
  | 'terverifikasi'
  | 'sedang_ditangani'
  | 'selesai';

export type ReportCategory =
  | 'jalan_rusak'
  | 'lampu_jalan'
  | 'drainase_banjir'
  | 'sampah_kebersihan'
  | 'fasilitas_publik'
  | 'taman_ruang_terbuka'
  | 'lainnya';

export type KecamatanJambi =
  | 'Telanaipura'
  | 'Danau Sipin'
  | 'Danau Teluk'
  | 'Pasar Jambi'
  | 'Jambi Timur'
  | 'Jambi Selatan'
  | 'Jelutung'
  | 'Kotabaru'
  | 'Alam Barajo'
  | 'Paal Merah'
  | 'Pelayangan';

export interface StatusHistoryItem {
  status: ReportStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface ReportItem {
  id: string;
  ticketNumber: string;
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
  reporterPhone?: string;
  assignedDinas?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  history: StatusHistoryItem[];
  officerNotes?: string;
  upvotes?: number;
  isSimulated: boolean;
  urgency?: 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';
  urgencyReason?: string;
  aiConfidence?: number;
}

export interface OfficialReply {
  responderName: string;
  responderDinas: string;
  message: string;
  repliedAt: string;
}

export interface ReportReview {
  id: string;
  reportId: string;
  ticketNumber: string;
  rating: number; // 1 to 5
  comment: string;
  reviewerName: string;
  createdAt: string;
  isModerated?: boolean;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  officialReply?: OfficialReply;
}

export type ProgramStatus = 'direncanakan' | 'berlangsung' | 'selesai' | 'ditunda';

export type ProgramCategory = 
  | 'infrastruktur'
  | 'kebersihan_lingkungan'
  | 'transportasi'
  | 'digitalisasi_pelayanan'
  | 'sosial_ekonomi'
  | 'taman_tata_kota';

export interface GovernmentProgram {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  objective: string;
  responsibleDinas: string;
  category: ProgramCategory;
  location: string;
  startDate: string;
  endDate?: string;
  status: ProgramStatus;
  progressPercentage: number; // 0 to 100
  documentationImages?: string[];
  updatedAt: string;
  createdAt: string;
}

export interface ProgramReview {
  id: string;
  programId: string;
  rating: number; // 1 to 5
  comment: string;
  reviewerName: string;
  reviewerRole?: string; // e.g. 'Warga Sekitar', 'Pelaku UMKM', 'Masyarakat Pengguna'
  feedbackType: 'masukan_pelaksanaan' | 'evaluasi_hasil' | 'saran_umum';
  createdAt: string;
  isModerated?: boolean;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  officialReply?: OfficialReply;
}

export interface DinasDefinition {
  id: string;
  name: string;
  shortName: string;
  code: string;
  categoryIds: ReportCategory[];
  slaHoursInitial: number; // standard target response time (e.g. 24h)
  slaHoursResolution: number; // standard target completion time (e.g. 72h / 120h)
  color: string;
  address: string;
  contact: string;
}

export interface DinasSlaMetrics {
  dinasId: string;
  dinasName: string;
  dinasShortName: string;
  totalIncoming: number;
  totalResolved: number;
  inProgressCount: number;
  pendingCount: number;
  resolutionRate: number; // in percentage e.g. 85.5%
  avgInitialResponseHours: number | null; // null if no data
  avgResolutionHours: number | null; // null if no data
  slaComplianceRate: number | null; // % of resolved within SLA target
  avgCitizenRating: number | null; // 1.0 to 5.0
  totalReviews: number;
}

export interface CitizenUser {
  id: string;
  nik: string; // 16 digit NIK
  name: string;
  phone: string;
  email?: string;
  kecamatan: KecamatanJambi;
  address?: string;
  avatarUrl?: string;
  totalReports?: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  role: string;
  agency: string;
  avatar?: string;
}

// ----------------------------------------------------
// AI VISION AUTO-FILL TYPES (Fitur 1)
// ----------------------------------------------------
export interface VisionAutoFillResult {
  category: ReportCategory;
  title: string;
  description: string;
  urgency: 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';
  urgencyReason: string;
  confidence: number;
  detectedIssues?: string[];
  titleSuggestion?: string;
  descriptionSuggestion?: string;
}

// ----------------------------------------------------
// AI SMART DUPLICATE ALERT TYPES (Fitur 3)
// ----------------------------------------------------
export interface DuplicateCandidate {
  report: ReportItem;
  similarityScore: number;
  similarityReason: string;
}

export interface DuplicateCheckResult {
  hasDuplicateCandidate: boolean;
  candidates: DuplicateCandidate[];
}

// ----------------------------------------------------
// HYBRID CUSTOMER SERVICE & AI CHAT TYPES (Fitur 2 & CS)
// ----------------------------------------------------
export type ConversationStatus = 
  | 'ai_melayani' 
  | 'menunggu_petugas' 
  | 'petugas_melayani' 
  | 'menunggu_balasan_warga' 
  | 'selesai';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'officer';
  senderName: string;
  senderRole?: string;
  message: string;
  timestamp: string;
  isInternalNote?: boolean; // Visible only to authorized officers
  ticketRef?: string;
  programRef?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  status: ConversationStatus;
  startedAt: string;
  updatedAt: string;
  assignedOfficerName?: string;
  assignedOfficerDinas?: string;
  messages: ChatMessage[];
  internalNotes: string[];
  unreadCountForUser: number;
  unreadCountForOfficer: number;
  waitingSince?: string;
  topic?: string;
}
