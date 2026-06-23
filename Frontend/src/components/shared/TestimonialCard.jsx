import { Quote } from 'lucide-react';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';

const TestimonialCard = ({ quote, name, company, rating, avatarUrl }) => {
  return (
    <Card hoverable className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <StarRating rating={rating} />
        <Quote className="h-6 w-6 text-[#E95520]/30" aria-hidden="true" />
      </div>
      <p className="mt-5 flex-1 text-sm leading-relaxed text-slate-600">"{quote}"</p>
      <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E95520]/10 text-sm font-semibold text-[#F37A49]"
            aria-hidden="true"
          >
            {name?.charAt(0)}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-sm text-slate-400">{company}</div>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;
