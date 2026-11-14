import React from 'react';

interface KatoLogoProps {
  /**
   * 'emblem': Iconic badge (Pin + Tanjak + Skyline + Waves) - direct replacement for old "KJ" box
   * 'horizontal': Emblem + KATO WARGA wordmark + Subtitle (for Navbar / Cards)
   * 'full': Complete branding with tagline "— Suaro Warga, Solusi Bersamo. —"
   */
  variant?: 'emblem' | 'horizontal' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark'; // 'dark' for dark backgrounds like the footer
  showTagline?: boolean;
}

export const KatoEmblemSvg: React.FC<{ className?: string; sizePx?: number }> = ({ 
  className = "w-10 h-10",
  sizePx 
}) => {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={sizePx ? { width: sizePx, height: sizePx } : undefined}
      aria-label="Logo Lambang KATO WARGA"
    >
      <defs>
        {/* Teal-to-emerald gradient for map pin */}
        <linearGradient id="katoPinGradient" x1="20" y1="25" x2="85" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="45%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>

        {/* Golden Tanjak crown gradient */}
        <linearGradient id="katoGoldGradient" x1="30" y1="5" x2="75" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* River green wave gradient */}
        <linearGradient id="katoGreenWave" x1="15" y1="100" x2="90" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* River gold wave gradient */}
        <linearGradient id="katoGoldWave" x1="25" y1="110" x2="85" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="katoGlow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0D9488" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. Gentala Arasy & City Skyline (Navy Blue Silhouette behind the Pin) */}
      <g id="skyline" fill="#0F3B56">
        {/* Buildings on the right */}
        <rect x="74" y="66" width="7" height="34" rx="1.5" opacity="0.9" />
        <rect x="83" y="60" width="8" height="40" rx="1.5" />
        <rect x="93" y="68" width="7" height="32" rx="1.5" opacity="0.85" />
        
        {/* Gentala Arasy Iconic Spire & Tower */}
        <path d="M83 60 L87 40 L91 60 Z" />
        <rect x="86" y="34" width="2" height="7" rx="0.5" />
        <circle cx="87" cy="33" r="1.5" />
        <path d="M84 45 L87 42 L90 45 L87 48 Z" />
      </g>

      {/* 2. Golden Tanjak / Traditional Jambi Crown atop the Pin */}
      <g id="tanjak-crown">
        {/* Central Spire */}
        <path 
          d="M52 4 L55 10 L52 14 L49 10 Z" 
          fill="url(#katoGoldGradient)" 
        />
        <rect x="51.2" y="13" width="1.6" height="5" fill="#D97706" />

        {/* Pagoda Tier 1 */}
        <path 
          d="M52 14 L60 22 C56 22 54 23 52 25 C50 23 48 22 44 22 Z" 
          fill="url(#katoGoldGradient)" 
        />

        {/* Pagoda Tier 2 / Curved Eaves of Tanjak */}
        <path 
          d="M52 22 L72 37 C65 35 60 38 52 40 C44 38 39 35 32 37 L52 22 Z" 
          fill="url(#katoGoldGradient)" 
        />
        {/* Crown base accent */}
        <path 
          d="M32 37 C40 33 46 38 52 39 C58 38 64 33 72 37 C67 43 57 44 52 44 C47 44 37 43 32 37 Z" 
          fill="#D97706" 
          opacity="0.9"
        />
      </g>

      {/* 3. Main Map Pin Body */}
      <g id="map-pin" filter="url(#katoGlow)">
        {/* Outer Pin path with smooth organic curve and tapered point */}
        <path 
          d="M52 35 C32 35 18 49 18 69 C18 84 32 99 52 118 C72 99 86 84 86 69 C86 49 72 35 52 35 Z" 
          fill="url(#katoPinGradient)" 
        />
        {/* Inner highlight ring */}
        <path 
          d="M52 40 C36 40 24 52 24 68 C24 81 36 94 52 110 C68 94 80 81 80 68 C80 52 68 40 52 40 Z" 
          fill="#0D9488" 
          opacity="0.25"
        />
      </g>

      {/* 4. Speech Bubble inside the Pin */}
      <g id="speech-bubble">
        {/* White Chat Bubble */}
        <path 
          d="M52 47 C39.5 47 29.5 56.5 29.5 68 C29.5 73.5 32 78.5 36.2 82.2 L32.5 91 L42.5 87.5 C45.4 88.5 48.6 89 52 89 C64.5 89 74.5 79.5 74.5 68 C74.5 56.5 64.5 47 52 47 Z" 
          fill="#FFFFFF" 
        />
        
        {/* Three dots (...) inside speech bubble */}
        <circle cx="43" cy="67.5" r="3.2" fill="#0F3B56" />
        <circle cx="52" cy="67.5" r="3.2" fill="#0F3B56" />
        <circle cx="61" cy="67.5" r="3.2" fill="#0F3B56" />
      </g>

      {/* 5. Batanghari River Waves at Base */}
      <g id="batanghari-waves">
        {/* Green Wave */}
        <path 
          d="M12 108 C25 96 40 114 62 115 C78 116 95 106 104 104 C94 112 76 122 58 120 C38 118 24 112 12 108 Z" 
          fill="url(#katoGreenWave)" 
        />
        {/* Golden Wave */}
        <path 
          d="M26 117 C38 114 48 123 66 124 C79 125 90 118 97 116 C88 123 74 130 60 128 C46 126 36 122 26 117 Z" 
          fill="url(#katoGoldWave)" 
        />
      </g>
    </svg>
  );
};

export const KatoLogo: React.FC<KatoLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  theme = 'light',
  showTagline = true
}) => {
  // Size dimensions
  const emblemSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  }[size];

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl lg:text-5xl'
  }[size];

  const subSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base'
  }[size];

  // If variant is just the emblem icon (direct replacement for the "KJ" square box)
  if (variant === 'emblem') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <KatoEmblemSvg className={emblemSizeClasses} />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Emblem */}
      <div className="shrink-0 transition-transform group-hover:scale-105 duration-300">
        <KatoEmblemSvg className={emblemSizeClasses} />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-tight select-none">
        {/* Top brand line: KATO WARGA */}
        <div className="flex items-baseline">
          <span 
            className={`font-black tracking-tight ${titleSizeClasses} ${
              isDark ? 'text-white' : 'text-[#0F3B56]'
            }`}
          >
            {/* Styled "K" with signature green swoosh accent */}
            <span className={isDark ? 'text-emerald-400' : 'text-[#16A34A]'}>K</span>
            <span>ATO</span>
            {' '}
            <span className={isDark ? 'text-teal-300' : 'text-[#00796B]'}>WARGA</span>
          </span>
        </div>

        {/* Subtitle: Kanal Aspirasi dan Tanggapan Online Warga */}
        <span 
          className={`font-bold tracking-tight mt-0.5 ${subSizeClasses} ${
            isDark ? 'text-emerald-200/90' : 'text-slate-600'
          }`}
        >
          Kanal Aspirasi dan Tanggapan Online Warga
        </span>

        {/* Tagline: — Suaro Warga, Solusi Bersamo. — (if 'full' variant or showTagline enabled) */}
        {(variant === 'full' || (showTagline && size !== 'sm')) && (
          <div className="flex items-center gap-2 mt-1.5 font-bold italic text-[11px] sm:text-xs">
            <span className="h-[2px] w-4 sm:w-6 bg-amber-400 rounded-full" />
            <span className={isDark ? 'text-amber-300' : 'text-[#00796B]'}>
              Suaro Warga, Solusi Bersamo.
            </span>
            <span className="h-[2px] w-4 sm:w-6 bg-amber-400 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
