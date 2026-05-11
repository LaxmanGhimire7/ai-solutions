import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const EventCard = ({ title, date, time, location, description, type }) => {
  const parsedDate = new Date(date);
  const day = parsedDate.toLocaleDateString('en-GB', { day: '2-digit' });
  const month = parsedDate.toLocaleDateString('en-GB', { month: 'short' });

  return (
    <Card hoverable className="flex flex-col gap-5 sm:flex-row">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-50 text-center">
        <span className="text-xl font-semibold text-slate-900">{day}</span>
        <span className="text-xs font-medium uppercase text-slate-400">{month}</span>
      </div>
      <div>
        <Badge variant={type === 'Upcoming' ? 'accent' : 'default'}>{type}</Badge>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {time} · {location}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </Card>
  );
};

export default EventCard;
