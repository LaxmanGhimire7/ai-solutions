import { Star } from 'lucide-react';

const StarRating = ({ rating, maxStars = 5 }) => {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const filled = index < rating;

        return (
          <Star
            key={index}
          className={`h-4 w-4 ${filled ? 'fill-[#E95520] text-[#E95520]' : 'text-slate-200'}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
};

export default StarRating;
