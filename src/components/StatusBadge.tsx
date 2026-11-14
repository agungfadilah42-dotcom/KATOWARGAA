import React from 'react';
import { ReportStatus } from '../types';
import { STATUS_CONFIG } from '../data/categories';
import { Clock, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.menunggu_verifikasi;

  const getIcon = () => {
    switch (status) {
      case 'menunggu_verifikasi':
        return <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'terverifikasi':
        return <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'sedang_ditangani':
        return <Wrench className="w-3.5 h-3.5 text-cyan-700 shrink-0" />;
      case 'selesai':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
  };

  const getStyle = () => {
    switch (status) {
      case 'menunggu_verifikasi':
        return 'text-amber-900 bg-amber-100/90 border-amber-300 ring-1 ring-amber-400/30';
      case 'terverifikasi':
        return 'text-blue-900 bg-blue-100/90 border-blue-300 ring-1 ring-blue-400/30';
      case 'sedang_ditangani':
        return 'text-cyan-950 bg-cyan-100/90 border-cyan-300 ring-1 ring-cyan-400/30';
      case 'selesai':
        return 'text-emerald-950 bg-emerald-100/90 border-emerald-300 ring-1 ring-emerald-400/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border rounded-lg ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${getStyle()} whitespace-nowrap shadow-xs`}
    >
      {getIcon()}
      <span>{config.label}</span>
    </span>
  );
};
