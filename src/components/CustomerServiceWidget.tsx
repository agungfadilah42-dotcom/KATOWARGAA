import React, { useState, useEffect, useRef } from 'react';
import { 
  Conversation, 
  ChatMessage, 
  ReportItem, 
  GovernmentProgram 
} from '../types';
import { 
  getActiveUserConversation, 
  addMessageToConversation, 
  switchConversationToHumanQueue,
  getStoredConversations
} from '../services/storage';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Headphones, 
  RotateCcw, 
  ChevronDown, 
  Minimize2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CustomerServiceWidgetProps {
  reports: ReportItem[];
  programs: GovernmentProgram[];
  onNavigateToTrack?: (ticket: string) => void;
  onNavigateToPrograms?: () => void;
  onNavigateToCreate?: () => void;
}

export const CustomerServiceWidget: React.FC<CustomerServiceWidgetProps> = ({
  reports,
  programs,
  onNavigateToTrack,
  onNavigateToPrograms,
  onNavigateToCreate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active conversation on load and periodic poll
  useEffect(() => {
    const active = getActiveUserConversation();
    setConversation(active);

    const interval = setInterval(() => {
      const allConvs = getStoredConversations();
      const current = allConvs.find(c => c.id === active.id) || getActiveUserConversation();
      setConversation(current);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasUnreadNotice(false);
    }
  }, [conversation?.messages, isOpen, isAiTyping]);

  // Quick Suggestion Chips
  const quickPrompts = [
    { label: '📋 Laporan yang Sedang Aktif', text: 'Tolong sebutkan apa saja laporan pengaduan warga yang saat ini sedang aktif atau dalam penanganan di Kota Jambi' },
    { label: '✅ Laporan yang Sudah Selesai', text: 'Apa saja laporan perbaikan fasilitas yang sudah selesai tuntas dikerjakan oleh Pemkot Jambi?' },
    { label: '🔍 Cek Tiket KJ-2026-0101', text: 'Tolong cek status penanganan laporan dengan nomor tiket KJ-2026-0101' },
    { label: '📊 Rekap Semua Laporan', text: 'Berapa rekapitulasi seluruh laporan masuk, berapa yang aktif, dan berapa yang sudah tuntas selesai?' },
    { label: '🏛️ Info Program Pemkot', text: 'Apa saja program prioritas pembangunan Pemerintah Kota Jambi tahun ini?' },
    { label: '🧑‍💼 Hubungi Petugas Manusia (CS)', text: 'Saya ingin berbicara langsung dengan petugas Customer Service manusia' }
  ];

  // Send citizen message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !conversation) return;

    setInputValue('');

    // 1. Append user message to conversation
    const updatedWithUser = addMessageToConversation(conversation.id, {
      sender: 'user',
      senderName: conversation.userName || 'Warga Jambi',
      message: text
    });
    setConversation(updatedWithUser);

    // If human officer is already handling, do NOT trigger AI response
    if (updatedWithUser.status === 'petugas_melayani') {
      return;
    }

    // Check if citizen is explicitly requesting a human officer
    const isRequestingHuman = /petugas|manusia|operator|hubungi petugas|cs langsung|orang/i.test(text);

    if (isRequestingHuman && updatedWithUser.status !== 'menunggu_petugas') {
      setIsAiTyping(true);
      setTimeout(() => {
        const switched = switchConversationToHumanQueue(conversation.id, text);
        setConversation(switched);
        setIsAiTyping(false);
      }, 700);
      return;
    }

    // If conversation is waiting for officer, acknowledge queue status
    if (updatedWithUser.status === 'menunggu_petugas') {
      setIsAiTyping(true);
      setTimeout(() => {
        const queueAck = addMessageToConversation(conversation.id, {
          sender: 'ai',
          senderName: 'Sistem KATO WARGA',
          senderRole: 'Antrean Petugas CS',
          message: 'Pesan Anda telah dicatat ke dalam antrean petugas. Petugas CS Pemkot Jambi akan segera membalas saat tersedia.'
        });
        setConversation(queueAck);
        setIsAiTyping(false);
      }, 600);
      return;
    }

    // Call server AI assistant endpoint with FULL reports & programs context
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: updatedWithUser.messages.slice(-8),
          history: updatedWithUser.messages.slice(-8).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.message
          })),
          ticketsContext: reports, // Pass ALL reports (both active & completed)
          programsContext: programs
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten AI.');
      }

      const data = await response.json();

      // Check if AI recommends human transfer
      if (data.requiresHumanTransfer) {
        const switched = switchConversationToHumanQueue(conversation.id, text);
        setConversation(switched);
      } else {
        // Auto-extract ticketRef from response if not explicitly provided
        let resolvedTicketRef = data.ticketRef;
        if (!resolvedTicketRef) {
          const matchTicket = (data.reply || '').match(/KJ-2026-\d{3,4}/i);
          if (matchTicket) {
            resolvedTicketRef = matchTicket[0].toUpperCase();
          }
        }

        const updatedWithAi = addMessageToConversation(conversation.id, {
          sender: 'ai',
          senderName: 'Asisten AI KATO WARGA',
          senderRole: 'Virtual Assistant',
          message: data.reply,
          ticketRef: resolvedTicketRef,
          programRef: data.programRef
        });
        setConversation(updatedWithAi);
      }
    } catch (err) {
      console.error('Chat AI Error:', err);
      // Fallback response with awareness of active and completed reports
      const activeCount = reports.filter(r => r.status !== 'selesai').length;
      const completedCount = reports.filter(r => r.status === 'selesai').length;

      const fallback = addMessageToConversation(conversation.id, {
        sender: 'ai',
        senderName: 'Asisten AI KATO WARGA',
        senderRole: 'Virtual Assistant',
        message: `Halo! Saya asisten virtual KATO WARGA Kota Jambi. Sistem saat ini mencatat ${reports.length} total laporan (${activeCount} laporan aktif dan ${completedCount} laporan selesai). Silakan masukkan nomor tiket (contoh: KJ-2026-0101) atau klik tombol "Hubungi Petugas Manusia" di bawah jika membutuhkan bantuan khusus.`
      });
      setConversation(fallback);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Request Human CS
  const handleRequestHumanOfficer = () => {
    if (!conversation) return;
    const switched = switchConversationToHumanQueue(conversation.id, 'Warga meminta terhubung dengan Petugas Customer Service');
    setConversation(switched);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {!isOpen && hasUnreadNotice && (
          <div className="mb-2 bg-teal-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-teal-700 animate-bounce flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#C8F135]" />
            <span>Ada pesan bantuan untuk Anda</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4.5 py-3.5 rounded-full shadow-2xl transition-all cursor-pointer font-black text-xs ${
            isOpen 
              ? 'bg-slate-900 hover:bg-slate-800 text-white' 
              : 'bg-[#00796B] hover:bg-[#00695C] text-white hover:scale-105 shadow-[#00796B]/35'
          }`}
          aria-label="Pusat Bantuan & Asisten AI"
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5 stroke-[2.5]" />
              <span>Tutup Bantuan</span>
            </>
          ) : (
            <>
              <div className="relative">
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C8F135] rounded-full border-2 border-[#00796B]" />
              </div>
              <div className="text-left">
                <span className="block leading-none">Bantuan Warga & AI</span>
                <span className="text-[10px] text-teal-200 font-semibold leading-tight">Chatbot & CS Online</span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Modern Chat Dialog Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-teal-500/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#00796B] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                {conversation?.status === 'petugas_melayani' ? (
                  <Headphones className="w-5 h-5 text-[#C8F135]" />
                ) : (
                  <Bot className="w-5 h-5 text-[#C8F135]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">
                    {conversation?.status === 'petugas_melayani' 
                      ? conversation.assignedOfficerName || 'Petugas CS Pemkot' 
                      : 'Asisten Virtual KATO WARGA'}
                  </h3>
                  <span className={`w-2 h-2 rounded-full ${
                    conversation?.status === 'petugas_melayani' ? 'bg-emerald-400 animate-pulse' :
                    conversation?.status === 'menunggu_petugas' ? 'bg-amber-400 animate-ping' :
                    'bg-[#C8F135]'
                  }`} />
                </div>
                <p className="text-[11px] text-teal-100 font-medium">
                  {conversation?.status === 'petugas_melayani' 
                    ? `${conversation.assignedOfficerDinas || 'Dinas Terkait'} (Petugas Manusia)`
                    : conversation?.status === 'menunggu_petugas'
                    ? 'Menunggu Petugas Mengambil Alih...'
                    : 'AI Siaga 24 Jam • Basis Data Laporan Aktif & Selesai'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Tutup Obrolan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Service Mode Status Banner */}
          <div className={`px-4 py-2 border-b text-xs flex items-center justify-between font-semibold ${
            conversation?.status === 'petugas_melayani' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
            conversation?.status === 'menunggu_petugas' ? 'bg-amber-50 text-amber-900 border-amber-200' :
            'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <span className="flex items-center gap-1.5 text-[11px]">
              {conversation?.status === 'petugas_melayani' ? (
                <>
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Sedang dilayani langsung oleh <strong>{conversation.assignedOfficerName}</strong></span>
                </>
              ) : conversation?.status === 'menunggu_petugas' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                  <span>Dalam antrean CS Pemkot Jambi</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Cerdas • Mengetahui Seluruh Laporan Aktif & Selesai</span>
                </>
              )}
            </span>

            {conversation?.status === 'ai_melayani' && (
              <button
                onClick={handleRequestHumanOfficer}
                className="text-[11px] text-teal-800 hover:text-teal-950 font-black underline underline-offset-2 cursor-pointer flex items-center gap-1"
              >
                <Headphones className="w-3 h-3" />
                <span>Hubungi Petugas</span>
              </button>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {conversation?.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isOfficer = msg.sender === 'officer';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      {msg.senderName} {msg.senderRole ? `• ${msg.senderRole}` : ''}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#00796B] text-white rounded-tr-xs font-medium'
                        : isOfficer
                        ? 'bg-emerald-50 text-emerald-950 border-2 border-emerald-300 rounded-tl-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.message}</p>

                    {/* Interactive Ticket Quick Link */}
                    {msg.ticketRef && onNavigateToTrack && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-900">
                          Tiket: {msg.ticketRef}
                        </span>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToTrack(msg.ticketRef!);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-black bg-teal-100 hover:bg-teal-200 text-teal-950 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <span>Lacak Detail</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Interactive Program Quick Link */}
                    {msg.programRef && onNavigateToPrograms && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-900">
                          Program Terkait
                        </span>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToPrograms();
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-black bg-teal-100 hover:bg-teal-200 text-teal-950 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <span>Buka Menu Program</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-center gap-2 text-slate-500 bg-white p-3 rounded-2xl rounded-tl-xs border border-slate-200 w-fit shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span className="text-xs font-semibold">Sedang merespons...</span>
                <div className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          {conversation?.status === 'ai_melayani' && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className="whitespace-nowrap px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 border border-slate-200 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={
                  conversation?.status === 'petugas_melayani'
                    ? 'Ketik pesan Anda ke petugas...'
                    : 'Tanyakan status laporan, program, atau bantuan...'
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-xs bg-slate-100 focus:bg-white border border-slate-300 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-400/20 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-2.5 rounded-xl font-black text-white transition-all cursor-pointer ${
                  inputValue.trim()
                    ? 'bg-[#00796B] hover:bg-[#005B54] shadow-md hover:scale-105'
                    : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                }`}
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
              <span>Layanan Terpadu Pemkot Jambi</span>
              <span>KATO WARGA AI v2.4</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
