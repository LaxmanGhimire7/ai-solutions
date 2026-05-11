import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';

const TestimonialCard = ({ quote, name, company, rating, avatarUrl }) => {
  return (
    <Card hoverable>
      <StarRating rating={rating} />
      <p className="mt-5 text-sm italic leading-relaxed text-slate-600">"{quote}"</p>
      <div className="mt-6 flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-100" aria-hidden="true" />
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
