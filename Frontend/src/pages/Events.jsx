import { useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EventCard from '@/components/shared/EventCard';
import { events } from '@/data/siteData';

const Events = () => {
  const [tab, setTab] = useState('Upcoming');
  const visibleEvents = useMemo(() => events.filter((event) => event.type === tab), [tab]);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="accent">Events</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">Company Events</h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600">
            Upcoming and past events for workshops, showcases, and client-focused sessions.
          </p>
        </div>

        <div className="mt-10 flex gap-3">
          {['Upcoming', 'Past'].map((item) => (
            <Button
              key={item}
              variant={tab === item ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTab(item)}
              aria-pressed={tab === item}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="mt-12 space-y-5">
          {visibleEvents.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
