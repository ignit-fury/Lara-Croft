import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  value?: number;
  onChange?: (value: number) => void;
  size?: number;
}

export default function StarRating({ rating = 0, value, onChange, size = 18 }: StarRatingProps) {
  const displayValue = value !== undefined ? value : rating;
  const [hoverValue, setHoverValue] = useState(0);
  const interactive = !!onChange;
  const stars = hoverValue || displayValue;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHoverValue(i)}
          onMouseLeave={() => interactive && setHoverValue(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={i <= stars ? 'fill-yellow-500 text-yellow-500' : 'fill-none text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
