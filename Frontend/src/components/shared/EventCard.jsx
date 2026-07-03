import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { getFallbackImage } from '@/data/siteData';

const EventThumbnail = ({ coverImage, day, month, title }) => {
  const [failed, setFailed] = useState(false);
  const image = coverImage || getFallbackImage('events');

  useEffect(() => {
    setFailed(false);
  }, [image]);

  if (image && !failed) {
    return (
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E95520]/25 bg-[#F5ECE6]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-[#E95520]/25 bg-[#E95520]/10 text-center">
      <span className="text-2xl font-semibold text-[#F37A49]">{day}</span>
      <span className="mt-1 text-xs font-semibold uppercase text-[#E95520]">{month}</span>
    </div>
  );
};

const EventCard = ({ title, date, time, location, description, type, coverImage, to }) => {
  const parsedDate = new Date(date);
  const day = parsedDate.toLocaleDateString('en-GB', { day: '2-digit' });
  const month = parsedDate.toLocaleDateString('en-GB', { month: 'short' });

  const card = (
    <Card hoverable className="group flex flex-col gap-6 sm:flex-row sm:items-center">
      <EventThumbnail coverImage={coverImage} day={day} month={month} title={title} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <Badge variant={type === 'Upcoming' ? 'accent' : 'default'}>{type}</Badge>
          <span className="text-xs text-slate-400">{parsedDate.getFullYear()}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-950">{title}</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {location}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors group-hover:border-[#E95520]/50 group-hover:text-[#F37A49] sm:flex">
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Card>
  );

  if (!to) return card;

  return (
    <Link to={to} className="block focus:outline-none focus:ring-2 focus:ring-[#E95520]/20">
      {card}
    </Link>
  );
};

export default EventCard;
