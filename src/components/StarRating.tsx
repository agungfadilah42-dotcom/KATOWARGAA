import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 to 5
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false
}) => {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const starSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6'
  };

  const currentVal = hoverVal !== null ? hoverVal : value;

  const labels = ['', 'Sangat Buruk', 'Kurang Memuaskan', 'Cukup Baik', 'Memuaskan', 'Sangat Memuaskan!'];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentVal;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverVal(star)}
              onMouseLeave={() => !readOnly && setHoverVal(null)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-115 transition-transform'} p-0.5 focus:outline-hidden`}
              aria-label={`Beri rating ${star} bintang`}
            >
              <Star
                className={`${starSizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-slate-300 stroke-[1.5]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-xs font-bold text-amber-900 ml-1">
          {labels[Math.round(currentVal)] || ''}
        </span>
      )}
    </div>
  );
};
