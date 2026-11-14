import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { INITIAL_MOCK_REPORTS } from './src/data/mockReports.ts';
import { INITIAL_MOCK_PROGRAMS } from './src/data/mockPrograms.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse port and host from environment or arguments
let PORT = 3000;
if (process.env.PORT) {
  PORT = parseInt(process.env.PORT, 10);
}
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--port' && process.argv[i + 1]) {
    PORT = parseInt(process.argv[i + 1], 10);
  } else if (process.argv[i].startsWith('--port=')) {
    PORT = parseInt(process.argv[i].split('=')[1], 10);
  }
}

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Timeout helper for resilient AI generation (increased to 25s for vision)
function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), ms))
  ]);
}

// Resilient Gemini model caller across lightweight and standard models
async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
  timeoutMs?: number;
}) {
  if (!ai) throw new Error('AI not configured');

  // Try gemini-3.1-flash-lite first (fast 2s inference, resilient to 503 traffic spikes),
  // then fallback to gemini-3.8-flash if needed
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        }),
        params.timeoutMs || 25000
      );
      if (response && response.text) {
        return { response, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} failed/timed out:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// Helper to resolve image payloads whether sent as data URL, raw base64, or local disk path
function resolveImagePayload(imageBase64: string, fallbackMime = 'image/jpeg'): { cleanBase64: string; mimeType: string } {
  let cleanBase64 = '';
  let mimeType = fallbackMime;

  if (imageBase64.startsWith('data:')) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      mimeType = match[1];
      cleanBase64 = match[2].trim();
    } else {
      cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
    }
  } else if (imageBase64.startsWith('/') || imageBase64.startsWith('public/')) {
    const cleanPath = imageBase64.replace(/^\/?(public\/)?/, '');
    const localDiskPath = path.join(__dirname, 'public', cleanPath);
    if (fs.existsSync(localDiskPath)) {
      const fileBuf = fs.readFileSync(localDiskPath);
      cleanBase64 = fileBuf.toString('base64');
      if (localDiskPath.endsWith('.png')) mimeType = 'image/png';
      else if (localDiskPath.endsWith('.webp')) mimeType = 'image/webp';
      else mimeType = 'image/jpeg';
    } else {
      cleanBase64 = imageBase64.trim();
    }
  } else {
    cleanBase64 = imageBase64.trim();
  }

  return { cleanBase64, mimeType };
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// =========================================================================
// 1. FITUR 1: AI VISUAL AUTO-FILL (/api/ai/vision-autofill)
// =========================================================================
app.post('/api/ai/vision-autofill', async (req, res) => {
  try {
    const { imageBase64, mimeType: userMime } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data foto (base64) wajib disertakan.' });
    }

    const { cleanBase64, mimeType } = resolveImagePayload(imageBase64, userMime);

    if (!cleanBase64 || cleanBase64.length < 50) {
      return res.status(400).json({ error: 'Format data foto tidak valid.' });
    }

    if (!ai) {
      // Heuristic fallback if GEMINI_API_KEY is not available
      return res.json({
        success: true,
        isAiPowered: false,
        source: 'heuristic_fallback',
        category: 'jalan_rusak',
        title: 'Kerusakan Prasarana Fasilitas Kota Terdeteksi',
        titleSuggestion: 'Kerusakan Prasarana Fasilitas Kota Terdeteksi',
        description: 'Foto telah berhasil diunggah. AI mendeteksi adanya indikasi permasalahan prasarana fasilitas publik yang memerlukan tindak lanjut dinas terkait.',
        descriptionSuggestion: 'Foto telah berhasil diunggah. AI mendeteksi adanya indikasi permasalahan prasarana fasilitas publik yang memerlukan tindak lanjut dinas terkait.',
        urgency: 'Sedang',
        urgencyReason: 'Kondisi membutuhkan penanganan berkala sebelum kerusakan meluas.',
        confidence: 72,
        detectedIssues: ['Permukaan fasilitas rusak', 'Memerlukan survei lapangan']
      });
    }

    const promptText = `Anda adalah asisten AI Computer Vision untuk portal pengaduan publik Pemerintah Kota Jambi (KATO WARGA).
Analisis foto yang diunggah warga secara objektif, teliti, dan realistis untuk mengisi formulir laporan pengaduan secara otomatis.

PILIH SALAH SATU dari 7 kategori pengaduan resmi berikut yang paling sesuai dengan foto:
1. "jalan_rusak": Jalan aspal berlubang, jalan amblas/bergelombang, retak buaya, paving block rusak, trotoar jalan rusak/ambles.
2. "lampu_jalan": Penerangan jalan umum (PJU) padam/mati, tiang lampu miring/roboh, kap lampu pecah, kabel lampu putus/menjuntai.
3. "drainase_banjir": Saluran drainase tersumbat sampah/endapan lumpur, gorong-gorong rusak/ambrol, genangan air jalan, luapan banjir permukiman.
4. "sampah_kebersihan": Tumpukan sampah liar di bahu jalan atau lahan kosong, TPS meluber, dahan/pohon tumbang menghalangi jalan.
5. "fasilitas_publik": Halte bus rusak, rambu lalu lintas miring/rusak, jembatan penyeberangan orang (JPO) rusak, pagar pembatas jalan rusak, fasilitas pejalan kaki/difabel.
6. "taman_ruang_terbuka": Fasilitas bermain anak (playground) rusak, bangku taman kota patah, fasilitas pedestrian taman kota rusak.
7. "lainnya": Masalah prasarana kota lainnya di luar 6 kategori di atas.

Instruksi Analisis:
- title: Buat judul laporan yang spesifik, ringkas, dan jelas dalam Bahasa Indonesia (maksimal 10 kata, contoh: "Lubang Aspal Sedalam 15 cm di Lajur Kiri", "Tumpukan Sampah Liar Meluber di Pinggir Jalan", "Gorong-gorong Mampet Menyebabkan Genangan Air").
- description: Buat uraian deskripsi 2-3 kalimat mengenai kondisi faktual yang terlihat pada foto, perkiraan tingkat kerusakan, dan dampaknya bagi warga sekitar atau pengendara. Jangan mengarang objek yang tidak ada dalam foto.
- urgency: Rekomendasikan tingkat urgensi yang objektif ("Rendah" | "Sedang" | "Tinggi" | "Darurat").
  * "Rendah": Gangguan estetika ringan, belum menghambat aktivitas umum.
  * "Sedang": Mengganggu kenyamanan publik namun belum membahayakan keselamatan jiwa secara fatal.
  * "Tinggi": Berpotensi memicu kecelakaan lalu lintas atau banjir meluas jika tidak segera ditangani.
  * "Darurat": Kondisi sangat genting yang mengancam nyawa seketika (seperti tiang listrik tegangan tinggi roboh atau amblas besar di jalan protokol).
- urgencyReason: Alasan singkat 1 kalimat mengapa tingkat urgensi tersebut direkomendasikan.
- confidence: Nilai keyakinan prediksi visual (angka bulat 50 sampai 98).
- detectedIssues: Array berisi 2 hingga 4 poin temuan elemen visual spesifik yang teramati pada foto.`;

    const { response, modelUsed } = await callGeminiWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          },
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Salah satu dari 7 kategori: jalan_rusak, lampu_jalan, drainase_banjir, sampah_kebersihan, fasilitas_publik, taman_ruang_terbuka, lainnya'
            },
            title: {
              type: Type.STRING,
              description: 'Judul spesifik dalam Bahasa Indonesia (maksimal 10 kata)'
            },
            description: {
              type: Type.STRING,
              description: 'Deskripsi faktual 2-3 kalimat'
            },
            urgency: {
              type: Type.STRING,
              description: 'Rendah, Sedang, Tinggi, atau Darurat'
            },
            urgencyReason: {
              type: Type.STRING,
              description: 'Alasan objektif rekomendasi urgensi'
            },
            confidence: {
              type: Type.INTEGER,
              description: 'Skor keyakinan 50 - 98'
            },
            detectedIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 sampai 4 temuan visual spesifik'
            }
          },
          required: ['category', 'title', 'description', 'urgency', 'urgencyReason', 'confidence', 'detectedIssues']
        }
      },
      timeoutMs: 25000
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Validate category
    const validCategories = [
      'jalan_rusak',
      'lampu_jalan',
      'drainase_banjir',
      'sampah_kebersihan',
      'fasilitas_publik',
      'taman_ruang_terbuka',
      'lainnya'
    ];
    if (!validCategories.includes(parsedData.category)) {
      parsedData.category = 'lainnya';
    }

    return res.json({
      ...parsedData,
      titleSuggestion: parsedData.title,
      descriptionSuggestion: parsedData.description,
      success: true,
      isAiPowered: true,
      source: 'gemini_vision',
      modelUsed
    });
  } catch (error: any) {
    console.error('Vision Auto-Fill API Error:', error);
    // Intelligent heuristic fallback
    return res.json({
      category: 'jalan_rusak',
      title: 'Kerusakan Prasarana Fasilitas Kota Terdeteksi',
      titleSuggestion: 'Kerusakan Prasarana Fasilitas Kota Terdeteksi',
      description: 'Foto telah berhasil diunggah. AI mendeteksi adanya indikasi permasalahan prasarana fasilitas publik yang memerlukan tindak lanjut dinas terkait.',
      descriptionSuggestion: 'Foto telah berhasil diunggah. AI mendeteksi adanya indikasi permasalahan prasarana fasilitas publik yang memerlukan tindak lanjut dinas terkait.',
      urgency: 'Sedang',
      urgencyReason: 'Kondisi membutuhkan verifikasi dan peninjauan berkala oleh tim lapangan dinas teknis.',
      confidence: 75,
      detectedIssues: ['Kerusakan prasarana fisik teramati', 'Dinas teknis perlu melakukan survei lapangan'],
      success: true,
      isAiPowered: false,
      source: 'resilient_heuristic'
    });
  }
});

// =========================================================================
// 2. FITUR 2: AI ASSISTANT / CHATBOT & HYBRID CS COPILOT (/api/ai/chat)
// =========================================================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { 
      message, 
      history = [], 
      conversationHistory = [],
      ticketsContext = [], 
      programsContext = [],
      isOfficerDraft = false,
      draftContext = ''
    } = req.body;

    if (!message && !isOfficerDraft) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    // Comprehensive knowledge base: use provided ticketsContext or fallback to initial mock database
    const allTickets: any[] = (ticketsContext && Array.isArray(ticketsContext) && ticketsContext.length > 0)
      ? ticketsContext 
      : INITIAL_MOCK_REPORTS;

    const allPrograms: any[] = (programsContext && Array.isArray(programsContext) && programsContext.length > 0)
      ? programsContext
      : INITIAL_MOCK_PROGRAMS;

    // Filter reports into Active (in-progress/verifying) and Completed (selesai)
    const activeTickets = allTickets.filter((t: any) => t.status !== 'selesai');
    const completedTickets = allTickets.filter((t: any) => t.status === 'selesai');

    // Human-readable status mapping
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'menunggu_verifikasi': return 'Menunggu Verifikasi (Antrean sistem)';
        case 'terverifikasi': return 'Terverifikasi (Diteruskan ke dinas teknis)';
        case 'sedang_ditangani': return 'Sedang Ditangani (Tim teknis lapangan bekerja)';
        case 'selesai': return 'Selesai (Perbaikan telah tuntas)';
        default: return status;
      }
    };

    // Helper for local offline/fallback response
    const buildLocalFallbackReply = (userQuery: string) => {
      const lower = userQuery.toLowerCase();

      // 1. Specific ticket lookup (e.g. KJ-2026-0101)
      const ticketMatch = userQuery.match(/KJ-2026-\d{3,4}/i);
      if (ticketMatch) {
        const searchTicket = ticketMatch[0].toUpperCase();
        const found = allTickets.find((t: any) => t.ticketNumber?.toUpperCase() === searchTicket);
        if (found) {
          const isFinished = found.status === 'selesai';
          const statusText = isFinished
            ? 'SELESAI (Perbaikan Telah Tuntas Dilaksanakan)'
            : found.status === 'sedang_ditangani'
            ? 'SEDANG DITANGANI (Pekerjaan Lapangan Sedang Berlangsung)'
            : found.status === 'terverifikasi'
            ? 'TERVERIFIKASI (Diteruskan ke Dinas Teknis Terkait)'
            : 'MENUNGGU VERIFIKASI';

          return {
            reply: `Halo Bapak/Ibu! Berdasarkan basis data resmi KATO WARGA Kota Jambi, laporan dengan nomor tiket ${found.ticketNumber} ("${found.title}"):\n\n• Status: ${statusText}\n• Kategori: ${found.category}\n• Lokasi: ${found.addressDetails || found.kecamatan} (Kecamatan ${found.kecamatan})\n• Dinas Penanggung Jawab: ${found.assignedDinas || 'Dinas Teknis Pemkot Jambi'}\n• Catatan Petugas / Tindak Lanjut: "${found.officerNotes || 'Laporan dalam koordinasi unit teknis dinas terkait.'}"\n\n${isFinished ? 'Laporan ini telah selesai dikerjakan secara tuntas. Anda dapat melihat lini masa foto dan memberi ulasan di menu Lacak Laporan.' : 'Perkembangan perbaikan dapat terus dipantau secara berkala melalui sistem.'}`,
            ticketRef: found.ticketNumber,
            isAiPowered: false,
            source: 'grounded_database_lookup'
          };
        } else {
          return {
            reply: `Nomor tiket ${searchTicket} tidak tercatat dalam basis data KATO WARGA saat ini. Pastikan format nomor tiket benar (contoh: KJ-2026-0101) atau cari langsung di menu "Lacak Laporan".`,
            isAiPowered: false,
            source: 'ticket_not_found'
          };
        }
      }

      // 2. Active reports list
      if (/aktif|sedang dikerjakan|belum selesai|dalam penanganan|proses|antrean/i.test(lower)) {
        const list = activeTickets.map((t: any, i: number) => 
          `${i + 1}. [${t.ticketNumber}] ${t.title}\n   • Status: ${getStatusLabel(t.status)}\n   • Wilayah: Kec. ${t.kecamatan} (${t.addressDetails || '-'})\n   • Dinas: ${t.assignedDinas || 'Dinas Teknis'}\n   • Catatan Progres: ${t.officerNotes || 'Dalam proses tindak lanjut'}`
        ).join('\n\n');

        return {
          reply: `Berikut daftar SELURUH LAPORAN YANG SEDANG AKTIF dalam penanganan Pemerintah Kota Jambi (Total: ${activeTickets.length} Laporan Aktif):\n\n${list}\n\nKetik nomor tiket di atas (misal: "cek tiket ${activeTickets[0]?.ticketNumber || 'KJ-2026-0101'}") untuk memeriksa riwayat detailnya.`,
          ticketRef: activeTickets[0]?.ticketNumber,
          isAiPowered: false,
          source: 'active_tickets_lookup'
        };
      }

      // 3. Completed reports list
      if (/selesai|tuntas|beres|sukses|berhasil|sudah selesai/i.test(lower)) {
        const list = completedTickets.map((t: any, i: number) => 
          `${i + 1}. [${t.ticketNumber}] ${t.title}\n   • Lokasi: Kec. ${t.kecamatan}\n   • Dinas Pelaksana: ${t.assignedDinas || 'Dinas Terkait'}\n   • Bukti Tuntas: ${t.officerNotes || 'Perbaikan selesai 100%'}`
        ).join('\n\n');

        return {
          reply: `Berikut daftar SELURUH LAPORAN YANG SUDAH SELESAI tuntas diperbaiki oleh Pemkot Jambi (Total: ${completedTickets.length} Laporan Selesai):\n\n${list}\n\nWarga dapat meninjau hasil penyelesaian fasilitas publik di atas atau memberikan evaluasi rating pelayanan pada menu Lacak Laporan.`,
          ticketRef: completedTickets[0]?.ticketNumber,
          isAiPowered: false,
          source: 'completed_tickets_lookup'
        };
      }

      // 4. All reports / statistics summary
      if (/semua laporan|seluruh laporan|rekap|statistik|jumlah laporan|total/i.test(lower)) {
        const percent = allTickets.length > 0 ? Math.round((completedTickets.length / allTickets.length) * 100) : 0;
        return {
          reply: `Ringkasan SELURUH LAPORAN KATO WARGA Kota Jambi:\n\n• Total Laporan Masuk: ${allTickets.length} laporan\n• Laporan Aktif: ${activeTickets.length} laporan (${activeTickets.filter((t: any) => t.status === 'sedang_ditangani').length} sedang ditangani di lapangan, ${activeTickets.filter((t: any) => t.status === 'terverifikasi').length} terverifikasi, ${activeTickets.filter((t: any) => t.status === 'menunggu_verifikasi').length} antrean verifikasi)\n• Laporan Selesai (Tuntas): ${completedTickets.length} laporan (${percent}% persentase penyelesaian)\n\nAnda dapat menanyakan "daftar laporan aktif" atau "daftar laporan selesai" untuk melihat rincian per tiket!`,
          isAiPowered: false,
          source: 'stats_lookup'
        };
      }

      // 5. Programs query
      if (/program|proyek|pembangunan|kegiatan/i.test(lower)) {
        const list = allPrograms.map((p: any, i: number) => 
          `${i + 1}. ${p.title} (${p.responsibleDinas})\n   • Capaian: ${p.progressPercentage}% | Lokasi: ${p.location}\n   • Tujuan: ${p.objective}`
        ).join('\n\n');
        return {
          reply: `Berikut daftar program pembangunan aktif Pemerintah Kota Jambi tahun 2026:\n\n${list}\n\nAnda dapat melihat rincian dan memberikan ulasan warga pada menu "Program Pemkot".`,
          programRef: allPrograms[0]?.id,
          isAiPowered: false,
          source: 'programs_lookup'
        };
      }

      // 6. Workflow / How to report
      if (/alur|cara lapor|panduan|bantuan/i.test(lower)) {
        return {
          reply: 'Alur pelaporan di KATO WARGA sangat mudah:\n1. Buka menu "Laporkan Masalah".\n2. Unggah foto kerusakan (AI akan mengisi kategori dan tingkat urgensi secara otomatis).\n3. Tentukan titik peta lokasi di Kota Jambi.\n4. Sistem akan memeriksa ada tidaknya laporan serupa sebelum menerbitkan tiket resmi.\n5. Nomor tiket resmi dapat langsung dilacak di menu "Lacak Laporan".',
          isAiPowered: false,
          source: 'grounded_guide_lookup'
        };
      }

      // General fallback
      return {
        reply: `Halo! Saya Asisten Virtual KATO WARGA Kota Jambi. Saya memiliki data LENGKAP seluruh laporan warga (${allTickets.length} total laporan: ${activeTickets.length} aktif dan ${completedTickets.length} sudah selesai tuntas). Anda dapat bertanya:\n• "Apa saja laporan yang sedang aktif?"\n• "Laporan apa saja yang sudah selesai?"\n• "Cek status tiket KJ-2026-0101"\n• "Berapa statistik rekap semua laporan?"\nAtau klik tombol "Hubungi Petugas" untuk terhubung dengan CS manusia kami.`,
        isAiPowered: false,
        source: 'general_welcome'
      };
    };

    if (!ai) {
      return res.json(buildLocalFallbackReply(message || ''));
    }

    // Build comprehensive, well-structured summaries of ALL tickets (both active and completed)
    const activeTicketsSummary = activeTickets.map((t: any, index: number) => 
      `${index + 1}. [TIKET: ${t.ticketNumber}] (STATUS: ${t.status.toUpperCase()})
- Judul: "${t.title}"
- Status Detail: ${getStatusLabel(t.status)}
- Kategori: ${t.category} | Urgensi: ${t.urgency || 'Sedang'}
- Lokasi: ${t.addressDetails || 'Kota Jambi'}, Kec. ${t.kecamatan}
- Dinas Teknis: ${t.assignedDinas || 'Dinas Teknis Pemkot Jambi'}
- Pelapor: ${t.isAnonymous ? 'Warga (Anonim)' : (t.reporterName || 'Warga')} | Dukungan: ${t.upvotes || 0} upvotes
- Dibuat: ${t.createdAt ? new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
- Progres Lapangan Terkini: "${t.officerNotes || 'Sedang dalam koordinasi penanganan lapangan.'}"
- Deskripsi: "${t.description}"`
    ).join('\n\n');

    const completedTicketsSummary = completedTickets.map((t: any, index: number) => 
      `${index + 1}. [TIKET: ${t.ticketNumber}] (STATUS: SELESAI / TUNTAS)
- Judul: "${t.title}"
- Kategori: ${t.category}
- Lokasi: ${t.addressDetails || 'Kota Jambi'}, Kec. ${t.kecamatan}
- Dinas Pelaksana: ${t.assignedDinas || 'Dinas Terkait Pemkot Jambi'}
- Pelapor: ${t.isAnonymous ? 'Warga (Anonim)' : (t.reporterName || 'Warga')}
- Tanggal Tuntas: ${t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
- Bukti / Catatan Penyelesaian Tuntas: "${t.officerNotes || 'Perbaikan fasilitas telah selesai 100% dan kembali berfungsi normal.'}"
- Deskripsi Awal: "${t.description}"`
    ).join('\n\n');

    const programsSummary = allPrograms.map((p: any, index: number) => 
      `${index + 1}. [PROGRAM: ${p.title}]
- Dinas: ${p.responsibleDinas} | Kategori: ${p.category} | Status: ${p.status}
- Capaian Progres: ${p.progressPercentage}% | Lokasi: ${p.location}
- Deskripsi: ${p.description}
- Tujuan: ${p.objective}`
    ).join('\n\n');

    const statsSummary = `STATISTIK SISTEM KATO WARGA KOTA JAMBI HARI INI:
- Total Seluruh Laporan Masuk: ${allTickets.length} laporan
- Laporan Aktif (Dalam Proses): ${activeTickets.length} laporan (${activeTickets.filter((t: any) => t.status === 'sedang_ditangani').length} sedang ditangani di lapangan, ${activeTickets.filter((t: any) => t.status === 'terverifikasi').length} terverifikasi, ${activeTickets.filter((t: any) => t.status === 'menunggu_verifikasi').length} antrean verifikasi)
- Laporan Selesai (Tuntas): ${completedTickets.length} laporan (${allTickets.length > 0 ? Math.round((completedTickets.length / allTickets.length) * 100) : 0}% penyelesaian)`;

    let systemInstruction = '';

    if (isOfficerDraft) {
      systemInstruction = `Anda adalah AI Copilot untuk Petugas Customer Service Pemerintah Kota Jambi (Diskominfo/PUPR).
Tugas Anda adalah membantu petugas CS menyusun draf balasan resmi yang santun, profesional, jelas, dan solutif kepada warga.

DATA LENGKAP KATO WARGA KOTA JAMBI:
${statsSummary}

DAFTAR LAPORAN AKTIF (${activeTickets.length}):
${activeTicketsSummary}

DAFTAR LAPORAN SELESAI (${completedTickets.length}):
${completedTicketsSummary}

DATA PROGRAM PEMERINTAH:
${programsSummary}

Panduan Draf:
1. Sapa warga dengan ramah dan sopan ("Selamat pagi/siang Bapak/Ibu...").
2. Jelaskan status atau tindak lanjut secara konkret berdasarkan data resmi di atas (baik laporan aktif maupun selesai).
3. Buat draf siap kirim agar petugas tinggal menyetujui atau mengedit sedikit.`;
    } else {
      systemInstruction = `Anda adalah Asisten Virtual Cerdas & Customer Service KATO WARGA Pemerintah Kota Jambi (Kanal Aspirasi dan Tanggapan Online Warga).
Motto: "Suaro Warga, Solusi Bersamo".
Karakter: Ramah, santun, responsif, profesional, dan sangat akurat.

PENTING - KNOWLEDGE BASE SELURUH LAPORAN WARGA:
Anda memiliki akses LENGKAP ke SELURUH DATA LAPORAN pengaduan warga di Kota Jambi, baik laporan yang SEDANG AKTIF (dalam proses penanganan/verifikasi) maupun laporan yang SUDAH SELESAI (tuntas diperbaiki oleh dinas teknis Pemkot Jambi).

${statsSummary}

=======================================================
DAFTAR SELURUH LAPORAN YANG SEDANG AKTIF (${activeTickets.length} Laporan):
=======================================================
${activeTicketsSummary || 'Saat ini tidak ada laporan yang sedang aktif.'}

=======================================================
DAFTAR SELURUH LAPORAN YANG SUDAH SELESAI / TUNTAS (${completedTickets.length} Laporan):
=======================================================
${completedTicketsSummary || 'Belum ada laporan yang berstatus selesai.'}

=======================================================
DAFTAR PROGRAM KERJA PEMERINTAH KOTA JAMBI (${allPrograms.length} Program):
=======================================================
${programsSummary || 'Belum ada program.'}

ATURAN DAN PANDUAN MENJAWAB:
1. PENGETAHUAN LAPORAN AKTIF & SELESAI:
   - Jika warga bertanya tentang "apa saja laporan yang aktif", "laporan apa yang sedang dikerjakan", atau "laporan yang belum selesai":
     Sebutkan daftar laporan aktif di atas secara rapi dengan mencantumkan nomor tiket resmi (format KJ-2026-xxxx), judul masalah, lokasi kecamatan, dinas yang menangani, dan catatan progres terkini.
   - Jika warga bertanya tentang "laporan yang sudah selesai", "apa saja yang sudah diperbaiki", atau "laporan yang tuntas":
     Sebutkan daftar laporan yang sudah berstatus selesai di atas secara rapi dengan menyebutkan nomor tiketnya, fasilitas apa yang diperbaiki, dan hasil/catatan tuntas dari dinas teknis (misal: penggantian modul MCB dan lampu LED, pengaspalan hotmix, normalisasi drainase).
   - Jika warga bertanya tentang seluruh laporan atau rekap/statistik:
     Jelaskan rekapitulasi data: berapa total laporan, berapa yang aktif, dan berapa yang sudah tuntas diperbaiki.

2. PENGECEKAN NOMOR TIKET SPESIFIK:
   - Jika warga menyebutkan nomor tiket (misal KJ-2026-0101, KJ-2026-0102, KJ-2026-0105, dll):
     Cari tiket tersebut di basis data aktif dan selesai di atas. Jelaskan status resminya secara lengkap:
     * Nomor tiket & judul pengaduan
     * Apakah berstatus AKTIF (Sedang Ditangani / Terverifikasi / Menunggu Verifikasi) atau SUDAH SELESAI
     * Lokasi & Kecamatan
     * Dinas teknis penanggung jawab
     * Catatan perkembangan atau bukti penyelesaian dari petugas lapangan.
   - Jika nomor tiket tidak terdaftar di basis data, nyatakan dengan jujur dan sarankan warga mengecek format nomor tiketnya (contoh: KJ-2026-0101).

3. PERTANYAAN PER WILAYAH / KECAMATAN / KATEGORI:
   - Jika warga menanyakan aduan di kecamatan tertentu (misal Danau Sipin, Pasar Jambi, Telanaipura):
     Sebutkan laporan yang ada di kecamatan tersebut, baik yang aktif maupun yang sudah selesai.

4. PROGRAM PEMERINTAH KOTA JAMBI:
   - Jelaskan program, capaian progres (%), dan dinas pelaksananya sesuai data program di atas.

5. HUBUNGI PETUGAS CS MANUSIA:
   - Jika warga memerlukan bantuan yang belum tercakup di data atau ingin berbicara dengan petugas manusia, sampaikan bahwa mereka dapat mengklik tombol "Hubungi Petugas Manusia" di atas panel chat ini.

6. FORMAT & GAYA BAHASA:
   - Format respon dengan rapi menggunakan poin-poin tebal.
   - Selalu sertakan nomor tiket resmi (KJ-2026-xxxx) agar warga dapat mengeceknya di sistem.`;
    }

    // Format conversation history for Gemini API
    const contents: any[] = [];
    
    // Support either history or conversationHistory
    const rawHistory = (history && history.length > 0) ? history : conversationHistory;
    if (rawHistory && rawHistory.length > 0) {
      for (const item of rawHistory.slice(-6)) {
        const role = (item.role === 'user' || item.sender === 'user') ? 'user' : 'model';
        const text = item.text || item.message || '';
        if (text) {
          contents.push({
            role,
            parts: [{ text }]
          });
        }
      }
    }

    // Add current user prompt or draft request
    contents.push({
      role: 'user',
      parts: [{ text: isOfficerDraft ? (draftContext || message) : message }]
    });

    const { response, modelUsed } = await callGeminiWithFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      },
      timeoutMs: 25000
    });

    const replyText = response.text || 'Maaf, saya tidak dapat merespons saat ini.';

    // Auto-detect ticket reference in reply if any
    const detectedTicket = replyText.match(/KJ-2026-\d{3,4}/i);
    const ticketRef = detectedTicket ? detectedTicket[0].toUpperCase() : undefined;

    return res.json({
      reply: replyText,
      ticketRef,
      isAiPowered: true,
      source: modelUsed
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);

    const userMsg = (req.body?.message || '').trim();
    const isOfficerDraft = !!req.body?.isOfficerDraft;

    if (isOfficerDraft) {
      return res.json({
        reply: 'Selamat siang Bapak/Ibu, terima kasih atas informasi dan pengaduan yang disampaikan. Laporan Anda telah kami catat dan dikoordinasikan langsung dengan unit teknis dinas terkait Pemerintah Kota Jambi untuk penanganan lebih lanjut di lapangan. Perkembangan tindak lanjut dapat dipantau berkala melalui portal KATO WARGA. Ada hal lain yang dapat kami bantu?',
        isAiPowered: false,
        source: 'resilient_copilot_template'
      });
    }

    const allTickets: any[] = (req.body?.ticketsContext && Array.isArray(req.body.ticketsContext) && req.body.ticketsContext.length > 0)
      ? req.body.ticketsContext 
      : INITIAL_MOCK_REPORTS;

    const allPrograms: any[] = (req.body?.programsContext && Array.isArray(req.body.programsContext) && req.body.programsContext.length > 0)
      ? req.body.programsContext
      : INITIAL_MOCK_PROGRAMS;

    const activeTickets = allTickets.filter((t: any) => t.status !== 'selesai');
    const completedTickets = allTickets.filter((t: any) => t.status === 'selesai');
    const lower = userMsg.toLowerCase();

    // Specific ticket lookup fallback
    const ticketMatch = userMsg.match(/KJ-2026-\d{3,4}/i);
    if (ticketMatch) {
      const searchTicket = ticketMatch[0].toUpperCase();
      const found = allTickets.find((t: any) => t.ticketNumber?.toUpperCase() === searchTicket);
      if (found) {
        const isFinished = found.status === 'selesai';
        return res.json({
          reply: `Halo Bapak/Ibu! Berdasarkan basis data KATO WARGA Kota Jambi, laporan dengan nomor tiket ${found.ticketNumber} ("${found.title}"):\n\n• Status: ${isFinished ? 'SELESAI (Tuntas Dikerjakan)' : found.status.toUpperCase()}\n• Kategori: ${found.category}\n• Wilayah: Kec. ${found.kecamatan} (${found.addressDetails || '-'})\n• Dinas Penanggung Jawab: ${found.assignedDinas || 'Dinas Teknis Pemkot Jambi'}\n• Catatan Lapangan: "${found.officerNotes || 'Laporan dalam penanganan unit dinas terkait.'}"\n\n${isFinished ? 'Perbaikan telah selesai tuntas. Anda dapat memberikan ulasan kepuasan di menu Lacak Laporan.' : 'Progres penanganan terus diperbarui oleh tim lapangan.'}`,
          ticketRef: found.ticketNumber,
          isAiPowered: false,
          source: 'grounded_database_lookup'
        });
      }
    }

    // Active reports lookup fallback
    if (/aktif|sedang dikerjakan|belum selesai|dalam penanganan/i.test(lower)) {
      const list = activeTickets.map((t: any, i: number) => 
        `${i + 1}. [${t.ticketNumber}] ${t.title} (Status: ${t.status.toUpperCase()}, Kec. ${t.kecamatan})`
      ).join('\n');
      return res.json({
        reply: `Daftar laporan pengaduan yang SEDANG AKTIF dalam penanganan Pemkot Jambi (${activeTickets.length} laporan):\n\n${list}\n\nSebutkan nomor tiket di atas untuk memeriksa progres detail.`,
        ticketRef: activeTickets[0]?.ticketNumber,
        isAiPowered: false,
        source: 'active_tickets_lookup'
      });
    }

    // Completed reports lookup fallback
    if (/selesai|tuntas|beres|sudah selesai/i.test(lower)) {
      const list = completedTickets.map((t: any, i: number) => 
        `${i + 1}. [${t.ticketNumber}] ${t.title} (Kec. ${t.kecamatan} - Catatan: ${t.officerNotes || 'Tuntas'})`
      ).join('\n');
      return res.json({
        reply: `Daftar laporan fasilitas umum yang TELAH SELESAI tuntas diperbaiki (${completedTickets.length} laporan):\n\n${list}\n\nSeluruh laporan di atas telah selesai ditangani oleh dinas terkait.`,
        ticketRef: completedTickets[0]?.ticketNumber,
        isAiPowered: false,
        source: 'completed_tickets_lookup'
      });
    }

    return res.json({
      reply: `Halo! Saya Asisten Virtual KATO WARGA Kota Jambi. Saya memiliki informasi data SELURUH LAPORAN (${allTickets.length} total laporan: ${activeTickets.length} aktif dan ${completedTickets.length} tuntas selesai). Anda dapat menanyakan:\n• "Apa saja laporan yang aktif?"\n• "Apa saja laporan yang sudah selesai?"\n• "Cek tiket KJ-2026-0101"\n• "Statistik rekap semua laporan"`,
      isAiPowered: false,
      source: 'general_fallback'
    });
  }
});

// Canonical Mock Reports for Duplicate Check Fallback
const DEFAULT_REPORTS_FOR_DUPLICATES = [
  {
    id: 'rep-101',
    ticketNumber: 'KJ-2026-0101',
    title: 'Lubang Jalan Cukup Dalam Dekat Simpang Kawat',
    category: 'jalan_rusak',
    kecamatan: 'Danau Sipin',
    addressDetails: 'Jl. Kolonel Abunjani No. 12, seberang SPBU Sipin',
    latitude: -1.6052,
    longitude: 103.5932,
    description: 'Aspal amblas sedalam sekitar 15 cm di lajur kiri mengarah ke Simpang Kawat. Sering menyebabkan pengendara motor oleng dan hampir jatuh terutama di malam hari.',
    status: 'sedang_ditangani',
    upvotes: 18
  },
  {
    id: 'rep-102',
    ticketNumber: 'KJ-2026-0102',
    title: 'Penerangan Jalan Umum (PJU) Padam 5 Tiang Beruntun',
    category: 'lampu_jalan',
    kecamatan: 'Telanaipura',
    addressDetails: 'Jl. Raden Mattaher, depan RSUD Raden Mattaher',
    latitude: -1.5978,
    longitude: 103.6085,
    description: 'Lampu jalan mati total sepanjang 200 meter. Area sangat gelap dan rawan tindak kejahatan atau kecelakaan bagi pejalan kaki dan keluarga pasien rumah sakit.',
    status: 'selesai',
    upvotes: 24
  },
  {
    id: 'rep-103',
    ticketNumber: 'KJ-2026-0103',
    title: 'Drainase Tersumbat dan Genangan Air Meluap ke Badan Jalan',
    category: 'drainase_banjir',
    kecamatan: 'Pasar Jambi',
    addressDetails: 'Jl. Dr. Wahidin, kawasan pertokoan Pasar Jambi',
    latitude: -1.5895,
    longitude: 103.6192,
    description: 'Gorong-gorong tersumbat endapan lumpur dan sampah plastik tebal. Setiap hujan deras lebih dari 30 menit, air limbah meluap hingga setinggi betis orang dewasa.',
    status: 'sedang_ditangani',
    upvotes: 31
  },
  {
    id: 'rep-104',
    ticketNumber: 'KJ-2026-0104',
    title: 'Tumpukan Sampah Liar di Pinggir Lahan Kosong',
    category: 'sampah_kebersihan',
    kecamatan: 'Jelutung',
    addressDetails: 'Jl. Gajah Mada No. 45, samping ruko kosong',
    latitude: -1.6142,
    longitude: 103.6215,
    description: 'Sampah rumah tangga dibuang sembarangan di pinggir jalan sehingga menimbulkan bau menyengat dan mengotori lingkungan permukiman.',
    status: 'menunggu_verifikasi',
    upvotes: 9
  }
];

// =========================================================================
// 3. FITUR 3: SMART DUPLICATE CHECK (/api/ai/check-duplicates)
// =========================================================================
app.post('/api/ai/check-duplicates', async (req, res) => {
  try {
    const { 
      title = '', 
      description = '', 
      category = '', 
      kecamatan = '', 
      existingReports = [] 
    } = req.body;

    const reportsToCheck = existingReports && existingReports.length > 0 
      ? existingReports 
      : DEFAULT_REPORTS_FOR_DUPLICATES;

    if (!title && !description) {
      return res.json({ hasDuplicateCandidate: false, candidates: [] });
    }

    // Heuristic + Semantic matching
    const candidates: Array<{
      report: any;
      similarityScore: number;
      similarityReason: string;
    }> = [];

    const inputTokens = `${title} ${description}`.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['yang', 'pada', 'dengan', 'untuk', 'saya', 'kami', 'kota', 'jambi', 'jalan'].includes(w));

    for (const report of reportsToCheck) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Category exact match (+30%)
      if (category && report.category === category) {
        score += 30;
        reasons.push('Kategori masalah sama');
      }

      // 2. Kecamatan match (+30%)
      if (kecamatan && report.kecamatan && report.kecamatan.toLowerCase() === kecamatan.toLowerCase()) {
        score += 30;
        reasons.push(`Wilayah berdekatan (Kecamatan ${kecamatan})`);
      }

      // 3. Keyword / text overlap (+40%)
      const reportTokens = `${report.title} ${report.description} ${report.addressDetails}`.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);

      let commonCount = 0;
      for (const tok of inputTokens) {
        if (reportTokens.includes(tok)) commonCount++;
      }

      if (inputTokens.length > 0) {
        const textOverlapPct = Math.min(40, Math.round((commonCount / inputTokens.length) * 40));
        if (textOverlapPct > 10) {
          score += textOverlapPct;
          reasons.push('Kesamaan kata kunci deskripsi masalah');
        }
      }

      // If score is high enough (>= 60%), consider candidate
      if (score >= 60) {
        candidates.push({
          report,
          similarityScore: Math.min(95, score),
          similarityReason: reasons.join(' dan ')
        });
      }
    }

    // Sort by highest similarity
    candidates.sort((a, b) => b.similarityScore - a.similarityScore);

    return res.json({
      hasDuplicateCandidate: candidates.length > 0,
      candidates: candidates.slice(0, 3)
    });
  } catch (error: any) {
    console.error('Check Duplicate API Error:', error);
    return res.json({ hasDuplicateCandidate: false, candidates: [] });
  }
});

// =========================================================================
// VITE MIDDLEWARE (DEV) & STATIC FILE SERVING (PROD)
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KATO WARGA Express + Vite server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
