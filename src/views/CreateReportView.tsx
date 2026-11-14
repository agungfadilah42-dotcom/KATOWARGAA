import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ReportCategory, 
  KecamatanJambi, 
  ReportItem, 
  VisionAutoFillResult, 
  DuplicateCandidate, 
  DuplicateCheckResult,
  CitizenUser 
} from '../types';
import { CATEGORIES, KECAMATAN_LIST } from '../data/categories';
import { LeafletMap } from '../components/LeafletMap';
import { hasUserUpvoted, toggleUserUpvote } from '../services/storage';
import { 
  Send, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  LocateFixed,
  X,
  FileText,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  RefreshCw,
  Info,
  Check,
  ChevronRight,
  Clock,
  Layers,
  Crosshair,
  Compass,
  Navigation,
  User
} from 'lucide-react';

interface CreateReportViewProps {
  initialCategory?: ReportCategory;
  reports?: ReportItem[];
  currentCitizen?: CitizenUser | null;
  onOpenCitizenLogin?: () => void;
  onSubmitReport: (data: {
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
    urgency?: 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';
    urgencyReason?: string;
    aiConfidence?: number;
  }) => ReportItem;
  onNavigateToTrack: (ticketNumber: string) => void;
  onNavigateToMap: () => void;
  onUpvoteReport?: (reportId: string) => void;
}

// Center of Kota Jambi as starting coordinate
const DEFAULT_COORDS = { lat: -1.6115, lng: 103.6150 };

// Titik Pusat Koordinat 11 Kecamatan di Kota Jambi
export const KECAMATAN_COORDINATES: Record<KecamatanJambi, { lat: number; lng: number }> = {
  'Telanaipura': { lat: -1.6042, lng: 103.5861 },
  'Danau Sipin': { lat: -1.6030, lng: 103.5950 },
  'Danau Teluk': { lat: -1.5790, lng: 103.6060 },
  'Pasar Jambi': { lat: -1.5930, lng: 103.6210 },
  'Jambi Timur': { lat: -1.5850, lng: 103.6350 },
  'Jambi Selatan': { lat: -1.6350, lng: 103.6400 },
  'Jelutung': { lat: -1.6150, lng: 103.6100 },
  'Kotabaru': { lat: -1.6360, lng: 103.6140 },
  'Alam Barajo': { lat: -1.6450, lng: 103.5700 },
  'Paal Merah': { lat: -1.6550, lng: 103.6550 },
  'Pelayangan': { lat: -1.5820, lng: 103.6180 }
};

// Preset Landmark & Titik Strategis Kota Jambi
export const JAMBI_LANDMARKS = [
  { name: 'Kantor Walikota Jambi', lat: -1.6375, lng: 103.6145, kec: 'Kotabaru' as KecamatanJambi, hint: 'Jl. Basuki Rahmat, Kotabaru' },
  { name: 'Tugu Keris Siginjai', lat: -1.6358, lng: 103.6133, kec: 'Kotabaru' as KecamatanJambi, hint: 'Kawasan Bundaran Kotabaru' },
  { name: 'Gentala Arasy & Danau Teluk', lat: -1.5898, lng: 103.6178, kec: 'Danau Teluk' as KecamatanJambi, hint: 'Kawasan Wisata Seberang Jembatan Gentala' },
  { name: 'Wisata Danau Sipin', lat: -1.6033, lng: 103.5855, kec: 'Danau Sipin' as KecamatanJambi, hint: 'Kawasan Tepian Danau Sipin' },
  { name: 'Pasar Angso Duo / WTC', lat: -1.5936, lng: 103.6212, kec: 'Pasar Jambi' as KecamatanJambi, hint: 'Jl. Sultan Thaha, Pasar Jambi' },
  { name: 'Kawasan Telanaipura', lat: -1.6042, lng: 103.5861, kec: 'Telanaipura' as KecamatanJambi, hint: 'Kawasan Perkantoran Gubernur Telanaipura' },
  { name: 'Bandara Sultan Thaha', lat: -1.6420, lng: 103.6425, kec: 'Jambi Selatan' as KecamatanJambi, hint: 'Kawasan Bandara Sultan Thaha, Thehok' },
  { name: 'Simpang Rimbo', lat: -1.6495, lng: 103.5650, kec: 'Alam Barajo' as KecamatanJambi, hint: 'Jl. Lintas Timur Simpang Rimbo' }
];

export function findNearestKecamatan(lat: number, lng: number): KecamatanJambi {
  let closestKec: KecamatanJambi = 'Telanaipura';
  let minDistance = Infinity;

  for (const [kec, coords] of Object.entries(KECAMATAN_COORDINATES)) {
    const dLat = coords.lat - lat;
    const dLng = coords.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      closestKec = kec as KecamatanJambi;
    }
  }
  return closestKec;
}

export const CreateReportView: React.FC<CreateReportViewProps> = ({
  initialCategory,
  reports = [],
  currentCitizen,
  onOpenCitizenLogin,
  onSubmitReport,
  onNavigateToTrack,
  onNavigateToMap,
  onUpvoteReport
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>(initialCategory || 'jalan_rusak');
  const [description, setDescription] = useState('');
  const [kecamatan, setKecamatan] = useState<KecamatanJambi>(
    currentCitizen?.kecamatan || 'Telanaipura'
  );
  const [addressDetails, setAddressDetails] = useState('');
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDS);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{
    type: 'success' | 'warning' | 'error' | 'idle';
    message: string;
    accuracy?: number;
  } | null>(null);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState(DEFAULT_COORDS.lat.toFixed(6));
  const [manualLng, setManualLng] = useState(DEFAULT_COORDS.lng.toFixed(6));
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState(currentCitizen?.name || '');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Sync reporter name if citizen logs in while on this view
  useEffect(() => {
    if (currentCitizen && !reporterName) {
      setReporterName(currentCitizen.name);
    }
  }, [currentCitizen, reporterName]);
  
  // Urgency & AI Meta
  const [urgency, setUrgency] = useState<'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat'>('Sedang');
  const [urgencyReason, setUrgencyReason] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // Photo State
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  // AI Visual Auto-Fill State
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<VisionAutoFillResult | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // AI Smart Duplicate Alert State
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateModalData, setDuplicateModalData] = useState<DuplicateCheckResult | null>(null);
  const [upvotedCandidates, setUpvotedCandidates] = useState<Record<string, { upvoted: boolean; count: number }>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submittedReport, setSubmittedReport] = useState<ReportItem | null>(null);

  // Trigger AI Visual Analysis
  const analyzePhotoWithAi = async (imageBase64OrUrl: string) => {
    if (!imageBase64OrUrl) return;
    setIsAnalyzingPhoto(true);
    setAiAnalysisError(null);

    try {
      const response = await fetch('/api/ai/vision-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageBase64OrUrl })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi layanan AI Vision.');
      }

      const result: VisionAutoFillResult = await response.json();
      setAiAnalysisResult(result);

      // Auto-fill form fields
      if (result.category) {
        setCategory(result.category);
      }
      if (result.urgency) {
        setUrgency(result.urgency);
      }
      if (result.urgencyReason) {
        setUrgencyReason(result.urgencyReason);
      }
      if (typeof result.confidence === 'number') {
        setAiConfidence(result.confidence);
      }

      // Auto-fill title if user hasn't typed a custom title yet
      const suggestedTitle = result.titleSuggestion || result.title;
      if (suggestedTitle && (!title.trim() || title.trim().length < 8)) {
        setTitle(suggestedTitle);
      }

      // Auto-fill description if user hasn't typed a long description yet
      const suggestedDesc = result.descriptionSuggestion || result.description;
      if (suggestedDesc && (!description.trim() || description.trim().length < 20)) {
        setDescription(suggestedDesc);
      }

    } catch (err) {
      console.error('AI Vision Auto-Fill Error:', err);
      setAiAnalysisError('Analisis otomatis foto belum terhubung. Jika menggunakan Vercel, pastikan GEMINI_API_KEY telah ditambahkan di Vercel Settings > Environment Variables.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Compress large camera photos on client canvas before sending
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            resolve(compressed);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationErrors(prev => ({ ...prev, photo: 'Mohon unggah file format JPG, PNG, atau WEBP.' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors(prev => ({ ...prev, photo: 'Ukuran foto maksimal 10 MB.' }));
      return;
    }

    setIsPhotoLoading(true);
    setAiAnalysisError(null);

    try {
      const compressedDataUrl = await compressImage(file);
      if (compressedDataUrl) {
        setPhotoPreview(compressedDataUrl);
        setIsPhotoLoading(false);
        // Automatically trigger AI Visual Auto-Fill
        analyzePhotoWithAi(compressedDataUrl);
      } else {
        setIsPhotoLoading(false);
      }
    } catch {
      setIsPhotoLoading(false);
    }
  };

  // Sample Photos for quick demo with distinct civic infrastructure categories
  const samplePhotos = [
    { label: 'Jalan Rusak / Amblas', url: '/images/jalan-rusak-jambi.jpg' },
    { label: 'Trotoar & Fasilitas Publik', url: '/images/city_infrastructure_jambi_1792244147077.jpg' },
    { label: 'Penerangan & Ruang Terbuka', url: '/images/hero_smart_city_jambi_1792244146207.jpg' }
  ];

  const handleSelectSamplePhoto = async (url: string) => {
    setPhotoPreview(url);
    setIsPhotoLoading(true);
    try {
      // Fetch and convert image to base64 for fast AI inference
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setIsPhotoLoading(false);
        analyzePhotoWithAi(dataUrl);
      };
      reader.onerror = () => {
        setIsPhotoLoading(false);
        analyzePhotoWithAi(url);
      };
      reader.readAsDataURL(blob);
    } catch {
      setIsPhotoLoading(false);
      analyzePhotoWithAi(url);
    }
  };

  // Re-apply AI Suggestions button handler
  const applyAiSuggestions = () => {
    if (!aiAnalysisResult) return;
    if (aiAnalysisResult.category) setCategory(aiAnalysisResult.category);
    if (aiAnalysisResult.urgency) setUrgency(aiAnalysisResult.urgency);
    if (aiAnalysisResult.urgencyReason) setUrgencyReason(aiAnalysisResult.urgencyReason);
    const suggestedTitle = aiAnalysisResult.titleSuggestion || aiAnalysisResult.title;
    if (suggestedTitle) setTitle(suggestedTitle);
    const suggestedDesc = aiAnalysisResult.descriptionSuggestion || aiAnalysisResult.description;
    if (suggestedDesc) setDescription(suggestedDesc);
  };

  // Geolocation trigger with full feedback & fallback
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsFeedback({
        type: 'error',
        message: 'Peramban (browser) tidak mendukung GPS Geolocation. Silakan gunakan tombol landmark Kota Jambi atau klik langsung pada peta.'
      });
      return;
    }

    setIsLocatingGps(true);
    setGpsFeedback({
      type: 'idle',
      message: 'Mencari sinyal GPS perangkat Anda...'
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGps(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);

        setCoordinates({ lat, lng });
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));

        const matchedKec = findNearestKecamatan(lat, lng);
        setKecamatan(matchedKec);

        setGpsFeedback({
          type: 'success',
          message: `Lokasi GPS berhasil terdeteksi (Akurasi: ±${accuracy} meter). Peta diarahkan ke wilayah Kecamatan ${matchedKec}.`,
          accuracy
        });
      },
      (err) => {
        setIsLocatingGps(false);
        let errMsg = 'Tidak dapat mendeteksi sinyal GPS.';
        if (err.code === 1) {
          errMsg = 'Izin akses lokasi GPS ditolak atau dibatasi peramban.';
        } else if (err.code === 2) {
          errMsg = 'Sinyal satelit GPS tidak terdeteksi pada perangkat.';
        } else if (err.code === 3) {
          errMsg = 'Permintaan lokasi GPS melebihi batas waktu (timeout).';
        }

        // Resilient fallback to currently selected kecamatan
        const fallbackCoord = KECAMATAN_COORDINATES[kecamatan] || DEFAULT_COORDS;
        setCoordinates(fallbackCoord);
        setManualLat(fallbackCoord.lat.toFixed(6));
        setManualLng(fallbackCoord.lng.toFixed(6));

        setGpsFeedback({
          type: 'warning',
          message: `${errMsg} Koordinat dialihkan ke pusat Kecamatan ${kecamatan}. Anda dapat menggeser pin langsung pada peta atau memilih landmark di bawah.`
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // Switch Kecamatan and sync map coordinates
  const handleKecamatanChange = (newKec: KecamatanJambi) => {
    setKecamatan(newKec);
    const coord = KECAMATAN_COORDINATES[newKec];
    if (coord) {
      setCoordinates(coord);
      setManualLat(coord.lat.toFixed(6));
      setManualLng(coord.lng.toFixed(6));
      setGpsFeedback({
        type: 'idle',
        message: `Peta dipusatkan ke Kecamatan ${newKec}. Geser pin untuk menentukan titik jalan/lokasi detail.`
      });
    }
  };

  // Landmark quick selection
  const handleSelectLandmark = (lm: typeof JAMBI_LANDMARKS[0]) => {
    setCoordinates({ lat: lm.lat, lng: lm.lng });
    setManualLat(lm.lat.toFixed(6));
    setManualLng(lm.lng.toFixed(6));
    setKecamatan(lm.kec);
    if (!addressDetails) {
      setAddressDetails(lm.hint);
    }
    setGpsFeedback({
      type: 'success',
      message: `Peta diarahkan ke ${lm.name} (Kecamatan ${lm.kec}).`
    });
  };

  // Manual Coordinates Apply
  const handleApplyManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -2 || lat > 0 || lng < 102 || lng > 105) {
      setGpsFeedback({
        type: 'error',
        message: 'Format koordinat tidak valid untuk wilayah Kota Jambi (Contoh Lat: -1.6115, Lng: 103.6150).'
      });
      return;
    }
    setCoordinates({ lat, lng });
    const matchedKec = findNearestKecamatan(lat, lng);
    setKecamatan(matchedKec);
    setGpsFeedback({
      type: 'success',
      message: `Koordinat manual (${lat.toFixed(5)}, ${lng.toFixed(5)}) berhasil diterapkan ke peta!`
    });
  };

  // Coordinate change callback from Leaflet picker
  const handleCoordinateChangeFromMap = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
    const matchedKec = findNearestKecamatan(lat, lng);
    setGpsFeedback({
      type: 'idle',
      message: `Pin diperbarui: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)} (Wilayah Kecamatan ${matchedKec})`
    });
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Judul laporan wajib diisi.';
    } else if (title.trim().length < 8) {
      errors.title = 'Judul minimal 8 karakter.';
    }

    if (!description.trim()) {
      errors.description = 'Deskripsi masalah wajib diisi.';
    } else if (description.trim().length < 20) {
      errors.description = 'Deskripsi minimal 20 karakter agar dinas terkait memahami rincian masalah.';
    }

    if (!addressDetails.trim()) {
      errors.addressDetails = 'Alamat atau patokan lokasi wajib diisi.';
    }

    if (!isAnonymous && !reporterName.trim()) {
      errors.reporterName = 'Isi nama Anda atau pilih opsi Lapor Anonim.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'Anda harus menyetujui pernyataan kebenaran data laporan.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Perform Final Report Creation
  const doSubmitReport = () => {
    setIsSubmitting(true);
    setDuplicateModalData(null);

    setTimeout(() => {
      const created = onSubmitReport({
        title: title.trim(),
        category,
        description: description.trim(),
        kecamatan,
        addressDetails: addressDetails.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        imageUrl: photoPreview || undefined,
        isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName.trim(),
        status: 'menunggu_verifikasi',
        urgency,
        urgencyReason: urgencyReason.trim() || undefined,
        aiConfidence: aiConfidence || undefined
      });

      setIsSubmitting(false);
      setSubmittedReport(created);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback silent
      }
    }, 600);
  };

  // Check For Duplicates Before Submit (Fitur 3: AI Smart Duplicate Alert)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsCheckingDuplicates(true);

    try {
      // Call duplicate detection API
      const res = await fetch('/api/ai/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          kecamatan,
          latitude: coordinates.lat,
          longitude: coordinates.lng
        })
      });

      if (res.ok) {
        const dupResult: DuplicateCheckResult = await res.json();
        if (dupResult.hasDuplicateCandidate && dupResult.candidates.length > 0) {
          // Initialize upvote states for candidates
          const initialCandidateStates: Record<string, { upvoted: boolean; count: number }> = {};
          dupResult.candidates.forEach(c => {
            initialCandidateStates[c.report.id] = {
              upvoted: hasUserUpvoted(c.report.id),
              count: c.report.upvotes || 0
            };
          });
          setUpvotedCandidates(initialCandidateStates);
          setDuplicateModalData(dupResult);
          setIsCheckingDuplicates(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Duplicate check skipped or failed, proceeding with submit:', err);
    }

    setIsCheckingDuplicates(false);
    doSubmitReport();
  };

  // Handle Upvote for a duplicate candidate (1 vote per user toggleable)
  const handleToggleUpvoteCandidate = (candidateId: string) => {
    const res = toggleUserUpvote(candidateId);
    setUpvotedCandidates(prev => ({
      ...prev,
      [candidateId]: {
        upvoted: res.hasUpvoted,
        count: res.upvotes
      }
    }));
    if (onUpvoteReport) {
      onUpvoteReport(candidateId);
    }
  };

  // Reset form to write another report
  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setAddressDetails('');
    setReporterName('');
    setPhotoPreview('');
    setIsAnonymous(false);
    setAgreeTerms(false);
    setUrgency('Sedang');
    setUrgencyReason('');
    setAiConfidence(null);
    setAiAnalysisResult(null);
    setAiAnalysisError(null);
    setSubmittedReport(null);
    setValidationErrors({});
    setDuplicateModalData(null);
  };

  // ----------------------------------------------------
  // Success Confirmation Screen
  // ----------------------------------------------------
  if (submittedReport) {
    const categoryObj = CATEGORIES.find(c => c.id === submittedReport.category);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-[32px] sm:rounded-[38px] border border-black/[0.06] p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] text-center space-y-6">
          <div className="w-16 h-16 bg-[#C8F135] text-stone-950 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black text-stone-900 uppercase tracking-wider bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200/60">
              Laporan Berhasil Diterima
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Terima Kasih atas Partisipasi Kito!
            </h2>
            <p className="text-sm text-slate-700 max-w-lg mx-auto font-medium">
              Laporan Anda telah tercatat ke dalam antrean sistem KATO WARGA dan siap diverifikasi oleh dinas teknis Kota Jambi.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <span className="text-xs text-teal-950 font-black uppercase tracking-wider">Nomor Tiket Resmi</span>
              <span className="font-mono text-base font-black text-teal-900 bg-[#E6F4EA] px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                {submittedReport.ticketNumber}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 font-medium">
              <div>
                <strong className="text-slate-900 block font-black text-sm">{submittedReport.title}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-bold text-teal-800 bg-[#E6F4EA] px-2 py-0.5 rounded border border-teal-200">
                  {categoryObj?.name}
                </span>
                {submittedReport.urgency && (
                  <span className={`px-2 py-0.5 rounded font-black border text-[11px] ${
                    submittedReport.urgency === 'Darurat' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    submittedReport.urgency === 'Tinggi' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    submittedReport.urgency === 'Sedang' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                    'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    Urgensi: {submittedReport.urgency}
                  </span>
                )}
              </div>
              <div>
                Wilayah: Kecamatan <span className="font-bold text-slate-900">{submittedReport.kecamatan}</span> ({submittedReport.addressDetails})
              </div>
              <div className="text-teal-800 font-mono text-[11px] font-bold">
                Koordinat: {submittedReport.latitude.toFixed(5)}, {submittedReport.longitude.toFixed(5)}
              </div>
              {submittedReport.aiConfidence && (
                <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Diverifikasi dengan dukungan AI Vision ({submittedReport.aiConfidence}% keyakinan)</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigateToTrack(submittedReport.ticketNumber)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#00796B] hover:bg-[#00695C] text-white font-black text-sm shadow-lg shadow-[#00796B]/25 transition-all cursor-pointer hover:scale-102"
            >
              <span>Lacak Status Tiket Ini</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={onNavigateToMap}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-teal-900 font-extrabold text-sm border-2 border-teal-300 shadow-md shadow-teal-500/10 hover:border-teal-400 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-teal-600 stroke-[2.5]" />
              <span>Lihat di Peta Aduan</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleResetForm}
              className="text-xs text-teal-700 hover:text-teal-900 font-black underline underline-offset-4 cursor-pointer"
            >
              + Buat Laporan Fasilitas Lainnya
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Interactive Report Form
  // ----------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-stone-900 border border-black/[0.06] text-xs font-bold mb-2 shadow-2xs">
          <FileText className="w-3.5 h-3.5 text-stone-700 stroke-[2.2]" />
          <span>Formulir Pengaduan Cerdas KATO WARGA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Laporkan Permasalahan Fasilitas Kota
        </h1>
        <p className="text-sm text-stone-600 mt-1 font-medium">
          Dilengkapi AI Visual Auto-Fill untuk deteksi otomatis dari foto dan AI Smart Duplicate Alert pencegah laporan ganda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[32px] sm:rounded-[38px] border border-black/[0.04] p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] space-y-9">
        
        {/* Section 1: Bukti Foto & AI Visual Auto-Fill */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#00796B] text-white font-black text-xs flex items-center justify-center shadow-xs">
                01
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Bukti Foto & AI Visual Auto-Fill</span>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-teal-900 px-2 py-0.5 rounded-full font-black border border-emerald-300">
                    <Sparkles className="w-3 h-3 text-teal-700" />
                    Fitur AI
                  </span>
                </h2>
              </div>
            </div>
            {photoPreview && (
              <button
                type="button"
                onClick={() => analyzePhotoWithAi(photoPreview)}
                disabled={isAnalyzingPhoto}
                className="inline-flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingPhoto ? 'animate-spin' : ''}`} />
                <span>Analisis Ulang Foto</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Unggah atau ambil foto kerusakan. AI akan menganalisis objek visual untuk mengisi kategori, ringkasan masalah, dan rekomendasi tingkat urgensi secara otomatis.
          </p>

          {/* Photo Upload Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-teal-300 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-teal-50/30 flex flex-col items-center justify-center">
              <Camera className="w-9 h-9 text-teal-600 mb-2 stroke-[2.2]" />
              <label className="cursor-pointer">
                <span className="inline-block px-4 py-2 rounded-xl bg-white border-2 border-teal-300 text-xs font-black text-teal-900 hover:bg-teal-50 shadow-sm transition-colors">
                  Pilih / Ambil Foto Kerusakan
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Mendukung JPG, PNG, WEBP (Maksimal 5 MB)
              </p>
            </div>

            {/* Preview or Simulation Sample Photos */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 flex flex-col justify-between">
              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-teal-300 h-36 bg-slate-900">
                  <img
                    src={photoPreview}
                    alt="Pratinjau Bukti"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setAiAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full hover:bg-slate-900 cursor-pointer"
                    title="Hapus foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-teal-600 text-white font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> Foto Terpasang
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Atau coba foto simulasi pengujian cepat:
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {samplePhotos.map((sp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSamplePhoto(sp.url)}
                        className="px-3 py-2 text-[11px] bg-white border border-teal-200 rounded-xl hover:border-teal-500 font-bold text-teal-900 text-left transition-colors cursor-pointer shadow-2xs flex items-center justify-between"
                      >
                        <span>{sp.label}</span>
                        <Sparkles className="w-3 h-3 text-teal-600" />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    AI langsung membaca objek foto dan mengisi kolom formulir di bawah.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Analyzing Status Indicator */}
          {isAnalyzingPhoto && (
            <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-300 rounded-2xl text-teal-950 animate-pulse">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-xs font-black">AI sedang menganalisis foto permasalahan...</p>
                <p className="text-[11px] text-teal-800">Mendeteksi objek visual, kategori fasilitas, dan estimasi tingkat keparahan.</p>
              </div>
            </div>
          )}

          {/* AI Analysis Result Banner */}
          {aiAnalysisResult && !isAnalyzingPhoto && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-400 rounded-2xl p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-teal-600 text-white rounded-lg shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                      Hasil Analisis AI Computer Vision
                    </h4>
                    <span className="text-[11px] text-teal-800 font-semibold">
                      Tingkat Keyakinan Model: <strong className="font-mono text-teal-900">{aiAnalysisResult.confidence}%</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-white border border-teal-300 text-teal-800 px-2.5 py-1 rounded-full font-bold">
                  Dapat Diedit Manual
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
                <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Kategori Terdeteksi</span>
                  <span className="font-black text-teal-900">{CATEGORIES.find(c => c.id === aiAnalysisResult.category)?.name}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Rekomendasi Urgensi</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                      aiAnalysisResult.urgency === 'Darurat' ? 'bg-rose-100 text-rose-800' :
                      aiAnalysisResult.urgency === 'Tinggi' ? 'bg-amber-100 text-amber-900' :
                      aiAnalysisResult.urgency === 'Sedang' ? 'bg-blue-100 text-blue-900' :
                      'bg-emerald-100 text-emerald-900'
                    }`}>
                      {aiAnalysisResult.urgency}
                    </span>
                    <span className="text-[11px] text-slate-600 truncate">{aiAnalysisResult.urgencyReason}</span>
                  </div>
                </div>
              </div>

              {aiAnalysisResult.detectedIssues && aiAnalysisResult.detectedIssues.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-600 font-bold">Elemen Visual:</span>
                  {aiAnalysisResult.detectedIssues.map((issue, idx) => (
                    <span key={idx} className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-teal-900 border border-teal-200">
                      ✓ {issue}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-teal-200/60">
                <p className="text-[11px] text-teal-900/80 italic">
                  Kolom formulir di bawah telah terisi otomatis sesuai hasil analisis foto. Anda bebas mengedit atau menyesuaikannya.
                </p>
                <button
                  type="button"
                  onClick={applyAiSuggestions}
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] bg-teal-800 hover:bg-teal-900 text-white font-bold px-3 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Terapkan Ulang Saran AI</span>
                </button>
              </div>
            </div>
          )}

          {aiAnalysisError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{aiAnalysisError}</span>
            </div>
          )}
        </div>

        {/* Section 2: Informasi Permasalahan & Urgensi */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 border-b-2 border-emerald-100 pb-3">
            <span className="w-7 h-7 rounded-lg bg-[#00796B] text-white font-black text-xs flex items-center justify-center shadow-xs">
              02
            </span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Rincian Laporan Pengaduan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kategori Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kategori Masalah <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kecamatan Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kecamatan / Wilayah <span className="text-rose-500">*</span>
              </label>
              <select
                value={kecamatan}
                onChange={(e) => handleKecamatanChange(e.target.value as KecamatanJambi)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-400/30 transition-all"
              >
                {KECAMATAN_LIST.map((kec) => (
                  <option key={kec} value={kec}>
                    Kecamatan {kec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tingkat Urgensi Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Tingkat Urgensi Masalah</span>
                {urgencyReason && (
                  <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Saran AI: {urgencyReason}
                  </span>
                )}
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Berdasarkan dampak & bahaya</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'Rendah', desc: 'Ringan, tidak darurat', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-950', active: 'bg-emerald-100 border-emerald-500 font-black' },
                { val: 'Sedang', desc: 'Mengganggu kenyamanan', color: 'border-blue-300 hover:bg-blue-50 text-blue-950', active: 'bg-blue-100 border-blue-500 font-black' },
                { val: 'Tinggi', desc: 'Risiko laka / macet parah', color: 'border-amber-300 hover:bg-amber-50 text-amber-950', active: 'bg-amber-100 border-amber-500 font-black' },
                { val: 'Darurat', desc: 'Bahaya nyawa / bencana', color: 'border-rose-300 hover:bg-rose-50 text-rose-950', active: 'bg-rose-100 border-rose-500 font-black' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setUrgency(item.val as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    urgency === item.val ? item.active : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-black flex items-center justify-between">
                    <span>{item.val}</span>
                    {urgency === item.val && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Judul Laporan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Judul Laporan Singkat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Aspal Amblas dan Berlubang di Dekat Simpang Kawat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-xs bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:bg-white transition-all ${
                validationErrors.title ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30'
              }`}
            />
            {validationErrors.title && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.title}
              </p>
            )}
          </div>

          {/* Deskripsi Lengkap */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Deskripsi Lengkap <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {description.length} karakter (min. 20)
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Jelaskan kronologi permasalahan, perkiraan ukuran, dampak terhadap lalu lintas atau keselamatan warga..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-xs bg-slate-50 border rounded-xl p-3.5 text-slate-900 font-medium focus:outline-hidden focus:bg-white transition-all leading-relaxed ${
                validationErrors.description ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30'
              }`}
            />
            {validationErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.description}
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Lokasi & Peta Koordinat */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-100 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#00796B] text-white font-black text-xs flex items-center justify-center shadow-xs">
                03
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Lokasi & Titik Peta
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">Tentukan titik masalah secara presisi</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocatingGps}
              className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl border transition-all cursor-pointer shadow-xs self-start sm:self-auto ${
                isLocatingGps
                  ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                  : 'bg-[#E6F4EA] hover:bg-[#D5EDE0] text-[#00796B] hover:text-[#005B54] border-[#00796B]/30'
              }`}
            >
              {isLocatingGps ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  <span>Mendeteksi Lokasi GPS...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4 text-[#00796B] stroke-[2.5]" />
                  <span>Gunakan Lokasi GPS Saya</span>
                </>
              )}
            </button>
          </div>

          {/* GPS Feedback & Status Alert */}
          {gpsFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                gpsFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : gpsFeedback.type === 'warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : gpsFeedback.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-teal-50 border-teal-300 text-teal-900'
              }`}
            >
              {gpsFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : gpsFeedback.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : gpsFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">
                <span>{gpsFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setGpsFeedback(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Alamat / Patokan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Alamat Rinci / Patokan Lokasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Jl. Kolonel Abunjani No. 12, seberang SPBU Sipin, RT 14"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              className={`w-full text-xs bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:bg-white transition-all ${
                validationErrors.addressDetails ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30'
              }`}
            />
            {validationErrors.addressDetails && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.addressDetails}
              </p>
            )}
          </div>

          {/* Pilihan Cepat Titik Strategis / Landmark Kota Jambi */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>Pilih Cepat Titik Strategis Kota Jambi:</span>
              </span>
              <span className="text-[10px] text-slate-500">Klik untuk langsung memposisikan peta</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {JAMBI_LANDMARKS.map((lm) => (
                <button
                  key={lm.name}
                  type="button"
                  onClick={() => handleSelectLandmark(lm)}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:text-teal-900 transition-all cursor-pointer shadow-2xs"
                >
                  📍 {lm.name}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Picker Map Container */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Titik Koordinat:</span>
                <span className="font-mono bg-teal-50 border border-teal-200 text-teal-900 font-extrabold px-2.5 py-0.5 rounded-lg text-xs">
                  {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                  Kec. {kecamatan}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowManualCoords(!showManualCoords)}
                className="text-[11px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
              >
                {showManualCoords ? 'Tutup Input Manual' : '⚙️ Input Koordinat Manual'}
              </button>
            </div>

            {/* Manual Lat/Lng Panel */}
            {showManualCoords && (
              <div className="p-3 bg-white border border-teal-200 rounded-xl space-y-2 shadow-xs">
                <span className="text-xs font-bold text-slate-800 block">
                  Masukkan Nilai Latitude & Longitude Secara Manual:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Latitude</label>
                    <input
                      type="text"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="-1.6115"
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Longitude</label>
                    <input
                      type="text"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="103.6150"
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleApplyManualCoordinates}
                      className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Terapkan Titik
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Leaflet Map */}
            <div className="h-80 w-full rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md relative">
              <LeafletMap
                center={[coordinates.lat, coordinates.lng]}
                zoom={15}
                isPickerMode={true}
                pickerCoordinates={{ lat: coordinates.lat, lng: coordinates.lng }}
                onCoordinateChange={handleCoordinateChangeFromMap}
                height="100%"
              />
            </div>

            <p className="text-[11px] text-slate-500 italic">
              💡 <strong>Tips:</strong> Klik di mana saja pada peta Kota Jambi atau seret (drag) pin hijau untuk menandai lokasi titik jalan rusak, lampu padam, atau masalah fasilitas publik dengan presisi.
            </p>
          </div>
        </div>

        {/* Section 4: Privasi Pelapor & Persetujuan */}
        <div className="space-y-4 bg-white p-6 rounded-2xl border-2 border-emerald-300 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#00796B] text-white font-black text-xs flex items-center justify-center shadow-xs">
              04
            </span>
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">
              Identitas & Privasi
            </h2>
          </div>

          {/* Citizen Account Integration Banner */}
          {currentCitizen ? (
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {currentCitizen.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 truncate">
                    {currentCitizen.name} <span className="text-[10px] text-teal-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-md">Warga Terverifikasi</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Kec. {currentCitizen.kecamatan} • Telp: {currentCitizen.phone}
                  </p>
                </div>
              </div>
              {onOpenCitizenLogin && (
                <button
                  type="button"
                  onClick={onOpenCitizenLogin}
                  className="text-[11px] font-bold text-teal-800 hover:text-teal-950 underline shrink-0 cursor-pointer"
                >
                  Kelola Akun
                </button>
              )}
            </div>
          ) : onOpenCitizenLogin ? (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Sudah memiliki Akun Warga Kota Jambi?</span>
              <button
                type="button"
                onClick={onOpenCitizenLogin}
                className="text-teal-700 font-bold hover:text-teal-900 underline cursor-pointer"
              >
                Masuk Warga ➔
              </button>
            </div>
          ) : null}

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
            />
            <label htmlFor="isAnonymous" className="text-xs text-slate-800 cursor-pointer font-bold">
              Laporkan secara <strong className="text-teal-900 bg-white px-1.5 py-0.5 rounded border border-teal-200">Anonim</strong> (Nama tidak akan dipublikasikan ke publik)
            </label>
          </div>

          {/* Name Input if not anonymous */}
          {!isAnonymous && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nama Pelapor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama lengkap Anda"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className={`w-full text-xs bg-white border rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-hidden ${
                  validationErrors.reporterName ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/30'
                }`}
              />
              {validationErrors.reporterName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.reporterName}
                </p>
              )}
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="pt-2 border-t border-emerald-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer accent-teal-600"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-800 cursor-pointer leading-relaxed font-semibold">
                Saya menyatakan informasi yang dilaporkan adalah benar dan menyetujui pemanfaatan data lokasi serta foto untuk penanganan perbaikan fasilitas umum oleh instansi berwenang Pemerintah Kota Jambi. <span className="text-rose-500">*</span>
              </label>
            </div>
            {validationErrors.agreeTerms && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.agreeTerms}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistem memeriksa duplikasi laporan sebelum penerbitan nomor tiket</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isCheckingDuplicates}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all cursor-pointer shadow-md ${
              isSubmitting || isCheckingDuplicates
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-[#00796B] hover:bg-[#005B54] text-white hover:shadow-lg hover:scale-102'
            }`}
          >
            {isCheckingDuplicates ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memeriksa Laporan Serupa...</span>
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Laporan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.2] text-white" />
                <span>Kirim Laporan Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* FITUR 3: AI SMART DUPLICATE ALERT MODAL                  */}
      {/* ======================================================== */}
      {duplicateModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-amber-400 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>AI Smart Duplicate Alert</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Laporan Serupa Terdeteksi di Sekitar Wilayah Anda
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  AI mendeteksi pengaduan dengan permasalahan serupa di lokasi berdekatan. Untuk mencegah penumpukan tiket ganda dan mempercepat penanganan dinas terkait, Anda disarankan untuk <strong>mendukung laporan yang sudah ada</strong>.
                </p>
              </div>
            </div>

            {/* List of Duplicate Candidates */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {duplicateModalData.candidates.map((cand, idx) => {
                const isUpvoted = upvotedCandidates[cand.report.id]?.upvoted ?? hasUserUpvoted(cand.report.id);
                const voteCount = upvotedCandidates[cand.report.id]?.count ?? (cand.report.upvotes || 0);

                return (
                  <div key={idx} className="border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-4 bg-slate-50/70 transition-all space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-teal-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                            {cand.report.ticketNumber}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700">
                            Kecamatan {cand.report.kecamatan}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            cand.report.status === 'selesai' ? 'bg-emerald-100 text-emerald-900' :
                            cand.report.status === 'sedang_ditangani' ? 'bg-amber-100 text-amber-900' :
                            'bg-blue-100 text-blue-900'
                          }`}>
                            {cand.report.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900">
                          {cand.report.title}
                        </h4>
                      </div>

                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl shrink-0 border border-amber-300">
                        {Math.round(cand.similarityScore * 100)}% Mirip
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cand.report.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-[11px] text-slate-500 font-semibold italic">
                        Alasan Kemiripan: {cand.similarityReason}
                      </span>

                      {/* 1 Vote per Citizen Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleUpvoteCandidate(cand.report.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isUpvoted
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white hover:bg-teal-50 text-teal-900 border border-teal-300'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
                        <span>{isUpvoted ? 'Didukung' : 'Dukung Laporan Ini'}</span>
                        <span className="bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded-md font-mono text-[10px]">
                          {voteCount}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Choices */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDuplicateModalData(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Kembali & Periksa Laporan Saya
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDuplicateModalData(null);
                    // If user upvoted, can simply navigate to map or track
                    onNavigateToMap();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-950 text-xs font-black border border-teal-300 transition-colors cursor-pointer"
                >
                  ✓ Cukup Dukung Laporan (Selesai)
                </button>

                <button
                  type="button"
                  onClick={doSubmitReport}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00796B] hover:bg-[#005B54] text-white text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  Tetap Buat Laporan Baru →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
