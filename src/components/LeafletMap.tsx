import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReportItem } from '../types';
import { STATUS_CONFIG } from '../data/categories';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface LeafletMapProps {
  reports?: ReportItem[];
  selectedReport?: ReportItem | null;
  onSelectReport?: (report: ReportItem) => void;
  // Picker mode props
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number };
  onCoordinateChange?: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Default center Kota Jambi (near Gentala Arasy & Kantor Walikota)
export const JAMBI_DEFAULT_CENTER: [number, number] = [-1.6115, 103.6150];

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports = [],
  selectedReport,
  onSelectReport,
  isPickerMode = false,
  pickerCoordinates,
  onCoordinateChange,
  height = '480px',
  zoom = 13,
  center = JAMBI_DEFAULT_CENTER
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialCenter = pickerCoordinates 
      ? [pickerCoordinates.lat, pickerCoordinates.lng] as [number, number]
      : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: zoom,
      scrollWheelZoom: true,
      zoomControl: true
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Force size invalidation to prevent grey tiles or misaligned tiles
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    // ResizeObserver for dynamic layout changes (accordions, modal, flex resize)
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      pickerMarkerRef.current = null;
    };
  }, []);

  // Handle Picker Mode Clicks & Drag
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isPickerMode) {
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onCoordinateChange) {
          onCoordinateChange(lat, lng);
        }
      };

      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [isPickerMode, onCoordinateChange]);

  // Update Picker Marker and Pan to it
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isPickerMode || !pickerCoordinates) return;

    const { lat, lng } = pickerCoordinates;

    const pinHtml = `
      <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: auto; cursor: grab;">
        <div style="background: #00796B; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 14px rgba(0, 121, 107, 0.45); white-space: nowrap; margin-bottom: 4px; border: 1.5px solid #ffffff; letter-spacing: 0.02em;">
          📍 Titik Lokasi Aduan
        </div>
        <div style="width: 28px; height: 28px; background: #00796B; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 6px 16px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <div style="width: 9px; height: 9px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `;

    const pickerIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: pinHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    if (!pickerMarkerRef.current) {
      const marker = L.marker([lat, lng], {
        icon: pickerIcon,
        draggable: true,
        title: 'Geser pin ini untuk menentukan titik lokasi yang tepat'
      }).addTo(map);

      marker.on('dragend', (e) => {
        const target = e.target;
        const pos = target.getLatLng();
        if (onCoordinateChange) {
          onCoordinateChange(pos.lat, pos.lng);
        }
      });

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([lat, lng]);
    }

    // Smoothly pan map to new coordinates if not already in view
    map.panTo([lat, lng], { animate: true, duration: 0.8 });
  }, [pickerCoordinates, isPickerMode, onCoordinateChange]);

  // Render Reports Markers (Display Mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || isPickerMode) return;

    markersLayer.clearLayers();

    reports.forEach((report) => {
      const statusMeta = STATUS_CONFIG[report.status] || STATUS_CONFIG.menunggu_verifikasi;
      const pinColor = statusMeta.dotColor || '#10b981';

      const pinHtml = `
        <div style="transform: translate(-50%, -100%); cursor: pointer; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: ${pinColor}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.28); display: flex; align-items: center; justify-content: center;">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-report-pin',
        html: pinHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(markersLayer);

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '230px';
      popupContent.style.padding = '6px';
      popupContent.innerHTML = `
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">
          ${report.ticketNumber} · ${report.kecamatan}
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 8px;">
          ${report.title}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: ${pinColor};">
            ${statusMeta.label}
          </span>
          <button id="btn-view-${report.id}" style="background: #00796B; color: white; border: none; padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(0, 121, 107, 0.3);">
            Lihat Detail
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${report.id}`);
        if (btn && onSelectReport) {
          btn.onclick = () => {
            onSelectReport(report);
          };
        }
      });
    });
  }, [reports, isPickerMode, onSelectReport]);

  // Center on Selected Report
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedReport) return;

    map.flyTo([selectedReport.latitude, selectedReport.longitude], 15, {
      duration: 1.2
    });
  }, [selectedReport]);

  const handleCenterToPin = () => {
    if (mapInstanceRef.current && pickerCoordinates) {
      mapInstanceRef.current.setView([pickerCoordinates.lat, pickerCoordinates.lng], 16, {
        animate: true
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl border border-slate-200 shadow-xs bg-slate-100">
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%', minHeight: '260px' }} 
        className={`z-0 ${isPickerMode ? 'cursor-crosshair' : ''}`} 
      />

      {isPickerMode && (
        <>
          {/* Top instruction banner */}
          <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-teal-200/80 text-[11px] font-bold text-teal-950 shadow-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
            <span>Klik pada peta atau geser pin hijau untuk menentukan titik aduan</span>
          </div>

          {/* Quick Re-center Button */}
          {pickerCoordinates && (
            <button
              type="button"
              onClick={handleCenterToPin}
              title="Pusatkan Peta ke Titik Pin"
              className="absolute bottom-4 right-3 z-20 bg-white hover:bg-slate-50 text-[#00796B] font-bold px-3 py-1.5 rounded-xl border border-teal-300 shadow-md text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pusatkan ke Pin</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
